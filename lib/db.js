// ============================================================
// Neon serverless database pool
// ============================================================
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.NEON_DATABASE_URL || process.env.DATABASE_URL || '');

module.exports = { sql };
