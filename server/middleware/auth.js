const jwt = require('jsonwebtoken');

const TOKEN_TTL = process.env.JWT_TTL || '30d';

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set');
  }
  return secret;
}

function signToken(player) {
  return jwt.sign(
    { sub: String(player._id), email: player.email, name: player.name },
    getSecret(),
    { expiresIn: TOKEN_TTL },
  );
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    const payload = jwt.verify(match[1], getSecret());
    req.user = {
      id: payload.sub,
      email: String(payload.email || '').toLowerCase(),
      name: payload.name,
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { requireAuth, signToken };
