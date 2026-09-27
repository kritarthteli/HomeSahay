/**
 * Routing Service (Person 2 — matching-ai branch)
 *
 * Thin wrapper around an OSRM-compatible routing server for
 * distance/duration/ETA. Falls back to a Haversine-based estimate if
 * OSRM is unreachable or not configured — the app must keep working
 * without it, per the task brief ("Do NOT spend time building a
 * complex OSRM integration").
 */

const { haversineDistanceKm } = require('./eligibilityService');

const OSRM_BASE_URL = process.env.OSRM_BASE_URL || 'http://localhost:5001';
const OSRM_TIMEOUT_MS = parseInt(process.env.OSRM_TIMEOUT_MS || '3000', 10);

// Used only by the fallback estimate — a rough average urban travel
// speed (km/h) for a gig worker on a two-wheeler in city traffic.
const FALLBACK_AVG_SPEED_KMPH = 20;

function haversineFallback(fromLat, fromLon, toLat, toLon) {
  const distanceKm = haversineDistanceKm(fromLat, fromLon, toLat, toLon);
  const durationMinutes = (distanceKm / FALLBACK_AVG_SPEED_KMPH) * 60;
  return {
    distanceKm: parseFloat(distanceKm.toFixed(2)),
    durationMinutes: Math.round(durationMinutes),
    etaMinutes: Math.round(durationMinutes) + 5, // +5 min buffer, matches existing ETA convention in routes/workers.js
    source: 'haversine_fallback',
  };
}

/**
 * @param {{latitude:number, longitude:number}} from
 * @param {{latitude:number, longitude:number}} to
 */
async function getRoute(from, to) {
  if (!from || !to || [from.latitude, from.longitude, to.latitude, to.longitude].some((v) => v === undefined || v === null)) {
    throw new Error('from.{latitude,longitude} and to.{latitude,longitude} are required.');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OSRM_TIMEOUT_MS);

  try {
    const url =
      `${OSRM_BASE_URL}/route/v1/driving/` +
      `${from.longitude},${from.latitude};${to.longitude},${to.latitude}` +
      `?overview=false`;

    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`OSRM responded with HTTP ${response.status}`);

    const data = await response.json();
    const route = data.routes && data.routes[0];
    if (!route) throw new Error('OSRM returned no route.');

    const distanceKm = route.distance / 1000;
    const durationMinutes = route.duration / 60;

    return {
      distanceKm: parseFloat(distanceKm.toFixed(2)),
      durationMinutes: Math.round(durationMinutes),
      etaMinutes: Math.round(durationMinutes) + 5,
      source: 'osrm',
    };
  } catch (err) {
    return haversineFallback(from.latitude, from.longitude, to.latitude, to.longitude);
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { getRoute, haversineFallback };
