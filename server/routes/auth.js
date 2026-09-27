const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { pool } = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { signToken, ROLES } = require('../config/jwt');

// ─────────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────────

const cleanPhone10 = (phone) => (phone || '').replace(/[^0-9]/g, '').slice(-10);

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

function formatWorkerAuth(w) {
  return {
    id: w.id,
    name: w.name,
    phone: w.phone,
    email: w.email,
    categoryId: w.category_id,
    cooperativeId: w.cooperative_id,
    isVerified: Boolean(w.is_verified),
    kycStatus: w.kyc_status,
  };
}

// =================================================================
// CUSTOMER AUTH
// (unchanged paths — /api/auth/register, /login, /me — so the
// existing app + services/apiClient.js keep working without changes)
// =================================================================

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

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required.' });
    }
    if (!phone || phone.replace(/[^0-9]/g, '').length < 10) {
      return res.status(400).json({ error: 'A valid 10-digit phone number is required.' });
    }
    if (!password || password.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters.' });
    }

    const cleanPhoneDigits = cleanPhone10(phone);
    const existing = await client.query(
      `SELECT id FROM customers WHERE RIGHT(regexp_replace(phone, '[^0-9]', '', 'g'), 10) = $1;`,
      [cleanPhoneDigits]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this phone number already exists. Please log in.' });
    }

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

    const addrId = `a${Date.now()}`;
    await client.query(
      `INSERT INTO customer_addresses (id, customer_id, label, address, is_default)
       VALUES ($1, $2, 'home', $3, true);`,
      [addrId, id, address ? address.trim() : 'JP Nagar, Bengaluru']
    );

    await client.query('COMMIT');

    const c = custRes.rows[0];
    const token = signToken({ id: c.id, name: c.name, phone: c.phone, role: ROLES.CUSTOMER });

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

router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required.' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Password is required.' });
    }

    const cleanPhone = cleanPhone10(phone);

    const result = await pool.query(
      `SELECT * FROM customers WHERE RIGHT(regexp_replace(phone, '[^0-9]', '', 'g'), 10) = $1;`,
      [cleanPhone]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'No account found with this phone number.' });
    }

    const c = result.rows[0];

    if (!c.password_hash) {
      // Legacy demo account without a password on file.
      if (password !== 'demo123') {
        return res.status(401).json({ error: 'Invalid password. Legacy accounts use password: demo123' });
      }
    } else {
      const isValid = await bcrypt.compare(password, c.password_hash);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid password.' });
      }
    }

    const addrRes = await pool.query(
      `SELECT * FROM customer_addresses WHERE customer_id = $1;`,
      [c.id]
    );

    const token = signToken({ id: c.id, name: c.name, phone: c.phone, role: ROLES.CUSTOMER });

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

router.get('/me', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== ROLES.CUSTOMER) {
      return res.status(403).json({ error: 'This endpoint is for customer accounts. Use the role-specific /me for other roles.' });
    }
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

// =================================================================
// WORKER AUTH
// New: workers can log in once they've registered with a password
// (see POST /api/workers, which accepts an optional `password`).
// Logging in does NOT require KYC approval — but req.user.isVerified
// reflects the real, server-side verification state, and every
// matching/dispatch decision must check that independently rather
// than trusting a client-supplied "verified" flag.
// =================================================================

router.post('/worker/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ error: 'Phone number and password are required.' });
    }

    const cleanPhone = cleanPhone10(phone);
    const result = await pool.query(
      `SELECT * FROM workers WHERE RIGHT(regexp_replace(COALESCE(phone, ''), '[^0-9]', '', 'g'), 10) = $1;`,
      [cleanPhone]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'No worker account found with this phone number.' });
    }

    const w = result.rows[0];
    if (!w.password_hash) {
      return res.status(401).json({ error: 'This worker account has no password set yet. Contact your cooperative to set one up.' });
    }

    const isValid = await bcrypt.compare(password, w.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid password.' });
    }

    const token = signToken({
      id: w.id,
      name: w.name,
      phone: w.phone,
      role: ROLES.WORKER,
      cooperativeId: w.cooperative_id,
    });

    console.log(`✅ Worker logged in: ${w.name} (${w.id})`);
    res.json({ token, worker: formatWorkerAuth(w) });
  } catch (err) {
    console.error('Worker login error:', err);
    res.status(500).json({ error: 'Login failed: ' + err.message });
  }
});

router.get('/worker/me', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== ROLES.WORKER) {
      return res.status(403).json({ error: 'This endpoint is for worker accounts.' });
    }
    const result = await pool.query(`SELECT * FROM workers WHERE id = $1;`, [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Worker not found.' });
    }
    res.json({ worker: formatWorkerAuth(result.rows[0]) });
  } catch (err) {
    console.error('Worker token verify error:', err);
    res.status(500).json({ error: err.message });
  }
});

