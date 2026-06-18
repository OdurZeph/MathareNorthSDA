const db = require('../config/db');

async function createDedicationRequest(data) {
  const [result] = await db.execute(
    `INSERT INTO child_dedications (
      parent_guardian_name, phone, email, child_full_name,
      child_date_of_birth, gender, preferred_dedication_date,
      additional_info, reference_number, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [
      data.parent_guardian_name,
      data.phone,
      data.email || null,
      data.child_full_name,
      data.child_date_of_birth || null,
      data.gender || null,
      data.preferred_dedication_date || null,
      data.additional_info || null,
      data.reference_number,
    ]
  );
  return { id: result.insertId, ...data };
}

module.exports = { createDedicationRequest };
