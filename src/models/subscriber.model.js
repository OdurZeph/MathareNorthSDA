const db = require('../config/db');

class Subscriber {
  static async create({ email, categories, verificationToken }) {
    const [result] = await db.execute(
      `INSERT INTO subscribers (email, categories, verification_token, status) VALUES (?, ?, ?, 'pending')`,
      [email, JSON.stringify(categories), verificationToken]
    );
    return result.insertId;
  }

  static async findByEmail(email) {
    const [rows] = await db.execute(
      'SELECT * FROM subscribers WHERE email = ?',
      [email]
    );
    return rows.length ? rows[0] : null;
  }

  static async findByVerificationToken(token) {
    const [rows] = await db.execute(
      'SELECT * FROM subscribers WHERE verification_token = ?',
      [token]
    );
    return rows.length ? rows[0] : null;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM subscribers WHERE id = ?',
      [id]
    );
    return rows.length ? rows[0] : null;
  }

  static async updateVerification(id, status) {
    const [result] = await db.execute(
      `UPDATE subscribers SET status = ?, verification_token = NULL, date_subscribed = NOW() WHERE id = ?`,
      [status, id]
    );
    return result.affectedRows > 0;
  }

  static async updateStatus(id, status) {
    const [result] = await db.execute(
      `UPDATE subscribers SET status = ? WHERE id = ?`,
      [status, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM subscribers WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async findAll({ search = '', status = '', category = '', limit = 50, offset = 0 } = {}) {
    let query = 'SELECT * FROM subscribers WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND email LIKE ?';
      params.push(`%${search}%`);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (category) {
      query += ' AND categories LIKE ?';
      params.push(`%"${category}"%`);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await db.execute(query, params);
    return rows;
  }

  static async getStats() {
    const [totalResult] = await db.execute('SELECT COUNT(*) as count FROM subscribers');
    const [activeResult] = await db.execute('SELECT COUNT(*) as count FROM subscribers WHERE status = "active"');
    const [pendingResult] = await db.execute('SELECT COUNT(*) as count FROM subscribers WHERE status = "pending"');
    const [unsubscribedResult] = await db.execute('SELECT COUNT(*) as count FROM subscribers WHERE status = "unsubscribed"');

    return {
      total: totalResult[0].count,
      active: activeResult[0].count,
      pending: pendingResult[0].count,
      unsubscribed: unsubscribedResult[0].count
    };
  }

  static async findByCategories(categories) {
    let query = 'SELECT DISTINCT email FROM subscribers WHERE status = "active" AND (';
    const params = [];

    categories.forEach((cat, index) => {
      if (index > 0) query += ' OR ';
      query += ' categories LIKE ?';
      params.push(`%"${cat}"%`);
    });
    query += ')';

    const [rows] = await db.execute(query, params);
    return rows.map(row => row.email);
  }
}

module.exports = Subscriber;
