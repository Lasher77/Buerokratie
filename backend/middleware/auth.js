const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Auth Token fehlt' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token abgelaufen' });
    }
    return res.status(401).json({ message: 'Ungültiger Token' });
  }
}

function requireRole(role) {
  const levels = { user: 1, moderator: 2, admin: 3 };
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Nicht autorisiert' });
    }
    if ((levels[req.user.role] || 0) < (levels[role] || 0)) {
      return res.status(403).json({ message: 'Nicht autorisiert' });
    }
    next();
  };
}

module.exports = { verifyToken, requireRole };
