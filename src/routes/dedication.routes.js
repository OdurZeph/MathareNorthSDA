const express = require('express');
const { createDedicationRequest } = require('../controllers/dedication.controller');

const router = express.Router();

// POST /api/child-dedication
router.post('/', createDedicationRequest);

module.exports = router;
