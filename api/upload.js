const { put } = require('@vercel/blob');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método no permitido' });
  }

  try {
    const filename = req.query.filename || `product-${Date.now()}.jpg`;
    
    // Subida directa a Vercel Blob
    const blob = await put(filename, req, {
      access: 'public',
    });

    return res.status(200).json({ success: true, url: blob.url });
  } catch (error) {
    console.error('Error en upload Vercel Blob:', error);
    return res.status(500).json({ success: false, message: 'Error subiendo archivo' });
  }
};