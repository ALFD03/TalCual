const { sql } = require('../../../lib/db');
const { requireAuth } = require('../../../lib/auth');

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  return requireAuth(async (req, res) => {
    try {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'ID requerido' });

      if (req.method === 'PUT') return update(req, res, id);
      if (req.method === 'DELETE') return remove(req, res, id);
      if (req.method === 'GET') return get(req, res, id);
      res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
      res.status(500).json({ error: 'Error del servidor' });
    }
  })(req, res);
};

async function get(req, res, id) {
  const rows = await sql`SELECT * FROM products WHERE id = ${id}`;
  if (rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(rows[0]);
}

async function update(req, res, id) {
  const { title, description, price, category, condition, image_url, status } = req.body || {};
  await sql`
    UPDATE products SET
      title = COALESCE(${title}, title),
      description = COALESCE(${description}, description),
      price = COALESCE(${Number(price)}, price),
      category = COALESCE(${category}, category),
      condition = COALESCE(${condition}, condition),
      image_url = COALESCE(${image_url}, image_url),
      status = COALESCE(${status}, status),
      updated_at = NOW()
    WHERE id = ${id}
  `;
  res.json({ ok: true });
}

async function remove(req, res, id) {
  await sql`DELETE FROM products WHERE id = ${id}`;
  res.json({ ok: true });
}
