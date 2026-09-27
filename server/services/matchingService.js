/**
 * Fair Matching Engine (Person 2 — matching-ai branch)
 *
 * Takes a pool of ELIGIBLE workers (already filtered by
 * eligibilityService) and ranks them with a transparent, configurable
 * weighted score:
 *
 *   Skill     35%
 *   Distance  25%
 *   Rating    20%
 *   Workload  20%
 *
 * Workload is fairness-aware: workers with fewer recent jobs score
 * higher, so the engine does not simply crown the highest-rated
 * worker every time.
 */

const { MATCHING_WEIGHTS, DEFAULT_MAX_DISTANCE_KM, MAX_RATING } = require('../config/matching');

// ─────────────────────────────────────────────────────────────
// Individual component scores — each returns a value in [0, 1].
// ─────────────────────────────────────────────────────────────

/**
 * 1.0  — worker's specific requiredSkill tag matches
 * 0.7  — worker's category matches the requested serviceCategory but
 *        doesn't carry the specific skill tag (still a valid pro)
 * 0.0  — no match at all (should already have been filtered out by
 *        eligibility, this is just a safety net)
 */
function scoreSkill(worker, { serviceCategory, requiredSkill }) {
  const skills = worker.skills || [];
  if (requiredSkill && skills.includes(requiredSkill)) return 1.0;
  if (serviceCategory && worker.category_id === serviceCategory) return 0.7;
  return 0.0;
}

/**
 * Linear falloff: 0km => 1.0, maxDistanceKm => 0.0. Workers outside
 * maxDistanceKm should never reach this function (eligibility already
 * excludes them), so the score is clamped defensively.
 */
function scoreDistance(distanceKm, maxDistanceKm = DEFAULT_MAX_DISTANCE_KM) {
  if (!Number.isFinite(distanceKm) || maxDistanceKm <= 0) return 0;
  const score = (maxDistanceKm - distanceKm) / maxDistanceKm;
  return Math.max(0, Math.min(1, score));
}

/** Simple normalized rating out of MAX_RATING (5). */
function scoreRating(worker) {
  const rating = Number(worker.rating) || 0;
  return Math.max(0, Math.min(1, rating / MAX_RATING));
}

/**
 * Workload FAIRNESS score, relative to the current candidate pool —
 * NOT a fixed formula like `1 / rating` and not a flat cutoff. A
 * worker's "recent workload" is today_jobs + sum(weekly_jobs) (jobs
 * actually recorded against them recently in the existing schema).
 * The worker with the LEAST recent workload in this pool gets 1.0,
 * the worker with the MOST gets 0.0; everyone else is scaled
 * linearly in between (min-max normalization). This is what makes an
 * underutilized-but-suitable worker able to outrank a busy top-rated
 * one, per the SIH pitch deck's "Fair Matching Engine".
 */
function recentWorkload(worker) {
  const weekly = Array.isArray(worker.weekly_jobs) ? worker.weekly_jobs.reduce((a, b) => a + (Number(b) || 0), 0) : 0;
  const today = Number(worker.today_jobs) || 0;
  return today + weekly;
}

function scoreWorkloadForPool(workers) {
  const loads = workers.map(recentWorkload);
  const min = Math.min(...loads);
  const max = Math.max(...loads);
  const range = max - min;

  return workers.map((w) => {
    const load = recentWorkload(w);
    if (range === 0) return 1.0; // everyone equally loaded -> nobody penalized
    return Math.max(0, Math.min(1, (max - load) / range));
  });
}

/**
 * Rank a pool of already-eligible workers for a given request.
 *
 * requirements: { serviceCategory, requiredSkill, maxDistanceKm? }
 * eligibleWorkers: array of workers as returned by eligibilityService,
 *   each with a `distanceKm` field already attached.
 * weights: optional override of MATCHING_WEIGHTS (still expected to
 *   sum to 1.0 — not re-normalized here, kept simple on purpose).
 *
 * Returns an array of:
 *   { workerId, name, totalScore, breakdown: { skill, distance, rating, workload } }
 * sorted by totalScore descending. Scores are 0-100 for readability.
 */
function rankWorkers(requirements, eligibleWorkers, weights = MATCHING_WEIGHTS) {
  if (!Array.isArray(eligibleWorkers) || eligibleWorkers.length === 0) return [];

  const { maxDistanceKm = DEFAULT_MAX_DISTANCE_KM } = requirements;
  const workloadScores = scoreWorkloadForPool(eligibleWorkers);

  const ranked = eligibleWorkers.map((worker, idx) => {
    const skill = scoreSkill(worker, requirements);
    const distance = scoreDistance(worker.distanceKm, maxDistanceKm);
    const rating = scoreRating(worker);
    const workload = workloadScores[idx];

    const totalScore =
      weights.skill * skill +
      weights.distance * distance +
      weights.rating * rating +
      weights.workload * workload;

    return {
      workerId: worker.id,
      name: worker.name,
      distanceKm: Number.isFinite(worker.distanceKm) ? parseFloat(worker.distanceKm.toFixed(2)) : null,
      rating: worker.rating,
      totalScore: parseFloat((totalScore * 100).toFixed(2)),
      breakdown: {
        skill: parseFloat((weights.skill * skill * 100).toFixed(2)),
        distance: parseFloat((weights.distance * distance * 100).toFixed(2)),
        rating: parseFloat((weights.rating * rating * 100).toFixed(2)),
        workload: parseFloat((weights.workload * workload * 100).toFixed(2)),
      },
    };
  });

  ranked.sort((a, b) => b.totalScore - a.totalScore);
  return ranked;
}

module.exports = {
  MATCHING_WEIGHTS,
  rankWorkers,
  scoreSkill,
  scoreDistance,
  scoreRating,
  scoreWorkloadForPool,
  recentWorkload,
};
