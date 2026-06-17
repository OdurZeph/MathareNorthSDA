const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contact.controller');
const validateContact = require('../middleware/validateContact');

// POST /api/contact
router.post('/', validateContact, contactController.createContact);

module.exports = router;