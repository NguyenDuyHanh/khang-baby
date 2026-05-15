const { verifyToken } = require('../utils/helpers');

// Verify JWT token
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ ok: false, message: 'No token provided' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ ok: false, message: 'Invalid token' });
  }

  req.user = decoded;
  next();
}

// Check role
function checkRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ ok: false, message: 'Unauthorized' });
    }

    if (!roles.includes(req.user.vai_tro)) {
      return res.status(403).json({ ok: false, message: 'Forbidden: Insufficient permissions' });
    }

    next();
  };
}

module.exports = authMiddleware;
module.exports.checkRole = checkRole;
