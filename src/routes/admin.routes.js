const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const {
    getDashboardStats,
    getRecentActivity,
    getPrayerRequests,
    markPrayerAsPrayed,
    deletePrayerRequest,
    getContactMessages,
    deleteContactMessage,
    getTransfers,
    updateTransferStatus,
    getDedications,
    updateDedicationStatus,
    getVisits,
    assignVisit,
    markVisitCompleted,
    getDonations,
    getDonationsSummary,
    createDonation,
    updateDonation,
    deleteDonation,
    getEmailLogs,
    exportDonations,
    exportPrayers,
    exportMessages
} = require('../controllers/admin.controller');
const subscriptionController = require('../controllers/subscription.controller');
const newsletterController = require('../controllers/newsletter.controller');

router.get('/dashboard', authMiddleware, getDashboardStats);
router.get('/recent-activity', authMiddleware, getRecentActivity);

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
router.put('/dedications/:id/status', authMiddleware, updateDedicationStatus);

// Pastoral Visits
router.get('/visits', authMiddleware, getVisits);
router.put('/visits/:id/assign', authMiddleware, assignVisit);
router.put('/visits/:id/complete', authMiddleware, markVisitCompleted);

// Donations
router.get('/donations', authMiddleware, getDonations);
router.get('/donations/summary', authMiddleware, getDonationsSummary);
router.post('/donations', authMiddleware, createDonation);
router.put('/donations/:id', authMiddleware, updateDonation);
router.delete('/donations/:id', authMiddleware, deleteDonation);

// Subscribers
router.get('/subscribers', authMiddleware, subscriptionController.getSubscribers);
router.put('/subscribers/:id/reactivate', authMiddleware, subscriptionController.reactivateSubscriber);
router.delete('/subscribers/:id', authMiddleware, subscriptionController.deleteSubscriber);

// Newsletter
router.post('/send-newsletter', authMiddleware, newsletterController.sendNewsletter);
router.post('/save-draft', authMiddleware, newsletterController.saveDraft);

// Email Logs
router.get('/email-logs', authMiddleware, getEmailLogs);

// Exports
router.get('/export/donations', authMiddleware, exportDonations);
router.get('/export/prayers', authMiddleware, exportPrayers);
router.get('/export/messages', authMiddleware, exportMessages);

module.exports = router;
