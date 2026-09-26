const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'homesahay_sih_2026_cooperative_secret_key_x9k2m';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate JWT token for a customer
 */
function generateToken(customer) {
  return jwt.sign(
    {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      role: 'customer',
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Format customer row into API response shape
 */
function formatCustomer(c, addresses = []) {
  return {
    id: c.id,
    name: c.name,
    avatar: c.avatar_url || `https://i.pravatar.cc/150?u=${encodeURIComponent(c.id)}`,
    location: {
      latitude: parseFloat(c.latitude) || 12.9416,
      longitude: parseFloat(c.longitude) || 77.5661,
    },
    address: c.primary_address,
    phone: c.phone,
    rating: parseFloat(c.rating) || 5.0,
    totalOrders: parseInt(c.total_orders, 10) || 0,
    email: c.email,
    gender: c.gender,
    sahayCash: parseFloat(c.sahay_cash) || 0,
    savedAddresses: (addresses || []).map((a) => ({
      id: a.id,
      label: a.label,
      address: a.address,
      isDefault: a.is_default,
    })),
  };
}

// ─────────────────────────────────────────────────────────────
// POST /api/auth/register — Create a new customer account + JWT
// ─────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      name,
      phone,
      password,
      email,
      address,
      gender = 'Other',
      latitude = 12.9416,
      longitude = 77.5661,
    } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required.' });
    }
    if (!phone || phone.replace(/[^0-9]/g, '').length < 10) {
      return res.status(400).json({ error: 'A valid 10-digit phone number is required.' });
    }
    if (!password || password.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters.' });
    }

    // Check for existing phone
    const cleanPhoneDigits = phone.replace(/[^0-9]/g, '').slice(-10);
    const existing = await client.query(
      `SELECT id FROM customers WHERE RIGHT(regexp_replace(phone, '[^0-9]', '', 'g'), 10) = $1;`,
      [cleanPhoneDigits]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this phone number already exists. Please log in.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const id = `c${Date.now()}`;
    const avatarUrl = `https://i.pravatar.cc/150?u=${encodeURIComponent(id)}`;
    const formattedPhone = `+91 ${cleanPhoneDigits.slice(0, 5)} ${cleanPhoneDigits.slice(5)}`;

    const insertQuery = `
      INSERT INTO customers (
        id, name, phone, email, avatar_url, gender, rating,
        total_orders, sahay_cash, latitude, longitude, primary_address, password_hash
      )
      VALUES ($1, $2, $3, $4, $5, $6, 5.0, 0, 100.00, $7, $8, $9, $10)
      RETURNING *;
    `;
    const custRes = await client.query(insertQuery, [
      id,
      name.trim(),
      formattedPhone,
      email ? email.trim() : null,
      avatarUrl,
      gender,
      parseFloat(latitude) || 12.9416,
      parseFloat(longitude) || 77.5661,
      address ? address.trim() : 'JP Nagar, Bengaluru',
      passwordHash,
    ]);

    // Create default address entry
    const addrId = `a${Date.now()}`;
    await client.query(
      `INSERT INTO customer_addresses (id, customer_id, label, address, is_default)
       VALUES ($1, $2, 'home', $3, true);`,
      [addrId, id, address ? address.trim() : 'JP Nagar, Bengaluru']
    );

    await client.query('COMMIT');

    const c = custRes.rows[0];
    const token = generateToken(c);

    console.log(`✅ New customer registered: ${c.name} (${c.id})`);

    res.status(201).json({
      token,
      customer: formatCustomer(c, [
        { id: addrId, label: 'home', address: c.primary_address, is_default: true },
      ]),
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed: ' + err.message });
  } finally {
    client.release();
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/auth/login — Authenticate with phone + password → JWT
// ─────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required.' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Password is required.' });
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);

    // Find customer by phone (match last 10 digits regardless of formatting/spaces/+91)
    const result = await pool.query(
      `SELECT * FROM customers WHERE RIGHT(regexp_replace(phone, '[^0-9]', '', 'g'), 10) = $1;`,
      [cleanPhone]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'No account found with this phone number.' });
    }

    const c = result.rows[0];

    // Verify password
    if (!c.password_hash) {
      // Legacy account without password — accept 'demo123' as default
      if (password !== 'demo123') {
        return res.status(401).json({ error: 'Invalid password. Legacy accounts use password: demo123' });
      }
    } else {
      const isValid = await bcrypt.compare(password, c.password_hash);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid password.' });
      }
    }

    // Fetch addresses
    const addrRes = await pool.query(
      `SELECT * FROM customer_addresses WHERE customer_id = $1;`,
      [c.id]
    );

    const token = generateToken(c);

    console.log(`✅ Customer logged in: ${c.name} (${c.id})`);

    res.json({
      token,
      customer: formatCustomer(c, addrRes.rows),
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed: ' + err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/auth/me — Verify JWT and return customer profile
// ─────────────────────────────────────────────────────────────
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const custRes = await pool.query(`SELECT * FROM customers WHERE id = $1;`, [req.user.id]);
    if (custRes.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found.' });
    }

    const c = custRes.rows[0];
    const addrRes = await pool.query(
      `SELECT * FROM customer_addresses WHERE customer_id = $1;`,
      [c.id]
    );

    res.json({
      customer: formatCustomer(c, addrRes.rows),
    });
  } catch (err) {
    console.error('Token verify error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
