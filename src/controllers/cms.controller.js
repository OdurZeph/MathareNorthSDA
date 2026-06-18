
const WebsiteSettings = require('../models/websiteSettings.model');
const Sermon = require('../models/sermons.model');
const Event = require('../models/events.model');
const Announcement = require('../models/announcements.model');
const Gallery = require('../models/gallery.model');
const Leadership = require('../models/leadership.model');
const Ministry = require('../models/ministries.model');
const Media = require('../models/media.model');
const PageSection = require('../models/pageSections.model');
const SEO = require('../models/seo.model');
const AuditLog = require('../models/auditLog.model');

// Website Settings
exports.getWebsiteSettings = async (req, res) => {
  try {
    const settings = await WebsiteSettings.getSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get settings', error: error.message });
  }
};

exports.updateWebsiteSettings = async (req, res) => {
  try {
    const settings = await WebsiteSettings.updateSettings(req.body);
    
    // Log audit
    if (req.user) {
      await AuditLog.create({
        admin_id: req.user.id,
        action: 'UPDATE',
        table_name: 'website_settings',
        changes: req.body
      });
    }
    
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update settings', error: error.message });
  }
};

// Sermons
exports.getSermons = async (req, res) => {
  try {
    const { includeUnpublished } = req.query;
    const sermons = await Sermon.getAll(includeUnpublished === 'true');
    res.json({ success: true, data: sermons });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get sermons', error: error.message });
  }
};

exports.getSermonById = async (req, res) => {
  try {
    const { includeUnpublished } = req.query;
    const sermon = await Sermon.getById(req.params.id, includeUnpublished === 'true');
    if (!sermon) {
      return res.status(404).json({ success: false, message: 'Sermon not found' });
    }
    res.json({ success: true, data: sermon });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get sermon', error: error.message });
  }
};

exports.createSermon = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.image = req.file.path;
    }
    const sermon = await Sermon.create(data);
    
    if (req.user) {
      await AuditLog.create({
        admin_id: req.user.id,
        action: 'CREATE',
        table_name: 'sermons',
        record_id: sermon.id,
        changes: data
      });
    }
    
    res.status(201).json({ success: true, data: sermon });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create sermon', error: error.message });
  }
};

exports.updateSermon = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.image = req.file.path;
    }
    const sermon = await Sermon.update(req.params.id, data);
    
    if (req.user) {
      await AuditLog.create({
        admin_id: req.user.id,
        action: 'UPDATE',
        table_name: 'sermons',
        record_id: req.params.id,
        changes: data
      });
    }
    
    res.json({ success: true, data: sermon });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update sermon', error: error.message });
  }
};

exports.deleteSermon = async (req, res) => {
  try {
    await Sermon.delete(req.params.id);
    
    if (req.user) {
      await AuditLog.create({
        admin_id: req.user.id,
        action: 'DELETE',
        table_name: 'sermons',
        record_id: req.params.id
      });
    }
    
    res.json({ success: true, message: 'Sermon deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete sermon', error: error.message });
  }
};

// Events
exports.getEvents = async (req, res) => {
  try {
    const { includeUnpublished } = req.query;
    const events = await Event.getAll(includeUnpublished === 'true');
    res.json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get events', error: error.message });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const { includeUnpublished } = req.query;
    const event = await Event.getById(req.params.id, includeUnpublished === 'true');
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get event', error: error.message });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.image = req.file.path;
    }
    const event = await Event.create(data);
    
    if (req.user) {
      await AuditLog.create({
        admin_id: req.user.id,
        action: 'CREATE',
        table_name: 'events',
        record_id: event.id,
        changes: data
      });
    }
    
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create event', error: error.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.image = req.file.path;
    }
    const event = await Event.update(req.params.id, data);
    
    if (req.user) {
      await AuditLog.create({
        admin_id: req.user.id,
        action: 'UPDATE',
        table_name: 'events',
        record_id: req.params.id,
        changes: data
      });
    }
    
    res.json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update event', error: error.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    await Event.delete(req.params.id);
    
    if (req.user) {
      await AuditLog.create({
        admin_id: req.user.id,
        action: 'DELETE',
        table_name: 'events',
        record_id: req.params.id
      });
    }
    
    res.json({ success: true, message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete event', error: error.message });
  }
};

// Announcements
exports.getAnnouncements = async (req, res) => {
  try {
    const { includeArchived } = req.query;
    const announcements = await Announcement.getAll(includeArchived === 'true');
    res.json({ success: true, data: announcements });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get announcements', error: error.message });
  }
};

exports.getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.getById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    res.json({ success: true, data: announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get announcement', error: error.message });
  }
};

exports.createAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.create(req.body);
    
    if (req.user) {
      await AuditLog.create({
        admin_id: req.user.id,
        action: 'CREATE',
        table_name: 'announcements',
        record_id: announcement.id,
        changes: req.body
      });
    }
    
    res.status(201).json({ success: true, data: announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create announcement', error: error.message });
  }
};

