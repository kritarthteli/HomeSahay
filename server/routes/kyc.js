const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authenticateToken, requireAnyRole } = require('../middleware/auth');
const { ROLES } = require('../config/jwt');

// Both endpoints below require an authenticated reviewer. A
// COOPERATIVE_ADMIN is further restricted to their own cooperative's
// queue/applications; a PLATFORM_ADMIN can see and act on all of them.

// GET /api/kyc
router.get(
  '/',
  authenticateToken,
  requireAnyRole(ROLES.COOPERATIVE_ADMIN, ROLES.PLATFORM_ADMIN),
  async (req, res) => {
    try {
      const isCoopAdmin = req.user.role === ROLES.COOPERATIVE_ADMIN;

      const query = `
        SELECT k.*, w.name, w.avatar_url, w.category_id, w.email, w.years_experience,
               c.name as cooperative_name
        FROM kyc_applications k
        LEFT JOIN workers w ON k.worker_id = w.id
        LEFT JOIN cooperatives c ON k.cooperative_id = c.id
        WHERE k.status = 'pending'
          AND ($1::text IS NULL OR k.cooperative_id = $1)
        ORDER BY k.submitted_at ASC;
      `;
      const result = await pool.query(query, [isCoopAdmin ? req.user.cooperativeId : null]);
      const list = result.rows.map((r) => ({
        id: r.id,
        workerId: r.worker_id,
        name: r.name,
        avatar: r.avatar_url,
        category: r.category_id,
        yearsExperience: parseInt(r.years_experience, 10) || 0,
        submittedAt: r.submitted_at,
        cooperative: r.cooperative_name,
        phone: r.phone,
        email: r.email,
        notes: r.notes,
      }));
      res.json(list);
    } catch (err) {
      console.error('Error fetching KYC queue:', err);
      res.status(500).json({ error: err.message });
    }
  }
);

// POST /api/kyc/:id/review
router.post(
  '/:id/review',
  authenticateToken,
  requireAnyRole(ROLES.COOPERATIVE_ADMIN, ROLES.PLATFORM_ADMIN),
  async (req, res) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { id } = req.params;
      const { action, rejectionReason } = req.body;

      // SECURITY: action must be exactly one of these two values.
      // Previously any string was accepted and silently treated as a
      // rejection unless it was literally 'approved' -- e.g. a typo or
      // an arbitrary payload like { action: "hacked" } would flip a
      // worker's kyc_status to 'rejected' without any real validation.
      if (action !== 'approved' && action !== 'rejected') {
        return res.status(400).json({ error: "action must be exactly 'approved' or 'rejected'." });
      }
      if (action === 'rejected' && (!rejectionReason || !rejectionReason.trim())) {
        return res.status(400).json({ error: 'rejectionReason is required when rejecting an application.' });
      }

      // Fetch first so we can enforce cooperative-scoping before writing.
      const existing = await client.query('SELECT * FROM kyc_applications WHERE id = $1;', [id]);
      if (existing.rows.length === 0) {
        return res.status(404).json({ error: 'KYC application not found' });
      }
      const applicationBefore = existing.rows[0];

      if (
        req.user.role === ROLES.COOPERATIVE_ADMIN &&
        req.user.cooperativeId !== applicationBefore.cooperative_id
      ) {
        return res.status(403).json({ error: 'You may only review applications for your own cooperative.' });
      }

      const kycRes = await client.query(
        `UPDATE kyc_applications
         SET status = $1,
             reviewed_at = CURRENT_TIMESTAMP,
             reviewer_id = $2,
             reviewer_type = $3,
             rejection_reason = $4
         WHERE id = $5
         RETURNING *;`,
        [action, req.user.id, req.user.role, action === 'rejected' ? rejectionReason.trim() : null, id]
      );

      const app = kycRes.rows[0];

      if (action === 'approved') {
        await client.query(
          `UPDATE workers SET is_verified = TRUE, kyc_status = 'approved' WHERE id = $1;`,
          [app.worker_id]
        );
      } else {
        await client.query(
          `UPDATE workers SET is_verified = FALSE, kyc_status = 'rejected' WHERE id = $1;`,
          [app.worker_id]
        );
      }

      await client.query('COMMIT');
      res.json({ success: true, id, action, rejectionReason: app.rejection_reason });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Error reviewing KYC:', err);
      res.status(500).json({ error: err.message });
    } finally {
      client.release();
    }
  }
);

module.exports = router;
