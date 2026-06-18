
const express = require('express');
const router = express.Router();
const cmsController = require('../controllers/cms.controller');
const authMiddleware = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// Apply auth middleware to all admin routes
router.use(authMiddleware);

// Website Settings
router.get('/settings', cmsController.getWebsiteSettings);
router.put('/settings', cmsController.updateWebsiteSettings);

// Sermons
router.get('/sermons', cmsController.getSermons);
router.get('/sermons/:id', cmsController.getSermonById);
router.post('/sermons', upload.single('image'), cmsController.createSermon);
router.put('/sermons/:id', upload.single('image'), cmsController.updateSermon);
router.delete('/sermons/:id', cmsController.deleteSermon);

// Events
router.get('/events', cmsController.getEvents);
router.get('/events/:id', cmsController.getEventById);
router.post('/events', upload.single('image'), cmsController.createEvent);
router.put('/events/:id', upload.single('image'), cmsController.updateEvent);
router.delete('/events/:id', cmsController.deleteEvent);

// Announcements
router.get('/announcements', cmsController.getAnnouncements);
router.get('/announcements/:id', cmsController.getAnnouncementById);
router.post('/announcements', cmsController.createAnnouncement);
router.put('/announcements/:id', cmsController.updateAnnouncement);
router.delete('/announcements/:id', cmsController.deleteAnnouncement);

// Gallery
router.get('/gallery/albums', cmsController.getGalleryAlbums);
router.get('/gallery/images', cmsController.getGalleryImages);
router.post('/gallery/images', (req, res, next) => { req.uploadType = 'gallery'; next(); }, upload.single('image'), cmsController.uploadGalleryImage);
router.delete('/gallery/images/:id', cmsController.deleteGalleryImage);

// Leadership
router.get('/leadership', cmsController.getLeadership);
router.get('/leadership/:id', cmsController.getLeaderById);
router.post('/leadership', upload.single('image'), cmsController.createLeader);
router.put('/leadership/:id', upload.single('image'), cmsController.updateLeader);
router.delete('/leadership/:id', cmsController.deleteLeader);

// Ministries
router.get('/ministries', cmsController.getMinistries);
router.get('/ministries/:slugOrId', cmsController.getMinistryById);
router.post('/ministries', upload.single('image'), cmsController.createMinistry);
router.put('/ministries/:id', upload.single('image'), cmsController.updateMinistry);
router.delete('/ministries/:id', cmsController.deleteMinistry);

// Media
router.get('/media', cmsController.getMedia);
router.get('/media/:id', cmsController.getMediaById);
router.post('/media', (req, res, next) => { req.uploadType = 'media'; next(); }, upload.single('file'), cmsController.uploadMedia);
router.delete('/media/:id', cmsController.deleteMedia);

// Page Sections
router.get('/page-sections', cmsController.getPageSections);
router.post('/page-sections', cmsController.createPageSection);
router.put('/page-sections/:id', cmsController.updatePageSection);
router.delete('/page-sections/:id', cmsController.deletePageSection);

// SEO
router.get('/seo', cmsController.getSEO);
router.put('/seo/:page', cmsController.updateSEO);

// Audit Logs
router.get('/audit-logs', cmsController.getAuditLogs);

module.exports = router;
