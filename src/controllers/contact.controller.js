const { v4: uuidv4 } = require('uuid');
const contactModel = require('../models/contact.model');
const { sendChurchEmail } = require('../services/mail.service');
const { logFormSubmission } = require('../utils/formLogger');

async function createContact(req, res) {
  const reference_number = `CT-${uuidv4().substring(0, 7).toUpperCase()}`;
  const contactData = {
    name: req.body.name.trim(),
    email: req.body.email.trim(),
    message: req.body.message.trim(),
    reference_number,
  };

  logFormSubmission('contact', {
    name: contactData.name,
    email: contactData.email,
    reference_number,
  });

  let dbId = null;
  try {
    const result = await contactModel.createContact(contactData);
    dbId = result.insertId;
  } catch (dbErr) {
    console.error('[form:contact] DB unavailable:', dbErr.message);
  }

  try {
    await sendChurchEmail({
      formType: 'contact',
      subject: `New Contact Message (${reference_number})`,
      html: `<h2>New Contact Message</h2>
       <p><strong>Reference:</strong> ${reference_number}</p>
       <p><strong>Name:</strong> ${contactData.name}</p>
       <p><strong>Email:</strong> ${contactData.email}</p>
       <p><strong>Message:</strong></p><p>${contactData.message}</p>
       <hr><p>Submitted: ${new Date().toISOString()}</p>`,
    });
  } catch (emailErr) {
    console.error('[form:contact] email failed:', emailErr.message);
  }

  return res.status(200).json({
    success: true,
    message: 'Contact form submitted successfully',
    reference_number,
    ...(dbId !== null && { id: dbId }),
  });
}

module.exports = { createContact };
