const { sql } = require('../lib/db');
const { requireAuth } = require('../lib/auth');

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'POST') return createOrder(req, res);
  if (req.method === 'GET') return requireAuth(listOrders)(req, res);
  res.status(405).json({ error: 'Method not allowed' });
};

async function createOrder(req, res) {
  try {
    const { items, total, count, customer } = req.body || {};
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'El pedido debe contener al menos un artículo' });
    }
    const result = await sql`
      INSERT INTO orders (customer_name, customer_note, items, total, item_count)
      VALUES (${customer?.name || ''}, ${customer?.note || ''}, ${JSON.stringify(items)}, ${Number(total) || 0}, ${Number(count) || items.length})
      RETURNING id, created_at
    `;
    res.status(201).json({ ok: true, id: result[0].id });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear pedido' });
  }
}

async function listOrders(req, res) {
  try {
    const rows = await sql`SELECT id, customer_name, customer_note, items, total, item_count, status, created_at FROM orders ORDER BY created_at DESC LIMIT 50`;
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Error al cargar pedidos' });
  }
}
