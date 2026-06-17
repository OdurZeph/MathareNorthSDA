const mysql = require('mysql2/promise');

// Pool is created lazily — the server starts regardless of DB availability.
// Individual queries will fail with a clear error if MySQL is down, but the
// process never crashes on startup.
let pool = null;

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host:             process.env.DB_HOST     || 'localhost',
      user:             process.env.DB_USER     || 'root',
      password:         process.env.DB_PASSWORD || '',
      database:         process.env.DB_NAME     || 'church_db',
      waitForConnections: true,
      connectionLimit:  10,
      queueLimit:       0,
      connectTimeout:   10000,
    });
  }
  return pool;
}

// Convenience: execute a prepared statement through the pool
async function execute(sql, params = []) {
  const [rows] = await getPool().execute(sql, params);
  return rows;
}

// Health-check used by server.js startup log
async function ping() {
  const conn = await getPool().getConnection();
  conn.release();
}

module.exports = { getPool, execute, ping };
