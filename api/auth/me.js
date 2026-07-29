const { sql } = require('../../lib/db');
const { requireAuth } = require('../../lib/auth');

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  return requireAuth(async (req, res) => {
    try {
      const users = await sql`SELECT id, name, email, role, avatar_url, is_active FROM admin_users WHERE id = ${req.user.id}`;
      if (users.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
      res.json(users[0]);
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener usuario' });
    }
  })(req, res);
};
