const db = require('../config/db');

class EmailLog {
  static async create({ subject, toEmail, category, status = 'pending', errorMessage = null, scheduledAt = null }) {
    const [result] = await db.execute(
      `INSERT INTO email_logs (subject, to_email, category, status, error_message, scheduled_at) VALUES (?, ?, ?, ?, ?, ?)`,
      [subject, toEmail, category, status, errorMessage, scheduledAt]
    );
    return result.insertId;
  }

  static async updateStatus(id, status, errorMessage = null) {
    let query = 'UPDATE email_logs SET status = ?';
    const params = [status];

    if (errorMessage) {
      query += ', error_message = ?';
      params.push(errorMessage);
    }

    if (status === 'sent') {
      query += ', sent_at = NOW()';
    }

    query += ' WHERE id = ?';
    params.push(id);

    const [result] = await db.execute(query, params);
    return result.affectedRows > 0;
  }

  static async findAll({ limit = 50, offset = 0 } = {}) {
    const [rows] = await db.execute(
      'SELECT * FROM email_logs ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [parseInt(limit), parseInt(offset)]
    );
    return rows;
  }

  static async getStats() {
    const [totalResult] = await db.execute('SELECT COUNT(*) as count FROM email_logs');
    const [sentResult] = await db.execute('SELECT COUNT(*) as count FROM email_logs WHERE status = "sent"');
    const [failedResult] = await db.execute('SELECT COUNT(*) as count FROM email_logs WHERE status = "failed"');

    return {
      total: totalResult[0].count,
      sent: sentResult[0].count,
      failed: failedResult[0].count
    };
  }
}

module.exports = EmailLog;
