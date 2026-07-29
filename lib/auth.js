// ============================================================
// JWT Auth middleware
// ============================================================
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const SECRET = () => process.env.JWT_SECRET || 'dev-secret-change-me';
const EXPIRES = () => process.env.JWT_EXPIRES_IN || '7d';

function signToken(payload) {
  return jwt.sign(payload, SECRET(), { expiresIn: EXPIRES() });
}

function verifyToken(token) {
  return jwt.verify(token, SECRET());
}

function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

function comparePassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

// Express-style middleware for Vercel serverless
function requireAuth(handler) {
  return async (req, res) => {
    try {
      const auth = req.headers.authorization || '';
      if (!auth.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token requerido' });
      }
      const token = auth.slice(7);
      const decoded = verifyToken(token);
      req.user = decoded;
      return handler(req, res);
    } catch (err) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }
  };
}

module.exports = { signToken, verifyToken, hashPassword, comparePassword, requireAuth };
