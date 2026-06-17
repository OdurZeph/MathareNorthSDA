const db = require('../config/db');

// Dashboard Stats
const getDashboardStats = async (req, res) => {
  try {
    const [[prayerCount]] = await db.execute('SELECT COUNT(*) as total FROM prayer_requests');
    const [[contactCount]] = await db.execute('SELECT COUNT(*) as total FROM contact_messages');
    const [[transferCount]] = await db.execute('SELECT COUNT(*) as total FROM membership_transfers');
    const [[dedicationCount]] = await db.execute('SELECT COUNT(*) as total FROM child_dedications');
    const [[visitCount]] = await db.execute('SELECT COUNT(*) as total FROM visitation_requests');
    const [[donationCount]] = await db.execute('SELECT COUNT(*) as total FROM donations');
    const [[donationTotal]] = await db.execute('SELECT COALESCE(SUM(amount), 0) as total FROM donations WHERE status = "Completed"');

    // Requests per month
    const [requestsPerMonth] = await db.execute(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month, 
        COUNT(*) as count 
      FROM (
        SELECT created_at FROM prayer_requests
        UNION ALL
        SELECT created_at FROM contact_messages
        UNION ALL
        SELECT created_at FROM membership_transfers
        UNION ALL
        SELECT created_at FROM child_dedications
        UNION ALL
        SELECT created_at FROM visitation_requests
      ) as all_requests
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12
    `);

    // Donations per month
    const [donationsPerMonth] = await db.execute(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month, 
        COALESCE(SUM(amount), 0) as total 
      FROM donations 
      WHERE status = 'Completed'
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12
    `);

    return res.status(200).json({
      success: true,
      data: {
        prayerRequests: prayerCount.total,
        contactMessages: contactCount.total,
        membershipTransfers: transferCount.total,
        childDedications: dedicationCount.total,
        visitationRequests: visitCount.total,
        totalDonations: donationTotal.total,
        requestsPerMonth,
        donationsPerMonth
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Prayer Requests
const getPrayerRequests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM prayer_requests WHERE 1=1';
    let params = [];

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR message LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [requests] = await db.execute(query, params);

    let countQuery = 'SELECT COUNT(*) as total FROM prayer_requests WHERE 1=1';
    let countParams = [];

    if (search) {
      countQuery += ' AND (name LIKE ? OR email LIKE ? OR message LIKE ?)';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    const [[countResult]] = await db.execute(countQuery, countParams);
    const totalPages = Math.ceil(countResult.total / limit);

    return res.status(200).json({
      success: true,
      data: {
        requests,
        total: countResult.total,
        totalPages,
        currentPage: page
      }
    });
  } catch (error) {
    console.error('Get prayer requests error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const markPrayerAsPrayed = async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('UPDATE prayer_requests SET is_prayed_for = 1 WHERE id = ?', [id]);
    return res.status(200).json({
      success: true,
      message: 'Prayer request marked as prayed for'
    });
  } catch (error) {
    console.error('Mark prayer as prayed error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const deletePrayerRequest = async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM prayer_requests WHERE id = ?', [id]);
    return res.status(200).json({
      success: true,
      message: 'Prayer request deleted successfully'
    });
  } catch (error) {
    console.error('Delete prayer request error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Contact Messages
const getContactMessages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM contact_messages WHERE 1=1';
    let params = [];

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR message LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [messages] = await db.execute(query, params);

    let countQuery = 'SELECT COUNT(*) as total FROM contact_messages WHERE 1=1';
    let countParams = [];

    if (search) {
      countQuery += ' AND (name LIKE ? OR email LIKE ? OR message LIKE ?)';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    const [[countResult]] = await db.execute(countQuery, countParams);
    const totalPages = Math.ceil(countResult.total / limit);

    return res.status(200).json({
      success: true,
      data: {
        messages,
        total: countResult.total,
        totalPages,
        currentPage: page
      }
    });
  } catch (error) {
    console.error('Get contact messages error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const deleteContactMessage = async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM contact_messages WHERE id = ?', [id]);
    return res.status(200).json({
      success: true,
      message: 'Contact message deleted successfully'
    });
  } catch (error) {
    console.error('Delete contact message error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Membership Transfers
const getTransfers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM membership_transfers WHERE 1=1';
    let params = [];

    if (search) {
      query += ' AND (full_name LIKE ? OR email LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [transfers] = await db.execute(query, params);

    let countQuery = 'SELECT COUNT(*) as total FROM membership_transfers WHERE 1=1';
    let countParams = [];

    if (search) {
      countQuery += ' AND (full_name LIKE ? OR email LIKE ?)';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm);
    }

    const [[countResult]] = await db.execute(countQuery, countParams);
    const totalPages = Math.ceil(countResult.total / limit);

    return res.status(200).json({
      success: true,
      data: {
        transfers,
        total: countResult.total,
        totalPages,
        currentPage: page
      }
    });
  } catch (error) {
    console.error('Get transfers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const updateTransferStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    await db.execute('UPDATE membership_transfers SET status = ? WHERE id = ?', [status, id]);
    return res.status(200).json({
      success: true,
      message: 'Transfer status updated successfully'
    });
  } catch (error) {
    console.error('Update transfer status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Pastoral Visitation Requests
const getVisits = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM visitation_requests WHERE 1=1';
    let params = [];

    if (search) {
      query += ' AND (full_name LIKE ? OR email LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [visits] = await db.execute(query, params);

    let countQuery = 'SELECT COUNT(*) as total FROM visitation_requests WHERE 1=1';
    let countParams = [];

    if (search) {
      countQuery += ' AND (full_name LIKE ? OR email LIKE ?)';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm);
    }

    const [[countResult]] = await db.execute(countQuery, countParams);
    const totalPages = Math.ceil(countResult.total / limit);

    return res.status(200).json({
      success: true,
      data: {
        visits,
        total: countResult.total,
        totalPages,
        currentPage: page
      }
    });
  } catch (error) {
    console.error('Get visits error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const assignVisit = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;

    await db.execute('UPDATE visitation_requests SET assigned_to = ? WHERE id = ?', [assignedTo, id]);
    return res.status(200).json({
      success: true,
      message: 'Visit assigned successfully'
    });
  } catch (error) {
    console.error('Assign visit error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const markVisitCompleted = async (req, res) => {
  try {
    const { id } = req.params;

    await db.execute('UPDATE visitation_requests SET is_completed = 1 WHERE id = ?', [id]);
    return res.status(200).json({
      success: true,
      message: 'Visit marked as completed'
    });
  } catch (error) {
    console.error('Mark visit completed error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Donations
const getDonations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const donationType = req.query.donationType || '';
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM donations WHERE 1=1';
    let params = [];

    if (search) {
      query += ' AND (donor_name LIKE ? OR phone LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    if (donationType) {
      query += ' AND donation_type = ?';
      params.push(donationType);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [donations] = await db.execute(query, params);

    let countQuery = 'SELECT COUNT(*) as total FROM donations WHERE 1=1';
    let countParams = [];

    if (search) {
      countQuery += ' AND (donor_name LIKE ? OR phone LIKE ?)';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm);
    }

    if (donationType) {
      countQuery += ' AND donation_type = ?';
      countParams.push(donationType);
    }

    const [[countResult]] = await db.execute(countQuery, countParams);
    const totalPages = Math.ceil(countResult.total / limit);

    return res.status(200).json({
      success: true,
      data: {
        donations,
        total: countResult.total,
        totalPages,
        currentPage: page
      }
    });
  } catch (error) {
    console.error('Get donations error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const createDonation = async (req, res) => {
  try {
    const { donorName, phone, email, amount, donationType, paymentMethod, transactionCode, status } = req.body;
    const [result] = await db.execute(
      `INSERT INTO donations (donor_name, phone, email, amount, donation_type, payment_method, transaction_code, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [donorName, phone, email, amount, donationType, paymentMethod, transactionCode, status]
    );

    return res.status(201).json({
      success: true,
      message: 'Donation created successfully',
      data: { id: result.insertId, ...req.body }
    });
  } catch (error) {
    console.error('Create donation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const updateDonation = async (req, res) => {
  try {
    const { id } = req.params;
    const { donorName, phone, email, amount, donationType, paymentMethod, transactionCode, status } = req.body;

    await db.execute(
      `UPDATE donations
       SET donor_name = ?, phone = ?, email = ?, amount = ?, donation_type = ?, payment_method = ?, transaction_code = ?, status = ?
       WHERE id = ?`,
      [donorName, phone, email, amount, donationType, paymentMethod, transactionCode, status, id]
    );

    return res.status(200).json({
      success: true,
      message: 'Donation updated successfully'
    });
  } catch (error) {
    console.error('Update donation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const deleteDonation = async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM donations WHERE id = ?', [id]);
    return res.status(200).json({
      success: true,
      message: 'Donation deleted successfully'
    });
  } catch (error) {
    console.error('Delete donation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Child Dedications
const getDedications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM child_dedications WHERE 1=1';
    let params = [];

    if (search) {
      query += ' AND (parent_guardian_name LIKE ? OR child_full_name LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [dedications] = await db.execute(query, params);

    let countQuery = 'SELECT COUNT(*) as total FROM child_dedications WHERE 1=1';
    let countParams = [];

    if (search) {
      countQuery += ' AND (parent_guardian_name LIKE ? OR child_full_name LIKE ?)';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm);
    }

    const [[countResult]] = await db.execute(countQuery, countParams);
    const totalPages = Math.ceil(countResult.total / limit);

    return res.status(200).json({
      success: true,
      data: {
        dedications,
        total: countResult.total,
        totalPages,
        currentPage: page
      }
    });
  } catch (error) {
    console.error('Get dedications error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
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
};
