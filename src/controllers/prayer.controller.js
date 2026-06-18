const { v4: uuidv4 } = require('uuid');
const prayerModel = require('../models/prayer.model');
const { sendChurchEmail } = require('../services/mail.service');
const { logFormSubmission } = require('../utils/formLogger');

async function createPrayerRequest(req, res) {
  const reference_number = `PR-${uuidv4().substring(0, 7).toUpperCase()}`;
  const prayerData = {
    name: req.body.name.trim(),
    email: req.body.email.trim(),
    message: req.body.message.trim(),
    reference_number,
  };

  logFormSubmission('prayer', {
    name: prayerData.name,
    email: prayerData.email,
    reference_number,
  });

  let dbId = null;
  try {
    const result = await prayerModel.createPrayerRequest(prayerData);
    dbId = result.id;
  } catch (dbErr) {
    console.error('[form:prayer] DB unavailable:', dbErr.message);
  }

  try {
    await sendChurchEmail({
      formType: 'prayer',
      subject: `New Prayer Request (${reference_number})`,
      html: `<h2>New Prayer Request</h2>
        <p><strong>Reference:</strong> ${reference_number}</p>
        <p><strong>Name:</strong> ${prayerData.name}</p>
        <p><strong>Email:</strong> ${prayerData.email}</p>
        <p><strong>Prayer Request:</strong></p>
        <p>${prayerData.message}</p>
        <hr>
        <p>Submitted: ${new Date().toISOString()}</p>`,
    });
  } catch (emailErr) {
    console.error('[form:prayer] email failed:', emailErr.message);
  }

  return res.status(200).json({
    success: true,
    message: 'Prayer request submitted successfully',
    reference_number,
    ...(dbId !== null && { id: dbId }),
  });
}

module.exports = { createPrayerRequest };
