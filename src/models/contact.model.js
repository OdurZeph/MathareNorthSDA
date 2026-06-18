const db = require('../config/db');

async function createContact(data) {
  const { name, email, message, reference_number } = data;
  const [result] = await db.execute(
    `INSERT INTO contact_messages (name, email, message, reference_number, created_at)
     VALUES (?, ?, ?, ?, NOW())`,
    [name, email, message, reference_number]
  );
  return { insertId: result.insertId };
}

module.exports = { createContact };
