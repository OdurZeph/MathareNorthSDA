const nodemailer = require('nodemailer');

const DEFAULT_RECEIVER = 'zephoduor14@gmail.com';

let transporter = null;

function getMailConfig() {
  return {
    user: (process.env.EMAIL_USER || process.env.SMTP_USER || '').trim(),
    pass: (process.env.EMAIL_PASS || process.env.SMTP_PASS || '').trim(),
    host: (process.env.SMTP_HOST || 'smtp.gmail.com').trim(),
    port: parseInt(process.env.SMTP_PORT || '465', 10),
    secure: process.env.SMTP_SECURE !== 'false',
    to: (
      process.env.EMAIL_TO ||
      process.env.ADMIN_EMAIL ||
      process.env.PRAYER_RECEIVER_EMAIL ||
      DEFAULT_RECEIVER
    ).trim(),
  };
}

function getTransporter() {
  if (transporter) return transporter;

  const cfg = getMailConfig();
  transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: { user: cfg.user, pass: cfg.pass },
  });

  return transporter;
}

function isMailConfigured() {
  const cfg = getMailConfig();
  return Boolean(cfg.user && cfg.pass && cfg.to);
}

/**
 * Log mail config status on server start (never logs credentials).
 */
function logMailStatus() {
  const cfg = getMailConfig();
  const configured = Boolean(cfg.user && cfg.pass);

  if (!configured) {
    console.warn('   Email NOT configured — set EMAIL_USER and EMAIL_PASS in .env');
    console.warn(`    Notifications will be sent to: ${cfg.to} once configured.\n`);
    return;
  }

  console.log(`  Email configured → ${cfg.to} (via ${cfg.host}:${cfg.port})\n`);
}

/**
 * Send a notification email to church administration.
 */
async function sendChurchEmail({ subject, html, formType = 'form' }) {
  const cfg = getMailConfig();

  if (!cfg.user || !cfg.pass) {
    const err = new Error(
      'Email service is not configured. Set EMAIL_USER and EMAIL_PASS in your .env file.'
    );
    err.code = 'EMAIL_CONFIG';
    throw err;
  }

  if (!cfg.to) {
    const err = new Error('Email recipient is not configured.');
    err.code = 'EMAIL_CONFIG';
    throw err;
  }

  console.log(`[mail:${formType}] sending → ${cfg.to} | subject: ${subject}`);

  try {
    const info = await getTransporter().sendMail({
      from: `"Mathare North SDA Church" <${cfg.user}>`,
      to: cfg.to,
      replyTo: cfg.user,
      subject,
      html,
    });

    console.log(`[mail:${formType}] success | messageId=${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`[mail:${formType}] failed | ${err.message}`);
    const mailErr = new Error(`Failed to send email: ${err.message}`);
    mailErr.code = 'EMAIL_SEND';
    throw mailErr;
  }
}

module.exports = {
  getMailConfig,
  isMailConfigured,
  logMailStatus,
  sendChurchEmail,
};
