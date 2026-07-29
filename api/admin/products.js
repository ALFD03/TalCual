const { sql } = require('../../lib/db');
const { requireAuth } = require('../../lib/auth');

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
  const { category, q, status, limit = '50', page = '1' } = req.query;
  const perPage = Math.min(parseInt(limit) || 50, 100);
  const offset = (Math.max(parseInt(page) || 1, 1) - 1) * perPage;
  let where = sql`WHERE 1=1`;
  if (category) where = sql`${where} AND category = ${category}`;
  if (status) where = sql`${where} AND status = ${status}`;
  if (q) where = sql`${where} AND (title ILIKE ${'%' + q + '%'} OR reference ILIKE ${'%' + q + '%'})`;

  const countResult = await sql`SELECT COUNT(*) as total FROM products ${where}`;
  const total = parseInt(countResult[0]?.total || 0);
  const rows = await sql`
    SELECT id, title, description, price, category, condition, image_url, status, reference, created_at, updated_at
    FROM products ${where} ORDER BY created_at DESC LIMIT ${perPage} OFFSET ${offset}
  `;
  res.json({ data: rows, pagination: { page: parseInt(page), per_page: perPage, total } });
}

async function create(req, res) {
  const { title, description, price, category, condition, image_url, status = 'active' } = req.body || {};
  if (!title || price === undefined) return res.status(400).json({ error: 'Título y precio son requeridos' });

  const ref = `TC-${Date.now().toString(36).toUpperCase()}`;
  const result = await sql`
    INSERT INTO products (title, description, price, category, condition, image_url, status, reference)
    VALUES (${title}, ${description || ''}, ${Number(price)}, ${category || null}, ${condition || null}, ${image_url || ''}, ${status}, ${ref})
    RETURNING id, reference, created_at
  `;
  res.status(201).json({ ok: true, product: result[0] });
}
