const { query } = require('../lib/db');
const { verifyToken } = require('../lib/auth');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Verificar Auth JWT
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No autorizado' });
  }

  const user = verifyToken(authHeader.split(' ')[1]);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Token inválido' });
  }

  const { id } = req.query;

  try {
    // LISTAR O OBTENER UNO
    if (req.method === 'GET') {
      if (id) {
        const resProd = await query('SELECT * FROM products WHERE id = $1', [id]);
        if (!resProd.rows.length) return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        return res.status(200).json({ success: true, data: resProd.rows[0] });
      }

      const { q, status } = req.query;
      let sql = 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category = c.id';
      let where = [];
      let params = [];

      if (q) {
        params.push(`%${q}%`);
        where.push(`p.title ILIKE $${params.length}`);
      }

      if (status) {
        params.push(status);
        where.push(`p.status = $${params.length}`);
      }

      if (where.length) sql += ' WHERE ' + where.join(' AND ');
      sql += ' ORDER BY p.created_at DESC';

      const result = await query(sql, params);
      return res.status(200).json({ success: true, data: result.rows });
    }

    // CREAR
    if (req.method === 'POST') {
      const { title, description, price, category, condition, image_url, status = 'active' } = req.body || {};
      const result = await query(
        `INSERT INTO products (title, description, price, category, condition, image_url, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [title, description, price, category || null, condition || null, image_url || '', status]
      );
      return res.status(201).json({ success: true, data: result.rows[0] });
    }

    // ACTUALIZAR
    if (req.method === 'PUT' && id) {
      const { title, description, price, category, condition, image_url, status } = req.body || {};
      const result = await query(
        `UPDATE products 
         SET title = $1, description = $2, price = $3, category = $4, condition = $5, image_url = $6, status = $7, updated_at = NOW()
         WHERE id = $8 RETURNING *`,
        [title, description, price, category || null, condition || null, image_url, status, id]
      );
      return res.status(200).json({ success: true, data: result.rows[0] });
    }

    // ELIMINAR
    if (req.method === 'DELETE' && id) {
      await query('DELETE FROM products WHERE id = $1', [id]);
      return res.status(200).json({ success: true, message: 'Producto eliminado' });
    }

    return res.status(400).json({ success: false, message: 'Operación inváida' });
  } catch (error) {
    console.error('Error en admin products:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};