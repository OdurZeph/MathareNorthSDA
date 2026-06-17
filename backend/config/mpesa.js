/**
 * Safaricom Daraja API configuration.
 * Set MPESA_ENV=sandbox for testing, MPESA_ENV=production for live payments.
 */

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
  passkey: process.env.MPESA_PASSKEY || process.env.PASSKEY || '',
  shortcode:
    process.env.MPESA_SHORTCODE ||
    process.env.PAYBILL_SHORTCODE ||
    process.env.TILL_SHORTCODE ||
    '',
  tillShortcode: process.env.TILL_SHORTCODE || '',
  paybillShortcode: process.env.PAYBILL_SHORTCODE || process.env.MPESA_SHORTCODE || '',
  callbackUrl: process.env.MPESA_CALLBACK_URL || process.env.CALLBACK_URL || '',
  oauthUrl: `${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
  stkPushUrl: `${BASE_URL}/mpesa/stkpush/v1/processrequest`,
  stkQueryUrl: `${BASE_URL}/mpesa/stkpushquery/v1/query`,
};

/** In-memory OAuth token cache */
let tokenCache = {
  accessToken: null,
  expiresAt: 0,
};

function setTokenCache(accessToken, expiresInSeconds) {
  const bufferMs = 60_000;
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

function validateMpesaConfig() {
  const missing = [];
  if (!config.consumerKey) missing.push('MPESA_CONSUMER_KEY');
  if (!config.consumerSecret) missing.push('MPESA_CONSUMER_SECRET');
  if (!config.passkey) missing.push('MPESA_PASSKEY');
  if (!config.shortcode) missing.push('MPESA_SHORTCODE');
  if (!config.callbackUrl) missing.push('MPESA_CALLBACK_URL');
  return missing;
}

module.exports = {
  config,
  setTokenCache,
  getCachedToken,
  clearTokenCache,
  validateMpesaConfig,
};
