const axios = require('axios');

const MPESA_ENV = (process.env.MPESA_ENV || 'sandbox').toLowerCase();

const BASE_URL =
  MPESA_ENV === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';

const config = {
  env: MPESA_ENV,
  baseUrl: BASE_URL,
  consumerKey: process.env.MPESA_CONSUMER_KEY || process.env.CONSUMER_KEY || '',
  consumerSecret: process.env.MPESA_CONSUMER_SECRET || process.env.CONSUMER_SECRET || '',
  paybill: process.env.MPESA_PAYBILL || process.env.PAYBILL_SHORTCODE || '',
  paybillAccount: process.env.MPESA_PAYBILL_ACCOUNT || '',
  paybillPasskey: process.env.MPESA_PAYBILL_PASSKEY || process.env.PASSKEY || '',
  // Support both MPESA_TILL_NUMBER (new) and MPESA_TILL (legacy)
  till: process.env.MPESA_TILL_NUMBER || process.env.MPESA_TILL || process.env.TILL_SHORTCODE || '',
  callbackUrl: process.env.MPESA_CALLBACK_URL || process.env.CALLBACK_URL || '',
  oauthUrl: `${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
  stkPushUrl: `${BASE_URL}/mpesa/stkpush/v1/processrequest`,
  stkQueryUrl: `${BASE_URL}/mpesa/stkpushquery/v1/query`,
};

let tokenCache = {
  accessToken: null,
  expiresAt: 0,
};

function setTokenCache(accessToken, expiresInSeconds) {
  const bufferMs = 60000;
  tokenCache = {
    accessToken,
    expiresAt: Date.now() + expiresInSeconds * 1000 - bufferMs,
  };
}

function getCachedToken() {
  if (tokenCache.accessToken && Date.now() < tokenCache.expiresAt) {
    return tokenCache.accessToken;
  }
  return null;
}

function clearTokenCache() {
  tokenCache = { accessToken: null, expiresAt: 0 };
}

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

function validateMpesaConfig({ useTill = false } = {}) {
  const missing = [];
  if (!config.consumerKey) missing.push('MPESA_CONSUMER_KEY');
  if (!config.consumerSecret) missing.push('MPESA_CONSUMER_SECRET');
  if (!config.callbackUrl) missing.push('MPESA_CALLBACK_URL');
  
  if (useTill) {
    if (!config.till) missing.push('MPESA_TILL');
  } else {
    if (!config.paybill) missing.push('MPESA_PAYBILL');
    if (!config.paybillPasskey) missing.push('MPESA_PAYBILL_PASSKEY');
  }
  
  return missing;
}

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

async function initiateStkPush({ phone, amount, reference, useTill = false, category }) {
  const shortcode = useTill ? config.till : config.paybill;
  const passkey = useTill ? '' : config.paybillPasskey;
  const transactionType = useTill ? 'CustomerBuyGoodsOnline' : 'CustomerPayBillOnline';

  if (!shortcode) {
    const key = useTill ? 'MPESA_TILL' : 'MPESA_PAYBILL';
    const err = new Error(`${key} is not configured`);
    err.code = 'MPESA_SHORTCODE';
    throw err;
  }

  if (!useTill && !passkey) {
    const err = new Error('MPESA_PAYBILL_PASSKEY is not configured');
    err.code = 'MPESA_CONFIG';
    throw err;
  }

  const token = await getAccessToken();
  const timestamp = getTimestamp();
  const password = useTill ? '' : generatePassword(shortcode, passkey, timestamp);

  const payload = useTill
    ? {
        // Till (Buy Goods): no Password field
        BusinessShortCode: shortcode,
        Timestamp: timestamp,
        TransactionType: transactionType,
        Amount: amount,
        PartyA: phone,
        PartyB: shortcode,
        PhoneNumber: phone,
        CallBackURL: config.callbackUrl,
        AccountReference: reference,
        TransactionDesc: `Church Donation - ${category}`,
      }
    : {
        // Paybill: Password required; AccountReference = paybill account number
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: transactionType,
        Amount: amount,
        PartyA: phone,
        PartyB: shortcode,
        PhoneNumber: phone,
        CallBackURL: config.callbackUrl,
        AccountReference: config.paybillAccount || reference,
        TransactionDesc: `Church Donation - ${category}`,
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

module.exports = {
  config,
  setTokenCache,
  getCachedToken,
  clearTokenCache,
  getTimestamp,
  generatePassword,
  validateMpesaConfig,
  getAccessToken,
  initiateStkPush,
};
