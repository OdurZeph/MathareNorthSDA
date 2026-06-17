const Subscriber = require('../models/subscriber.model');
const EmailDraft = require('../models/emailDraft.model');
const EmailLog = require('../models/emailLog.model');
const emailService = require('../services/emailService');
const emailTemplates = require('../services/emailTemplates');

const sendNewsletter = async (req, res) => {
  try {
    const { subject, content, category } = req.body;

    if (!subject || !content) {
      return res.status(400).json({
        success: false,
        message: 'Subject and content are required'
      });
    }

    // Get recipients
    const recipients = await Subscriber.findByCategories(category ? [category] : ['Church Announcements']);
    
    if (recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No active subscribers found for this category'
      });
    }

    // Send emails
    const results = await emailService.sendBulkEmail({
      recipients,
      subject,
      html: emailTemplates.newsletterTemplate('{{email}}', subject, content),
      category
    });

    const successCount = results.filter(r => r.success).length;

    return res.status(200).json({
      success: true,
      message: `Successfully sent ${successCount} emails`,
      data: {
        total: recipients.length,
        sent: successCount,
        failed: results.filter(r => !r.success).length
      }
    });
  } catch (error) {
    console.error('Send newsletter error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send newsletter'
    });
  }
};

const saveDraft = async (req, res) => {
  try {
    const { subject, content, category, scheduledAt, draftId } = req.body;

    if (!subject || !content) {
      return res.status(400).json({
        success: false,
        message: 'Subject and content are required'
      });
    }

    let draftIdResult;
    if (draftId) {
      await EmailDraft.update(draftId, {
        subject,
        content,
        category,
        scheduledAt
      });
      draftIdResult = draftId;
    } else {
      draftIdResult = await EmailDraft.create({
        subject,
        content,
        category,
        scheduledAt
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Draft saved successfully',
      data: { draftId: draftIdResult }
    });
  } catch (error) {
    console.error('Save draft error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save draft'
    });
  }
};

const getDrafts = async (req, res) => {
  try {
    const drafts = await EmailDraft.findAll();
    return res.status(200).json({
      success: true,
      data: drafts
    });
  } catch (error) {
    console.error('Get drafts error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch drafts'
    });
  }
};

const deleteDraft = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await EmailDraft.delete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Draft not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Draft deleted successfully'
    });
  } catch (error) {
    console.error('Delete draft error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete draft'
    });
  }
};

const getEmailStats = async (req, res) => {
  try {
    const subscriberStats = await Subscriber.getStats();
    const emailLogStats = await EmailLog.getStats();

    return res.status(200).json({
      success: true,
      data: {
        subscribers: subscriberStats,
        emails: emailLogStats
      }
    });
  } catch (error) {
    console.error('Get email stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch stats'
    });
  }
};

const exportToCSV = async (req, res) => {
  try {
    const subscribers = await Subscriber.findAll({ limit: 1000 });
    
    let csv = 'ID,Email,Status,Categories,Date Subscribed\n';
    for (const sub of subscribers) {
      const categories = JSON.parse(sub.categories || '[]').join('; ');
      csv += `${sub.id},${sub.email},${sub.status},${categories},${sub.date_subscribed || sub.created_at}\n`;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="subscribers.csv"');
    return res.send(csv);
  } catch (error) {
    console.error('Export CSV error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to export CSV'
    });
  }
};

module.exports = {
  sendNewsletter,
  saveDraft,
  getDrafts,
  deleteDraft,
  getEmailStats,
  exportToCSV
};
