const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { createPayment, verifyPayment, getPaymentByJob, DEMO_DISCLAIMER } = require('../services/paymentService');
const { createNotification, NOTIFICATION_TYPES } = require('../services/notificationService');

// ─────────────────────────────────────────────────────────────
// SAFE DEMO/MOCK payments only. No real payment gateway is called
// anywhere in this file -- see server/services/paymentService.js.
// ─────────────────────────────────────────────────────────────

// POST /api/payments/create
// body: { jobId, method? }
router.post('/create', async (req, res) => {
  try {
    const { jobId, method } = req.body;
    if (!jobId) {
      return res.status(400).json({ error: 'jobId is required' });
    }

    const jobRes = await pool.query('SELECT * FROM jobs WHERE id = $1;', [jobId]);
    if (jobRes.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }
    const job = jobRes.rows[0];

    const { payment, created } = await createPayment({
      jobId,
      customerId: job.customer_id,
      amount: parseFloat(job.amount),
      method,
    });

    res.status(created ? 201 : 200).json({ ...payment, isDemo: true, disclaimer: DEMO_DISCLAIMER });
  } catch (err) {
    console.error('Error creating demo payment:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/payments/verify
// body: { paymentId } or { jobId }
router.post('/verify', async (req, res) => {
  try {
    const { paymentId, jobId } = req.body;
    if (!paymentId && !jobId) {
      return res.status(400).json({ error: 'paymentId or jobId is required' });
    }

    const payment = await verifyPayment({ paymentId, jobId });
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Best-effort notification; never fails the payment response.
    if (payment.customerId) {
      await createNotification({
        userId: payment.customerId,
        userType: 'customer',
        jobId: payment.jobId,
        type: NOTIFICATION_TYPES.PAYMENT_SUCCESS,
        title: 'Payment successful (demo)',
        message: `Your demo payment of ₹${payment.amount} was successful.`,
      });
    }

    res.json({ ...payment, isDemo: true, disclaimer: DEMO_DISCLAIMER });
  } catch (err) {
    console.error('Error verifying demo payment:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/payments/:jobId
router.get('/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const payment = await getPaymentByJob(jobId);
    if (!payment) {
      return res.status(404).json({ error: 'No payment found for this job' });
    }
    res.json({ ...payment, isDemo: true, disclaimer: DEMO_DISCLAIMER });
  } catch (err) {
    console.error('Error fetching payment:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
