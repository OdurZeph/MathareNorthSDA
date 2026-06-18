
const db = require('../config/db');

class Ministry {
  static async getAll() {
    const [rows] = await db.execute('SELECT * FROM ministries ORDER BY sort_order, created_at DESC');
    return rows;
  }

  static async getBySlug(slug) {
    const [rows] = await db.execute('SELECT * FROM ministries WHERE slug = ?', [slug]);
    return rows[0];
  }

  static async getById(id) {
    const [rows] = await db.execute('SELECT * FROM ministries WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(data) {
    const { title, slug, description, image, sort_order } = data;
    const [result] = await db.execute(`
      INSERT INTO ministries (title, slug, description, image, sort_order)
      VALUES (?, ?, ?, ?, ?)
    `, [title, slug, description, image, sort_order || 0]);
    return this.getById(result.insertId);
  }

  static async update(id, data) {
    const { title, slug, description, image, sort_order } = data;
    await db.execute(`
      UPDATE ministries 
      SET 
        title = COALESCE(?, title),
        slug = COALESCE(?, slug),
        description = COALESCE(?, description),
        image = COALESCE(?, image),
        sort_order = COALESCE(?, sort_order),
        updated_at = NOW()
      WHERE id = ?
    `, [title, slug, description, image, sort_order, id]);
    return this.getById(id);
  }

  static async delete(id) {
    await db.execute('DELETE FROM ministries WHERE id = ?', [id]);
  }
}

module.exports = Ministry;
