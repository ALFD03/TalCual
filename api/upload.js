const { requireAuth } = require('../lib/auth');
const { uploadFile } = require('../lib/blob');

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  return requireAuth(async (req, res) => {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    try {
      const { pipeline } = require('stream');
      const { promisify } = require('util');
      const pipelineAsync = promisify(pipeline);

      const buffers = [];
      for await (const chunk of req) buffers.push(chunk);
      const buffer = Buffer.concat(buffers);

      // Parse multipart manually (simplified - in production use formidable/multer)
      const contentType = req.headers['content-type'] || '';
      if (!contentType.includes('multipart/form-data')) {
        return res.status(400).json({ error: 'Se requiere multipart/form-data' });
      }

      const file = { buffer, originalname: 'upload.jpg', mimetype: 'image/jpeg' };
      const folder = req.query.folder || 'products';
      const url = await uploadFile(buffer, file.originalname || 'image.jpg', folder);
      res.json({ url });
    } catch (err) {
      res.status(500).json({ error: 'Error al subir archivo' });
    }
  })(req, res);
};
