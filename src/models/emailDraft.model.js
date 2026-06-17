const db = require('../config/db');

class EmailDraft {
  static async create({ subject, content, category, scheduledAt = null }) {
    const [result] = await db.execute(
      `INSERT INTO email_drafts (subject, content, category, scheduled_at) VALUES (?, ?, ?, ?)`,
      [subject, content, category, scheduledAt]
    );
    return result.insertId;
  }

  static async update(id, { subject, content, category, scheduledAt }) {
    const [result] = await db.execute(
      `UPDATE email_drafts SET subject = ?, content = ?, category = ?, scheduled_at = ? WHERE id = ?`,
      [subject, content, category, scheduledAt, id]
    );
    return result.affectedRows > 0;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM email_drafts WHERE id = ?',
      [id]
    );
    return rows.length ? rows[0] : null;
  }

  static async findAll({ limit = 50, offset = 0 } = {}) {
    const [rows] = await db.execute(
      'SELECT * FROM email_drafts WHERE is_sent = 0 ORDER BY updated_at DESC LIMIT ? OFFSET ?',
      [parseInt(limit), parseInt(offset)]
    );
    return rows;
  }

  static async markAsSent(id) {
    const [result] = await db.execute(
      'UPDATE email_drafts SET is_sent = 1 WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM email_drafts WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = EmailDraft;
