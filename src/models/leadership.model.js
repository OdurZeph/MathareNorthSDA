
const db = require('../config/db');

class Leadership {
  static async getAll() {
    const [rows] = await db.execute('SELECT * FROM leadership ORDER BY sort_order, created_at DESC');
    return rows;
  }

  static async getByRole(role) {
    const [rows] = await db.execute('SELECT * FROM leadership WHERE role = ? ORDER BY sort_order, created_at DESC', [role]);
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.execute('SELECT * FROM leadership WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(data) {
    const { name, title, role, phone, email, image, biography, sort_order } = data;
    const [result] = await db.execute(`
      INSERT INTO leadership (name, title, role, phone, email, image, biography, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, title, role, phone, email, image, biography, sort_order || 0]);
    return this.getById(result.insertId);
  }

  static async update(id, data) {
    const { name, title, role, phone, email, image, biography, sort_order } = data;
    await db.execute(`
      UPDATE leadership 
      SET 
        name = COALESCE(?, name),
        title = COALESCE(?, title),
        role = COALESCE(?, role),
        phone = COALESCE(?, phone),
        email = COALESCE(?, email),
        image = COALESCE(?, image),
        biography = COALESCE(?, biography),
        sort_order = COALESCE(?, sort_order),
        updated_at = NOW()
      WHERE id = ?
    `, [name, title, role, phone, email, image, biography, sort_order, id]);
    return this.getById(id);
  }

  static async delete(id) {
    await db.execute('DELETE FROM leadership WHERE id = ?', [id]);
  }
}

module.exports = Leadership;
