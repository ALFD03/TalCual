const { query } = require('../lib/db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const type = req.query.type;

  try {
    if (type === 'categories') {
      const result = await query('SELECT * FROM categories ORDER BY name ASC');
      return res.status(200).json({ success: true, data: result.rows });
    }

    if (type === 'conditions') {
      const result = await query('SELECT * FROM conditions ORDER BY id ASC');
      return res.status(200).json({ success: true, data: result.rows });
    }

    if (type === 'config') {
      return res.status(200).json({
        success: true,
        data: {
          whatsapp_number: process.env.WHATSAPP_NUMBER || '584249039269',
          store_name: 'TAL CUAL'
        }
      });
    }

    return res.status(400).json({ success: false, message: 'Tipo no válido' });
  } catch (error) {
    console.error('Error en meta:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};