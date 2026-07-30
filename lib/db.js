// lib/db.js
const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('⚠️ ALERTA: La variable DATABASE_URL no está definida.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};