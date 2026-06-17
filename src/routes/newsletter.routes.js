const express = require('express');
const router = express.Router();
const newsletterController = require('../controllers/newsletter.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Admin routes
router.get('/subscribers', authMiddleware, newsletterController.getSubscribers);
router.delete('/subscribers/:id', authMiddleware, newsletterController.deleteSubscriber);
router.post('/subscribers/:id/reactivate', authMiddleware, newsletterController.reactivateSubscriber);
router.get('/subscribers/export', authMiddleware, newsletterController.exportToCSV);

router.post('/send-newsletter', authMiddleware, newsletterController.sendNewsletter);
router.post('/save-draft', authMiddleware, newsletterController.saveDraft);
router.get('/drafts', authMiddleware, newsletterController.getDrafts);
router.delete('/drafts/:id', authMiddleware, newsletterController.deleteDraft);
router.get('/stats', authMiddleware, newsletterController.getEmailStats);

module.exports = router;
