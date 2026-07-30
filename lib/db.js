// lib/db.js
const { Pool } = require('pg');

if (!process.env.NEON_DATABASE_URL) {
  console.error('⚠️ ALERTA: La variable NEON_DATABASE_URL no está definida.');
}

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Obligatorio para la conexión SSL segura con Neon
  },
  max: 10, // Máximo de conexiones simultáneas en el pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};