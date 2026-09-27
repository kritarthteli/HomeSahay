const express = require('express');
const router = express.Router();

const { getRoute } = require('../services/routingService');

/**
 * GET /api/routing/route?fromLat=&fromLon=&toLat=&toLon=
 * Returns: { distanceKm, durationMinutes, etaMinutes, source }
 * source is "osrm" when OSRM answered, or "haversine_fallback" otherwise.
 */
router.get('/route', async (req, res) => {
  try {
    const { fromLat, fromLon, toLat, toLon } = req.query;
    if ([fromLat, fromLon, toLat, toLon].some((v) => v === undefined)) {
      return res.status(400).json({ error: 'fromLat, fromLon, toLat and toLon are required.' });
    }

    const result = await getRoute(
      { latitude: parseFloat(fromLat), longitude: parseFloat(fromLon) },
      { latitude: parseFloat(toLat), longitude: parseFloat(toLon) }
    );
    res.json(result);
  } catch (err) {
    console.error('Error computing route:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