// =================================================================
// COOPERATIVE ADMIN AUTH
// =================================================================

function formatCoopAdminAuth(admin, cooperativeName = null) {
  return {
    id: admin.id,
    name: admin.name,
    phone: admin.phone,
    email: admin.email,
    cooperativeId: admin.cooperative_id,
    cooperativeName,
  };
}

router.post('/cooperative-admin/login', async (req, res) => {
  try {
    const { phone, email, password } = req.body;
    if ((!phone && !email) || !password) {
      return res.status(400).json({ error: 'Phone or email, and password, are required.' });
    }

    let result;
    if (phone) {
      const cleanPhone = cleanPhone10(phone);
      result = await pool.query(
        `SELECT * FROM cooperative_members
         WHERE role = 'ADMIN' AND RIGHT(regexp_replace(COALESCE(phone, ''), '[^0-9]', '', 'g'), 10) = $1;`,
        [cleanPhone]
      );
    } else {
      result = await pool.query(
        `SELECT * FROM cooperative_members WHERE role = 'ADMIN' AND email = $1;`,
        [email.trim().toLowerCase()]
      );
    }

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'No cooperative admin account found.' });
    }

    const admin = result.rows[0];
    if (!admin.password_hash) {
      return res.status(401).json({ error: 'This account has no password set yet.' });
    }

    const isValid = await bcrypt.compare(password, admin.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid password.' });
    }

    const token = signToken({
      id: admin.id,
      name: admin.name,
      role: ROLES.COOPERATIVE_ADMIN,
      cooperativeId: admin.cooperative_id,
    });

    const coopRes = await pool.query('SELECT name FROM cooperatives WHERE id = $1;', [admin.cooperative_id]);
    const cooperativeName = coopRes.rows[0]?.name || null;

    console.log(`✅ Cooperative admin logged in: ${admin.name} (${admin.id})`);
    res.json({
      token,
      admin: formatCoopAdminAuth(admin, cooperativeName),
    });
  } catch (err) {
    console.error('Cooperative admin login error:', err);
    res.status(500).json({ error: 'Login failed: ' + err.message });
  }
});

// GET /api/auth/cooperative-admin/me — used to restore a saved session
// (same pattern as /auth/me and /auth/worker/me above). Re-checks the
// DB rather than trusting only the JWT, so a deactivated/removed admin
// can't keep using a still-valid token indefinitely.
router.get('/cooperative-admin/me', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== ROLES.COOPERATIVE_ADMIN) {
      return res.status(403).json({ error: 'This endpoint is for cooperative admin accounts.' });
    }
    const result = await pool.query(`SELECT * FROM cooperative_members WHERE id = $1 AND role = 'ADMIN';`, [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cooperative admin not found.' });
    }
    const admin = result.rows[0];
    const coopRes = await pool.query('SELECT name FROM cooperatives WHERE id = $1;', [admin.cooperative_id]);
    const cooperativeName = coopRes.rows[0]?.name || null;
    res.json({ admin: formatCoopAdminAuth(admin, cooperativeName) });
  } catch (err) {
    console.error('Cooperative admin token verify error:', err);
    res.status(500).json({ error: err.message });
  }
});

// =================================================================
// PLATFORM ADMIN AUTH
// =================================================================

router.post('/admin/login', async (req, res) => {
  try {
    const { phone, email, password } = req.body;
    if ((!phone && !email) || !password) {
      return res.status(400).json({ error: 'Phone or email, and password, are required.' });
    }

    let result;
    if (phone) {
      const cleanPhone = cleanPhone10(phone);
      result = await pool.query(
        `SELECT * FROM platform_admins
         WHERE RIGHT(regexp_replace(COALESCE(phone, ''), '[^0-9]', '', 'g'), 10) = $1;`,
        [cleanPhone]
      );
    } else {
      result = await pool.query(`SELECT * FROM platform_admins WHERE email = $1;`, [email.trim().toLowerCase()]);
    }

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'No platform admin account found.' });
    }

    const admin = result.rows[0];
    const isValid = await bcrypt.compare(password, admin.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid password.' });
    }

    const token = signToken({ id: admin.id, name: admin.name, role: ROLES.PLATFORM_ADMIN });

    console.log(`✅ Platform admin logged in: ${admin.name} (${admin.id})`);
    res.json({
      token,
      admin: { id: admin.id, name: admin.name, phone: admin.phone, email: admin.email },
    });
  } catch (err) {
    console.error('Platform admin login error:', err);
    res.status(500).json({ error: 'Login failed: ' + err.message });
  }
});

module.exports = router;
