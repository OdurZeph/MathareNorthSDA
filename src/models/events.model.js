
const db = require('../config/db');

class Event {
  static async getAll(includeUnpublished = false) {
    let query = 'SELECT * FROM events';
    let params = [];
    if (!includeUnpublished) {
      query += ' WHERE is_published = 1';
    }
    query += ' ORDER BY date DESC';
    const [rows] = await db.execute(query, params);
    return rows;
  }

  static async getById(id, includeUnpublished = false) {
    let query = 'SELECT * FROM events WHERE id = ?';
    let params = [id];
    if (!includeUnpublished) {
      query += ' AND is_published = 1';
    }
    const [rows] = await db.execute(query, params);
    return rows[0];
  }

  static async create(data) {
    const { title, description, date, location, image, registration_link } = data;
    const [result] = await db.execute(`
      INSERT INTO events (title, description, date, location, image, registration_link)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [title, description, date, location, image, registration_link]);
    return this.getById(result.insertId, true);
  }

  static async update(id, data) {
    const { title, description, date, location, image, registration_link, is_published } = data;
    await db.execute(`
      UPDATE events 
      SET 
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        date = COALESCE(?, date),
        location = COALESCE(?, location),
        image = COALESCE(?, image),
        registration_link = COALESCE(?, registration_link),
        is_published = COALESCE(?, is_published),
        updated_at = NOW()
      WHERE id = ?
    `, [title, description, date, location, image, registration_link, is_published, id]);
    return this.getById(id, true);
  }

  static async delete(id) {
    await db.execute('DELETE FROM events WHERE id = ?', [id]);
  }
}

module.exports = Event;
