const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscription.controller');
const rateLimit = require('express-rate-limit');

const subscriptionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { success: false, message: 'Too many requests, please try again later' }
});

router.post('/subscribe', subscriptionLimiter, subscriptionController.subscribe);
router.post('/verify-subscription', subscriptionController.verifySubscription);
router.post('/unsubscribe', subscriptionLimiter, subscriptionController.unsubscribe);
router.get('/categories', subscriptionController.getCategories);

module.exports = router;
