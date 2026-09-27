const express = require('express');
const router = express.Router();

const { getEligibleWorkers } = require('../services/eligibilityService');
const { rankWorkers, MATCHING_WEIGHTS } = require('../services/matchingService');
const { DEFAULT_MAX_DISTANCE_KM } = require('../config/matching');

/**
 * POST /api/matching/rank
 *
 * Body: {
 *   serviceCategory: string (required, e.g. "plumber"),
 *   requiredSkill?: string (e.g. "pipe_repair"),
 *   latitude: number (required),
 *   longitude: number (required),
 *   maxDistanceKm?: number (default 15)
 * }
 *
 * Flow: structured requirement -> eligibility filter -> fair scoring -> ranked workers.
 */
router.post('/rank', async (req, res) => {
  try {
    const {
      serviceCategory,
      requiredSkill,
      latitude,
      longitude,
      maxDistanceKm = DEFAULT_MAX_DISTANCE_KM,
    } = req.body;

    if (!serviceCategory) {
      return res.status(400).json({ error: 'serviceCategory is required.' });
    }
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'latitude and longitude are required.' });
    }

    const requirements = {
      serviceCategory,
      requiredSkill,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      maxDistanceKm: parseFloat(maxDistanceKm),
    };

    const { eligible, rejected, usedPostGIS, error } = await getEligibleWorkers(requirements);
    if (error) {
      return res.status(400).json({ error });
    }

    const ranked = rankWorkers(requirements, eligible);

    res.json({
      requirements,
      weights: MATCHING_WEIGHTS,
      geoSource: usedPostGIS ? 'postgis' : 'haversine',
      eligibleCount: eligible.length,
      rejectedCount: rejected.length,
      rejected,
      ranked,
      bestMatch: ranked[0] || null,
    });
  } catch (err) {
    console.error('Error ranking workers:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
