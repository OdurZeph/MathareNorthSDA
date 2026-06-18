
const db = require('../config/db');

class PageSection {
  static async getAll() {
    const [rows] = await db.execute('SELECT * FROM page_sections ORDER BY page, sort_order');
    return rows;
  }

  static async getByPage(page) {
    const [rows] = await db.execute('SELECT * FROM page_sections WHERE page = ? ORDER BY sort_order', [page]);
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.execute('SELECT * FROM page_sections WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(data) {
    const { page, section_key, title, content, sort_order } = data;
    const [result] = await db.execute(`
      INSERT INTO page_sections (page, section_key, title, content, sort_order)
      VALUES (?, ?, ?, ?, ?)
    `, [page, section_key, title, content, sort_order || 0]);
    return this.getById(result.insertId);
  }

  static async update(id, data) {
    const { title, content, sort_order } = data;
    await db.execute(`
      UPDATE page_sections 
      SET 
        title = COALESCE(?, title),
        content = COALESCE(?, content),
        sort_order = COALESCE(?, sort_order),
        updated_at = NOW()
      WHERE id = ?
    `, [title, content, sort_order, id]);
    return this.getById(id);
  }

  static async delete(id) {
    await db.execute('DELETE FROM page_sections WHERE id = ?', [id]);
  }
}

module.exports = PageSection;
