const { initiateStkPush } = require('../config/mpesa');
const donationModel = require('../models/donation.model');

function validateKenyanPhone(phone) {
  const cleaned = String(phone).replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    return `254${cleaned.slice(1)}`;
  } else if (cleaned.startsWith('254')) {
    return cleaned;
  } else if (cleaned.startsWith('7') && cleaned.length === 9) {
    return `254${cleaned}`;
  } else if (cleaned.startsWith('1') && cleaned.length === 9) {
    return `254${cleaned}`;
  }
  return null;
}

function validateAmount(amount) {
  const num = Number(amount);
  return !isNaN(num) && num > 0;
}

function normalizeDonationType(type) {
  const normalized = String(type || '').toLowerCase().replace(/[\s-]+/g, '_');
  const aliases = {
    // Building fund → Till
    building_fund: 'building',
    building: 'building',
    construction: 'building',
    // General / donation / church support → Paybill
    general: 'general',
    donation: 'donation',
    church_support: 'church_support',
    churchsupport: 'church_support',
    // Standard giving categories → Paybill
    tithe: 'tithe',
    tithes: 'tithe',
    offering: 'offering',
    missions: 'missions',
    mission: 'missions',
  };
  return aliases[normalized] || null;
}

/** Returns true if the normalized type is a building fund (routes to Till) */
function isBuildingCategory(normalizedType) {
  return normalizedType === 'building';
}

function validateDonationType(type) {
  return normalizeDonationType(type) !== null;
}

const stkPush = async (req, res) => {
  try {
    // Accept both old and new payload formats
    const {
      phone,
      phoneNumber,
      amount,
      type,
      category
    } = req.body;

    const usePhone = phone || phoneNumber;
    const normalizedType = normalizeDonationType(type || category);

    const validPhone = validateKenyanPhone(usePhone);
    if (!validPhone) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number. Must be a valid Kenyan number (e.g., 07XXXXXXXXX, 2547XXXXXXXXX)'
      });
    }

    if (!validateAmount(amount)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount. Must be a positive number.'
      });
    }

    if (!validateDonationType(type || category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid donation type. Must be one of: general, donation, church_support, tithe, offering, missions, building_fund, construction'
      });
    }

    const typeLower = normalizedType;
    const useTill = isBuildingCategory(typeLower);
    const finalCategory = useTill ? 'BUILDING' : typeLower.toUpperCase();
    const reference = finalCategory;
    const paymentMethod = useTill ? 'TILL' : 'PAYBILL';

    const mpesaResponse = await initiateStkPush({
      phone: validPhone,
      amount: Number(amount),
      reference,
      useTill,
      category: finalCategory
    });

    const checkoutRequestID = mpesaResponse.CheckoutRequestID || mpesaResponse.checkoutRequestID;
    const merchantRequestID = mpesaResponse.MerchantRequestID || mpesaResponse.merchantRequestID;

    try {
      await donationModel.insertDonation({
        phone: validPhone,
        amount: Number(amount),
        reference,
        category: finalCategory,
        paymentMethod,
        checkoutRequestID,
        status: 'Pending',
        donorName: req.body.donorName?.trim() || null,
      });
    } catch (dbErr) {
      console.error('[mpesa] DB save failed (STK still sent):', dbErr.message);
    }

    return res.status(200).json({
      success: true,
      message: mpesaResponse.CustomerMessage || 'STK Push sent. Please check your phone.',
      data: {
        checkoutRequestID,
        merchantRequestID,
        phone: validPhone,
        amount: Number(amount),
        type: typeLower,
        category: finalCategory,
        paymentMethod,
        status: 'Pending'
      }
    });
  } catch (error) {
    console.error('STK Push error:', error);

    const statusMap = {
      MPESA_CONFIG: 503,
      MPESA_SHORTCODE: 503,
      MPESA_TOKEN: 502,
      MPESA_TIMEOUT: 504,
      MPESA_STK_REJECTED: 422,
      MPESA_STK_FAILED: 502,
      VALIDATION: 400
    };

    const statusCode = statusMap[error.code] || 500;

    return res.status(statusCode).json({
      success: false,
      message: error.message || 'An error occurred while processing your request.',
      code: error.code
    });
  }
};

module.exports = {
  stkPush
};
