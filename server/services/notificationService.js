const { pool } = require('../db');

// ─────────────────────────────────────────────────────────────
// Simple in-app/database notification service (Person 3 scope).
// No push notifications -- rows in `notifications`, read via
// GET /api/notifications and PATCH /api/notifications/:id/read.
// ─────────────────────────────────────────────────────────────

const NOTIFICATION_TYPES = Object.freeze({
  BOOKING_CREATED: 'booking_created',
  WORKER_ASSIGNED: 'worker_assigned',
  WORKER_ACCEPTED: 'worker_accepted',
  WORKER_REJECTED: 'worker_rejected',
  JOB_IN_PROGRESS: 'job_in_progress',
  JOB_COMPLETED: 'job_completed',
  JOB_CANCELLED: 'job_cancelled',
  PAYMENT_SUCCESS: 'payment_success',
});

function formatNotification(row) {
  return {
    id: row.id,
    userId: row.user_id,
    userType: row.user_type,
    jobId: row.job_id,
    type: row.type,
    title: row.title,
    message: row.message,
    isRead: Boolean(row.is_read),
    createdAt: row.created_at,
  };
}

/**
 * Create and persist a single notification. Never throws into the
 * caller's main flow -- a notification failure should not fail a
 * booking/status update, so callers should fire-and-forget this
 * (it already logs its own errors) rather than let it roll back a
 * transaction the notification isn't really part of.
 */
async function createNotification({ userId, userType, jobId = null, type, title, message }) {
  try {
    if (!userId || !userType || !type || !title || !message) {
      console.error('notificationService: missing required field(s), skipping notification', {
        userId,
        userType,
        type,
      });
      return null;
    }
    const id = `n${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const result = await pool.query(
      `INSERT INTO notifications (id, user_id, user_type, job_id, type, title, message)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *;`,
      [id, userId, userType, jobId, type, title, message]
    );
    return formatNotification(result.rows[0]);
  } catch (err) {
    console.error('notificationService: failed to create notification:', err.message);
    return null;
  }
}

async function getNotificationsForUser(userId, userType) {
  const result = await pool.query(
    `SELECT * FROM notifications
     WHERE user_id = $1 AND ($2::text IS NULL OR user_type = $2)
     ORDER BY created_at DESC;`,
    [userId, userType || null]
  );
  return result.rows.map(formatNotification);
}

async function markNotificationRead(id) {
  const result = await pool.query(
    `UPDATE notifications SET is_read = TRUE WHERE id = $1 RETURNING *;`,
    [id]
  );
  return result.rows[0] ? formatNotification(result.rows[0]) : null;
}

module.exports = {
  NOTIFICATION_TYPES,
  createNotification,
  getNotificationsForUser,
  markNotificationRead,
  formatNotification,
};
