const { verifyToken } = require('../config/jwt');

/**
 * Middleware: Verify JWT token from Authorization header.
 * Attaches decoded user payload to req.user on success.
 * req.user.role is trusted from here on -- it was set by our own
 * signToken() call at login time, never by the client.
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please log in again.' });
    }
    return res.status(403).json({ error: 'Invalid token.' });
  }
}

/**
 * Optional auth middleware: attaches user if token present, but doesn't block.
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (token) {
    try {
      req.user = verifyToken(token);
    } catch (_) {
      req.user = null;
    }
  }
  next();
}

/**
 * Middleware factory: require the authenticated user to hold ONE
 * specific role. Must run after authenticateToken.
 */
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    if (req.user.role !== role) {
      return res.status(403).json({ error: `Access denied. Requires role: ${role}.` });
    }
    next();
  };
}

/**
 * Middleware factory: require the authenticated user to hold ANY of
 * the given roles. Must run after authenticateToken.
 */
function requireAnyRole(...roles) {
  const allowed = roles.flat();
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({ error: `Access denied. Requires one of: ${allowed.join(', ')}.` });
    }
    next();
  };
}

/**
 * Middleware factory: allow access if the authenticated user IS the
 * resource identified by req.params[idParam], OR holds one of the
 * given elevated roles (e.g. PLATFORM_ADMIN). Used so a customer/worker
 * can only read or edit their OWN record unless an admin is asking.
 */
function requireSelfOrRoles(idParam, ...roles) {
  const allowed = roles.flat();
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    const isSelf = req.user.id === req.params[idParam];
    const isElevated = allowed.includes(req.user.role);
    if (!isSelf && !isElevated) {
      return res.status(403).json({ error: 'Access denied. You may only access your own account.' });
    }
    next();
  };
}

module.exports = {
  authenticateToken,
  optionalAuth,
  requireRole,
  requireAnyRole,
  requireSelfOrRoles,
};
