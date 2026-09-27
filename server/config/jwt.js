const jwt = require('jsonwebtoken');
require('dotenv').config();

// ─────────────────────────────────────────────────────────────
// Single source of truth for the JWT secret.
//
// SECURITY: There is intentionally NO hardcoded fallback secret here.
// A backend that silently falls back to a baked-in string means anyone
// who reads the source (or the public GitHub repo) can forge valid
// tokens for ANY role, including PLATFORM_ADMIN. If JWT_SECRET is not
// set in server/.env, we fail loudly at startup instead of failing
// silently at auth time.
// ─────────────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || JWT_SECRET.trim().length === 0) {
  throw new Error(
    'JWT_SECRET is not set. Copy server/.env.example to server/.env and set a strong JWT_SECRET before starting the server.'
  );
}

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Canonical roles used across the platform. Kept here (not scattered
// across route files) so every module checks against the same list.
const ROLES = Object.freeze({
  CUSTOMER: 'CUSTOMER',
  WORKER: 'WORKER',
  COOPERATIVE_ADMIN: 'COOPERATIVE_ADMIN',
  PLATFORM_ADMIN: 'PLATFORM_ADMIN',
});

/**
 * Sign a JWT for an authenticated identity.
 * `payload` should only ever contain server-trusted fields (id, role,
 * cooperativeId, etc.) — never anything taken verbatim from a request
 * body, since this becomes the source of truth for every later
 * authorization check.
 */
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { JWT_SECRET, JWT_EXPIRES_IN, ROLES, signToken, verifyToken };
