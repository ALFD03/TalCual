const { sql } = require('../../../lib/db');
const { requireAuth, hashPassword } = require('../../../lib/auth');

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  return requireAuth(async (req, res) => {
    try {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'ID requerido' });

      if (req.method === 'PUT') return update(req, res, id);
      if (req.method === 'DELETE') return remove(req, res, id);
      if (req.method === 'GET') {
        const rows = await sql`SELECT id, name, email, role, avatar_url, is_active, created_at FROM admin_users WHERE id = ${id}`;
        if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
        return res.json(rows[0]);
      }
      res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
      res.status(500).json({ error: 'Error del servidor' });
    }
  })(req, res);
};

async function update(req, res, id) {
  const { name, email, password, role, is_active } = req.body || {};
  const updates = [];
  if (name) updates.push(sql`name = ${name}`);
  if (email) updates.push(sql`email = ${email}`);
  if (password) updates.push(sql`password = ${hashPassword(password)}`);
  if (role) updates.push(sql`role = ${role}`);
  if (is_active !== undefined) updates.push(sql`is_active = ${is_active}`);
  if (updates.length > 0) {
    await sql`UPDATE admin_users SET ${sql.join(updates, sql`, `)}, updated_at = NOW() WHERE id = ${id}`;
  }
  res.json({ ok: true });
}

async function remove(req, res, id) {
  await sql`DELETE FROM admin_users WHERE id = ${id}`;
  res.json({ ok: true });
}
