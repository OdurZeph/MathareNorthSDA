const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const {
  getDashboardStats,
  getPrayerRequests,
  markPrayerAsPrayed,
  deletePrayerRequest,
  getContactMessages,
  deleteContactMessage,
  getTransfers,
  updateTransferStatus,
  getDedications,
  getVisits,
  assignVisit,
  markVisitCompleted,
  getDonations,
  createDonation,
  updateDonation,
  deleteDonation
} = require('../controllers/admin.controller');

router.get('/dashboard', authMiddleware, getDashboardStats);

// Prayer Requests
router.get('/prayers', authMiddleware, getPrayerRequests);
router.put('/prayers/:id/pray', authMiddleware, markPrayerAsPrayed);
router.delete('/prayers/:id', authMiddleware, deletePrayerRequest);

// Contact Messages
router.get('/contacts', authMiddleware, getContactMessages);
router.delete('/contacts/:id', authMiddleware, deleteContactMessage);

// Membership Transfers
router.get('/transfers', authMiddleware, getTransfers);
router.put('/transfers/:id/status', authMiddleware, updateTransferStatus);

// Child Dedications
router.get('/dedications', authMiddleware, getDedications);

// Pastoral Visits
router.get('/visits', authMiddleware, getVisits);
router.put('/visits/:id/assign', authMiddleware, assignVisit);
router.put('/visits/:id/complete', authMiddleware, markVisitCompleted);

// Donations
router.get('/donations', authMiddleware, getDonations);
router.post('/donations', authMiddleware, createDonation);
router.put('/donations/:id', authMiddleware, updateDonation);
router.delete('/donations/:id', authMiddleware, deleteDonation);

module.exports = router;
