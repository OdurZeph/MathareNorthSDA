const db = require('../config/db');

function parseMpesaDate(value) {
  if (!value) return null;
  const raw = String(value);
  if (!/^\d{14}$/.test(raw)) return null;

  const year = raw.slice(0, 4);
  const month = raw.slice(4, 6);
  const day = raw.slice(6, 8);
  const hour = raw.slice(8, 10);
  const minute = raw.slice(10, 12);
  const second = raw.slice(12, 14);

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

async function createDonation({
  donorName = null,
  phoneNumber,
  amount,
  category,
  checkoutRequestID,
  merchantRequestID = null,
  status = 'Pending',
}) {
  const result = await db.execute(
    `INSERT INTO donations
       (donorName, phoneNumber, amount, category, checkoutRequestID,
        merchantRequestID, status, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
    [
      donorName || null,
      phoneNumber,
      amount,
      category,
      checkoutRequestID,
      merchantRequestID,
      status,
    ]
  );

  return { id: result.insertId, checkoutRequestID, status };
}

async function findByCheckoutRequestID(checkoutRequestID) {
  const rows = await db.execute(
    `SELECT id, donorName, phoneNumber, amount, category, checkoutRequestID,
            merchantRequestID, mpesaReceiptNumber, transactionDate, status, createdAt
     FROM donations
     WHERE checkoutRequestID = ?
     LIMIT 1`,
    [checkoutRequestID]
  );

  return rows[0] || null;
}

async function updateFromCallback({
  checkoutRequestID,
  merchantRequestID = null,
  mpesaReceiptNumber = null,
  transactionDate = null,
  status,
}) {
  await db.execute(
    `UPDATE donations
     SET status = ?,
         merchantRequestID = COALESCE(?, merchantRequestID),
         mpesaReceiptNumber = COALESCE(?, mpesaReceiptNumber),
         transactionDate = COALESCE(?, transactionDate)
     WHERE checkoutRequestID = ?`,
    [
      status,
      merchantRequestID,
      mpesaReceiptNumber,
      parseMpesaDate(transactionDate) || transactionDate,
      checkoutRequestID,
    ]
  );

  return findByCheckoutRequestID(checkoutRequestID);
}

async function getAllDonations({ limit = 100, offset = 0 } = {}) {
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 100, 1), 500);
  const safeOffset = Math.max(parseInt(offset, 10) || 0, 0);

  return db.execute(
    `SELECT id, donorName, phoneNumber, amount, category, checkoutRequestID,
            merchantRequestID, mpesaReceiptNumber, transactionDate, status, createdAt
     FROM donations
     ORDER BY createdAt DESC
     LIMIT ${safeLimit} OFFSET ${safeOffset}`
  );
}

module.exports = {
  parseMpesaDate,
  createDonation,
  findByCheckoutRequestID,
  updateFromCallback,
  getAllDonations,
};
