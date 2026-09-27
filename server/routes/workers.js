const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { pool } = require('../db');
const { authenticateToken, requireSelfOrRoles, requireAnyRole } = require('../middleware/auth');
const { ROLES } = require('../config/jwt');

// Utility: Haversine distance in km
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Calculate Composite Fairness Score
const calculateFairnessScore = (worker, category, weights) => {
  const skillScore = worker.category === category ? 1.0 : 0.5;
  const maxDist = 10;
  const dist = worker.computedDistanceKm ?? worker.distanceKm ?? 1;
  const distScore = Math.max(0, (maxDist - dist) / maxDist);
  const ratingScore = (worker.rating || 0) / 5;
  const maxJobs = 8;
  const fairnessScore = Math.max(0, (maxJobs - (worker.todayJobs || 0)) / maxJobs);

  const composite =
    (weights.skillMatch ?? 0.35) * skillScore +
    (weights.distance ?? 0.25) * distScore +
    (weights.rating ?? 0.20) * ratingScore +
    (weights.fairnessPenalty ?? 0.20) * fairnessScore;

  return parseFloat((composite * 100).toFixed(1));
};

// Format SQL row into frontend worker model
const formatWorker = (row, skillsMap = {}, languagesMap = {}) => ({
  id: row.id,
  name: row.name,
  avatar: row.avatar_url || 'https://i.pravatar.cc/150?img=11',
  category: row.category_id,
  cooperative: row.cooperative_name || row.cooperative_id,
  cooperativeName: row.cooperative_name || row.cooperative_id || null,
  skills: skillsMap[row.id] || (row.skills_agg ? row.skills_agg.split(',') : [row.category_id]),
  languages: languagesMap[row.id] || (row.languages_agg ? row.languages_agg.split(',') : ['Kannada']),
  rating: parseFloat(row.rating) || 0,
  totalJobs: parseInt(row.total_jobs, 10) || 0,
  todayJobs: parseInt(row.today_jobs, 10) || 0,
  todayEarnings: parseFloat(row.today_earnings) || 0,
  isVerified: Boolean(row.is_verified),
  isOnline: Boolean(row.is_online),
  location: {
    latitude: parseFloat(row.latitude) || 12.9416,
    longitude: parseFloat(row.longitude) || 77.5661,
  },
  distanceKm: parseFloat(row.distance_km) || 0.5,
  etaMinutes: parseInt(row.eta_minutes, 10) || 10,
  yearsExperience: parseInt(row.years_experience, 10) || 0,
  pricePerHour: parseFloat(row.price_per_hour) || 300,
  kyc_status: row.kyc_status || 'pending',
  weeklyJobs: row.weekly_jobs || [0, 0, 0, 0, 0, 0, 0],
  phone: row.phone,
  email: row.email,
});

