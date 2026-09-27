/**
 * Unit tests for the Fair Matching Engine.
 * Run with: node --test server/tests
 *
 * Demo scenario required by the task brief:
 *   Worker A: excellent rating, excellent skill, HIGH workload
 *   Worker B: slightly lower rating, excellent skill, LOW workload
 *   Worker C: good rating, wrong/poor skill or too far
 *
 * Assertion: the system must NOT blindly always choose Worker A —
 * Worker B should be able to rank competitively (here, actually win)
 * because of workload fairness, without sacrificing eligibility.
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  rankWorkers,
  scoreSkill,
  scoreDistance,
  scoreRating,
  scoreWorkloadForPool,
  recentWorkload,
} = require('../services/matchingService');

const requirements = {
  serviceCategory: 'plumber',
  requiredSkill: 'pipe_repair',
  maxDistanceKm: 15,
};

function makeWorker(overrides) {
  return {
    id: 'w_base',
    name: 'Base Worker',
    category_id: 'plumber',
    skills: ['plumber', 'pipe_repair'],
    rating: 4.5,
    today_jobs: 0,
    weekly_jobs: [0, 0, 0, 0, 0, 0, 0],
    distanceKm: 2,
    ...overrides,
  };
}

test('scoreSkill: exact requiredSkill match scores highest', () => {
  const w = makeWorker({ skills: ['plumber', 'pipe_repair'] });
  assert.equal(scoreSkill(w, requirements), 1.0);
});

test('scoreSkill: category-only match scores partial credit', () => {
  const w = makeWorker({ skills: ['plumber'] });
  assert.equal(scoreSkill(w, requirements), 0.7);
});

test('scoreSkill: no match at all scores zero', () => {
  const w = makeWorker({ category_id: 'electrician', skills: ['electrician'] });
  assert.equal(scoreSkill(w, requirements), 0.0);
});

test('scoreDistance: 0km is a perfect score, maxDistanceKm is zero', () => {
  assert.equal(scoreDistance(0, 15), 1);
  assert.equal(scoreDistance(15, 15), 0);
  assert.ok(scoreDistance(7.5, 15) > 0.4 && scoreDistance(7.5, 15) < 0.6);
});

test('scoreDistance: never goes negative for out-of-range input', () => {
  assert.equal(scoreDistance(20, 15), 0);
});

test('scoreRating: normalizes out of 5', () => {
  assert.equal(scoreRating(makeWorker({ rating: 5 })), 1);
  assert.equal(scoreRating(makeWorker({ rating: 0 })), 0);
  assert.equal(scoreRating(makeWorker({ rating: 2.5 })), 0.5);
});

test('scoreWorkloadForPool: fewest-jobs worker gets 1.0, most-jobs worker gets 0.0', () => {
  const light = makeWorker({ id: 'light', today_jobs: 0, weekly_jobs: [1, 1, 0, 0, 0, 0, 0] });
  const heavy = makeWorker({ id: 'heavy', today_jobs: 5, weekly_jobs: [8, 7, 9, 8, 6, 8, 5] });
  const [lightScore, heavyScore] = scoreWorkloadForPool([light, heavy]);
  assert.equal(lightScore, 1);
  assert.equal(heavyScore, 0);
});

test('scoreWorkloadForPool: equal workload across the pool penalizes nobody', () => {
  const a = makeWorker({ id: 'a', today_jobs: 3, weekly_jobs: [3, 3, 3, 3, 3, 3, 3] });
  const b = makeWorker({ id: 'b', today_jobs: 3, weekly_jobs: [3, 3, 3, 3, 3, 3, 3] });
  const scores = scoreWorkloadForPool([a, b]);
  assert.deepEqual(scores, [1, 1]);
});

test('recentWorkload sums today_jobs + weekly_jobs', () => {
  const w = makeWorker({ today_jobs: 2, weekly_jobs: [1, 1, 1, 1, 1, 1, 1] });
  assert.equal(recentWorkload(w), 9);
});

test('rankWorkers: demo scenario — fairness lets underutilized Worker B win over overworked, higher-rated Worker A', () => {
  const workerA = makeWorker({
    id: 'workerA',
    name: 'Worker A (overworked star)',
    rating: 4.9,
    skills: ['plumber', 'pipe_repair'],
    distanceKm: 2,
    today_jobs: 5,
    weekly_jobs: [8, 7, 9, 8, 6, 8, 5], // very high recent workload
  });

  const workerB = makeWorker({
    id: 'workerB',
    name: 'Worker B (underutilized but suitable)',
    rating: 4.6, // slightly lower, still excellent
    skills: ['plumber', 'pipe_repair'],
    distanceKm: 3, // reasonable distance
    today_jobs: 0,
    weekly_jobs: [1, 0, 1, 0, 0, 0, 0], // low recent workload
  });

  const workerC = makeWorker({
    id: 'workerC',
    name: 'Worker C (wrong skill, far away)',
    category_id: 'carpenter',
    rating: 4.7,
    skills: ['carpenter'],
    distanceKm: 14, // near the edge of service area
    today_jobs: 0,
    weekly_jobs: [0, 0, 0, 0, 0, 0, 0],
  });

  const ranked = rankWorkers(requirements, [workerA, workerB, workerC]);

  assert.equal(ranked.length, 3);
  // Worker B should outrank Worker A thanks to workload fairness,
  // even though Worker A has the higher raw rating.
  assert.equal(ranked[0].workerId, 'workerB');
  assert.equal(ranked[1].workerId, 'workerA');
  // Worker C (wrong skill + far) should rank last.
  assert.equal(ranked[2].workerId, 'workerC');

  // breakdown keys exist and roughly sum to totalScore
  const top = ranked[0];
  const sum = top.breakdown.skill + top.breakdown.distance + top.breakdown.rating + top.breakdown.workload;
  assert.ok(Math.abs(sum - top.totalScore) < 0.05);
});

test('rankWorkers: empty pool returns empty array', () => {
  assert.deepEqual(rankWorkers(requirements, []), []);
});
