function buildDonationReceipt(donation) {
  if (!donation || donation.status !== 'Success') return null;

  return {
    receiptNumber: donation.mpesaReceiptNumber,
    donorName: donation.donorName || null,
    phoneNumber: donation.phoneNumber,
    amount: donation.amount,
    category: donation.category,
    paidAt: donation.transactionDate,
    checkoutRequestID: donation.checkoutRequestID,
    merchantRequestID: donation.merchantRequestID,
  };
}

async function prepareReceiptNotifications(receipt) {
  // Future email and SMS providers can be called from here.
  return receipt;
}

module.exports = {
  buildDonationReceipt,
  prepareReceiptNotifications,
};
