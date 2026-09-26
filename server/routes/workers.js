const express = require('express');
const router = express.Router();
const { pool } = require('../db');

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

    const query = `
      SELECT w.*, c.name as cooperative_name,
        string_agg(DISTINCT ws.skill, ',') as skills_agg,
        string_agg(DISTINCT wl.language, ',') as languages_agg
      FROM workers w
      LEFT JOIN cooperatives c ON w.cooperative_id = c.id
      LEFT JOIN worker_skills ws ON w.id = ws.worker_id
      LEFT JOIN worker_languages wl ON w.id = wl.worker_id
      WHERE w.is_verified = TRUE AND w.is_online = TRUE
      GROUP BY w.id, c.name;
    `;
    const result = await pool.query(query);

    let workers = result.rows.map((row) => formatWorker(row));

    // Filter by category if specified and not 'general'
    if (category && category !== 'general') {
      workers = workers.filter(
        (w) => w.category === category || w.skills.includes(category)
      );
    }

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
router.put('/:id/status', async (req, res) => {
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
router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const {
      name,
      phone,
      email,
      skills = [],
      yearsExperience,
      cooperative = 'coop_jp_nagar',
      serviceArea,
      availability = 'Flexible',
      pricePerHour = 350,
    } = req.body;

    const id = `w${Date.now()}`;
    const category = skills[0] ? skills[0].toLowerCase() : 'general';

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
        latitude, longitude, distance_km, eta_minutes, service_area, availability
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', false, false, 12.9416, 77.5661, 0.5, 10, $9, $10)
      RETURNING *;
    `;
    await client.query(insertWorkerQuery, [
      id,
      name,
      phone,
      email,
      category,
      coopId,
      parseInt(yearsExperience, 10) || 0,
      parseFloat(pricePerHour) || 350,
      serviceArea,
      availability,
    ]);

    // Insert skills
    for (const skill of skills) {
      await client.query(
        `INSERT INTO worker_skills (worker_id, skill) VALUES ($1, $2) ON CONFLICT DO NOTHING;`,
        [id, skill.toLowerCase()]
      );
    }

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
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
