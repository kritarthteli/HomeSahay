const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const {
  getNotificationsForUser,
  markNotificationRead,
} = require('../services/notificationService');

// GET /api/notifications?userId=&userType=
// Basic/demo scope (matches jobs.js): identified by query params, not
// a JWT session, since neither customer nor worker flows currently
// send an auth token on every screen. userType ('customer' | 'worker')
// is optional -- omit it to fetch everything for that userId.
router.get('/', async (req, res) => {
  try {
    const { userId, userType } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    if (userType && !['customer', 'worker'].includes(userType)) {
      return res.status(400).json({ error: "userType must be 'customer' or 'worker'" });
    }
    const notifications = await getNotificationsForUser(userId, userType);
    res.json(notifications);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await markNotificationRead(id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json({ success: true, notification });
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
