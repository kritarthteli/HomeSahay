const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// ─────────────────────────────────────────────────────────────
// Reviews reuse the `jobs` table's existing (previously unused)
// customer_rating / customer_review columns instead of adding a new
// table -- jobId already implies both customer_id and worker_id, so
// a dedicated reviews table would just duplicate that FK. This keeps
// the database exactly as it was designed (schema.sql is untouched
// here) while still satisfying "store customer, worker, job, rating,
// comment" (all four are present on/derivable from the job row).
// ─────────────────────────────────────────────────────────────

function formatReview(job) {
  return {
    jobId: job.id,
    customerId: job.customer_id,
    workerId: job.worker_id,
    rating: job.customer_rating,
    comment: job.customer_review,
  };
}

// POST /api/reviews
// body: { jobId, customerId, rating, comment }
router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { jobId, customerId, rating, comment } = req.body;

    if (!jobId) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'jobId is required' });
    }
    const ratingNum = parseInt(rating, 10);
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'rating must be an integer between 1 and 5' });
    }

    const jobRes = await client.query('SELECT * FROM jobs WHERE id = $1 FOR UPDATE;', [jobId]);
    if (jobRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Job not found' });
    }
    const job = jobRes.rows[0];

    // Only completed jobs can be reviewed.
    if (job.status !== 'completed') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: `Only completed jobs can be reviewed (this job is ${job.status})` });
    }

    if (customerId && job.customer_id !== customerId) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'This job does not belong to that customer' });
    }

    // Prevent duplicate reviews for the same job.
    if (job.customer_rating !== null && job.customer_rating !== undefined) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'This job has already been reviewed' });
    }

    const updated = await client.query(
      `UPDATE jobs SET customer_rating = $1, customer_review = $2 WHERE id = $3 RETURNING *;`,
      [ratingNum, (comment || '').trim() || null, jobId]
    );

    // Recompute the worker's overall rating from all their reviewed
    // jobs (simple average, not a weighted/decaying score -- "basic
    // reviews" scope).
    if (job.worker_id) {
      await client.query(
        `UPDATE workers
         SET rating = (
           SELECT ROUND(AVG(customer_rating)::numeric, 2)
           FROM jobs
           WHERE worker_id = $1 AND customer_rating IS NOT NULL
         )
         WHERE id = $1;`,
        [job.worker_id]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(formatReview(updated.rows[0]));
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error submitting review:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// GET /api/reviews?workerId=&jobId= — read helper for the demo/tests,
// not part of the required API surface but trivial and low-risk.
router.get('/', async (req, res) => {
  try {
    const { workerId, jobId } = req.query;
    const conditions = ['customer_rating IS NOT NULL'];
    const params = [];

    if (workerId) {
      params.push(workerId);
      conditions.push(`worker_id = $${params.length}`);
    }
    if (jobId) {
      params.push(jobId);
      conditions.push(`id = $${params.length}`);
    }

    const result = await pool.query(
      `SELECT id, customer_id, worker_id, customer_rating, customer_review
       FROM jobs WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC;`,
      params
    );
    res.json(
      result.rows.map((j) =>
        formatReview({
          id: j.id,
          customer_id: j.customer_id,
          worker_id: j.worker_id,
          customer_rating: j.customer_rating,
          customer_review: j.customer_review,
        })
      )
    );
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
