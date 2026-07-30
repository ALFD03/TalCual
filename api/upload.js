const { put } = require('@vercel/blob');
const Busboy = require('busboy');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método no permitido' });
  }

  try {
    const { url } = await new Promise((resolve, reject) => {
      const busboy = Busboy({ headers: req.headers });
      let fileBuffer = null;
      let fileName = `product-${Date.now()}.jpg`;

      busboy.on('file', (fieldname, file, { filename }) => {
        if (filename) fileName = `${Date.now()}-${filename}`;
        const chunks = [];
        file.on('data', (data) => chunks.push(data));
        file.on('end', () => { fileBuffer = Buffer.concat(chunks); });
      });

      busboy.on('finish', async () => {
        if (!fileBuffer) {
          const err = new Error('No se recibió ningún archivo');
          err.status = 400;
          reject(err);
          return;
        }
        try {
          const blob = await put(fileName, fileBuffer, { access: 'public' });
          resolve({ url: blob.url });
        } catch (err) { reject(err); }
      });

      busboy.on('error', reject);
      req.pipe(busboy);
    });

    return res.status(200).json({ success: true, url });
  } catch (error) {
    console.error('Error en upload:', error);
    const status = error.status || 500;
    return res.status(status).json({ success: false, message: error.message || 'Error subiendo archivo' });
  }
};