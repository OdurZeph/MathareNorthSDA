MPESA_CONSUMER_KEY=DG5YJFymIolkVndMEG7snn9VIxarrxoEdgAZ605LIc3jAuKv
MPESA_CONSUMER_SECRET=oETbqUU54UEPVus7l9JpA0eiS1c9CvvV9P68EKmhmcwAHkZV3mDTsPj02wXAmcTA
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_daraja_passkey
MPESA_CALLBACK_URL=https://your-domain.com/api/mpesa/callback  # use ngrok for local testingconst bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin.model');

const login = async (req, res) => {
  try {
    // Validate request body
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Check JWT secret is configured
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables');
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }

    // Find admin by email
    const admin = await Admin.findByEmail(email);
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Validate password exists before comparing
    if (!admin.password) {
      console.error('Admin record has no password:', admin.id);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Compare password safely
    let isMatch;
    try {
      isMatch = await bcrypt.compare(password, admin.password);
    } catch (bcryptError) {
      console.error('Bcrypt comparison error:', bcryptError);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: admin.id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const logout = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const me = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      admin: req.admin
    });
  } catch (error) {
    console.error('Me error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  login,
  logout,
  me
};
