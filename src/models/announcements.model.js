
const db = require('../config/db');

class Announcement {
  static async getAll(includeArchived = false) {
    let query = 'SELECT * FROM announcements';
    let params = [];
    if (!includeArchived) {
      query += ' WHERE is_archived = 0';
    }
    query += ' ORDER BY publish_date DESC';
    const [rows] = await db.execute(query, params);
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.execute('SELECT * FROM announcements WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(data) {
    const { title, body, category, publish_date } = data;
    const [result] = await db.execute(`
      INSERT INTO announcements (title, body, category, publish_date)
      VALUES (?, ?, ?, ?)
    `, [title, body, category, publish_date]);
    return this.getById(result.insertId);
  }

  static async update(id, data) {
    const { title, body, category, publish_date, is_archived } = data;
    await db.execute(`
      UPDATE announcements 
      SET 
        title = COALESCE(?, title),
        body = COALESCE(?, body),
        category = COALESCE(?, category),
        publish_date = COALESCE(?, publish_date),
        is_archived = COALESCE(?, is_archived),
        updated_at = NOW()
      WHERE id = ?
    `, [title, body, category, publish_date, is_archived, id]);
    return this.getById(id);
  }

  static async delete(id) {
    await db.execute('DELETE FROM announcements WHERE id = ?', [id]);
  }
}

module.exports = Announcement;
