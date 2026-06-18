const db = require('../config/db');

async function createTransferRequest(data) {
  const [result] = await db.execute(
    `INSERT INTO membership_transfers (
      full_name, phone, email, current_church, conference_region,
      baptism_date, membership_number, reason_for_transfer, additional_notes,
      reference_number, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', NOW())`,
    [
      data.full_name,
      data.phone,
      data.email,
      data.current_church || null,
      data.conference_region || null,
      data.baptism_date || null,
      data.membership_number || null,
      data.reason_for_transfer || null,
      data.additional_notes || null,
      data.reference_number,
    ]
  );
  return { id: result.insertId, ...data };
}

async function createVisitationRequest(data) {
  const [result] = await db.execute(
    `INSERT INTO visitation_requests (
      full_name, phone, email, physical_address, type_of_visit,
      preferred_date, preferred_time, prayer_request_message,
      reference_number, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [
      data.full_name,
      data.phone,
      data.email || null,
      data.physical_address || null,
      data.type_of_visit || null,
      data.preferred_date || null,
      data.preferred_time || null,
      data.prayer_request_message || null,
      data.reference_number,
    ]
  );
  return { id: result.insertId, ...data };
}

module.exports = { createTransferRequest, createVisitationRequest };
