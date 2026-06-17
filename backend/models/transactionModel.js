const db = require('../config/db');

async function createTransaction({
  phone_number,
  amount,
  transaction_type,
  checkout_request_id,
  status = 'Pending',
}) {
  const result = await db.execute(
    `INSERT INTO transactions
       (phone_number, amount, transaction_type, checkout_request_id, status, created_at)
     VALUES (?, ?, ?, ?, ?, NOW())`,
    [phone_number, amount, transaction_type, checkout_request_id, status]
  );
  return { id: result.insertId, checkout_request_id, status };
}

async function findByCheckoutRequestId(checkoutRequestId) {
  const rows = await db.execute(
    `SELECT * FROM transactions WHERE checkout_request_id = ? LIMIT 1`,
    [checkoutRequestId]
  );
  return rows[0] || null;
}

async function updateFromCallback({
  checkout_request_id,
  status,
  mpesa_receipt_number = null,
}) {
  await db.execute(
    `UPDATE transactions
     SET status = ?, mpesa_receipt_number = COALESCE(?, mpesa_receipt_number)
     WHERE checkout_request_id = ?`,
    [status, mpesa_receipt_number, checkout_request_id]
  );
  return findByCheckoutRequestId(checkout_request_id);
}

async function getAllTransactions({ limit = 100, offset = 0 } = {}) {
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 100, 1), 500);
  const safeOffset = Math.max(parseInt(offset, 10) || 0, 0);

  return db.execute(
    `SELECT id, phone_number, amount, transaction_type, checkout_request_id,
            mpesa_receipt_number, status, created_at
     FROM transactions
     ORDER BY created_at DESC
     LIMIT ${safeLimit} OFFSET ${safeOffset}`
  );
}

module.exports = {
  createTransaction,
  findByCheckoutRequestId,
  updateFromCallback,
  getAllTransactions,
};
