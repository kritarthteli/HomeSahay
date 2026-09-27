const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authenticateToken, requireRole, requireAnyRole } = require('../middleware/auth');
const { ROLES } = require('../config/jwt');

// NOTE on scope: GET / (list) is NOT defined here. It already lives in
// routes/config.js at GET /api/cooperatives and is mounted before this
// router in index.js, so it keeps serving that route for backward
// compatibility with existing clients. This file only adds the
// detail/create/update/roster endpoints that didn't exist before.

const formatCooperative = (row) => ({
  id: row.id,
  name: row.name,
  area: row.area,
  city: row.city,
  createdAt: row.created_at,
});

// GET /api/cooperatives/:id — public detail view.
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM cooperatives WHERE id = $1;`, [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cooperative not found.' });
    }
    res.json(formatCooperative(result.rows[0]));
  } catch (err) {
    console.error('Error fetching cooperative:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/cooperatives — PLATFORM_ADMIN only. Creating new
// cooperatives is a platform-level decision, not something an
// individual cooperative admin can do for themselves.
router.post('/', authenticateToken, requireRole(ROLES.PLATFORM_ADMIN), async (req, res) => {
  try {
    const { name, area, city = 'Bengaluru' } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Cooperative name is required.' });
    }
    if (!area || !area.trim()) {
      return res.status(400).json({ error: 'Area is required.' });
    }

    const id = `coop_${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')}_${Date.now().toString(36)}`;

    const result = await pool.query(
      `INSERT INTO cooperatives (id, name, area, city) VALUES ($1, $2, $3, $4) RETURNING *;`,
      [id, name.trim(), area.trim(), city.trim()]
    );

    console.log(`✅ Cooperative created: ${result.rows[0].name} (${id})`);
    res.status(201).json(formatCooperative(result.rows[0]));
  } catch (err) {
    console.error('Error creating cooperative:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/cooperatives/:id — PLATFORM_ADMIN (any cooperative), or a
// COOPERATIVE_ADMIN of that specific cooperative (req.user.cooperativeId
// must match the :id in the URL). A cooperative admin for coop A must
// never be able to edit coop B just by changing the URL param.
router.put(
  '/:id',
  authenticateToken,
  requireAnyRole(ROLES.PLATFORM_ADMIN, ROLES.COOPERATIVE_ADMIN),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (req.user.role === ROLES.COOPERATIVE_ADMIN && req.user.cooperativeId !== id) {
        return res.status(403).json({ error: 'You may only manage your own cooperative.' });
      }

      const { name, area, city } = req.body;
      const result = await pool.query(
        `UPDATE cooperatives
         SET name = COALESCE($1, name), area = COALESCE($2, area), city = COALESCE($3, city)
         WHERE id = $4
         RETURNING *;`,
        [name, area, city, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Cooperative not found.' });
      }

      res.json(formatCooperative(result.rows[0]));
    } catch (err) {
      console.error('Error updating cooperative:', err);
      res.status(500).json({ error: err.message });
    }
  }
);

// GET /api/cooperatives/:id/workers — roster. Restricted to that
// cooperative's own admin, or a platform admin — a worker roster is
// operational data, not something the public or other cooperatives
// should be able to browse.
router.get(
  '/:id/workers',
  authenticateToken,
  requireAnyRole(ROLES.PLATFORM_ADMIN, ROLES.COOPERATIVE_ADMIN),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (req.user.role === ROLES.COOPERATIVE_ADMIN && req.user.cooperativeId !== id) {
        return res.status(403).json({ error: 'You may only view your own cooperative\'s roster.' });
      }

      const query = `
        SELECT w.*, string_agg(DISTINCT ws.skill, ',') as skills_agg
        FROM workers w
        LEFT JOIN worker_skills ws ON w.id = ws.worker_id
        WHERE w.cooperative_id = $1
        GROUP BY w.id
        ORDER BY w.name ASC;
      `;
      const result = await pool.query(query, [id]);

      const roster = result.rows.map((w) => ({
        id: w.id,
        name: w.name,
        phone: w.phone,
        email: w.email,
        category: w.category_id,
        skills: w.skills_agg ? w.skills_agg.split(',') : [],
        isVerified: Boolean(w.is_verified),
        kycStatus: w.kyc_status,
        rating: parseFloat(w.rating) || 0,
        isOnline: Boolean(w.is_online),
      }));

      res.json(roster);
    } catch (err) {
      console.error('Error fetching cooperative roster:', err);
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
