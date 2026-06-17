const axios = require('axios');
const {
  config,
  setTokenCache,
  getCachedToken,
  clearTokenCache,
  validateMpesaConfig,
} = require('../config/mpesa');

/**
 * Daraja timestamp: YYYYMMDDHHmmss (Kenya local time approximation via UTC offset +3 optional;
 * Safaricom accepts server-generated format from current time).
 */
function getTimestamp() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return (
    now.getFullYear().toString() +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds())
  );
}

function generatePassword(shortcode, passkey, timestamp) {
  const raw = `${shortcode}${passkey}${timestamp}`;
  return Buffer.from(raw).toString('base64');
}

/**
 * Fetch OAuth access token; uses cache until near expiry.
 */
async function getAccessToken() {
  const cached = getCachedToken();
  if (cached) return cached;

  const missing = validateMpesaConfig();
  if (missing.length) {
    const err = new Error(`M-Pesa configuration incomplete: ${missing.join(', ')}`);
    err.code = 'MPESA_CONFIG';
    throw err;
  }

  const credentials = Buffer.from(
    `${config.consumerKey}:${config.consumerSecret}`
  ).toString('base64');

  try {
    const { data } = await axios.get(config.oauthUrl, {
      headers: { Authorization: `Basic ${credentials}` },
      timeout: 15000,
    });

    if (!data.access_token) {
      clearTokenCache();
      const err = new Error('OAuth response missing access_token');
      err.code = 'MPESA_TOKEN';
      throw err;
    }

    const expiresIn = parseInt(data.expires_in, 10) || 3599;
    setTokenCache(data.access_token, expiresIn);
    return data.access_token;
  } catch (error) {
    clearTokenCache();
    if (error.response) {
      const err = new Error(
        error.response.data?.errorMessage ||
          error.response.data?.error ||
          'Failed to obtain M-Pesa access token'
      );
      err.code = 'MPESA_TOKEN';
      err.status = error.response.status;
      throw err;
    }
    if (error.code === 'ECONNABORTED') {
      const err = new Error('M-Pesa OAuth request timed out');
      err.code = 'MPESA_TIMEOUT';
      throw err;
    }
    throw error;
  }
}

/**
 * Initiate STK Push (Lipa na M-Pesa Online).
 */
async function initiateStkPush({
  phone,
  amount,
  shortcode,
  transactionType,
  paymentType,
  accountReference,
}) {
  if (!shortcode) {
    const err = new Error('M-Pesa shortcode is not configured for this payment channel');
    err.code = 'MPESA_SHORTCODE';
    throw err;
  }

  const token = await getAccessToken();
  const timestamp = getTimestamp();
  const password = generatePassword(shortcode, config.passkey, timestamp);

  const payload = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: transactionType,
    Amount: amount,
    PartyA: phone,
    PartyB: shortcode,
    PhoneNumber: phone,
    CallBackURL: config.callbackUrl,
    AccountReference: accountReference || paymentType,
    TransactionDesc: `Church ${paymentType}`,
  };

  try {
    const { data } = await axios.post(config.stkPushUrl, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    if (data.ResponseCode && data.ResponseCode !== '0') {
      const err = new Error(data.ResponseDescription || 'STK Push rejected by M-Pesa');
      err.code = 'MPESA_STK_REJECTED';
      err.mpesaResponse = data;
      throw err;
    }

    return data;
  } catch (error) {
    if (error.code === 'MPESA_STK_REJECTED') throw error;

    if (error.response?.status === 401) {
      clearTokenCache();
      const err = new Error('M-Pesa access token invalid or expired');
      err.code = 'MPESA_TOKEN';
      throw err;
    }

    if (error.response) {
      const body = error.response.data;
      const err = new Error(
        body?.errorMessage ||
          body?.error ||
          body?.ResponseDescription ||
          'STK Push request failed'
      );
      err.code = 'MPESA_STK_FAILED';
      err.status = error.response.status;
      err.mpesaResponse = body;
      throw err;
    }

    if (error.code === 'ECONNABORTED') {
      const err = new Error('STK Push request timed out');
      err.code = 'MPESA_TIMEOUT';
      throw err;
    }

    throw error;
  }
}

async function queryStkPushStatus({ checkoutRequestID, shortcode = config.shortcode }) {
  if (!checkoutRequestID) {
    const err = new Error('checkoutRequestID is required');
    err.code = 'VALIDATION';
    throw err;
  }

  if (!shortcode) {
    const err = new Error('M-Pesa shortcode is not configured');
    err.code = 'MPESA_SHORTCODE';
    throw err;
  }

  const token = await getAccessToken();
  const timestamp = getTimestamp();
  const password = generatePassword(shortcode, config.passkey, timestamp);

  try {
    const { data } = await axios.post(
      config.stkQueryUrl,
      {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestID,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    return data;
  } catch (error) {
    if (error.response?.status === 401) {
      clearTokenCache();
      const err = new Error('M-Pesa access token invalid or expired');
      err.code = 'MPESA_TOKEN';
      throw err;
    }

    if (error.response) {
      const body = error.response.data;
      const err = new Error(
        body?.errorMessage ||
          body?.error ||
          body?.ResponseDescription ||
          'STK Push status query failed'
      );
      err.code = 'MPESA_STK_FAILED';
      err.status = error.response.status;
      err.mpesaResponse = body;
      throw err;
    }

    if (error.code === 'ECONNABORTED') {
      const err = new Error('STK Push status query timed out');
      err.code = 'MPESA_TIMEOUT';
      throw err;
    }

    throw error;
  }
}

module.exports = {
  getTimestamp,
  generatePassword,
  getAccessToken,
  initiateStkPush,
  queryStkPushStatus,
};
