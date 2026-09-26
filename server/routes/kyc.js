const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET /api/kyc
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT k.*, w.name, w.avatar_url, w.category_id, c.name as cooperative_name
      FROM kyc_applications k
      LEFT JOIN workers w ON k.worker_id = w.id
      LEFT JOIN cooperatives c ON k.cooperative_id = c.id
      WHERE k.status = 'pending'
      ORDER BY k.submitted_at ASC;
    `;
    const result = await pool.query(query);
    const list = result.rows.map((r) => ({
      id: r.id,
      workerId: r.worker_id,
      name: r.name,
      avatar: r.avatar_url,
      category: r.category_id,
      submittedAt: r.submitted_at,
      documents: {
        aadhar: { uploaded: r.aadhar_uploaded, verified: r.aadhar_verified },
        skill_cert: { uploaded: r.skill_cert_uploaded, verified: r.skill_cert_verified },
        address_proof: { uploaded: r.address_proof_uploaded, verified: r.address_proof_verified },
        photo: { uploaded: r.photo_uploaded, verified: r.photo_verified },
      },
      cooperative: r.cooperative_name || 'JP Nagar Workers Cooperative',
      phone: r.phone,
      notes: r.notes,
    }));
    res.json(list);
  } catch (err) {
    console.error('Error fetching KYC queue:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/kyc/:id/review
router.post('/:id/review', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const { action } = req.body; // 'approved' or 'rejected'

    const kycRes = await client.query(
      `UPDATE kyc_applications SET status = $1, reviewed_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *;`,
      [action, id]
    );

    if (kycRes.rows.length === 0) {
      return res.status(404).json({ error: 'KYC application not found' });
    }

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
    res.json({ success: true, id, action });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error reviewing KYC:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
