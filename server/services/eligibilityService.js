/**
 * Eligibility Service (Person 2 — matching-ai branch)
 *
 * Filters the workers table down to workers who are actually allowed
 * to be matched for a given request. This ALWAYS runs before the Fair
 * Matching Engine scores anyone — fairness never overrides eligibility.
 *
 * Reuses the existing `workers`, `worker_skills`, `kyc_applications` and
 * `jobs` tables/columns exactly as created by Person 1. Nothing here
 * alters schema, auth, RBAC or KYC.
 */

const { pool } = require('../db');
const { DEFAULT_MAX_DISTANCE_KM, ACTIVE_JOB_STATUSES } = require('../config/matching');

// Haversine fallback (km) — used when PostGIS geometry columns aren't
// populated / available. Kept identical in spirit to the one already
// used in routes/workers.js so distance numbers stay consistent
// across the app.
function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  if ([lat1, lon1, lat2, lon2].some((v) => v === null || v === undefined || Number.isNaN(v))) {
    return Infinity;
  }
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Detect whether PostGIS is actually installed & usable in this DB.
 * Cached for the lifetime of the process so we don't re-check on
 * every request.
 */
let _postgisAvailable = null;
async function isPostGISAvailable() {
  if (_postgisAvailable !== null) return _postgisAvailable;
  try {
    const res = await pool.query(
      `SELECT 1 FROM pg_extension WHERE extname = 'postgis' LIMIT 1;`
    );
    _postgisAvailable = res.rowCount > 0;
  } catch (err) {
    _postgisAvailable = false;
  }
  return _postgisAvailable;
}

/**
 * A worker "has" the required skill if their category matches the
 * requested serviceCategory OR the specific requiredSkill tag appears
 * in their worker_skills rows. Category match alone is treated as
 * sufficient (a plumber is eligible for any plumbing job), matching
 * how workers register today (see server/routes/workers.js POST /).
 */
function hasRequiredSkill(worker, { serviceCategory, requiredSkill }) {
  if (serviceCategory && worker.category_id === serviceCategory) return true;
  if (requiredSkill && Array.isArray(worker.skills) && worker.skills.includes(requiredSkill)) {
    return true;
  }
  return false;
}

/**
 * Fetch workers currently tied up with an active job so they can be
 * excluded. A single DB round-trip for the whole candidate pool
 * rather than one query per worker.
 */
async function getBusyWorkerIds() {
  const placeholders = ACTIVE_JOB_STATUSES.map((_, i) => `$${i + 1}`).join(', ');
  const res = await pool.query(
    `SELECT DISTINCT worker_id FROM jobs WHERE status IN (${placeholders});`,
    ACTIVE_JOB_STATUSES
  );
  return new Set(res.rows.map((r) => r.worker_id));
}

/**
 * Core eligibility predicate for a single already-loaded worker row.
 * Distance must already be computed and attached as worker.distanceKm.
 */
function isEligible(worker, requirements, busyWorkerIds) {
  const { serviceCategory, requiredSkill, maxDistanceKm = DEFAULT_MAX_DISTANCE_KM } = requirements;

  if (!worker.is_verified) return { eligible: false, reason: 'not_verified' };
  if (worker.kyc_status === 'rejected') return { eligible: false, reason: 'kyc_rejected' };
  if (!worker.is_online) return { eligible: false, reason: 'not_available' };
  if (!hasRequiredSkill(worker, { serviceCategory, requiredSkill })) {
    return { eligible: false, reason: 'skill_mismatch' };
  }
  if (!(worker.distanceKm <= maxDistanceKm)) return { eligible: false, reason: 'out_of_service_area' };
  if (busyWorkerIds.has(worker.id)) return { eligible: false, reason: 'busy_with_active_job' };

  return { eligible: true, reason: null };
}

/**
 * Main entry point: given structured requirements, return the list of
 * eligible workers with their computed distance, ready to be handed
 * to the Fair Matching Engine.
 *
 * requirements: { serviceCategory, requiredSkill, latitude, longitude, maxDistanceKm? }
 */
