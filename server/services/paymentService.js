const { pool } = require('../db');

// ─────────────────────────────────────────────────────────────
// SAFE DEMO/MOCK payment service (Person 3 scope).
//
// This does NOT talk to any real payment gateway. Every payment row
// has is_demo = TRUE and every response is clearly labelled as a
// demo/test transaction. verifyPayment() always succeeds -- there
// is nothing to "actually" verify -- which is fine because no real
// money ever moves through this code.
// ─────────────────────────────────────────────────────────────

const DEMO_DISCLAIMER =
  'This is a DEMO/TEST payment for the hackathon prototype. No real money is transferred and no real payment gateway is used.';

function formatPayment(row) {
  return {
    id: row.id,
    jobId: row.job_id,
    customerId: row.customer_id,
    amount: parseFloat(row.amount),
    method: row.method,
    status: row.status,
    isDemo: Boolean(row.is_demo),
    demoReference: row.demo_reference,
    createdAt: row.created_at,
    verifiedAt: row.verified_at,
    disclaimer: DEMO_DISCLAIMER,
  };
}

/**
 * Create a demo payment for a job. If a PENDING or SUCCESS payment
 * already exists for this job, that existing record is returned
 * instead of creating a duplicate (so retrying POST /create is safe).
 */
async function createPayment({ jobId, customerId, amount, method = 'demo_upi' }) {
  const existing = await pool.query(
    `SELECT * FROM payments WHERE job_id = $1 AND status IN ('PENDING', 'SUCCESS') ORDER BY created_at DESC LIMIT 1;`,
    [jobId]
  );
  if (existing.rows.length > 0) {
    return { payment: formatPayment(existing.rows[0]), created: false };
  }

  const id = `pay${Date.now()}`;
  const demoReference = `DEMO-${Date.now().toString(36).toUpperCase()}`;
  const result = await pool.query(
    `INSERT INTO payments (id, job_id, customer_id, amount, method, status, is_demo, demo_reference)
     VALUES ($1, $2, $3, $4, $5, 'PENDING', TRUE, $6)
     RETURNING *;`,
    [id, jobId, customerId, amount, method, demoReference]
  );
  return { payment: formatPayment(result.rows[0]), created: true };
}

/**
 * Verify (settle) a demo payment. Always resolves to SUCCESS -- this
 * simulates a successful gateway callback for demo purposes.
 */
async function verifyPayment({ paymentId, jobId }) {
  const lookup = paymentId
    ? await pool.query(`SELECT * FROM payments WHERE id = $1;`, [paymentId])
    : await pool.query(
        `SELECT * FROM payments WHERE job_id = $1 ORDER BY created_at DESC LIMIT 1;`,
        [jobId]
      );

  if (lookup.rows.length === 0) {
    return null;
  }
  const existing = lookup.rows[0];

  if (existing.status === 'SUCCESS') {
    return formatPayment(existing);
  }

  const result = await pool.query(
    `UPDATE payments SET status = 'SUCCESS', verified_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *;`,
    [existing.id]
  );
  return formatPayment(result.rows[0]);
}

async function getPaymentByJob(jobId) {
  const result = await pool.query(
    `SELECT * FROM payments WHERE job_id = $1 ORDER BY created_at DESC LIMIT 1;`,
    [jobId]
  );
  return result.rows[0] ? formatPayment(result.rows[0]) : null;
}

module.exports = {
  DEMO_DISCLAIMER,
  createPayment,
  verifyPayment,
  getPaymentByJob,
  formatPayment,
};
