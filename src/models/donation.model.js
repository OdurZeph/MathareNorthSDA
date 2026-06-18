const db = require('../config/db');

async function insertDonation({
  phone,
  amount,
  reference,
  category,
  paymentMethod,
  checkoutRequestID,
  status = 'Pending',
  donorName = null,
}) {
  const [result] = await db.execute(
    `INSERT INTO donations (
      donor_name, phone, amount, reference, category, donation_type,
      payment_method, checkout_request_id, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [donorName, phone, amount, reference, category, category, paymentMethod, checkoutRequestID, status]
  );
  return {
    id: result.insertId,
    phone,
    amount,
    reference,
    category,
    paymentMethod,
    checkoutRequestID,
    status,
  };
}

async function findByCheckoutRequestID(checkoutRequestID) {
  const [rows] = await db.execute(
    'SELECT * FROM donations WHERE checkout_request_id = ? LIMIT 1',
    [checkoutRequestID]
  );
  return rows.length ? rows[0] : null;
}

async function updateDonationStatus({ checkoutRequestID, status, mpesaReceipt = null }) {
  await db.execute(
    'UPDATE donations SET status = ?, mpesa_receipt = COALESCE(?, mpesa_receipt) WHERE checkout_request_id = ?',
    [status, mpesaReceipt, checkoutRequestID]
  );
  return findByCheckoutRequestID(checkoutRequestID);
}

async function getAllDonations({ limit = 100, offset = 0 } = {}) {
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 100, 1), 500);
  const safeOffset = Math.max(parseInt(offset, 10) || 0, 0);

  const [rows] = await db.execute(
    'SELECT * FROM donations ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [safeLimit, safeOffset]
  );
  return rows;
}

async function getByCategory(category, { limit = 100, offset = 0 } = {}) {
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 100, 1), 500);
  const safeOffset = Math.max(parseInt(offset, 10) || 0, 0);

  const [rows] = await db.execute(
    'SELECT * FROM donations WHERE category = ? OR donation_type = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [category, category, safeLimit, safeOffset]
  );
  return rows;
}

module.exports = {
  insertDonation,
  findByCheckoutRequestID,
  updateDonationStatus,
  getAllDonations,
  getByCategory,
};
