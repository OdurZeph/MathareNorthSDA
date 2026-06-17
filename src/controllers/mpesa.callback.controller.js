const donationModel = require('../models/donation.model');

const mpesaCallback = async (req, res) => {
  try {
    const body = req.body?.Body?.stkCallback || req.body?.stkCallback;

    if (!body) {
      console.warn('M-Pesa callback: unexpected payload shape', JSON.stringify(req.body));
      return res.status(200).json({
        ResultCode: 0,
        ResultDesc: 'Callback received successfully'
      });
    }

    const checkoutRequestID = body.CheckoutRequestID;
    const resultCode = Number(body.ResultCode);
    const resultDesc = body.ResultDesc || '';

    if (!checkoutRequestID) {
      console.warn('M-Pesa callback ignored: missing CheckoutRequestID');
      return res.status(200).json({
        ResultCode: 0,
        ResultDesc: 'Callback received successfully'
      });
    }

    const existingDonation = await donationModel.findByCheckoutRequestID(checkoutRequestID);

    if (!existingDonation) {
      console.warn(`M-Pesa callback ignored: unknown CheckoutRequestID ${checkoutRequestID}`);
      return res.status(200).json({
        ResultCode: 0,
        ResultDesc: 'Callback received successfully'
      });
    }

    if (existingDonation.status !== 'Pending') {
      console.warn(`M-Pesa callback ignored: donation already processed (status: ${existingDonation.status})`);
      return res.status(200).json({
        ResultCode: 0,
        ResultDesc: 'Callback received successfully'
      });
    }

    let status = 'Failed';
    let mpesaReceipt = null;

    if (resultCode === 0 && Array.isArray(body.CallbackMetadata?.Item)) {
      for (const item of body.CallbackMetadata.Item) {
        if (item.Name === 'MpesaReceiptNumber') mpesaReceipt = item.Value;
      }
      status = 'Completed';
    }

    await donationModel.updateDonationStatus({
      checkoutRequestID,
      status,
      mpesaReceipt
    });

    console.log(`M-Pesa callback: ${checkoutRequestID} -> ${status} (${resultDesc})`);

    return res.status(200).json({
      ResultCode: 0,
      ResultDesc: 'Callback received successfully'
    });
  } catch (error) {
    console.error('M-Pesa callback processing error:', error);
    return res.status(200).json({
      ResultCode: 0,
      ResultDesc: 'Callback received successfully'
    });
  }
};

module.exports = {
  mpesaCallback
};
