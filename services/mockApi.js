// ============================================================
// Mock API Service — SIH Cooperative Gig Platform
// Simulates all 3 tiers of the platform backend
// ============================================================

import { MOCK_WORKERS, MOCK_CUSTOMERS, JOB_HISTORY, DEFAULT_RANKING_WEIGHTS } from '../data/seedData';
import { api } from './apiClient';

// Utility: simulate network latency
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Utility: calculate Haversine distance between two coords (km)
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

// ── TIER 3: Mock AI Natural Language Parser ─────────────────
// Simulates an NLP model that parses informal/Hinglish requests
// into structured service intents.

const CATEGORY_KEYWORDS = {
  plumber: ['pipe', 'leak', 'plumber', 'water', 'tap', 'drain', 'nali', 'pipe leak', 'nal', 'bathroom'],
  electrician: ['electric', 'light', 'fan', 'wire', 'switch', 'power', 'bijli', 'current', 'board', 'bulb'],
  cleaner: ['clean', 'cleaning', 'sweep', 'mop', 'dust', 'safai', 'jhadu', 'jharoo', 'ghar'],
  cook: ['cook', 'food', 'meal', 'khana', 'lunch', 'dinner', 'breakfast', 'roti', 'rice', 'sabzi'],
  carpenter: ['wood', 'furniture', 'door', 'carpenter', 'shelf', 'almirah', 'repair', 'table', 'chair'],
};

const URGENCY_KEYWORDS = {
  emergency: ['emergency', 'urgent', 'asap', 'abhi', 'jaldi', 'turant', 'help', 'immediately', 'now', 'flood', 'fire', 'short circuit'],
  high: ['today', 'aaj', 'soon', 'quick', 'fast'],
  normal: [],
};

/**
 * Tier 3: Parse a natural language service request
 * @param {string} text - Raw user input
 * @returns {{ service_category: string, urgency: string, confidence: number, parsed_intent: string }}
 */
export const parseNaturalLanguage = async (text) => {
  await delay(1000); // Simulate AI inference time

  const lower = text.toLowerCase();

  // Score each category
  let bestCategory = 'general';
  let bestScore = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const score = keywords.reduce((acc, kw) => (lower.includes(kw) ? acc + 1 : acc), 0);
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  // Determine urgency
  let urgency = 'normal';
  for (const [level, keywords] of Object.entries(URGENCY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      urgency = level;
      break;
    }
  }

  const confidence = Math.min(0.95, 0.55 + bestScore * 0.1);

  return {
    service_category: bestCategory,
    urgency,
    confidence: parseFloat(confidence.toFixed(2)),
    parsed_intent: `Looking for ${bestCategory} service with ${urgency} priority`,
    radius_km: urgency === 'emergency' ? 5 : urgency === 'high' ? 10 : 15,
  };
};

// ── TIER 1: Mock Deterministic Filter ──────────────────────
// Hard filters: verified, online, skill match, distance radius

/**
 * Tier 1: Filter workers by deterministic rules
 * @param {string} category - Service category
 * @param {{ latitude: number, longitude: number }} userLocation
 * @param {number} radiusKm - Search radius
 * @param {object[]} workerPool - Pool of workers to filter
 * @returns {object[]} Eligible workers with computed distance
 */
const filterWorkers = (category, userLocation, radiusKm, workerPool) => {
  return workerPool
    .filter((w) => {
      // Must be verified
      if (!w.isVerified) return false;
      // Must be online
      if (!w.isOnline) return false;
      // Must have matching skill
      if (category !== 'general' && w.category !== category) return false;
      // Must be within radius
      const dist = haversineDistance(
        userLocation.latitude,
        userLocation.longitude,
        w.location.latitude,
        w.location.longitude
      );
      return dist <= radiusKm;
    })
    .map((w) => ({
      ...w,
      computedDistanceKm: parseFloat(
        haversineDistance(
          userLocation.latitude,
          userLocation.longitude,
          w.location.latitude,
          w.location.longitude
        ).toFixed(2)
      ),
    }));
};

// ── TIER 2: Mock Fair Ranking Engine ───────────────────────
// Weighted formula with fairness penalty to prevent monopoly

/**
 * Tier 2: Calculate composite fairness score for a single worker
 * Higher score = ranked higher (better match)
 * @param {object} worker
 * @param {string} category
 * @param {object} weights
 * @returns {number} Score 0–100
 */
