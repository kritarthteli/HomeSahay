const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET /api/jobs
router.get('/', async (req, res) => {
  try {
    const { workerId, customerId } = req.query;
    let query = `
      SELECT j.*, w.name as worker_name, c.name as customer_name
      FROM jobs j
      LEFT JOIN workers w ON j.worker_id = w.id
      LEFT JOIN customers c ON j.customer_id = c.id
    `;
    const params = [];
    const conditions = [];

    if (workerId) {
      params.push(workerId);
      conditions.push(`j.worker_id = $${params.length}`);
    }
    if (customerId) {
      params.push(customerId);
      conditions.push(`j.customer_id = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }
    query += ` ORDER BY j.created_at DESC;`;

    const result = await pool.query(query, params);
    const jobs = result.rows.map((r) => ({
      id: r.id,
      workerId: r.worker_id,
      customerId: r.customer_id,
      category: r.category_id,
      amount: parseFloat(r.amount),
      status: r.status,
      date: r.job_date,
      time: r.job_time,
      urgency: r.urgency,
      workerName: r.worker_name,
      customerName: r.customer_name,
    }));
    res.json(jobs);
  } catch (err) {
    console.error('Error fetching jobs:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/jobs
router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { customerId, workerId, category, urgency = 'normal' } = req.body;

    const workerRes = await client.query('SELECT * FROM workers WHERE id = $1;', [workerId]);
    if (workerRes.rows.length === 0) {
      return res.status(404).json({ error: 'Worker not found' });
    }
    const worker = workerRes.rows[0];

    const baseHours = urgency === 'emergency' ? 1 : 1.5;
    const laborCost = Math.round(parseFloat(worker.price_per_hour) * baseHours);
    const convenienceFee = Math.round(laborCost * 0.05);
    const cooperativeLevy = Math.round(laborCost * 0.03);
    const totalAmount = laborCost + convenienceFee + cooperativeLevy;

    const jobId = `j${Date.now()}`;
    const insertJobQuery = `
      INSERT INTO jobs (
        id, customer_id, worker_id, category_id, amount, labor_cost,
        convenience_fee, cooperative_levy, status, urgency, job_date, job_time
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending_acceptance', $9, CURRENT_DATE, TO_CHAR(CURRENT_TIMESTAMP, 'HH24:MI'))
      RETURNING *;
    `;
    await client.query(insertJobQuery, [
      jobId,
      customerId,
      workerId,
      category || worker.category_id,
      totalAmount,
      laborCost,
      convenienceFee,
      cooperativeLevy,
      urgency,
    ]);

    await client.query('COMMIT');

    res.status(201).json({
      jobId,
      status: 'pending_acceptance',
      worker: {
        id: worker.id,
        name: worker.name,
        avatar: worker.avatar_url,
        rating: parseFloat(worker.rating),
        phone: worker.phone || '+91 98765 XXXXX',
      },
      estimatedArrival: worker.eta_minutes || 10,
      pricing: {
        laborCost,
        convenienceFee,
        cooperativeLevy,
        totalAmount,
        breakdown: [
          { label: 'Labour Charges', amount: laborCost },
          { label: 'Convenience Fee (5%)', amount: convenienceFee },
          { label: 'Cooperative Fund (3%)', amount: cooperativeLevy },
        ],
      },
      acceptanceDeadline: 30,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating job:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// PATCH /api/jobs/:id/status
router.patch('/:id/status', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const { status } = req.body; // 'accepted', 'rejected', 'completed'

    const jobRes = await client.query('UPDATE jobs SET status = $1 WHERE id = $2 RETURNING *;', [status, id]);
    if (jobRes.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }
    const job = jobRes.rows[0];

    // If completed, update worker today jobs & earnings in database
    if (status === 'completed' && job.worker_id) {
      await client.query(
        `UPDATE workers
         SET today_jobs = today_jobs + 1,
             today_earnings = today_earnings + $1,
             total_jobs = total_jobs + 1
         WHERE id = $2;`,
        [job.amount, job.worker_id]
      );
    }

    await client.query('COMMIT');
    res.json({ success: true, job });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updating job status:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
