const express = require('express');
const router  = express.Router();
const { createTransferRequest, createVisitationRequest } = require('../controllers/membership.controller');
const { createDedicationRequest } = require('../controllers/dedication.controller');

// POST /api/membership/transfer
router.post('/transfer', createTransferRequest);

// POST /api/membership/visitation
router.post('/visitation', createVisitationRequest);

// POST /api/membership/dedication
router.post('/dedication', createDedicationRequest);

module.exports = router;
