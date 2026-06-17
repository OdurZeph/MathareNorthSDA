require('dotenv').config();
const mysql = require('mysql2/promise');

mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectTimeout: 5000,
}).getConnection()
  .then(c => { console.log('DB_OK'); c.release(); process.exit(0); })
  .catch(e => { console.error('DB_FAIL:', e.code, e.message); process.exit(1); });
