const { v4: uuidv4 } = require('uuid');
const membershipModel = require('../models/membership.model');
const { sendChurchEmail } = require('../services/mail.service');
const { logFormSubmission } = require('../utils/formLogger');

async function createTransferRequest(req, res) {
  const reference_number = `TR-${uuidv4().substring(0, 7).toUpperCase()}`;

  const data = {
    full_name: (req.body.full_name || '').trim(),
    phone: (req.body.phone || '').trim(),
    email: (req.body.email || '').trim(),
    current_church: (req.body.current_church || '').trim(),
    conference_region: (req.body.conference_region || '').trim(),
    baptism_date: (req.body.baptism_date || '').trim(),
    membership_number: (req.body.membership_number || '').trim(),
    reason_for_transfer: (req.body.reason_for_transfer || '').trim(),
    additional_notes: (req.body.additional_notes || '').trim(),
    reference_number,
  };

  if (!data.full_name || !data.email || !data.phone) {
    return res.status(400).json({
      success: false,
      message: 'Full name, email, and phone number are required.',
    });
  }

  logFormSubmission('membership-transfer', {
    full_name: data.full_name,
    email: data.email,
    phone: data.phone,
    reference_number,
  });

  let dbId = null;
  try {
    const result = await membershipModel.createTransferRequest(data);
    dbId = result.id;
  } catch (dbErr) {
    console.error('[form:membership-transfer] DB unavailable:', dbErr.message);
  }

  try {
    await sendChurchEmail({
      formType: 'membership-transfer',
      subject: `New Membership Transfer Request (${reference_number})`,
      html: `<h2>Membership Transfer Request</h2>
       <p><strong>Reference:</strong> ${reference_number}</p>
       <p><strong>Full Name:</strong> ${data.full_name}</p>
       <p><strong>Email:</strong> ${data.email}</p>
       <p><strong>Phone:</strong> ${data.phone}</p>
       <p><strong>Current Church:</strong> ${data.current_church || 'Not provided'}</p>
       <p><strong>Conference/Region:</strong> ${data.conference_region || 'Not provided'}</p>
       <p><strong>Baptism Date:</strong> ${data.baptism_date || 'Not provided'}</p>
       <p><strong>Membership Number:</strong> ${data.membership_number || 'Not provided'}</p>
       <p><strong>Reason for Transfer:</strong> ${data.reason_for_transfer || 'Not provided'}</p>
       <p><strong>Additional Notes:</strong> ${data.additional_notes || 'Not provided'}</p>
       <hr><p>Submitted: ${new Date().toISOString()}</p>`,
    });
  } catch (emailErr) {
    console.error('[form:membership-transfer] email failed:', emailErr.message);
  }

  return res.status(200).json({
    success: true,
    message: 'Transfer request submitted successfully.',
    reference_number,
    ...(dbId !== null && { id: dbId }),
  });
}

async function createVisitationRequest(req, res) {
  const reference_number = `VR-${uuidv4().substring(0, 7).toUpperCase()}`;

  const data = {
    full_name: (req.body.full_name || '').trim(),
    phone: (req.body.phone || '').trim(),
    email: (req.body.email || '').trim(),
    physical_address: (req.body.physical_address || '').trim(),
    type_of_visit: (req.body.type_of_visit || '').trim(),
    preferred_date: (req.body.preferred_date || '').trim(),
    preferred_time: (req.body.preferred_time || '').trim(),
    prayer_request_message: (req.body.prayer_request_message || '').trim(),
    reference_number,
  };

  if (!data.full_name || !data.phone) {
    return res.status(400).json({
      success: false,
      message: 'Full name and phone number are required.',
    });
  }

  logFormSubmission('visitation', {
    full_name: data.full_name,
    phone: data.phone,
    reference_number,
  });

  let dbId = null;
  try {
    const result = await membershipModel.createVisitationRequest(data);
    dbId = result.id;
  } catch (dbErr) {
    console.error('[form:visitation] DB unavailable:', dbErr.message);
  }

  try {
    await sendChurchEmail({
      formType: 'visitation',
      subject: `New Pastoral Visitation Request (${reference_number})`,
      html: `<h2>Pastoral Visitation Request</h2>
       <p><strong>Reference:</strong> ${reference_number}</p>
       <p><strong>Full Name:</strong> ${data.full_name}</p>
       <p><strong>Phone:</strong> ${data.phone}</p>
       <p><strong>Email:</strong> ${data.email || 'Not provided'}</p>
       <p><strong>Physical Address:</strong> ${data.physical_address || 'Not provided'}</p>
       <p><strong>Type of Visit:</strong> ${data.type_of_visit || 'Not provided'}</p>
       <p><strong>Preferred Date:</strong> ${data.preferred_date || 'Not provided'}</p>
       <p><strong>Preferred Time:</strong> ${data.preferred_time || 'Not provided'}</p>
       <p><strong>Prayer Request / Message:</strong> ${data.prayer_request_message || 'Not provided'}</p>
       <hr><p>Submitted: ${new Date().toISOString()}</p>`,
    });
  } catch (emailErr) {
    console.error('[form:visitation] email failed:', emailErr.message);
  }

  return res.status(200).json({
    success: true,
    message: 'Visitation request submitted successfully.',
    reference_number,
    ...(dbId !== null && { id: dbId }),
  });
}

module.exports = { createTransferRequest, createVisitationRequest };
