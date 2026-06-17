const db = require('../config/db');

class Admin {
  static async create(adminData) {
    const { username, email, password, role } = adminData;
    const [result] = await db.execute(
      'INSERT INTO admins (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, password, role]
    );
    return { id: result.insertId, ...adminData };
  }

  static async findByEmail(email) {
    const [rows] = await db.execute(
      'SELECT * FROM admins WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT id, username, email, role, created_at FROM admins WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }
}

module.exports = Admin;