exports.updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.update(req.params.id, req.body);
    
    if (req.user) {
      await AuditLog.create({
        admin_id: req.user.id,
        action: 'UPDATE',
        table_name: 'announcements',
        record_id: req.params.id,
        changes: req.body
      });
    }
    
    res.json({ success: true, data: announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update announcement', error: error.message });
  }
};

exports.deleteAnnouncement = async (req, res) => {
  try {
    await Announcement.delete(req.params.id);
    
    if (req.user) {
      await AuditLog.create({
        admin_id: req.user.id,
        action: 'DELETE',
        table_name: 'announcements',
        record_id: req.params.id
      });
    }
    
    res.json({ success: true, message: 'Announcement deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete announcement', error: error.message });
  }
};

// Gallery
exports.getGalleryAlbums = async (req, res) => {
  try {
    const albums = await Gallery.getAlbums();
    res.json({ success: true, data: albums });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get albums', error: error.message });
  }
};

exports.getGalleryImages = async (req, res) => {
  try {
    let images;
    if (req.query.album) {
      images = await Gallery.getImagesByAlbum(req.query.album);
    } else {
      images = await Gallery.getAllImages();
    }
    res.json({ success: true, data: images });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get images', error: error.message });
  }
};

exports.uploadGalleryImage = async (req, res) => {
  try {
    const { album } = req.body;
    const image = await Gallery.uploadImage({ image_path: req.file.path, album });
    
    if (req.user) {
      await AuditLog.create({
        admin_id: req.user.id,
        action: 'CREATE',
        table_name: 'gallery',
        record_id: image.id,
        changes: { image_path: req.file.path, album }
      });
    }
    
    res.status(201).json({ success: true, data: image });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to upload image', error: error.message });
  }
};

exports.deleteGalleryImage = async (req, res) => {
  try {
    await Gallery.deleteImage(req.params.id);
    
    if (req.user) {
      await AuditLog.create({
        admin_id: req.user.id,
        action: 'DELETE',
        table_name: 'gallery',
        record_id: req.params.id
      });
    }
    
    res.json({ success: true, message: 'Image deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete image', error: error.message });
  }
};

// Leadership
exports.getLeadership = async (req, res) => {
  try {
    let leaders;
    if (req.query.role) {
      leaders = await Leadership.getByRole(req.query.role);
    } else {
      leaders = await Leadership.getAll();
    }
    res.json({ success: true, data: leaders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get leadership', error: error.message });
  }
};

exports.getLeaderById = async (req, res) => {
  try {
    const leader = await Leadership.getById(req.params.id);
    if (!leader) {
      return res.status(404).json({ success: false, message: 'Leader not found' });
    }
    res.json({ success: true, data: leader });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get leader', error: error.message });
  }
};

exports.createLeader = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.image = req.file.path;
    }
    const leader = await Leadership.create(data);
    
    if (req.user) {
      await AuditLog.create({
        admin_id: req.user.id,
        action: 'CREATE',
        table_name: 'leadership',
        record_id: leader.id,
        changes: data
      });
    }
    
    res.status(201).json({ success: true, data: leader });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create leader', error: error.message });
  }
};

exports.updateLeader = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.image = req.file.path;
    }
    const leader = await Leadership.update(req.params.id, data);
    
    if (req.user) {
      await AuditLog.create({
        admin_id: req.user.id,
        action: 'UPDATE',
        table_name: 'leadership',
        record_id: req.params.id,
        changes: data
      });
    }
    
    res.json({ success: true, data: leader });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update leader', error: error.message });
  }
};

exports.deleteLeader = async (req, res) => {
  try {
    await Leadership.delete(req.params.id);
    
    if (req.user) {
      await AuditLog.create({
        admin_id: req.user.id,
        action: 'DELETE',
        table_name: 'leadership',
        record_id: req.params.id
      });
    }
    
    res.json({ success: true, message: 'Leader deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete leader', error: error.message });
  }
};

// Ministries
exports.getMinistries = async (req, res) => {
  try {
    const ministries = await Ministry.getAll();
    res.json({ success: true, data: ministries });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get ministries', error: error.message });
  }
};

exports.getMinistryById = async (req, res) => {
  try {
    let ministry;
    if (req.params.slugOrId.match(/^\d+$/)) {
      ministry = await Ministry.getById(req.params.slugOrId);
    } else {
      ministry = await Ministry.getBySlug(req.params.slugOrId);
    }
    if (!ministry) {
      return res.status(404).json({ success: false, message: 'Ministry not found' });
    }
    res.json({ success: true, data: ministry });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get ministry', error: error.message });
  }
};