// GET /api/workers
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT w.*, c.name as cooperative_name,
        string_agg(DISTINCT ws.skill, ',') as skills_agg,
        string_agg(DISTINCT wl.language, ',') as languages_agg
      FROM workers w
      LEFT JOIN cooperatives c ON w.cooperative_id = c.id
      LEFT JOIN worker_skills ws ON w.id = ws.worker_id
      LEFT JOIN worker_languages wl ON w.id = wl.worker_id
      GROUP BY w.id, c.name
      ORDER BY w.name ASC;
    `;
    const result = await pool.query(query);
    const workers = result.rows.map((row) => formatWorker(row));
    res.json(workers);
  } catch (err) {
    console.error('Error fetching workers:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/workers/nearby
router.get('/nearby', async (req, res) => {
  try {
    const { category, latitude, longitude, radius = 10 } = req.query;
    const userLat = parseFloat(latitude) || 12.9416;
    const userLon = parseFloat(longitude) || 77.5661;
    const searchRadius = parseFloat(radius) || 10;

    // Fetch ranking weights
    const weightsRes = await pool.query('SELECT * FROM ranking_weights ORDER BY id DESC LIMIT 1;');
    const weights = weightsRes.rows[0]
      ? {
          skillMatch: parseFloat(weightsRes.rows[0].skill_match),
          distance: parseFloat(weightsRes.rows[0].distance),
          rating: parseFloat(weightsRes.rows[0].rating),
          fairnessPenalty: parseFloat(weightsRes.rows[0].fairness_penalty),
        }
      : { skillMatch: 0.35, distance: 0.25, rating: 0.20, fairnessPenalty: 0.20 };

    // Customer visibility rule (current iteration): a worker is eligible
    // to be found the moment their cooperative has approved them —
    // is_online is NOT part of this filter for now (see task notes).
    // Category matching uses workers.category_id directly, since every
    // worker now has exactly ONE primary category and that column is
    // the single source of truth (no more worker_skills fallback here).
    const categoryFilter = category && category !== 'general' ? category : null;

    const query = `
      SELECT w.*, c.name as cooperative_name,
        string_agg(DISTINCT ws.skill, ',') as skills_agg,
        string_agg(DISTINCT wl.language, ',') as languages_agg
      FROM workers w
      LEFT JOIN cooperatives c ON w.cooperative_id = c.id
      LEFT JOIN worker_skills ws ON w.id = ws.worker_id
      LEFT JOIN worker_languages wl ON w.id = wl.worker_id
      WHERE w.is_verified = TRUE
        AND ($1::text IS NULL OR w.category_id = $1)
      GROUP BY w.id, c.name;
    `;
    const result = await pool.query(query, [categoryFilter]);

    let workers = result.rows.map((row) => formatWorker(row));

    // Distance computation and filter
    const scoredWorkers = workers
      .map((w) => {
        const computedDist = parseFloat(
          haversineDistance(userLat, userLon, w.location.latitude, w.location.longitude).toFixed(2)
        );
        const workerWithDist = {
          ...w,
          computedDistanceKm: computedDist,
          estimatedEta: Math.round(computedDist * 4 + 5),
        };
        const score = calculateFairnessScore(workerWithDist, category || 'general', weights);
        return {
          ...workerWithDist,
          score,
        };
      })
      .filter((w) => w.computedDistanceKm <= searchRadius)
      .sort((a, b) => b.score - a.score);

    res.json(scoredWorkers);
  } catch (err) {
    console.error('Error fetching nearby workers:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/workers/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT w.*, c.name as cooperative_name,
        string_agg(DISTINCT ws.skill, ',') as skills_agg,
        string_agg(DISTINCT wl.language, ',') as languages_agg
      FROM workers w
      LEFT JOIN cooperatives c ON w.cooperative_id = c.id
      LEFT JOIN worker_skills ws ON w.id = ws.worker_id
      LEFT JOIN worker_languages wl ON w.id = wl.worker_id
      WHERE w.id = $1
      GROUP BY w.id, c.name;
    `;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Worker not found' });
    }
    res.json(formatWorker(result.rows[0]));
  } catch (err) {
    console.error('Error fetching worker details:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/workers/:id/status
// Only the worker themself (or a cooperative/platform admin) may flip
// their own online/offline status — never trust an id passed by an
// unauthenticated caller.
router.put(
  '/:id/status',
  authenticateToken,
  requireSelfOrRoles('id', ROLES.COOPERATIVE_ADMIN, ROLES.PLATFORM_ADMIN),
  async (req, res) => {
  try {
    const { id } = req.params;
    const { isOnline } = req.body;
    const result = await pool.query(
      `UPDATE workers SET is_online = $1 WHERE id = $2 RETURNING *;`,
      [isOnline, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Worker not found' });
    }
    res.json({ workerId: id, isOnline, success: true });
  } catch (err) {
    console.error('Error updating worker status:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/workers (Registration)
// `password` is optional for backward compatibility with the existing
// mobile registration flow, which does not collect one yet. When
// provided, it is hashed and stored so the worker can later use
// POST /api/auth/worker/login. A worker is NEVER marked verified or
// eligible for matching just by registering — that only happens once
// their KYC application is approved (see routes/kyc.js).
router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const {
      name,
      phone,
      email,
      password,
      // `categoryId` is the forward-looking single-category field; `skills`
      // is kept only for backward compatibility with older clients that
      // still send an array. Either way, exactly ONE category is used —
      // a worker has one primary skill, not a list.
      categoryId,
      skills = [],
      yearsExperience,
      cooperative = 'coop_jp_nagar',
      serviceArea,
      availability = 'Flexible',
      pricePerHour = 350,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required.' });
    }
    if (!phone || phone.replace(/[^0-9]/g, '').length < 8) {
      return res.status(400).json({ error: 'A valid contact number is required.' });
    }
    if (password && password.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters.' });
    }

    const category = (categoryId || skills[0] || '').toString().trim().toLowerCase();
    if (!category) {
      return res.status(400).json({ error: 'Please select one service category.' });
    }

    // The category MUST be a real service_categories.id — workers.category_id
    // has a foreign key to it, so validate up front and return a clean 400
    // instead of a raw FK-violation 500 if an unknown value is sent.
    const categoryCheck = await client.query('SELECT id FROM service_categories WHERE id = $1;', [category]);
    if (categoryCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: `Unknown service category: ${category}` });
    }

    const id = `w${Date.now()}`;
    const passwordHash = password ? await bcrypt.hash(password, await bcrypt.genSalt(10)) : null;
    // BUGFIX: an empty string is not NULL. uq_workers_email is a partial
    // unique index (WHERE email IS NOT NULL), so every worker registered
    // with a blank email was colliding on email = '' after the first one.
    // Normalize blank/whitespace-only email to NULL so the partial index
    // actually skips it, same as intended.
    const normalizedEmail = email && email.trim() ? email.trim() : null;

    // Reject duplicate accounts up front with a clear message, instead of
    // letting it fall through to the unique-index violation below. This
    // also guarantees we never create a dangling kyc_applications row for
    // an account that didn't actually get (re-)created.
    const cleanPhoneDigits = phone.replace(/[^0-9]/g, '').slice(-10);
    const dupCheck = await client.query(
      `SELECT id FROM workers
       WHERE RIGHT(regexp_replace(COALESCE(phone, ''), '[^0-9]', '', 'g'), 10) = $1
          OR ($2::text IS NOT NULL AND email = $2)
       LIMIT 1;`,
      [cleanPhoneDigits, normalizedEmail]
    );
    if (dupCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'A worker account with this phone number or email already exists. Please log in instead.' });
    }

    // Look up cooperative id
    let coopId = cooperative;
    const coopRes = await client.query('SELECT id FROM cooperatives WHERE name ILIKE $1 OR id = $2 LIMIT 1;', [cooperative, cooperative]);
    if (coopRes.rows.length > 0) {
      coopId = coopRes.rows[0].id;
    }

    const insertWorkerQuery = `
      INSERT INTO workers (
        id, name, phone, email, category_id, cooperative_id,
        years_experience, price_per_hour, kyc_status, is_verified, is_online,
        latitude, longitude, distance_km, eta_minutes, service_area, availability,
        password_hash
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', false, false, 12.9416, 77.5661, 0.5, 10, $9, $10, $11)
      RETURNING *;
    `;
    await client.query(insertWorkerQuery, [
      id,
      name,
      phone,
      normalizedEmail,
      category,
      coopId,
      parseInt(yearsExperience, 10) || 0,
      parseFloat(pricePerHour) || 350,
      serviceArea,
      availability,
      passwordHash,
    ]);

    // Backward-compatible worker_skills row. A worker now has exactly ONE
    // category, so exactly ONE row is inserted here (never a loop over
    // multiple skills) — workers.category_id remains the single source of
    // truth for category matching; this row is kept only so any existing
    // reads of worker_skills keep working.
    await client.query(
      `INSERT INTO worker_skills (worker_id, skill) VALUES ($1, $2) ON CONFLICT DO NOTHING;`,
      [id, category]
    );

    // Insert pending KYC
    const kycId = `kyc${Date.now()}`;
    await client.query(
      `INSERT INTO kyc_applications (id, worker_id, cooperative_id, phone, status, notes)
       VALUES ($1, $2, $3, $4, 'pending', 'Submitted via mobile registration');`,
      [kycId, id, coopId, phone]
    );

    await client.query('COMMIT');
    res.status(201).json({ id, message: 'Worker registered successfully in PostgreSQL', kycId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error registering worker:', err);
    // 23505 = unique_violation (e.g. a concurrent request won the race
    // against the dupCheck above). Surface it as a clean 409 instead of
    // a raw 500 with a Postgres constraint name in it.
    if (err.code === '23505') {
      return res.status(409).json({ error: 'A worker account with this phone number or email already exists. Please log in instead.' });
    }
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// ─────────────────────────────────────────────────────────────
// Worker Availability — base structure only. This is intentionally
// simple CRUD over day-of-week/time-window slots; the actual
// scheduling/matching logic that consumes this belongs to the Fair
// Matching Engine (Person 2), not here.
// ─────────────────────────────────────────────────────────────

const formatAvailability = (row) => ({
  id: row.id,
  workerId: row.worker_id,
  dayOfWeek: row.day_of_week,
  startTime: row.start_time,
  endTime: row.end_time,
  isAvailable: Boolean(row.is_available),
});

// GET /api/workers/:id/availability — public (needed to show a
// worker's schedule to customers browsing the marketplace).
router.get('/:id/availability', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM worker_availability WHERE worker_id = $1 ORDER BY day_of_week, start_time;`,
      [req.params.id]
    );
    res.json(result.rows.map(formatAvailability));
  } catch (err) {
    console.error('Error fetching worker availability:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/workers/:id/availability — only the worker themself (or
// a cooperative/platform admin) can set their availability slots.
router.post(
  '/:id/availability',
  authenticateToken,
  requireSelfOrRoles('id', ROLES.COOPERATIVE_ADMIN, ROLES.PLATFORM_ADMIN),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { dayOfWeek, startTime, endTime, isAvailable = true } = req.body;

      if (dayOfWeek === undefined || dayOfWeek < 0 || dayOfWeek > 6) {
        return res.status(400).json({ error: 'dayOfWeek must be between 0 (Sunday) and 6 (Saturday).' });
      }
      if (!startTime || !endTime) {
        return res.status(400).json({ error: 'startTime and endTime are required (HH:MM).' });
      }

      const slotId = `wa${Date.now()}`;
      const result = await pool.query(
        `INSERT INTO worker_availability (id, worker_id, day_of_week, start_time, end_time, is_available)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (worker_id, day_of_week, start_time)
         DO UPDATE SET end_time = EXCLUDED.end_time, is_available = EXCLUDED.is_available
         RETURNING *;`,
        [slotId, id, dayOfWeek, startTime, endTime, isAvailable]
      );
      res.status(201).json(formatAvailability(result.rows[0]));
    } catch (err) {
      console.error('Error setting worker availability:', err);
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