export const calculateFairnessScore = (worker, category, weights = DEFAULT_RANKING_WEIGHTS) => {
  // Skill Match Score (0-1): exact category = 1.0, else 0.5
  const skillScore = worker.category === category ? 1.0 : 0.5;

  // Distance Score (0-1): closer = higher (inverse, capped at 10km)
  const maxDist = 10;
  const distScore = Math.max(0, (maxDist - (worker.computedDistanceKm ?? worker.distanceKm)) / maxDist);

  // Rating Score (0-1): normalize from 0–5 scale
  const ratingScore = worker.rating / 5;

  // Fairness Penalty (0-1): workers with MORE jobs today get PENALIZED
  // This is the anti-monopoly mechanism — boost workers with fewer daily jobs
  const maxJobs = 8;
  const fairnessScore = Math.max(0, (maxJobs - worker.todayJobs) / maxJobs);

  const composite =
    weights.skillMatch * skillScore +
    weights.distance * distScore +
    weights.rating * ratingScore +
    weights.fairnessPenalty * fairnessScore;

  return parseFloat((composite * 100).toFixed(1));
};

/**
 * Tier 1+2: Filter then rank workers
 * @param {string} category
 * @param {{ latitude: number, longitude: number }} userLocation
 * @param {number} radiusKm
 * @param {object} weights - Ranking weights
 * @returns {Promise<object[]>} Ranked workers with scores
 */
export const fetchNearbyWorkers = async (
  category,
  userLocation,
  radiusKm = 10,
  weights = DEFAULT_RANKING_WEIGHTS,
  workerPool = MOCK_WORKERS
) => {
  try {
    const liveWorkers = await api.getNearbyWorkers(category, userLocation, radiusKm);
    if (liveWorkers && liveWorkers.length > 0) {
      return liveWorkers;
    }
  } catch (err) {
    console.log('[PostgreSQL API] Offline or unreachable, falling back to local pool:', err.message);
  }

  await delay(400);
  const eligible = filterWorkers(category, userLocation, radiusKm, workerPool);
  const scored = eligible.map((w) => ({
    ...w,
    score: calculateFairnessScore(w, category, weights),
    estimatedEta: Math.round(w.computedDistanceKm * 4 + 5), // ~4 min/km + 5 min buffer
  }));

  // Sort descending by score
  return scored.sort((a, b) => b.score - a.score);
};

// ── Job Request Submission ──────────────────────────────────
/**
 * Submit a job booking request
 * @param {{ customerId, workerId, category, userLocation, description, urgency }} params
 * @returns {Promise<{ jobId, status, worker, estimatedArrival, price }>}
 */
export const submitJobRequest = async (params) => {
  try {
    const liveJob = await api.createJob(params);
    if (liveJob && liveJob.jobId) {
      return liveJob;
    }
  } catch (err) {
    console.log('[PostgreSQL API] Offline or unreachable for createJob, using mock fallback:', err.message);
  }

  await delay(600);

  const worker = MOCK_WORKERS.find((w) => w.id === params.workerId);
  if (!worker) throw new Error('Worker not found');

  const baseHours = params.urgency === 'emergency' ? 1 : 1.5;
  const laborCost = Math.round(worker.pricePerHour * baseHours);
  const convenienceFee = Math.round(laborCost * 0.05);
  const cooperativeLevy = Math.round(laborCost * 0.03);
  const totalAmount = laborCost + convenienceFee + cooperativeLevy;

  return {
    jobId: `j${Date.now()}`,
    status: 'pending_acceptance',
    worker: {
      id: worker.id,
      name: worker.name,
      avatar: worker.avatar,
      rating: worker.rating,
      phone: '+91 98765 XXXXX',
    },
    estimatedArrival: worker.etaMinutes,
    pricing: {
      laborCost,
      convenienceFee,
      cooperativeLevy,
      totalAmount,
      breakdown: [
        { label: 'Labour Charges', amount: laborCost },
        { label: 'Convenience Fee (5%)', amount: convenienceFee },
        { label: 'Cooperative Fund (3%)', amount: cooperativeLevy },
      ],
    },
    acceptanceDeadline: 30, // seconds for worker to accept
  };
};

// ── SOS Emergency Dispatch ──────────────────────────────────
/**
 * Trigger emergency dispatch — forces 5km radius, highest urgency
 * @param {{ customerId, category, userLocation }} params
 * @returns {Promise<{ jobId, workers, dispatchedTo }>}
 */
