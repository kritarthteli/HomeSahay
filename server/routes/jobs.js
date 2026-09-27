const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { createNotification, NOTIFICATION_TYPES } = require('../services/notificationService');

// ─────────────────────────────────────────────────────────────
// JOB LIFECYCLE (Person 3 scope)
//
// The brief's conceptual lifecycle is:
//   PENDING -> ASSIGNED -> ACCEPTED -> IN_PROGRESS -> COMPLETED
//   (+ CANCELLED from most states)
//
// This maps onto the *existing* lowercase status strings the rest of
// the app (store/appStore.js, app/(worker)/*, app/(customer)/*) already
// reads and writes, so nothing outside this file needs to change:
//
//   PENDING     -> 'pending'             a job row exists but no
//                                         worker has been matched yet
//   ASSIGNED    -> 'pending_acceptance'  a worker has been matched/
//                                         chosen and is awaiting their
//                                         accept/reject (existing string)
//   ACCEPTED    -> 'accepted'            (existing string)
//   IN_PROGRESS -> 'in_progress'         (existing string)
//   COMPLETED   -> 'completed'           (existing string)
//   CANCELLED   -> 'cancelled'           (existing string)
//   (REJECTED)  -> 'rejected'            worker declined -- existing
//                                         terminal state, kept as-is
//
// In practice the customer app already matches a worker client-side
// (GET /api/workers/nearby) before calling POST /api/jobs with that
// workerId, so a created job normally starts directly at ASSIGNED
// (`pending_acceptance`). PENDING (`pending`) exists for the case
// where no workerId is supplied -- see assignWorkerViaMatching below.
// ─────────────────────────────────────────────────────────────

const STATUS = Object.freeze({
  PENDING: 'pending',
  ASSIGNED: 'pending_acceptance',
  ACCEPTED: 'accepted',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected',
});

// Only these transitions are allowed. Anything not listed here --
// including the example from the brief, PENDING -> COMPLETED -- is
// rejected with a 400.
const VALID_TRANSITIONS = Object.freeze({
  [STATUS.PENDING]: [STATUS.ASSIGNED, STATUS.CANCELLED],
  [STATUS.ASSIGNED]: [STATUS.ACCEPTED, STATUS.REJECTED, STATUS.CANCELLED],
  [STATUS.ACCEPTED]: [STATUS.IN_PROGRESS, STATUS.CANCELLED],
  [STATUS.IN_PROGRESS]: [STATUS.COMPLETED, STATUS.CANCELLED],
  [STATUS.COMPLETED]: [],
  [STATUS.CANCELLED]: [],
  [STATUS.REJECTED]: [],
});

function isValidTransition(from, to) {
  return Array.isArray(VALID_TRANSITIONS[from]) && VALID_TRANSITIONS[from].includes(to);
}

// ─────────────────────────────────────────────────────────────
// Matching integration -- Person 2 owns the actual fairness/ranking
// algorithm (GET /api/workers/nearby in server/routes/workers.js).
// We do NOT reimplement any part of that scoring here; instead we
// call that same endpoint over HTTP (self-request to this server)
// and use its top-ranked, already-sorted result. This keeps job
// creation working even without a workerId, without touching
// workers.js at all.
// ─────────────────────────────────────────────────────────────

