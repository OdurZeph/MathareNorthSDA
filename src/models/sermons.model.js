
const db = require('../config/db');

class Sermon {
  static async getAll(includeUnpublished = false) {
    let query = 'SELECT * FROM sermons';
    let params = [];
    if (!includeUnpublished) {
      query += ' WHERE is_published = 1';
    }
    query += ' ORDER BY date DESC';
    const [rows] = await db.execute(query, params);
    return rows;
  }

  static async getById(id, includeUnpublished = false) {
    let query = 'SELECT * FROM sermons WHERE id = ?';
    let params = [id];
    if (!includeUnpublished) {
      query += ' AND is_published = 1';
    }
    const [rows] = await db.execute(query, params);
    return rows[0];
  }

  static async create(data) {
    const { title, speaker, date, description, youtube_url, image } = data;
    const [result] = await db.execute(`
      INSERT INTO sermons (title, speaker, date, description, youtube_url, image)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [title, speaker, date, description, youtube_url, image]);
    return this.getById(result.insertId, true);
  }

  static async update(id, data) {
    const { title, speaker, date, description, youtube_url, image, is_published } = data;
    await db.execute(`
      UPDATE sermons 
      SET 
        title = COALESCE(?, title),
        speaker = COALESCE(?, speaker),
        date = COALESCE(?, date),
        description = COALESCE(?, description),
        youtube_url = COALESCE(?, youtube_url),
        image = COALESCE(?, image),
        is_published = COALESCE(?, is_published),
        updated_at = NOW()
      WHERE id = ?
    `, [title, speaker, date, description, youtube_url, image, is_published, id]);
    return this.getById(id, true);
  }

  static async delete(id) {
    await db.execute('DELETE FROM sermons WHERE id = ?', [id]);
  }
}

module.exports = Sermon;
