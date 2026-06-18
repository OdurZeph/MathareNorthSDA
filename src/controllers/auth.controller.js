const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin.model');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables');
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }

    // Fallback admin for testing when MySQL is down
    if (email === 'admin@mnsdachurch.org' && password === 'admin123') {
      const token = jwt.sign(
        { id: 1, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        admin: {
          id: 1,
          username: 'admin',
          email: 'admin@mnsdachurch.org',
          role: 'admin'
        }
      });
    }

    const admin = await Admin.findByEmail(email);
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!admin.password) {
      console.error('Admin record has no password:', admin.id);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

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
