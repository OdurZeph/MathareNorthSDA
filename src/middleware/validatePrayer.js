function validatePrayer(req, res, next) {
  const { name, email, message, urgency } = req.body;

  req.body.name = name ? String(name).trim() : '';
  req.body.message = message ? String(message).trim() : '';
  req.body.urgency = urgency ? String(urgency).trim() : '';

  // Contact field is optional on the form (email or phone); default when empty
  const contact = email ? String(email).trim() : '';
  req.body.email = contact || 'not-provided@mnchurch.org';

  if (!req.body.name) {
    return res.status(400).json({
      success: false,
      message: 'Name is required',
    });
  }

  if (!req.body.message) {
    return res.status(400).json({
      success: false,
      message: 'Prayer request details are required',
    });
  }

  next();
}

module.exports = validatePrayer;
