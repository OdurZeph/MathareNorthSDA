const crypto = require('crypto');
const Subscriber = require('../models/subscriber.model');
const emailService = require('../services/emailService');
const emailTemplates = require('../services/emailTemplates');

const SUBSCRIPTION_CATEGORIES = [
  'Church Announcements',
  'Sabbath Programs',
  'Prayer Updates',
  'Evangelism and Missions',
  'Youth Ministry',
  'Building Project Updates',
  'Events and Seminars'
];

const subscribe = async (req, res) => {
  try {
    const { email, categories } = req.body;

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    // Validate categories
    const validCategories = SUBSCRIPTION_CATEGORIES.filter(cat => categories?.includes(cat));
    if (validCategories.length === 0) {
      validCategories.push('Church Announcements');
    }

    // Check if already subscribed
    const existingSubscriber = await Subscriber.findByEmail(email);
    if (existingSubscriber) {
      if (existingSubscriber.status === 'active') {
        return res.status(400).json({
          success: false,
          message: 'You are already subscribed to our newsletter'
        });
      } else if (existingSubscriber.status === 'pending') {
        // Resend confirmation email
        const verificationUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/verify-subscription?token=${encodeURIComponent(existingSubscriber.verification_token)}`;
        const html = emailTemplates.confirmationTemplate(email, verificationUrl);
        
        await emailService.sendEmail({
          to: email,
          subject: 'Confirm Your Subscription',
          html,
          category: 'System'
        });

        return res.status(200).json({
          success: true,
          message: 'Confirmation email resent. Please check your inbox'
        });
      } else if (existingSubscriber.status === 'unsubscribed') {
        // Reactivate
        const verificationToken = crypto.randomBytes(32).toString('hex');
        await Subscriber.updateVerification(existingSubscriber.id, 'pending');
        await Subscriber.updateStatus(existingSubscriber.id, 'pending');
        
        // Update categories
        const verificationUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/verify-subscription?token=${encodeURIComponent(verificationToken)}`;
        const html = emailTemplates.confirmationTemplate(email, verificationUrl);
        
        await emailService.sendEmail({
          to: email,
          subject: 'Confirm Your Subscription',
          html,
          category: 'System'
        });

        return res.status(200).json({
          success: true,
          message: 'Please check your email to confirm your subscription'
        });
      }
    }

    // Create new subscriber
    const verificationToken = crypto.randomBytes(32).toString('hex');
    await Subscriber.create({
      email,
      categories: validCategories,
      verificationToken
    });

    // Send confirmation email
    const verificationUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/verify-subscription?token=${encodeURIComponent(verificationToken)}`;
    const html = emailTemplates.confirmationTemplate(email, verificationUrl);
    
    await emailService.sendEmail({
      to: email,
      subject: 'Confirm Your Subscription',
      html,
      category: 'System'
    });

    return res.status(200).json({
      success: true,
      message: 'Please check your email to confirm your subscription'
    });
  } catch (error) {
    console.error('Subscription error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to subscribe. Please try again later.'
    });
  }
};

const verifySubscription = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    const subscriber = await Subscriber.findByVerificationToken(token);
    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired verification link'
      });
    }

    // Update subscriber
    await Subscriber.updateVerification(subscriber.id, 'active');

    // Send welcome email
    const welcomeHtml = emailTemplates.welcomeTemplate(subscriber.email);
    await emailService.sendEmail({
      to: subscriber.email,
      subject: 'Welcome to Mathare North SDA Church!',
      html: welcomeHtml,
      category: 'System'
    });

    return res.status(200).json({
      success: true,
      message: 'Subscription confirmed! Welcome to our community.'
    });
  } catch (error) {
    console.error('Verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify subscription. Please try again later.'
    });
  }
};

const unsubscribe = async (req, res) => {
  try {
    let { token } = req.body;
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Unsubscribe token is required'
      });
    }

    // Decode token to get email
    let email;
    try {
      email = Buffer.from(decodeURIComponent(token), 'base64').toString('utf8');
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid unsubscribe link'
      });
    }

    const subscriber = await Subscriber.findByEmail(email);
    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Subscriber not found'
      });
    }

    await Subscriber.updateStatus(subscriber.id, 'unsubscribed');

    return res.status(200).json({
      success: true,
      message: 'You have been unsubscribed successfully'
    });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to unsubscribe. Please try again later.'
    });
  }
};

const getSubscribers = async (req, res) => {
  try {
    const { search, status, category, limit, offset } = req.query;
    const subscribers = await Subscriber.findAll({
      search,
      status,
      category,
      limit,
      offset
    });

    const stats = await Subscriber.getStats();

    return res.status(200).json({
      success: true,
      data: subscribers,
      stats
    });
  } catch (error) {
    console.error('Get subscribers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch subscribers'
    });
  }
};

const deleteSubscriber = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Subscriber.delete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Subscriber not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Subscriber deleted successfully'
    });
  } catch (error) {
    console.error('Delete subscriber error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete subscriber'
    });
  }
};

const reactivateSubscriber = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Subscriber.updateStatus(id, 'active');

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Subscriber not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Subscriber reactivated successfully'
    });
  } catch (error) {
    console.error('Reactivate subscriber error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reactivate subscriber'
    });
  }
};

const getCategories = (req, res) => {
  return res.status(200).json({
    success: true,
    categories: SUBSCRIPTION_CATEGORIES
  });
};

module.exports = {
  subscribe,
  verifySubscription,
  unsubscribe,
  getSubscribers,
  deleteSubscriber,
  reactivateSubscriber,
  getCategories
};
