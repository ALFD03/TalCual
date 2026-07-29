module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json({
    whatsappNumber: process.env.WHATSAPP_NUMBER || '584249039269',
    frontendUrl: process.env.FRONTEND_URL || '/',
    storeName: 'TAL CUAL',
  });
};
