const { sql } = require('../../lib/db');

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'GET') return getProducts(req, res);
  res.status(405).json({ error: 'Method not allowed' });
};

async function getProducts(req, res) {
  try {
    const { category, q, sort, condition, limit = '12', page = '1' } = req.query;
    const perPage = Math.min(Math.max(parseInt(limit) || 12, 1), 48);
    const offset = (Math.max(parseInt(page) || 1, 1) - 1) * perPage;

    let where = sql`WHERE status = 'active'`;
    if (category) where = sql`${where} AND category = ${category}`;
    if (condition) where = sql`${where} AND condition = ${condition}`;
    if (q) where = sql`${where} AND (title ILIKE ${'%' + q + '%'} OR description ILIKE ${'%' + q + '%'})`;

    let order = sql`ORDER BY created_at DESC`;
    if (sort === 'precio-asc') order = sql`ORDER BY price ASC`;
    if (sort === 'precio-desc') order = sql`ORDER BY price DESC`;

    const countResult = await sql`SELECT COUNT(*) as total FROM products ${where}`;
    const total = parseInt(countResult[0]?.total || 0);

    const rows = await sql`
      SELECT id, title, description, price, category, condition, image_url, status, reference, created_at
      FROM products ${where} ${order} LIMIT ${perPage} OFFSET ${offset}
    `;

    res.json({
      data: rows,
      pagination: { page: parseInt(page), per_page: perPage, total, total_pages: Math.ceil(total / perPage) },
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al cargar productos' });
  }
}
