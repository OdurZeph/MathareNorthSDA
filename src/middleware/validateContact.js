function validateContact(req, res, next) {
  const { name, email, message } = req.body;

  // Check if all required fields are present and non-empty
  if (!name || !name.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Name is required'
    });
  }

  if (!email || !email.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Email is required'
    });
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address'
    });
  }

  if (!message || !message.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Message is required'
    });
  }

  // If all validations pass, attach trimmed values to request body for consistency
  req.body.name = name.trim();
  req.body.email = email.trim();
  req.body.message = message.trim();

  next();
}

module.exports = validateContact;