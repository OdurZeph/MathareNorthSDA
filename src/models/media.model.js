
const db = require('../config/db');

class Media {
  static async getAll() {
    const [rows] = await db.execute('SELECT * FROM media ORDER BY created_at DESC');
    return rows;
  }

  static async getByType(type) {
    const [rows] = await db.execute('SELECT * FROM media WHERE type = ? ORDER BY created_at DESC', [type]);
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.execute('SELECT * FROM media WHERE id = ?', [id]);
    return rows[0];
  }

  static async upload(data) {
    const { file_path, type, title, description } = data;
    const [result] = await db.execute(`
      INSERT INTO media (file_path, type, title, description)
      VALUES (?, ?, ?, ?)
    `, [file_path, type, title, description]);
    return this.getById(result.insertId);
  }

  static async delete(id) {
    await db.execute('DELETE FROM media WHERE id = ?', [id]);
  }
}

module.exports = Media;
