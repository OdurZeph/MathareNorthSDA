const { v4: uuidv4 } = require('uuid');
const prayerModel = require('../models/prayer.model');
const nodemailer = require('nodemailer');

async function createPrayerRequest(req, res) {
  try {
    // Generate reference number: PR- followed by 7 characters from uuid
    const uuid = uuidv4();
    const reference_number = 'PR-' + uuid.substring(0, 7).toUpperCase();

    const prayerData = {
      name: req.body.name.trim(),
      email: req.body.email.trim(),
      message: req.body.message.trim(),
      reference_number
    };

    const result = await prayerModel.createPrayerRequest(prayerData);

    // Send email notification
    try {
      const emailUser = process.env.EMAIL_USER?.trim();
      const emailPass = process.env.EMAIL_PASS?.trim();
      const prayerReceiver = process.env.PRAYER_RECEIVER_EMAIL?.trim();

      // Only send email if all required credentials are present
      if (emailUser && emailPass && prayerReceiver) {
        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: {
            user: emailUser,
            pass: emailPass,
          }
        });

        await transporter.sendMail({
          from: emailUser,
          to: prayerReceiver,
          subject: `New Prayer Request (${reference_number})`,
          html: `
            <h2>New Prayer Request</h2>
            <p><strong>Reference:</strong> ${reference_number}</p>
            <p><strong>Name:</strong> ${prayerData.name}</p>
            <p><strong>Email:</strong> ${prayerData.email}</p>
            <p><strong>Prayer Request:</strong></p>
            <p>${prayerData.message}</p>
            <hr>
            <p>Submitted: ${new Date().toISOString()}</p>
          `,
        });
      } else {
        console.warn('Email configuration missing. Skipping email notification.');
      }
    } catch (emailError) {
      console.error('Error sending prayer notification email:', emailError);
      // We don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Prayer request submitted successfully',
      reference_number: result.reference_number,
      id: result.id
    });
  } catch (error) {
    console.error('Error creating prayer request:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

module.exports = { createPrayerRequest };