async function fetchRankedWorkers({ category, latitude, longitude }) {
  const port = process.env.PORT || 5000;
  const query = new URLSearchParams({
    ...(category ? { category } : {}),
    ...(latitude != null ? { latitude: String(latitude) } : {}),
    ...(longitude != null ? { longitude: String(longitude) } : {}),
  });
  const url = `http://localhost:${port}/api/workers/nearby?${query.toString()}`;

  if (typeof fetch !== 'function') {
    throw new Error('Matching service unavailable: global fetch is not supported on this Node version (need Node 18+).');
  }
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Matching service (GET /api/workers/nearby) returned ${res.status}`);
  }
  return res.json(); // already ranked/sorted by Person 2's fairness score
}

/**
 * Assign the top-ranked available worker (from Person 2's matching
 * endpoint) to a PENDING job. Only used when a job was created
 * without an explicit workerId.
 */
async function assignWorkerViaMatching(job) {
  const rankedWorkers = await fetchRankedWorkers({
    category: job.category_id,
    latitude: job.latitude,
    longitude: job.longitude,
  });

  if (!Array.isArray(rankedWorkers) || rankedWorkers.length === 0) {
    return null;
  }
  return rankedWorkers[0]; // highest fairness score, already sorted by Person 2's endpoint
}

// GET /api/jobs
router.get('/', async (req, res) => {
  try {
    const { workerId, customerId, status } = req.query;
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
    if (status) {
      params.push(status);
      conditions.push(`j.status = $${params.length}`);
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
      rating: r.customer_rating,
      review: r.customer_review,
    }));
    res.json(jobs);
  } catch (err) {
    console.error('Error fetching jobs:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/jobs/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT j.*, w.name as worker_name, c.name as customer_name
       FROM jobs j
       LEFT JOIN workers w ON j.worker_id = w.id
       LEFT JOIN customers c ON j.customer_id = c.id
       WHERE j.id = $1;`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }
    const r = result.rows[0];
    res.json({
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
      rating: r.customer_rating,
      review: r.customer_review,
    });
  } catch (err) {
    console.error('Error fetching job:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/jobs
// Existing/primary flow: body includes workerId (customer already
// matched via GET /api/workers/nearby client-side) -> job is created
// directly at ASSIGNED ('pending_acceptance'), unchanged behaviour.
//
// New/optional flow: body omits workerId -> job is created at PENDING
// ('pending'), then Person 2's matching endpoint is used server-side
// to pick and assign the top-ranked worker (-> ASSIGNED). If no
// worker is available the job is left at PENDING.
router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { customerId, workerId, category, urgency = 'normal', latitude, longitude } = req.body;

    if (!customerId) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'customerId is required' });
    }

    let worker = null;
    if (workerId) {
      const workerRes = await client.query('SELECT * FROM workers WHERE id = $1;', [workerId]);
      if (workerRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Worker not found' });
      }
      worker = workerRes.rows[0];
    } else if (!category) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Either workerId or category is required' });
    }

    const baseHours = urgency === 'emergency' ? 1 : 1.5;
    const pricePerHour = worker ? parseFloat(worker.price_per_hour) : 300; // placeholder until matched
    const laborCost = Math.round(pricePerHour * baseHours);
    const convenienceFee = Math.round(laborCost * 0.05);
    const cooperativeLevy = Math.round(laborCost * 0.03);
    const totalAmount = laborCost + convenienceFee + cooperativeLevy;

    const jobId = `j${Date.now()}`;
    const initialStatus = worker ? STATUS.ASSIGNED : STATUS.PENDING;
    const insertJobQuery = `
      INSERT INTO jobs (
        id, customer_id, worker_id, category_id, amount, labor_cost,
        convenience_fee, cooperative_levy, status, urgency, job_date, job_time
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_DATE, TO_CHAR(CURRENT_TIMESTAMP, 'HH24:MI'))
      RETURNING *;
    `;
    await client.query(insertJobQuery, [
      jobId,
      customerId,
      worker ? worker.id : null,
      category || (worker ? worker.category_id : null),
      totalAmount,
      laborCost,
      convenienceFee,
      cooperativeLevy,
      initialStatus,
      urgency,
    ]);

    await client.query('COMMIT');

    // Notify: booking created (customer-side confirmation).
    await createNotification({
      userId: customerId,
      userType: 'customer',
      jobId,
      type: NOTIFICATION_TYPES.BOOKING_CREATED,
      title: 'Booking created',
      message: worker
        ? `Your booking has been created and sent to ${worker.name}.`
        : 'Your booking has been created. We are finding you the best available worker.',
    });

    // If matched at creation time, notify the worker too.
    if (worker) {
      await createNotification({
        userId: worker.id,
        userType: 'worker',
        jobId,
        type: NOTIFICATION_TYPES.WORKER_ASSIGNED,
        title: 'New job request',
        message: `You have a new job request. Please accept or decline within 30 seconds.`,
      });
    }

    // No worker yet -> try to auto-assign one via Person 2's matching
    // endpoint before responding. Best-effort: if matching fails for
    // any reason, the job simply stays PENDING and can be retried
    // later (e.g. by re-calling PATCH .../status or a future retry
    // endpoint) rather than failing the whole booking request.
    if (!worker) {
      try {
        const matched = await assignWorkerViaMatching({
          category_id: category,
          latitude,
          longitude,
        });
        if (matched && matched.id) {
          const matchedWorkerRes = await pool.query('SELECT * FROM workers WHERE id = $1;', [matched.id]);
          const matchedWorker = matchedWorkerRes.rows[0];
          if (matchedWorker) {
            const mLaborCost = Math.round(parseFloat(matchedWorker.price_per_hour) * baseHours);
            const mConvenienceFee = Math.round(mLaborCost * 0.05);
            const mCooperativeLevy = Math.round(mLaborCost * 0.03);
            const mTotalAmount = mLaborCost + mConvenienceFee + mCooperativeLevy;

            await pool.query(
              `UPDATE jobs
               SET worker_id = $1, status = $2, amount = $3, labor_cost = $4,
                   convenience_fee = $5, cooperative_levy = $6
               WHERE id = $7;`,
              [matchedWorker.id, STATUS.ASSIGNED, mTotalAmount, mLaborCost, mConvenienceFee, mCooperativeLevy, jobId]
            );

            await createNotification({
              userId: matchedWorker.id,
              userType: 'worker',
              jobId,
              type: NOTIFICATION_TYPES.WORKER_ASSIGNED,
              title: 'New job request',
              message: 'You have a new job request. Please accept or decline within 30 seconds.',
            });

            return res.status(201).json({
              jobId,
              status: STATUS.ASSIGNED,
              worker: {
                id: matchedWorker.id,
                name: matchedWorker.name,
                avatar: matchedWorker.avatar_url,
                rating: parseFloat(matchedWorker.rating),
                phone: matchedWorker.phone || '+91 98765 XXXXX',
              },
              estimatedArrival: matchedWorker.eta_minutes || 10,
              pricing: {
                laborCost: mLaborCost,
                convenienceFee: mConvenienceFee,
                cooperativeLevy: mCooperativeLevy,
                totalAmount: mTotalAmount,
                breakdown: [
                  { label: 'Labour Charges', amount: mLaborCost },
                  { label: 'Convenience Fee (5%)', amount: mConvenienceFee },
                  { label: 'Cooperative Fund (3%)', amount: mCooperativeLevy },
                ],
              },
              acceptanceDeadline: 30,
            });
          }
        }
      } catch (matchErr) {
        console.error('Matching failed, job left PENDING:', matchErr.message);
      }

      // Matching found nobody (or failed) -- respond with the job
      // still PENDING so the client can show "still finding a worker"
      // and retry later.
      return res.status(202).json({
        jobId,
        status: STATUS.PENDING,
        message: 'No worker available right now. Your booking is pending and will be matched as soon as one is.',
      });
    }

    res.status(201).json({
      jobId,
      status: initialStatus,
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
// body: { status } — must be one of the STATUS values above, and the
// transition from the job's current status must be valid (see
// VALID_TRANSITIONS). Example rejected transition: PENDING -> COMPLETED.
router.patch('/:id/status', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const requestedStatus = (req.body.status || '').toString().trim();

    const validStatuses = Object.values(STATUS);
    if (!validStatuses.includes(requestedStatus)) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: `Invalid status "${requestedStatus}". Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const jobRes = await client.query('SELECT * FROM jobs WHERE id = $1 FOR UPDATE;', [id]);
    if (jobRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Job not found' });
    }
    const currentJob = jobRes.rows[0];
    const currentStatus = currentJob.status;

    if (currentStatus === requestedStatus) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: `Job is already ${requestedStatus}` });
    }

    if (!isValidTransition(currentStatus, requestedStatus)) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: `Invalid status transition from ${currentStatus} to ${requestedStatus}`,
        currentStatus,
        allowedNextStatuses: VALID_TRANSITIONS[currentStatus] || [],
      });
    }

    const updatedRes = await client.query(
      'UPDATE jobs SET status = $1 WHERE id = $2 RETURNING *;',
      [requestedStatus, id]
    );
    const job = updatedRes.rows[0];

    // If completed, update worker today jobs & earnings (unchanged
    // from the existing behaviour).
    if (requestedStatus === STATUS.COMPLETED && job.worker_id) {
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

    // Notifications for the transitions the brief calls out. Fired
    // after commit so a notification hiccup never rolls back the
    // actual status change.
    if (requestedStatus === STATUS.ACCEPTED && job.customer_id) {
      await createNotification({
        userId: job.customer_id,
        userType: 'customer',
        jobId: job.id,
        type: NOTIFICATION_TYPES.WORKER_ACCEPTED,
        title: 'Worker accepted your booking',
        message: 'Your worker has accepted the job and is on the way.',
      });
    } else if (requestedStatus === STATUS.REJECTED && job.customer_id) {
      await createNotification({
        userId: job.customer_id,
        userType: 'customer',
        jobId: job.id,
        type: NOTIFICATION_TYPES.WORKER_REJECTED,
        title: 'Worker declined your booking',
        message: 'Your worker was unable to take this job. Please try booking again.',
      });
    } else if (requestedStatus === STATUS.COMPLETED) {
      if (job.customer_id) {
        await createNotification({
          userId: job.customer_id,
          userType: 'customer',
          jobId: job.id,
          type: NOTIFICATION_TYPES.JOB_COMPLETED,
          title: 'Job completed',
          message: 'Your job has been marked as completed. You can now pay and leave a review.',
        });
      }
      if (job.worker_id) {
        await createNotification({
          userId: job.worker_id,
          userType: 'worker',
          jobId: job.id,
          type: NOTIFICATION_TYPES.JOB_COMPLETED,
          title: 'Job completed',
          message: 'You marked this job as completed.',
        });
      }
    } else if (requestedStatus === STATUS.CANCELLED) {
      if (job.customer_id) {
        await createNotification({
          userId: job.customer_id,
          userType: 'customer',
          jobId: job.id,
          type: NOTIFICATION_TYPES.JOB_CANCELLED,
          title: 'Booking cancelled',
          message: 'This booking has been cancelled.',
        });
      }
      if (job.worker_id) {
        await createNotification({
          userId: job.worker_id,
          userType: 'worker',
          jobId: job.id,
          type: NOTIFICATION_TYPES.JOB_CANCELLED,
          title: 'Job cancelled',
          message: 'This job has been cancelled.',
        });
      }
    }

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
