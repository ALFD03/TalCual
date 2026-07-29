// ============================================================
// Vercel Blob utility
// ============================================================
const { put, del, list } = require('@vercel/blob');

async function uploadFile(fileBuffer, fileName, folder = 'products') {
  const path = `${folder}/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const blob = await put(path, fileBuffer, {
    access: 'public',
    contentType: fileName.endsWith('.png') ? 'image/png' : 'image/jpeg',
    addRandomSuffix: false,
  });
  return blob.url;
}

async function deleteFile(url) {
  if (!url || !url.includes('vercel-blob.com')) return;
  await del(url);
}

async function listFiles(folder = 'products') {
  const { blobs } = await list({ prefix: `${folder}/` });
  return blobs;
}

module.exports = { uploadFile, deleteFile, listFiles };
