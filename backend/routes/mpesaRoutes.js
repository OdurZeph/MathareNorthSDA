const express = require('express');
const mpesaController = require('../controllers/mpesaController');

const router = express.Router();

router.post('/stkpush', mpesaController.stkPush);
router.post('/callback', mpesaController.mpesaCallback);
router.get('/status/:checkoutRequestID', mpesaController.getDonationStatus);
router.post('/verify/:checkoutRequestID', mpesaController.verifyTransaction);
router.get('/transactions', mpesaController.listTransactions);

module.exports = router;
