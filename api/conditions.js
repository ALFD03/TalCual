const { sql } = require('../lib/db');
module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const rows = await sql`SELECT id, name FROM conditions ORDER BY id ASC`;
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al cargar condiciones' });
  }
};
