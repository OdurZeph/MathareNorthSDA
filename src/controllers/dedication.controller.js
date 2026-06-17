const { v4: uuidv4 } = require('uuid');
const { sendChurchEmail } = require('../services/mail.service');
const { logFormSubmission } = require('../utils/formLogger');

async function createDedicationRequest(req, res) {
  const reference_number = `CD-${uuidv4().substring(0, 7).toUpperCase()}`;

  const data = {
    parent_guardian_name: (req.body.parent_guardian_name || '').trim(),
    phone: (req.body.phone || '').trim(),
    email: (req.body.email || '').trim(),
    child_full_name: (req.body.child_full_name || '').trim(),
    child_date_of_birth: (req.body.child_date_of_birth || '').trim(),
    gender: (req.body.gender || '').trim(),
    preferred_dedication_date: (req.body.preferred_dedication_date || '').trim(),
    additional_info: (req.body.additional_info || '').trim(),
    reference_number,
  };

  if (!data.parent_guardian_name || !data.child_full_name || !data.phone) {
    return res.status(400).json({
      success: false,
      message: "Parent/guardian name, child's full name, and phone number are required.",
    });
  }

  logFormSubmission('child-dedication', {
    parent_guardian_name: data.parent_guardian_name,
    child_full_name: data.child_full_name,
    phone: data.phone,
    reference_number,
  });

  try {
    await sendChurchEmail({
      formType: 'child-dedication',
      subject: `New Child Dedication Request (${reference_number})`,
      html: `<h2>Child Dedication Request</h2>
        <p><strong>Reference:</strong> ${reference_number}</p>
        <h3>Parent / Guardian</h3>
        <p><strong>Name:</strong> ${data.parent_guardian_name}</p>
        <p><strong>Phone:</strong> ${data.phone || 'Not provided'}</p>
        <p><strong>Email:</strong> ${data.email || 'Not provided'}</p>
        <h3>Child</h3>
        <p><strong>Full Name:</strong> ${data.child_full_name}</p>
        <p><strong>Date of Birth:</strong> ${data.child_date_of_birth || 'Not provided'}</p>
        <p><strong>Gender:</strong> ${data.gender || 'Not provided'}</p>
        <h3>Request Details</h3>
        <p><strong>Preferred Dedication Date:</strong> ${data.preferred_dedication_date || 'Not provided'}</p>
        <p><strong>Additional Information:</strong> ${data.additional_info || 'Not provided'}</p>
        <hr><p>Submitted: ${new Date().toISOString()}</p>`,
    });
  } catch (emailErr) {
    const status = emailErr.code === 'EMAIL_CONFIG' ? 503 : 500;
    return res.status(status).json({
      success: false,
      message: emailErr.message || 'Failed to send dedication request notification email.',
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Child dedication request submitted successfully.',
    reference_number,
  });
}

module.exports = { createDedicationRequest };
