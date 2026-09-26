const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET /api/analytics
router.get('/', async (req, res) => {
  try {
    const workersRes = await pool.query(
      `SELECT id, name, today_jobs, today_earnings, rating, is_online FROM workers ORDER BY name ASC;`
    );

    const jobsByWorker = workersRes.rows.map((w) => ({
      workerId: w.id,
      name: w.name.split(' ')[0],
      todayJobs: parseInt(w.today_jobs, 10) || 0,
      todayEarnings: parseFloat(w.today_earnings) || 0,
      rating: parseFloat(w.rating) || 0,
    }));

    const totalJobs = jobsByWorker.reduce((a, b) => a + b.todayJobs, 0);

    const revRes = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total_rev FROM jobs WHERE status = 'completed';`
    );
    const totalRevenue = parseFloat(revRes.rows[0].total_rev);

    const activeWorkers = workersRes.rows.filter((w) => w.is_online).length;

    // Gini coefficient calculation on live jobs distribution
    const jobs = jobsByWorker.map((w) => w.todayJobs).sort((a, b) => a - b);
    const n = jobs.length;
    const mean = n > 0 ? jobs.reduce((a, b) => a + b, 0) / n : 0;
    const giniNumerator = jobs.reduce((sum, xi) => sum + jobs.reduce((s, xj) => s + Math.abs(xi - xj), 0), 0);
    const gini = mean > 0 ? parseFloat((giniNumerator / (2 * n * n * mean)).toFixed(3)) : 0;

    res.json({
      jobsByWorker,
      summary: {
        totalJobs,
        totalRevenue,
        activeWorkers,
        fairnessIndex: parseFloat((1 - gini).toFixed(3)),
        giniCoefficient: gini,
      },
    });
  } catch (err) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
