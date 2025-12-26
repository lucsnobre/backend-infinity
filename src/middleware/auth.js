const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'missing_auth' });
  }

  const token = header.slice('Bearer '.length);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-change-me');
    req.user = { id: payload.sub };
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'invalid_token' });
  }
}

module.exports = { requireAuth };
