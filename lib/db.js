// lib/db.js
const { Pool } = require('@neondatabase/serverless');

if (!process.env.NEON_DATABASE_URL) {
  console.error('⚠️ ALERTA: La variable NEON_DATABASE_URL no está definida.');
}

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};