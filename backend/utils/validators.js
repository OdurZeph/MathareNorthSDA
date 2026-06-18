const DONATION_CATEGORIES = ['tithe', 'offering', 'missions', 'building_fund'];
const GENERAL_CATEGORIES = ['general', 'donation', 'church_support'];
const BUILDING_CATEGORIES = ['building_fund', 'construction'];
const LEGACY_PAYMENT_TYPES = ['test'];
const VALID_PAYMENT_TYPES = [
  ...new Set([...DONATION_CATEGORIES, ...GENERAL_CATEGORIES, ...LEGACY_PAYMENT_TYPES]),
];
const VALID_MODES = ['development', 'production'];

/** Kenyan M-Pesa mobile format: 254 followed by 7 or 1 and 8 more digits. */
const KENYAN_PHONE_REGEX = /^254[71]\d{8}$/;

function normalizePhone(phone) {
  if (phone == null) return '';
  let cleaned = String(phone).trim().replace(/[\s().-]/g, '');

  if (cleaned.startsWith('+')) cleaned = cleaned.slice(1);
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    cleaned = '254' + cleaned.slice(1);
  }
  if (cleaned.startsWith('7') && cleaned.length === 9) {
    cleaned = '254' + cleaned;
  }

  return cleaned;
}

function sanitizeText(value, maxLength = 120) {
  if (value == null) return '';
  return String(value)
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function normalizeCategory(value) {
  const normalized = String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, '_');

  if (normalized === 'tithes') return 'tithe';
  if (normalized === 'mission' || normalized === 'missions_fund') return 'missions';
  if (
    normalized === 'building' ||
    normalized === 'buildingfund' ||
    normalized === 'building_fund' ||
    normalized === 'construction'
  ) return 'building_fund';
  if (normalized === 'church_support' || normalized === 'churchsupport') return 'church_support';
  if (normalized === 'donation') return 'donation';
  if (normalized === 'general') return 'general';

  return normalized;
}

function isValidKenyanPhone(phone) {
  return KENYAN_PHONE_REGEX.test(normalizePhone(phone));
}

function validateStkPushBody(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body is required'] };
  }

  const phone = normalizePhone(body.phoneNumber || body.phone);
  if (!phone) {
    errors.push('Phone number is required');
  } else if (!isValidKenyanPhone(phone)) {
    errors.push('Phone must be a valid Kenyan number (format: 2547XXXXXXXX or 2541XXXXXXXX)');
  }

  const amount = Number(body.amount);
  if (body.amount === undefined || body.amount === null || body.amount === '') {
    errors.push('Amount is required');
  } else if (Number.isNaN(amount) || amount <= 0 || amount > 1000000) {
    errors.push('Amount must be between 1 and 1000000');
  }

  const paymentType = normalizeCategory(body.category || body.paymentType);
  if (!paymentType) {
    errors.push('category is required (e.g. general, donation, church_support, tithe, offering, missions, building_fund, construction)');
  } else if (!VALID_PAYMENT_TYPES.includes(paymentType)) {
    errors.push(`category must be one of: ${VALID_PAYMENT_TYPES.join(', ')}`);
  }

  const mode = (body.mode || 'production').toLowerCase().trim();
  if (!VALID_MODES.includes(mode)) {
    errors.push(`mode must be one of: ${VALID_MODES.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    data: {
      phone,
      phoneNumber: phone,
      amount: Math.ceil(amount),
      donorName: sanitizeText(body.donorName),
      category: paymentType,
      paymentType,
      mode,
    },
  };
}

/**
 * Route payment to Till or Paybill based on category:
 *   - building_fund | construction  → Till (CustomerBuyGoodsOnline)
 *   - everything else               → Paybill (CustomerPayBillOnline)
 *
 * The `mode` flag can still force till routing for development/test overrides.
 */
function resolvePaymentChannel({ paymentType, mode }) {
  const useTill =
    mode === 'development' ||
    paymentType === 'test' ||
    BUILDING_CATEGORIES.includes(paymentType);

  if (useTill) {
    return {
      shortcode: process.env.MPESA_TILL_NUMBER || process.env.TILL_SHORTCODE,
      transactionType: 'CustomerBuyGoodsOnline',
      channel: 'till',
      label: 'Till (Buy Goods)',
      accountReference: null, // Till payments don't use an account number
    };
  }

  return {
    shortcode: process.env.MPESA_PAYBILL || process.env.PAYBILL_SHORTCODE || process.env.MPESA_SHORTCODE,
    transactionType: 'CustomerPayBillOnline',
    channel: 'paybill',
    label: 'Paybill',
    accountReference: process.env.MPESA_PAYBILL_ACCOUNT || '',
  };
}

module.exports = {
  DONATION_CATEGORIES,
  GENERAL_CATEGORIES,
  BUILDING_CATEGORIES,
  VALID_PAYMENT_TYPES,
  VALID_MODES,
  normalizePhone,
  normalizeCategory,
  sanitizeText,
  isValidKenyanPhone,
  validateStkPushBody,
  resolvePaymentChannel,
};
