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

    const totalJobsToday = jobsByWorker.reduce((a, b) => a + b.todayJobs, 0);

    const revRes = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total_rev FROM jobs WHERE status = 'completed';`
    );
    const totalRevenue = parseFloat(revRes.rows[0].total_rev);

    const activeWorkers = workersRes.rows.filter((w) => w.is_online).length;

    // Basic booking-lifecycle analytics (Person 3 scope), computed
    // across ALL jobs (not just today) so total/completed/cancelled
    // stay accurate as the demo runs. `totalJobs` below is kept as
    // the pre-existing "today" snapshot for backward compatibility
    // with any client already reading it; the new fields are additive.
    const statusCountsRes = await pool.query(
      `SELECT status, COUNT(*)::int as count FROM jobs GROUP BY status;`
    );
    const statusCounts = {};
    let totalJobsAllTime = 0;
    for (const row of statusCountsRes.rows) {
      statusCounts[row.status] = row.count;
      totalJobsAllTime += row.count;
    }
    const completedJobs = statusCounts['completed'] || 0;
    const cancelledJobs = statusCounts['cancelled'] || 0;

    // Jobs per worker (all-time count), independent of the today-only
    // jobsByWorker breakdown above.
    const jobsPerWorkerRes = await pool.query(
      `SELECT w.id as worker_id, w.name, COUNT(j.id)::int as job_count
       FROM workers w
       LEFT JOIN jobs j ON j.worker_id = w.id
       GROUP BY w.id, w.name
       ORDER BY w.name ASC;`
    );
    const jobsPerWorker = jobsPerWorkerRes.rows.map((r) => ({
      workerId: r.worker_id,
      name: r.name,
      jobCount: r.job_count,
    }));

    // Gini coefficient calculation on live jobs distribution
    const jobs = jobsByWorker.map((w) => w.todayJobs).sort((a, b) => a - b);
    const n = jobs.length;
    const mean = n > 0 ? jobs.reduce((a, b) => a + b, 0) / n : 0;
    const giniNumerator = jobs.reduce((sum, xi) => sum + jobs.reduce((s, xj) => s + Math.abs(xi - xj), 0), 0);
    const gini = mean > 0 ? parseFloat((giniNumerator / (2 * n * n * mean)).toFixed(3)) : 0;

    res.json({
      jobsByWorker,
      jobsPerWorker,
      summary: {
        totalJobs: totalJobsToday, // pre-existing field: today's jobs, unchanged shape
        totalJobsAllTime,
        completedJobs,
        cancelledJobs,
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