export const triggerSOSDispatch = async (params) => {
  await delay(600); // Faster for emergency

  const ranked = await fetchNearbyWorkers(
    params.category || 'general',
    params.userLocation,
    5, // Hard 5km emergency radius
    { skillMatch: 0.4, distance: 0.4, rating: 0.15, fairnessPenalty: 0.05 } // Distance-weighted for SOS
  );

  if (ranked.length === 0) {
    throw new Error('No workers available within 5km. Expanding search…');
  }

  const topWorker = ranked[0];
  return {
    jobId: `sos_${Date.now()}`,
    status: 'sos_dispatched',
    dispatchedTo: topWorker,
    totalEligible: ranked.length,
    message: `SOS dispatched to ${topWorker.name}. ETA: ${topWorker.estimatedEta} min`,
  };
};

// ── Payment Processing ──────────────────────────────────────
/**
 * Simulate payment gateway processing
 * @param {{ amount: number, method: 'upi' | 'card' | 'cash', jobId: string }} params
 * @returns {Promise<{ success: boolean, transactionId: string, method: string }>}
 */
export const processPayment = async (params) => {
  await delay(2000); // Simulate payment gateway latency

  // Simulate 95% success rate
  const success = Math.random() > 0.05;

  if (!success) {
    throw new Error('Payment gateway timeout. Please retry.');
  }

  return {
    success: true,
    transactionId: `TXN${Date.now()}`,
    method: params.method,
    amount: params.amount,
    timestamp: new Date().toISOString(),
    message: params.method === 'cash' ? 'Pay cash to worker on arrival' : 'Payment successful!',
  };
};

export const updateWorkerStatus = async (workerId, isOnline) => {
  try {
    const res = await api.updateWorkerStatus(workerId, isOnline);
    if (res && res.success) {
      return res;
    }
  } catch (err) {
    console.log('[PostgreSQL API] Offline for updateWorkerStatus, using local:', err.message);
  }
  await delay(200);
  return { workerId, isOnline, updatedAt: new Date().toISOString() };
};

// ── KYC Actions ─────────────────────────────────────────────
/**
 * Approve or reject a KYC application
 * @param {string} kycId
 * @param {'approved' | 'rejected'} action
 * @param {string} reason - Optional rejection reason
 */
export const processKYC = async (kycId, action, reason = '') => {
  try {
    const res = await api.reviewKyc(kycId, action);
    if (res && res.success) {
      return {
        kycId,
        action,
        reason,
        processedAt: new Date().toISOString(),
        success: true,
      };
    }
  } catch (err) {
    console.log('[PostgreSQL API] Offline for processKYC, using local:', err.message);
  }
  await delay(400);
  return {
    kycId,
    action,
    reason,
    processedAt: new Date().toISOString(),
    success: true,
  };
};

// ── Analytics Data ──────────────────────────────────────────
/**
 * Fetch analytics summary for admin dashboard
 */
export const fetchAnalytics = async () => {
  try {
    const liveAnalytics = await api.getAnalytics();
    if (liveAnalytics && liveAnalytics.summary) {
      return liveAnalytics;
    }
  } catch (err) {
    console.log('[PostgreSQL API] Offline for fetchAnalytics, using local calculations:', err.message);
  }

  await delay(300);

  const jobsByWorker = MOCK_WORKERS.map((w) => ({
    workerId: w.id,
    name: w.name.split(' ')[0],
    todayJobs: w.todayJobs,
    todayEarnings: w.todayEarnings,
    rating: w.rating,
  }));

  const totalJobs = jobsByWorker.reduce((a, b) => a + b.todayJobs, 0);
  const totalRevenue = JOB_HISTORY.filter((j) => j.status === 'completed').reduce((a, j) => a + j.amount, 0);
  const activeWorkers = MOCK_WORKERS.filter((w) => w.isOnline).length;

  // Gini coefficient to measure distribution inequality (0 = perfect, 1 = monopoly)
  const jobs = jobsByWorker.map((w) => w.todayJobs).sort((a, b) => a - b);
  const n = jobs.length;
  const mean = jobs.reduce((a, b) => a + b, 0) / n;
  const giniNumerator = jobs.reduce((sum, xi, i) => sum + jobs.reduce((s, xj) => s + Math.abs(xi - xj), 0), 0);
  const gini = mean > 0 ? parseFloat((giniNumerator / (2 * n * n * mean)).toFixed(3)) : 0;

  return {
    jobsByWorker,
    summary: {
      totalJobs,
      totalRevenue,
      activeWorkers,
      fairnessIndex: parseFloat((1 - gini).toFixed(3)), // Higher = more fair
      giniCoefficient: gini,
    },
  };
};
