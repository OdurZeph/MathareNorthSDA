const express = require('express');
const router = express.Router();
const { stkPush } = require('../controllers/mpesa.controller');
const { mpesaCallback } = require('../controllers/mpesa.callback.controller');
const donationModel = require('../models/donation.model');

router.post('/stkpush', stkPush);
router.post('/callback', mpesaCallback);
router.get('/donations', async (req, res) => {
  try {
    const limit = req.query.limit;
    const offset = req.query.offset;
    const donations = await donationModel.getAllDonations({ limit, offset });
    return res.status(200).json({
      success: true,
      count: donations.length,
      data: donations
    });
  } catch (error) {
    console.error('Get donations error:', error);
    return res.status(503).json({
      success: false,
      message: 'Unable to fetch donations. Check database connection.'
    });
  }
});
router.get('/donations/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const limit = req.query.limit;
    const offset = req.query.offset;
    const donations = await donationModel.getByCategory(category.toUpperCase(), { limit, offset });
    return res.status(200).json({
      success: true,
      count: donations.length,
      data: donations
    });
  } catch (error) {
    console.error('Get donations by category error:', error);
    return res.status(503).json({
      success: false,
      message: 'Unable to fetch donations. Check database connection.'
    });
  }
});
router.get('/status/:checkoutRequestID', async (req, res) => {
  try {
    const { checkoutRequestID } = req.params;
    const donation = await donationModel.findByCheckoutRequestID(checkoutRequestID);

    let publicStatus = null;
    if (donation?.status) {
      if (donation.status === 'Completed') publicStatus = 'Success';
      else if (donation.status === 'Failed') publicStatus = 'Failed';
      else publicStatus = 'Pending';
    }

    return res.status(200).json({
      success: true,
      data: donation ? {
        status: publicStatus,
        receipt: donation.mpesa_receipt ? { receiptNumber: donation.mpesa_receipt } : null
      } : null
    });
  } catch (error) {
    console.error('Get donation status error:', error);
    return res.status(503).json({
      success: false,
      message: 'Unable to fetch donation status.'
    });
  }
});

module.exports = router;
