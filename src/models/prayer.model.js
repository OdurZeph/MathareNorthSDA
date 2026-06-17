const db = require('../config/db');

async function createPrayerRequest(data) {
  const { name, email, message, reference_number } = data;
  const rows = await db.execute(
    `INSERT INTO prayer_requests (name, email, message, reference_number, created_at)
     VALUES (?, ?, ?, ?, NOW())`,
    [name, email, message, reference_number]
  );
  return { id: rows.insertId, ...data };
}

module.exports = { createPrayerRequest };
