const db = require('../config/db');

async function createPrayerRequest(data) {
  const { name, email, message, reference_number } = data;
  const [result] = await db.execute(
    `INSERT INTO prayer_requests (name, email, message, reference_number, created_at)
     VALUES (?, ?, ?, ?, NOW())`,
    [name, email, message, reference_number]
  );
  return { id: result.insertId, reference_number, ...data };
}

module.exports = { createPrayerRequest };
