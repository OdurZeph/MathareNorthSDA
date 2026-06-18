const stkService = require('../services/stkService');
const transactionModel = require('../models/transactionModel');
const donationModel = require('../models/donationModel');
const {
  buildDonationReceipt,
  prepareReceiptNotifications,
} = require('../services/receiptService');
const {
  validateStkPushBody,
  resolvePaymentChannel,
} = require('../utils/validators');

function mapErrorToHttp(err) {
  const code = err.code || 'INTERNAL';
  const statusMap = {
    MPESA_CONFIG: 503,
    MPESA_SHORTCODE: 503,
    MPESA_TOKEN: 502,
    MPESA_TIMEOUT: 504,
    MPESA_STK_REJECTED: 422,
    MPESA_STK_FAILED: 502,
    VALIDATION: 400,
    DB_ERROR: 503,
  };

  return {
    status: statusMap[code] || 500,
    code,
    message: err.message || 'An unexpected error occurred',
  };
}

/**
 * POST /api/mpesa/stkpush
 */
async function stkPush(req, res) {
  const validation = validateStkPushBody(req.body);
  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validation.errors,
    });
  }

  const { donorName, phone, phoneNumber, amount, category, paymentType, mode } =
    validation.data;
  const channel = resolvePaymentChannel({ paymentType, mode });

  if (!channel.shortcode) {
    const key =
      channel.channel === 'till'
        ? 'MPESA_TILL_NUMBER'
        : 'MPESA_PAYBILL';

    return res.status(503).json({
      success: false,
      message: `${key} is not configured in environment variables`,
    });
  }

  try {
    const mpesaResponse = await stkService.initiateStkPush({
      phone,
      amount,
      shortcode: channel.shortcode,
      transactionType: channel.transactionType,
      paymentType: category,
      // For paybill: use the configured account number; for till: use category label
      accountReference:
        channel.accountReference ||
        category.replace(/_/g, '-').slice(0, 12),
    });

    const checkoutRequestID =
      mpesaResponse.CheckoutRequestID || mpesaResponse.checkoutRequestID;
    const merchantRequestID =
      mpesaResponse.MerchantRequestID || mpesaResponse.merchantRequestID || null;

    let donation = null;
    try {
      donation = await donationModel.createDonation({
        donorName,
        phoneNumber,
        amount,
        category,
        checkoutRequestID,
        merchantRequestID,
        status: 'Pending',
      });
    } catch (dbErr) {
      console.error('Failed to save pending donation:', dbErr.message);
      dbErr.code = 'DB_ERROR';
      throw dbErr;
    }

    try {
      await transactionModel.createTransaction({
        phone_number: phone,
        amount,
        transaction_type: category,
        checkout_request_id: checkoutRequestID,
        status: 'Pending',
      });
    } catch (legacyDbErr) {
      console.warn('Failed to save legacy transaction log:', legacyDbErr.message);
    }

    return res.status(200).json({
      success: true,
      message: mpesaResponse.CustomerMessage || 'STK Push sent. Check your phone.',
      data: {
        checkoutRequestID,
        checkoutRequestId: checkoutRequestID,
        merchantRequestID,
        merchantRequestId: merchantRequestID,
        channel: channel.channel,
        transactionType: channel.transactionType,
        category,
        paymentType,
        mode,
        status: 'Pending',
        donationId: donation?.id,
      },
    });
  } catch (err) {
    console.error('STK Push error:', err.message);
    const { status, code, message } = mapErrorToHttp(err);

    return res.status(status).json({
      success: false,
      message,
      code,
      ...(process.env.NODE_ENV !== 'production' && err.mpesaResponse
        ? { details: err.mpesaResponse }
        : {}),
    });
  }
}

/**
 * POST /api/mpesa/callback
 */
