/**
 * Cloudflare Turnstile server-side verification (optional).
 * The frontend does not yet embed a Turnstile widget, so verification
 * only runs when cf_turnstile_response is present in the request body.
 */

const https = require('https');
const querystring = require('querystring');

async function verifyTurnstile(token, remoteip) {
  return new Promise((resolve, reject) => {
    const secret = process.env.TURNSTILE_SECRET_KEY;

    if (!secret) {
      return resolve({ success: true });
    }

    const postData = querystring.stringify({
      secret,
      response: token,
      ...(remoteip && { remoteip }),
    });

    const options = {
      hostname: 'challenges.cloudflare.com',
      port: 443,
      path: '/turnstile/v0/siteverify',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          reject(new Error('Invalid Turnstile response'));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function validateTurnstile(req, res, next) {
  if (process.env.NODE_ENV === 'test') return next();

  const token = req.body?.cf_turnstile_response;

  // No widget on forms yet — do not block submissions without a token
  if (!token) {
    return next();
  }

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.warn('[turnstile] Token received but TURNSTILE_SECRET_KEY is not set — skipping');
    return next();
  }

  try {
    const ip = req.headers['cf-connecting-ip'] || req.socket?.remoteAddress;
    const result = await verifyTurnstile(token, ip);

    if (!result.success) {
      console.warn('[turnstile] verification failed:', result['error-codes']);
      return res.status(400).json({
        success: false,
        message: 'Security check failed. Please refresh the page and try again.',
      });
    }

    next();
  } catch (err) {
    console.error('[turnstile] verification error:', err.message);
    next();
  }
}

module.exports = validateTurnstile;
