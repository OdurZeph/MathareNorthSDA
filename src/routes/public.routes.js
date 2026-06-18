
const express = require('express');
const router = express.Router();
const WebsiteSettings = require('../models/websiteSettings.model');
const Sermon = require('../models/sermons.model');
const Event = require('../models/events.model');
const Announcement = require('../models/announcements.model');
const Gallery = require('../models/gallery.model');
const Leadership = require('../models/leadership.model');
const Ministry = require('../models/ministries.model');
const PageSection = require('../models/pageSections.model');
const SEO = require('../models/seo.model');

// Website Settings
router.get('/settings', async (req, res) => {
  try {
    const settings = await WebsiteSettings.getSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get settings' });
  }
});

// Sermons
router.get('/sermons', async (req, res) => {
  try {
    const sermons = await Sermon.getAll();
    res.json({ success: true, data: sermons });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get sermons' });
  }
});

// Events
router.get('/events', async (req, res) => {
  try {
    const events = await Event.getAll();
    res.json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get events' });
  }
});

// Announcements
router.get('/announcements', async (req, res) => {
  try {
    const announcements = await Announcement.getAll();
    res.json({ success: true, data: announcements });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get announcements' });
  }
});

// Gallery
router.get('/gallery/albums', async (req, res) => {
  try {
    const albums = await Gallery.getAlbums();
    res.json({ success: true, data: albums });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get albums' });
  }
});

router.get('/gallery/images', async (req, res) => {
  try {
    let images;
    if (req.query.album) {
      images = await Gallery.getImagesByAlbum(req.query.album);
    } else {
      images = await Gallery.getAllImages();
    }
    res.json({ success: true, data: images });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get images' });
  }
});

// Leadership
router.get('/leadership', async (req, res) => {
  try {
    let leaders;
    if (req.query.role) {
      leaders = await Leadership.getByRole(req.query.role);
    } else {
      leaders = await Leadership.getAll();
    }
    res.json({ success: true, data: leaders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get leadership' });
  }
});

// Ministries
router.get('/ministries', async (req, res) => {
  try {
    const ministries = await Ministry.getAll();
    res.json({ success: true, data: ministries });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get ministries' });
  }
});

// Page Sections
router.get('/page-sections', async (req, res) => {
  try {
    let sections;
    if (req.query.page) {
      sections = await PageSection.getByPage(req.query.page);
    } else {
      sections = await PageSection.getAll();
    }
    res.json({ success: true, data: sections });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get sections' });
  }
});

// SEO
router.get('/seo', async (req, res) => {
  try {
    if (req.query.page) {
      const seo = await SEO.getByPage(req.query.page);
      res.json({ success: true, data: seo });
    } else {
      const seo = await SEO.getAll();
      res.json({ success: true, data: seo });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get SEO settings' });
  }
});

module.exports = router;