async function getEligibleWorkers(requirements) {
  const { serviceCategory, latitude, longitude, maxDistanceKm = DEFAULT_MAX_DISTANCE_KM } = requirements;

  if (latitude === undefined || longitude === undefined || latitude === null || longitude === null) {
    throw new Error('latitude and longitude are required to evaluate eligibility.');
  }
  if (!serviceCategory) {
    throw new Error('serviceCategory is required to evaluate eligibility.');
  }

  // 7. Required service category must be one we actually support.
  const categoryCheck = await pool.query(
    'SELECT id FROM service_categories WHERE id = $1;',
    [serviceCategory]
  );
  if (categoryCheck.rows.length === 0) {
    return { eligible: [], rejected: [], usedPostGIS: false, error: `Unsupported service category: ${serviceCategory}` };
  }

  const usePostGIS = await isPostGISAvailable();
  let rows;
  let usedPostGIS = false;

  if (usePostGIS) {
    // Geospatial nearby-worker query. Coordinates are stored as plain
    // NUMERIC columns (no geometry column yet), so we build a
    // geography point on the fly rather than requiring a schema
    // change — this still lets Postgres/PostGIS do the distance math
    // instead of plain JS Haversine.
    try {
      const res = await pool.query(
        `SELECT w.*,
                string_agg(DISTINCT ws.skill, ',') AS skills_agg,
                ST_Distance(
                  ST_MakePoint(w.longitude, w.latitude)::geography,
                  ST_MakePoint($1, $2)::geography
                ) / 1000.0 AS distance_km
         FROM workers w
         LEFT JOIN worker_skills ws ON w.id = ws.worker_id
         WHERE w.latitude IS NOT NULL AND w.longitude IS NOT NULL
         GROUP BY w.id
         HAVING ST_Distance(
                  ST_MakePoint(w.longitude, w.latitude)::geography,
                  ST_MakePoint($1, $2)::geography
                ) / 1000.0 <= $3
         ORDER BY distance_km ASC;`,
        [longitude, latitude, maxDistanceKm]
      );
      rows = res.rows;
      usedPostGIS = true;
    } catch (err) {
      // PostGIS extension exists but the query failed for some other
      // reason (e.g. permissions) — fail open to the Haversine path
      // rather than breaking the demo.
      rows = null;
    }
  }

  if (!rows) {
    const res = await pool.query(
      `SELECT w.*, string_agg(DISTINCT ws.skill, ',') AS skills_agg
       FROM workers w
       LEFT JOIN worker_skills ws ON w.id = ws.worker_id
       GROUP BY w.id;`
    );
    rows = res.rows.map((row) => ({
      ...row,
      distance_km: haversineDistanceKm(latitude, longitude, parseFloat(row.latitude), parseFloat(row.longitude)),
    }));
  }

  const busyWorkerIds = await getBusyWorkerIds();

  const eligible = [];
  const rejected = [];

  for (const row of rows) {
    const worker = {
      id: row.id,
      name: row.name,
      category_id: row.category_id,
      cooperative_id: row.cooperative_id,
      skills: row.skills_agg ? row.skills_agg.split(',') : [row.category_id],
      rating: parseFloat(row.rating) || 0,
      total_jobs: parseInt(row.total_jobs, 10) || 0,
      today_jobs: parseInt(row.today_jobs, 10) || 0,
      weekly_jobs: row.weekly_jobs || [0, 0, 0, 0, 0, 0, 0],
      is_verified: Boolean(row.is_verified),
      is_online: Boolean(row.is_online),
      kyc_status: row.kyc_status,
      distanceKm: parseFloat(row.distance_km),
      pricePerHour: parseFloat(row.price_per_hour) || 0,
    };

    const check = isEligible(worker, requirements, busyWorkerIds);
    if (check.eligible) {
      eligible.push(worker);
    } else {
      rejected.push({ workerId: worker.id, reason: check.reason });
    }
  }

  return { eligible, rejected, usedPostGIS };
}

module.exports = {
  getEligibleWorkers,
  isEligible,
  hasRequiredSkill,
  haversineDistanceKm,
  isPostGISAvailable,
  getBusyWorkerIds,
};
