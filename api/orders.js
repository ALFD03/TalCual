const { query } = require('../lib/db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'POST') {
      const { customer, items, total } = req.body || {};
      const customer_name = customer?.name || req.body.customer_name || '';
      const customer_note = customer?.note || '';

      if (!items || !items.length) {
        return res.status(400).json({ success: false, message: 'Datos incompletos para la orden' });
      }

      const result = await query(
        `INSERT INTO orders (customer_name, customer_note, items, total, status) 
         VALUES ($1, $2, $3, $4, 'pending') RETURNING *`,
        [customer_name, customer_note, JSON.stringify(items), total || 0]
      );

      return res.status(201).json({ success: true, data: result.rows[0] });
    }

    return res.status(405).json({ success: false, message: 'Método no permitido' });
  } catch (error) {
    console.error('Error en orders:', error);
    return res.status(500).json({ success: false, message: 'Error interno' });
  }
};