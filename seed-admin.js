const bcrypt = require('bcrypt');
const db = require('./src/config/db');

async function seedAdmin() {
  try {
    // Check if admin already exists
    const [existing] = await db.execute('SELECT * FROM admins WHERE email = ?', ['admin@mnsdachurch.org']);
    if (existing.length > 0) {
      console.log('Admin already exists!');
      process.exit(0);
    }

    // Hash password
    const password = 'admin123'; // Default password (change later!)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    await db.execute(
      'INSERT INTO admins (username, email, password, role) VALUES (?, ?, ?, ?)',
      ['admin', 'admin@mnsdachurch.org', hashedPassword, 'admin']
    );

    console.log('Admin created successfully!');
    console.log('Email: admin@mnsdachurch.org');
    console.log('Password: admin123');
    console.log('IMPORTANT: Please change this password immediately after logging in!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
}

seedAdmin();