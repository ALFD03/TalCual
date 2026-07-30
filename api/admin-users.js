const { query } = require('../lib/db');
const { verifyToken, hashPassword } = require('../lib/auth');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No autorizado' });
  }

  const currentUser = verifyToken(authHeader.split(' ')[1]);
  if (!currentUser) return res.status(401).json({ success: false, message: 'Token inválido' });

  const { id } = req.query;

  try {
    if (req.method === 'GET') {
      if (id) {
        const u = await query('SELECT id, name, email, role, is_active, created_at FROM admin_users WHERE id = $1', [id]);
        if (!u.rows.length) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        return res.status(200).json({ success: true, data: u.rows[0] });
      }

      const users = await query('SELECT id, name, email, role, is_active, created_at FROM admin_users ORDER BY created_at DESC');
      return res.status(200).json({ success: true, data: users.rows });
    }

    if (req.method === 'POST') {
      const { name, email, password, role = 'editor' } = req.body || {};
      const passHash = await hashPassword(password);

      const result = await query(
        'INSERT INTO admin_users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
        [name, email, passHash, role]
      );
      return res.status(201).json({ success: true, data: result.rows[0] });
    }

    if (req.method === 'PUT' && id) {
      const { name, email, role, password } = req.body || {};

      if (password && password.trim() !== '') {
        const passHash = await hashPassword(password);
        await query('UPDATE admin_users SET password = $1 WHERE id = $2', [passHash, id]);
      }

      const result = await query(
        'UPDATE admin_users SET name = $1, email = $2, role = $3 WHERE id = $4 RETURNING id, name, email, role',
        [name, email, role, id]
      );

      return res.status(200).json({ success: true, data: result.rows[0] });
    }

    if (req.method === 'DELETE' && id) {
      await query('DELETE FROM admin_users WHERE id = $1', [id]);
      return res.status(200).json({ success: true, message: 'Usuario eliminado' });
    }

    return res.status(400).json({ success: false, message: 'Petición inválida' });
  } catch (error) {
    console.error('Error en admin users:', error);
    return res.status(500).json({ success: false, message: 'Error de servidor' });
  }
};