/**
 * Unit tests for the Eligibility Service, with a fully mocked DB pool
 * (no real Postgres needed to run these). Run with: node --test server/tests
 *
 * We inject a fake `../db` module into Node's require cache BEFORE
 * eligibilityService.js is first required, so `const { pool } =
 * require('../db')` inside it resolves to our mock instead of trying
 * to open a real Postgres connection.
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const dbPath = require.resolve('../db');

const WORKERS_ROWS = [
  {
    id: 'w001',
    name: 'Rajan Kumar',
    category_id: 'plumber',
    cooperative_id: 'coop_jp_nagar',
    skills_agg: 'plumber,pipe_repair,drainage',
    rating: '4.8',
    total_jobs: '312',
    today_jobs: '2',
    weekly_jobs: [4, 5, 3, 6, 2, 4, 2],
    is_verified: true,
    is_online: true,
    kyc_status: 'approved',
    latitude: '12.9388',
    longitude: '77.5710',
    price_per_hour: '350',
  },
  {
    // not verified -> must be excluded
    id: 'w_unverified',
    name: 'Unverified Worker',
    category_id: 'plumber',
    cooperative_id: 'coop_jp_nagar',
    skills_agg: 'plumber,pipe_repair',
    rating: '4.5',
    total_jobs: '10',
    today_jobs: '0',
    weekly_jobs: [0, 0, 0, 0, 0, 0, 0],
    is_verified: false,
    is_online: true,
    kyc_status: 'pending',
    latitude: '12.9390',
    longitude: '77.5715',
    price_per_hour: '300',
  },
  {
    // offline -> must be excluded
    id: 'w_offline',
    name: 'Offline Worker',
    category_id: 'plumber',
    cooperative_id: 'coop_jp_nagar',
    skills_agg: 'plumber,pipe_repair',
    rating: '4.9',
    total_jobs: '400',
    today_jobs: '1',
    weekly_jobs: [1, 1, 1, 1, 1, 1, 1],
    is_verified: true,
    is_online: false,
    kyc_status: 'approved',
    latitude: '12.9391',
    longitude: '77.5716',
    price_per_hour: '360',
  },
  {
    // wrong skill/category -> must be excluded
    id: 'w_wrong_skill',
    name: 'Electrician Worker',
    category_id: 'electrician',
    cooperative_id: 'coop_south_blr',
    skills_agg: 'electrician,wiring',
    rating: '4.9',
    total_jobs: '400',
    today_jobs: '0',
    weekly_jobs: [0, 0, 0, 0, 0, 0, 0],
    is_verified: true,
    is_online: true,
    kyc_status: 'approved',
    latitude: '12.9395',
    longitude: '77.5720',
    price_per_hour: '400',
  },
  {
    // too far -> must be excluded (Bengaluru vs Chennai-ish coords)
    id: 'w_too_far',
    name: 'Faraway Worker',
    category_id: 'plumber',
    cooperative_id: 'coop_jp_nagar',
    skills_agg: 'plumber,pipe_repair',
    rating: '4.6',
    total_jobs: '90',
    today_jobs: '0',
    weekly_jobs: [0, 0, 0, 0, 0, 0, 0],
    is_verified: true,
    is_online: true,
    kyc_status: 'approved',
    latitude: '13.5,'.split(',')[0], // 13.5 -> far north of JP Nagar
    longitude: '77.5710',
    price_per_hour: '320',
  },
  {
    // busy with an active job -> must be excluded
    id: 'w_busy',
    name: 'Busy Worker',
    category_id: 'plumber',
    cooperative_id: 'coop_jp_nagar',
    skills_agg: 'plumber,pipe_repair',
    rating: '4.7',
    total_jobs: '150',
    today_jobs: '1',
    weekly_jobs: [1, 1, 1, 1, 1, 1, 1],
    is_verified: true,
    is_online: true,
    kyc_status: 'approved',
    latitude: '12.9389',
    longitude: '77.5712',
    price_per_hour: '330',
  },
];

const fakePool = {
  query: async (text, params) => {
    if (text.includes('pg_extension')) {
      return { rowCount: 0, rows: [] }; // force Haversine fallback path
    }
    if (text.includes('FROM service_categories')) {
      const cat = params[0];
      return cat === 'plumber' ? { rows: [{ id: 'plumber' }] } : { rows: [] };
    }
    if (text.includes('FROM jobs WHERE status IN')) {
      return { rows: [{ worker_id: 'w_busy' }] };
    }
    if (text.includes('FROM workers w')) {
      return { rows: WORKERS_ROWS };
    }
    throw new Error(`Unexpected query in test mock: ${text}`);
  },
};

require.cache[dbPath] = {
  id: dbPath,
  filename: dbPath,
  loaded: true,
  exports: { pool: fakePool },
};

const { getEligibleWorkers } = require('../services/eligibilityService');

test('getEligibleWorkers: filters out unverified, offline, wrong-skill, too-far, and busy workers', async () => {
  const { eligible, rejected, usedPostGIS } = await getEligibleWorkers({
    serviceCategory: 'plumber',
    requiredSkill: 'pipe_repair',
    latitude: 12.9416, // JP Nagar, Bengaluru
    longitude: 77.5661,
    maxDistanceKm: 15,
  });

  assert.equal(usedPostGIS, false);
  const eligibleIds = eligible.map((w) => w.id).sort();
  assert.deepEqual(eligibleIds, ['w001']);

  const rejectedMap = Object.fromEntries(rejected.map((r) => [r.workerId, r.reason]));
  assert.equal(rejectedMap.w_unverified, 'not_verified');
  assert.equal(rejectedMap.w_offline, 'not_available');
  assert.equal(rejectedMap.w_wrong_skill, 'skill_mismatch');
  assert.equal(rejectedMap.w_too_far, 'out_of_service_area');
  assert.equal(rejectedMap.w_busy, 'busy_with_active_job');
});

test('getEligibleWorkers: unsupported service category returns empty with an error message', async () => {
  const { eligible, error } = await getEligibleWorkers({
    serviceCategory: 'not_a_real_category',
    requiredSkill: 'x',
    latitude: 12.9416,
    longitude: 77.5661,
  });
  assert.equal(eligible.length, 0);
  assert.match(error, /Unsupported service category/);
});
