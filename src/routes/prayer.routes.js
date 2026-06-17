const express = require('express');
const router = express.Router();
const validatePrayer = require('../middleware/validatePrayer');
const { createPrayerRequest } = require('../controllers/prayer.controller');

router.post('/', validatePrayer, createPrayerRequest);

module.exports = router;