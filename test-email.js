require('dotenv').config();
const { sendChurchEmail } = require('./src/services/mail.service');

async function testEmail() {
  try {
    console.log('Testing email service...');
    const result = await sendChurchEmail({
      formType: 'test',
      subject: 'Test Email from Church Website',
      html: '<h2>Test Email</h2><p>This is a test email to verify the email service is working correctly.</p><p>Timestamp: ' + new Date().toISOString() + '</p>'
    });
    console.log('Email sent successfully!');
    console.log('Message ID:', result.messageId);
  } catch (error) {
    console.error('Failed to send email:');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error stack:', error.stack);
  }
}

testEmail();