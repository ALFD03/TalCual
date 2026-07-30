const { query } = require('../lib/db');
const { verifyToken } = require('../lib/auth');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No autorizado' });
  }

  const user = verifyToken(authHeader.split(' ')[1]);
  if (!user) return res.status(401).json({ success: false, message: 'Token inválido' });

  const { id } = req.query;

  try {
    if (req.method === 'GET') {
      if (id) {
        const result = await query('SELECT * FROM categories WHERE id = $1', [id]);
        if (!result.rows.length) return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
        return res.status(200).json({ success: true, data: result.rows[0] });
      }
      const result = await query('SELECT * FROM categories ORDER BY display_order ASC, name ASC');
      return res.status(200).json({ success: true, data: result.rows });
    }

    if (req.method === 'POST') {
      const { id, name, display_order } = req.body || {};
      if (!id || !name) {
        return res.status(400).json({ success: false, message: 'ID y nombre requeridos' });
      }
      const result = await query(
        'INSERT INTO categories (id, name, display_order) VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, display_order = EXCLUDED.display_order RETURNING *',
        [id, name, display_order || 0]
      );
      return res.status(201).json({ success: true, data: result.rows[0] });
    }

    if (req.method === 'PUT' && id) {
      const { name, display_order } = req.body || {};
      const result = await query(
        'UPDATE categories SET name = $1, display_order = $2 WHERE id = $3 RETURNING *',
        [name, display_order || 0, id]
      );
      if (!result.rows.length) return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
      return res.status(200).json({ success: true, data: result.rows[0] });
    }

    if (req.method === 'DELETE' && id) {
      await query('DELETE FROM categories WHERE id = $1', [id]);
      return res.status(200).json({ success: true, message: 'Categoría eliminada' });
    }

    return res.status(400).json({ success: false, message: 'Petición inválida' });
  } catch (error) {
    console.error('Error en admin categories:', error);
    return res.status(500).json({ success: false, message: 'Error de servidor' });
  }
};
