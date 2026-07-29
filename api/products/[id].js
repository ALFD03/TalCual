const { sql } = require('../../lib/db');

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { id } = req.query;
    const rows = await sql`SELECT id, title, description, price, category, condition, image_url, status, reference, created_at FROM products WHERE id = ${id} AND status = 'active'`;
    if (rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al cargar producto' });
  }
};