exports.createMinistry = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.image = req.file.path;
    }
    const ministry = await Ministry.create(data);
    
    if (req.user) {
      await AuditLog.create({
        admin_id: req.user.id,
        action: 'CREATE',
        table_name: 'ministries',
        record_id: ministry.id,
        changes: data
      });
    }
    
    res.status(201).json({ success: true, data: ministry });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create ministry', error: error.message });
  }
};

exports.updateMinistry = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.image = req.file.path;
    }
    const ministry = await Ministry.update(req.params.id, data);
    
    if (req.user) {
      await AuditLog.create({
        admin_id: req.user.id,
        action: 'UPDATE',
        table_name: 'ministries',
        record_id: req.params.id,
        changes: data
      });
    }
    
    res.json({ success: true, data: ministry });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update ministry', error: error.message });
  }
};

exports.deleteMinistry = async (req, res) => {
  try {
    await Ministry.delete(req.params.id);
    
    if (req.user) {
      await AuditLog.create({
        admin_id: req.user.id,
        action: 'DELETE',
        table_name: 'ministries',
        record_id: req.params.id
      });
    }
    
    res.json({ success: true, message: 'Ministry deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete ministry', error: error.message });
  }
};

// Media
exports.getMedia = async (req, res) => {
  try {
    let media;
    if (req.query.type) {
      media = await Media.getByType(req.query.type);
    } else {
      media = await Media.getAll();
    }
    res.json({ success: true, data: media });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get media', error: error.message });
  }
};

exports.getMediaById = async (req, res) => {
  try {
    const mediaItem = await Media.getById(req.params.id);
    if (!mediaItem) {
      return res.status(404).json({ success: false, message: 'Media not found' });
    }
    res.json({ success: true, data: mediaItem });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get media', error: error.message });
  }
};

exports.uploadMedia = async (req, res) => {
  try {
    const { type, title, description } = req.body;
    const media = await Media.upload({
      file_path: req.file.path,
      type,
      title,
      description
    });
    
    if (req.user) {
      await AuditLog.create({
        admin_id: req.user.id,
        action: 'CREATE',
        table_name: 'media',
        record_id: media.id,
        changes: { file_path: req.file.path, type, title, description }
      });
    }
    
    res.status(201).json({ success: true, data: media });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to upload media', error: error.message });
  }
};

exports.deleteMedia = async (req, res) => {
  try {
    await Media.delete(req.params.id);
    
    if (req.user) {
      await AuditLog.create({
        admin_id: req.user.id,
        action: 'DELETE',
        table_name: 'media',
        record_id: req.params.id
      });
    }
    
    res.json({ success: true, message: 'Media deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete media', error: error.message });
  }
};

// Page Sections
exports.getPageSections = async (req, res) => {
  try {
    let sections;
    if (req.query.page) {
      sections = await PageSection.getByPage(req.query.page);
    } else {
      sections = await PageSection.getAll();
    }
    res.json({ success: true, data: sections });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get sections', error: error.message });
  }
};

exports.createPageSection = async (req, res) => {
  try {
    const section = await PageSection.create(req.body);
    
    if (req.user) {
      await AuditLog.create({
        admin_id: req.user.id,
        action: 'CREATE',
        table_name: 'page_sections',
        record_id: section.id,
        changes: req.body
      });
    }
    
    res.status(201).json({ success: true, data: section });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create section', error: error.message });
  }
};

exports.updatePageSection = async (req, res) => {
  try {
    const section = await PageSection.update(req.params.id, req.body);
    
    if (req.user) {
      await AuditLog.create({
        admin_id: req.user.id,
        action: 'UPDATE',
        table_name: 'page_sections',
        record_id: req.params.id,
        changes: req.body
      });
    }
    
    res.json({ success: true, data: section });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update section', error: error.message });
  }
};

exports.deletePageSection = async (req, res) => {
  try {
    await PageSection.delete(req.params.id);
    
    if (req.user) {
      await AuditLog.create({
        admin_id: req.user.id,
        action: 'DELETE',
        table_name: 'page_sections',
        record_id: req.params.id
      });
    }
    
    res.json({ success: true, message: 'Section deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete section', error: error.message });
  }
};

// SEO
exports.getSEO = async (req, res) => {
  try {
    if (req.query.page) {
      const seo = await SEO.getByPage(req.query.page);
      res.json({ success: true, data: seo });
    } else {
      const seo = await SEO.getAll();
      res.json({ success: true, data: seo });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get SEO settings', error: error.message });
  }
};

exports.updateSEO = async (req, res) => {
  try {
    const seo = await SEO.createOrUpdate(req.params.page, req.body);
    
    if (req.user) {
      await AuditLog.create({
        admin_id: req.user.id,
        action: 'UPDATE',
        table_name: 'seo',
        changes: req.body
      });
    }
    
    res.json({ success: true, data: seo });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update SEO settings', error: error.message });
  }
};

// Audit Logs
exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.getAll(req.query.limit || 100);
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get audit logs', error: error.message });
  }
};