async function mpesaCallback(req, res) {
  const respondOk = () =>
    res.status(200).json({
      ResultCode: 0,
      ResultDesc: 'Callback received successfully',
    });

  try {
    const body = req.body?.Body?.stkCallback || req.body?.stkCallback;
    if (!body) {
      console.warn('M-Pesa callback: unexpected payload shape', JSON.stringify(req.body));
      return respondOk();
    }

    const checkoutRequestID = body.CheckoutRequestID;
    const merchantRequestID = body.MerchantRequestID || null;
    const resultCode = Number(body.ResultCode);
    const resultDesc = body.ResultDesc || '';

    if (!checkoutRequestID) {
      console.warn('M-Pesa callback ignored: missing CheckoutRequestID');
      return respondOk();
    }

    const status = resultCode === 0 ? 'Success' : 'Failed';
    let mpesaReceiptNumber = null;
    let phoneNumber = null;
    let amount = null;
    let transactionDate = null;

    if (resultCode === 0 && Array.isArray(body.CallbackMetadata?.Item)) {
      for (const item of body.CallbackMetadata.Item) {
        if (item.Name === 'MpesaReceiptNumber') mpesaReceiptNumber = item.Value;
        if (item.Name === 'PhoneNumber') phoneNumber = String(item.Value);
        if (item.Name === 'Amount') amount = item.Value;
        if (item.Name === 'TransactionDate') transactionDate = item.Value;
      }
    }

    const existingDonation = await donationModel.findByCheckoutRequestID(
      checkoutRequestID
    );

    if (!existingDonation) {
      console.warn(
        `M-Pesa callback ignored: unknown CheckoutRequestID ${checkoutRequestID}`
      );
      return respondOk();
    }

    let updatedDonation = existingDonation;
    if (existingDonation.status !== 'Success') {
      updatedDonation = await donationModel.updateFromCallback({
        checkoutRequestID,
        merchantRequestID,
        status,
        mpesaReceiptNumber,
        transactionDate,
      });
    }

    try {
      const existingTransaction = await transactionModel.findByCheckoutRequestId(
        checkoutRequestID
      );

      if (existingTransaction) {
        await transactionModel.updateFromCallback({
          checkout_request_id: checkoutRequestID,
          status,
          mpesa_receipt_number: mpesaReceiptNumber,
        });
      } else {
        await transactionModel.createTransaction({
          phone_number: phoneNumber || existingDonation.phoneNumber || 'unknown',
          amount: amount || existingDonation.amount || 0,
          transaction_type: existingDonation.category,
          checkout_request_id: checkoutRequestID,
          status,
        });
        if (mpesaReceiptNumber) {
          await transactionModel.updateFromCallback({
            checkout_request_id: checkoutRequestID,
            status,
            mpesa_receipt_number: mpesaReceiptNumber,
          });
        }
      }
    } catch (legacyDbErr) {
      console.warn('M-Pesa callback legacy transaction log skipped:', legacyDbErr.message);
    }

    const receipt = buildDonationReceipt(updatedDonation);
    if (receipt) {
      await prepareReceiptNotifications(receipt);
    }

    console.log(
      `M-Pesa callback: ${checkoutRequestID} -> ${status} (${resultDesc})`
    );

    return respondOk();
  } catch (err) {
    console.error('M-Pesa callback processing error:', err.message);
    return respondOk();
  }
}

/**
 * GET /api/mpesa/status/:checkoutRequestID
 */
async function getDonationStatus(req, res) {
  try {
    const checkoutRequestID =
      req.params.checkoutRequestID || req.params.checkoutRequestId;

    if (!checkoutRequestID) {
      return res.status(400).json({
        success: false,
        message: 'checkoutRequestID is required',
      });
    }

    const donation = await donationModel.findByCheckoutRequestID(checkoutRequestID);
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation transaction not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        checkoutRequestID: donation.checkoutRequestID,
        merchantRequestID: donation.merchantRequestID,
        status: donation.status,
        category: donation.category,
        amount: donation.amount,
        receipt: buildDonationReceipt(donation),
      },
    });
  } catch (err) {
    console.error('Donation status error:', err.message);
    return res.status(503).json({
      success: false,
      message: 'Unable to fetch donation status. Check database connection.',
    });
  }
}

/**
 * POST /api/mpesa/verify/:checkoutRequestID
 */
async function verifyTransaction(req, res) {
  try {
    const checkoutRequestID =
      req.params.checkoutRequestID || req.params.checkoutRequestId;

    if (!checkoutRequestID) {
      return res.status(400).json({
        success: false,
        message: 'checkoutRequestID is required',
      });
    }

    const donation = await donationModel.findByCheckoutRequestID(checkoutRequestID);
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation transaction not found',
      });
    }

    const mpesaStatus = await stkService.queryStkPushStatus({
      checkoutRequestID,
    });

    return res.status(200).json({
      success: true,
      data: {
        checkoutRequestID,
        status: donation.status,
        mpesa: {
          ResponseCode: mpesaStatus.ResponseCode,
          ResponseDescription: mpesaStatus.ResponseDescription,
          ResultCode: mpesaStatus.ResultCode,
          ResultDesc: mpesaStatus.ResultDesc,
        },
      },
    });
  } catch (err) {
    console.error('M-Pesa verification error:', err.message);
    const { status, code, message } = mapErrorToHttp(err);

    return res.status(status).json({
      success: false,
      message,
      code,
      ...(process.env.NODE_ENV !== 'production' && err.mpesaResponse
        ? { details: err.mpesaResponse }
        : {}),
    });
  }
}

/**
 * GET /api/mpesa/transactions
 */
async function listTransactions(req, res) {
  try {
    const limit = req.query.limit;
    const offset = req.query.offset;
    const donations = await donationModel.getAllDonations({
      limit,
      offset,
    });

    return res.status(200).json({
      success: true,
      count: donations.length,
      data: donations,
    });
  } catch (err) {
    try {
      const limit = req.query.limit;
      const offset = req.query.offset;
      const transactions = await transactionModel.getAllTransactions({
        limit,
        offset,
      });

      return res.status(200).json({
        success: true,
        count: transactions.length,
        data: transactions,
      });
    } catch (fallbackErr) {
      console.error('List transactions error:', fallbackErr.message);
      return res.status(503).json({
        success: false,
        message: 'Unable to fetch transactions. Check database connection.',
      });
    }
  }
}

module.exports = {
  stkPush,
  mpesaCallback,
  getDonationStatus,
  verifyTransaction,
  listTransactions,
};
