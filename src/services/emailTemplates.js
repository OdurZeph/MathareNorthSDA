const path = require('path');

const CHURCH_LOGO_URL = 'https://example.com/logo.png'; // Replace with actual logo URL
const CHURCH_NAME = 'Mathare North SDA Church';
const CHURCH_WEBSITE = 'https://matharenorthsda.org';

const generateUnsubscribeLink = (email) => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  const token = Buffer.from(email).toString('base64');
  return `${baseUrl}/unsubscribe?token=${encodeURIComponent(token)}`;
};

const baseTemplate = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${CHURCH_NAME}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: #0a2351; padding: 30px; text-align: center; }
    .header img { max-height: 80px; }
    .content { padding: 30px; color: #333; line-height: 1.6; }
    .footer { background: #f0f0f0; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    .button { display: inline-block; padding: 12px 30px; background: #D4AF37; color: black; text-decoration: none; border-radius: 4px; font-weight: bold; }
    .social-links { margin-top: 20px; }
    .social-links a { color: #D4AF37; margin: 0 10px; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="color: white; margin: 0;">${CHURCH_NAME}</h2>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>${CHURCH_NAME} | Mathare North, Nairobi</p>
      <p>Email: info@matharenorthsda.org | Phone: +254 7XX XXX XXX</p>
      <div class="social-links">
        <a href="${CHURCH_WEBSITE}">Website</a>
      </div>
      <p style="margin-top: 20px;">
        If you no longer wish to receive these emails, 
        <a href="${generateUnsubscribeLink('{{email}}')}" style="color: #D4AF37;">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>
`;

const welcomeTemplate = (email) => baseTemplate(`
  <h2 style="color: #0a2351;">Welcome to ${CHURCH_NAME}!</h2>
  <p>Thank you for subscribing to our newsletter.</p>
  <p>We're excited to have you as part of our community.</p>
  <p>Here's what you can expect:</p>
  <ul>
    <li>Weekly church announcements</li>
    <li>Special event invitations</li>
    <li>Prayer requests updates</li>
    <li>Ministry highlights</li>
  </ul>
  <p>If you have any questions, feel free to reach out to us at any time.</p>
  <p>Blessings,<br>The ${CHURCH_NAME} Team</p>
`.replace('{{email}}', email));

const confirmationTemplate = (email, verificationUrl) => baseTemplate(`
  <h2 style="color: #0a2351;">Confirm Your Subscription</h2>
  <p>Thank you for signing up for our newsletter!</p>
  <p>Please click the button below to confirm your subscription:</p>
  <p style="text-align: center; margin: 30px 0;">
    <a href="${verificationUrl}" class="button">Confirm Subscription</a>
  </p>
  <p style="font-size: 12px; color: #999;">This link will expire in 24 hours.</p>
  <p>If you did not sign up for this newsletter, you can ignore this email.</p>
`.replace('{{email}}', email));

const newsletterTemplate = (email, subject, content) => baseTemplate(`
  <h2 style="color: #0a2351;">${subject}</h2>
  <div>${content}</div>
`.replace('{{email}}', email));

const eventTemplate = (email, eventDetails) => baseTemplate(`
  <h2 style="color: #0a2351;">You're Invited!</h2>
  <div>${eventDetails}</div>
`.replace('{{email}}', email));

const prayerUpdateTemplate = (email, update) => baseTemplate(`
  <h2 style="color: #0a2351;">Prayer Update</h2>
  <div>${update}</div>
`.replace('{{email}}', email));

module.exports = {
  welcomeTemplate,
  confirmationTemplate,
  newsletterTemplate,
  eventTemplate,
  prayerUpdateTemplate,
  generateUnsubscribeLink
};
