const nodemailer = require('nodemailer');
const EmailLog = require('../models/emailLog.model');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 465,
    secure: process.env.EMAIL_PORT === '465',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

const sendEmail = async ({ to, subject, html, category = 'general' }) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    html
  };

  let logId;
  try {
    logId = await EmailLog.create({
      subject,
      toEmail: to,
      category,
      status: 'pending'
    });

    const info = await transporter.sendMail(mailOptions);
    await EmailLog.updateStatus(logId, 'sent');

    console.log(`Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
    if (logId) {
      await EmailLog.updateStatus(logId, 'failed', error.message);
    }
    return { success: false, error: error.message };
  }
};

const sendBulkEmail = async ({ recipients, subject, html, category }) => {
  const results = [];
  for (const to of recipients) {
    const result = await sendEmail({
      to,
      subject,
      html: html.replace('{{email}}', to),
      category
    });
    results.push({ email: to, ...result });
  }
  return results;
};

module.exports = {
  sendEmail,
  sendBulkEmail
};
