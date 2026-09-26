const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET /api/categories
router.get('/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM service_categories ORDER BY label ASC;');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/cooperatives
router.get('/cooperatives', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cooperatives ORDER BY name ASC;');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching cooperatives:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/ranking-weights
router.get('/ranking-weights', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ranking_weights ORDER BY id DESC LIMIT 1;');
    if (result.rows.length === 0) {
      return res.json({ skillMatch: 0.35, distance: 0.25, rating: 0.20, fairnessPenalty: 0.20 });
    }
    const r = result.rows[0];
    res.json({
      skillMatch: parseFloat(r.skill_match),
      distance: parseFloat(r.distance),
      rating: parseFloat(r.rating),
      fairnessPenalty: parseFloat(r.fairness_penalty),
    });
  } catch (err) {
    console.error('Error fetching ranking weights:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/ranking-weights
router.put('/ranking-weights', async (req, res) => {
  try {
    const { skillMatch, distance, rating, fairnessPenalty } = req.body;
    const result = await pool.query(
      `INSERT INTO ranking_weights (skill_match, distance, rating, fairness_penalty, updated_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       RETURNING *;`,
      [skillMatch, distance, rating, fairnessPenalty]
    );
    const r = result.rows[0];
    res.json({
      skillMatch: parseFloat(r.skill_match),
      distance: parseFloat(r.distance),
      rating: parseFloat(r.rating),
      fairnessPenalty: parseFloat(r.fairness_penalty),
    });
  } catch (err) {
    console.error('Error updating ranking weights:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
