
const db = require('../config/db');

class AuditLog {
  static async create(data) {
    const { admin_id, action, table_name, record_id, changes } = data;
    const [result] = await db.execute(`
      INSERT INTO audit_logs (admin_id, action, table_name, record_id, changes)
      VALUES (?, ?, ?, ?, ?)
    `, [admin_id, action, table_name, record_id, JSON.stringify(changes)]);
    const [rows] = await db.execute('SELECT * FROM audit_logs WHERE id = ?', [result.insertId]);
    return rows[0];
  }

  static async getAll(limit = 100) {
    const [rows] = await db.execute(`
      SELECT al.*, a.username 
      FROM audit_logs al 
      LEFT JOIN admins a ON al.admin_id = a.id 
      ORDER BY al.created_at DESC 
      LIMIT ?
    `, [limit]);
    return rows;
  }
}

module.exports = AuditLog;
