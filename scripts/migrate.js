require('dotenv').config();

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function migrate() {
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'church_db';

  let connection;
  try {
    connection = await mysql.createConnection({ host, user, password, multipleStatements: true });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
    await connection.query(`USE \`${database}\``);

    // Run all migrations in order
    const migrations = [
      '001_init.sql',
      '002_cms_tables.sql'
    ];

    for (const migrationFile of migrations) {
      const migrationPath = path.join(__dirname, '..', 'migrations', migrationFile);
      if (fs.existsSync(migrationPath)) {
        const sql = fs.readFileSync(migrationPath, 'utf8');
        await connection.query(sql);
        console.log(`Applied migration: ${migrationFile}`);
      }
    }

    console.log(`Migration complete — database "${database}" is ready.`);
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

migrate();
