const { sql } = require('../../lib/db');
const { requireAuth, hashPassword } = require('../../lib/auth');

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  return requireAuth(async (req, res) => {
    try {
      if (req.method === 'GET') return list(req, res);
      if (req.method === 'POST') return create(req, res);
      res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
      res.status(500).json({ error: 'Error del servidor' });
    }
  })(req, res);
};

async function list(req, res) {
  const rows = await sql`SELECT id, name, email, role, avatar_url, is_active, created_at FROM admin_users ORDER BY created_at DESC`;
  res.json({ data: rows });
}

async function create(req, res) {
  const { name, email, password, role = 'editor' } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ error: 'Nombre, email y contraseña requeridos' });
  const hashed = hashPassword(password);
  try {
    const result = await sql`
      INSERT INTO admin_users (name, email, password, role)
      VALUES (${name}, ${email}, ${hashed}, ${role})
      RETURNING id, created_at
    `;
    res.status(201).json({ ok: true, user: result[0] });
  } catch (err) {
    if (err.message?.includes('duplicate key')) return res.status(409).json({ error: 'El email ya existe' });
    throw err;
  }
}
