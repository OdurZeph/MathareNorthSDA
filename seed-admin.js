require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('./src/config/db');

async function seedAdmin() {
  try {
    const username = 'admin';
    const email = 'admin@mnchurch.org';
    const password = 'admin123';
    const role = 'Super Admin';

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.execute(
      `INSERT INTO admins (username, email, password, role) VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE username = username`,
      [username, email, hashedPassword, role]
    );

    console.log('✅ Admin user created successfully!');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    process.exit(1);
  }
}

seedAdmin();
