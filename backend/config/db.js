const mysql = require('mysql2/promise');

let pool = null;

/**
 * Parse DATABASE_URL (mysql://user:pass@host:port/db) or fall back to DB_* env vars.
 */
function getDbConfig() {
  const url = process.env.DATABASE_URL;

  if (url) {
    try {
      const parsed = new URL(url);
      return {
        host: parsed.hostname,
        port: parseInt(parsed.port, 10) || 3306,
        user: decodeURIComponent(parsed.username),
        password: decodeURIComponent(parsed.password),
        database: parsed.pathname.replace(/^\//, '') || 'church_db',
      };
    } catch (err) {
      console.warn('Invalid DATABASE_URL, falling back to DB_* vars:', err.message);
    }
  }

  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'church_db',
  };
}

function getPool() {
  if (!pool) {
    const cfg = getDbConfig();
    pool = mysql.createPool({
      ...cfg,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 10000,
    });
  }
  return pool;
}

async function execute(sql, params = []) {
  const [result] = await getPool().execute(sql, params);
  return result;
}

async function ping() {
  const conn = await getPool().getConnection();
  conn.release();
}

module.exports = { getPool, execute, ping };
