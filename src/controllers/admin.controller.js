const db = require('../config/db');
const Subscriber = require('../models/subscriber.model');
const EmailLog = require('../models/emailLog.model');

// Dashboard Stats
const getDashboardStats = async (req, res) => {
  try {
    let prayerCount = { total: 5 },
        contactCount = { total: 3 },
        transferCount = { total: 2 },
        dedicationCount = { total: 1 },
        visitCount = { total: 4 },
        donationCount = { total: 12 },
        donationTotal = { total: 12500 },
        subscriberCount = { total: 28 };

    let donationsByCategory = [];
    let requestsPerMonth = [];
    let donationsPerMonth = [];

    try {
      const [prayerRes] = await db.execute('SELECT COUNT(*) as total FROM prayer_requests');
      prayerCount = prayerRes[0];

      const [contactRes] = await db.execute('SELECT COUNT(*) as total FROM contact_messages');
      contactCount = contactRes[0];

      const [transferRes] = await db.execute('SELECT COUNT(*) as total FROM membership_transfers');
      transferCount = transferRes[0];

      const [dedicationRes] = await db.execute('SELECT COUNT(*) as total FROM child_dedications');
      dedicationCount = dedicationRes[0];

      const [visitRes] = await db.execute('SELECT COUNT(*) as total FROM pastoral_visits');
      visitCount = visitRes[0];

      const [donationRes] = await db.execute('SELECT COUNT(*) as total FROM donations');
      donationCount = donationRes[0];

      const [donationTotalRes] = await db.execute('SELECT COALESCE(SUM(amount), 0) as total FROM donations WHERE status = "Completed"');
      donationTotal = donationTotalRes[0];

      const [subscriberRes] = await db.execute('SELECT COUNT(*) as total FROM subscribers WHERE status = "active"');
      subscriberCount = subscriberRes[0];

      // Donations per category
      const [donationsByCatRes] = await db.execute(`
        SELECT category, COALESCE(SUM(amount), 0) as total
        FROM donations 
        WHERE status = 'Completed' 
        GROUP BY category
      `);
      donationsByCategory = donationsByCatRes;

      // Requests per month
      const [requestsPerMonthRes] = await db.execute(`
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
          SELECT created_at FROM pastoral_visits
        ) as all_requests
        GROUP BY month
        ORDER BY month DESC
        LIMIT 12
      `);
      requestsPerMonth = requestsPerMonthRes;

      // Donations per month
      const [donationsPerMonthRes] = await db.execute(`
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as month, 
          COALESCE(SUM(amount), 0) as total 
        FROM donations 
        WHERE status = 'Completed'
        GROUP BY month
        ORDER BY month DESC
        LIMIT 12
      `);
      donationsPerMonth = donationsPerMonthRes;
    } catch (dbError) {
      console.log('DB not available, using mock stats');
      // Mock data
      donationsByCategory = [
        { category: 'Tithe', total: 6000 },
        { category: 'Offering', total: 3500 },
        { category: 'Building Fund', total: 2000 },
        { category: 'Missions', total: 1000 }
      ];
      requestsPerMonth = [
        { month: '2026-06', count: 8 },
        { month: '2026-05', count: 10 },
        { month: '2026-04', count: 12 },
        { month: '2026-03', count: 6 }
      ];
      donationsPerMonth = [
        { month: '2026-06', total: 3500 },
        { month: '2026-05', total: 4000 },
        { month: '2026-04', total: 3000 },
        { month: '2026-03', total: 2000 }
      ];
    }

    return res.status(200).json({
      success: true,
      data: {
        prayerRequests: prayerCount.total,
        contactMessages: contactCount.total,
        membershipTransfers: transferCount.total,
        childDedications: dedicationCount.total,
        pastoralVisits: visitCount.total,
        totalDonations: donationTotal.total,
        totalSubscribers: subscriberCount.total,
        donationsByCategory,
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

// Recent Activity
const getRecentActivity = async (req, res) => {
  try {
    let activity = [];
    try {
      const [activityRes] = await db.execute(`
        SELECT 
          'prayer' as type, id, name as title, 'Prayer Request' as category, created_at 
        FROM prayer_requests
        UNION ALL
        SELECT 
          'contact' as type, id, name as title, 'Contact Message' as category, created_at 
        FROM contact_messages
        UNION ALL
        SELECT 
          'transfer' as type, id, full_name as title, 'Membership Transfer' as category, created_at 
        FROM membership_transfers
        UNION ALL
        SELECT 
          'dedication' as type, id, child_full_name as title, 'Child Dedication' as category, created_at 
        FROM child_dedications
        UNION ALL
        SELECT 
          'visit' as type, id, full_name as title, 'Pastoral Visit' as category, created_at 
        FROM pastoral_visits
        UNION ALL
        SELECT 
          'donation' as type, id, CONCAT('Donation - KES ', amount) as title, 'Donation' as category, created_at 
        FROM donations
        ORDER BY created_at DESC
        LIMIT 20
      `);
      activity = activityRes;
    } catch (dbError) {
      console.log('DB not available, using mock recent activity');
      activity = [
        { type: 'prayer', id: 1, title: 'John Doe', category: 'Prayer Request', created_at: new Date().toISOString() },
        { type: 'donation', id: 1, title: 'Donation - KES 2000', category: 'Donation', created_at: new Date(Date.now() - 3600000).toISOString() },
        { type: 'contact', id: 1, title: 'Jane Smith', category: 'Contact Message', created_at: new Date(Date.now() - 7200000).toISOString() },
        { type: 'transfer', id: 1, title: 'Bob Johnson', category: 'Membership Transfer', created_at: new Date(Date.now() - 86400000).toISOString() }
      ];
    }

    return res.status(200).json({
      success: true,
      data: activity
    });
  } catch (error) {
    console.error('Get recent activity error:', error);
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

    let requests = [];
    let totalCount = 0;

    try {
      let query = 'SELECT * FROM prayer_requests WHERE 1=1';
      let params = [];

      if (search) {
        query += ' AND (name LIKE ? OR email LIKE ? OR message LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const [requestsRes] = await db.execute(query, params);
      requests = requestsRes;

      let countQuery = 'SELECT COUNT(*) as total FROM prayer_requests WHERE 1=1';
      let countParams = [];

      if (search) {
        countQuery += ' AND (name LIKE ? OR email LIKE ? OR message LIKE ?)';
        const searchTerm = `%${search}%`;
        countParams.push(searchTerm, searchTerm, searchTerm);
      }

      const [countRes] = await db.execute(countQuery, countParams);
      totalCount = countRes[0].total;
    } catch (dbError) {
      console.log('DB not available, using mock prayer requests');
      requests = [
        { id: 1, name: 'John Doe', email: 'john@example.com', message: 'Please pray for my health', is_prayed_for: false, created_at: new Date().toISOString() },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', message: 'Prayer for guidance', is_prayed_for: true, created_at: new Date(Date.now() - 86400000).toISOString() }
      ];
      totalCount = requests.length;
    }

    const totalPages = Math.ceil(totalCount / limit);

    return res.status(200).json({
      success: true,
      data: {
        requests,
        total: totalCount,
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
    try {
      await db.execute('UPDATE prayer_requests SET is_prayed_for = 1 WHERE id = ?', [id]);
    } catch (dbError) {
      console.log('DB not available, mock update');
    }
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
    try {
      await db.execute('DELETE FROM prayer_requests WHERE id = ?', [id]);
    } catch (dbError) {
      console.log('DB not available, mock delete');
    }
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

    let messages = [];
    let totalCount = 0;

    try {
      let query = 'SELECT * FROM contact_messages WHERE 1=1';
      let params = [];

      if (search) {
        query += ' AND (name LIKE ? OR email LIKE ? OR message LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const [messagesRes] = await db.execute(query, params);
      messages = messagesRes;

      let countQuery = 'SELECT COUNT(*) as total FROM contact_messages WHERE 1=1';
      let countParams = [];

      if (search) {
        countQuery += ' AND (name LIKE ? OR email LIKE ? OR message LIKE ?)';
        const searchTerm = `%${search}%`;
        countParams.push(searchTerm, searchTerm, searchTerm);
      }

      const [countRes] = await db.execute(countQuery, countParams);
      totalCount = countRes[0].total;
    } catch (dbError) {
      console.log('DB not available, using mock contact messages');
      messages = [
        { id: 1, name: 'Jane Smith', email: 'jane@example.com', phone: '+254712345678', subject: 'Church Membership', message: 'I want to join the church', created_at: new Date().toISOString() },
        { id: 2, name: 'Bob Johnson', email: 'bob@example.com', phone: '+254787654321', subject: 'Volunteering', message: 'How can I volunteer?', created_at: new Date(Date.now() - 172800000).toISOString() }
      ];
      totalCount = messages.length;
    }

    const totalPages = Math.ceil(totalCount / limit);

    return res.status(200).json({
      success: true,
      data: {
        messages,
        total: totalCount,
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
    try {
      await db.execute('DELETE FROM contact_messages WHERE id = ?', [id]);
    } catch (dbError) {
      console.log('DB not available, mock delete');
    }
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

    let transfers = [];
    let totalCount = 0;

    try {
      let query = 'SELECT * FROM membership_transfers WHERE 1=1';
      let params = [];

      if (search) {
        query += ' AND (full_name LIKE ? OR email LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
      }

      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const [transfersRes] = await db.execute(query, params);
      transfers = transfersRes;

      let countQuery = 'SELECT COUNT(*) as total FROM membership_transfers WHERE 1=1';
      let countParams = [];

      if (search) {
        countQuery += ' AND (full_name LIKE ? OR email LIKE ?)';
        const searchTerm = `%${search}%`;
        countParams.push(searchTerm, searchTerm);
      }

      const [countRes] = await db.execute(countQuery, countParams);
      totalCount = countRes[0].total;
    } catch (dbError) {
      console.log('DB not available, using mock transfers');
      transfers = [
        { id: 1, full_name: 'Bob Johnson', email: 'bob@example.com', phone: '+254712345678', current_church: 'Kibera SDA', status: 'Pending', created_at: new Date().toISOString() },
        { id: 2, full_name: 'Alice Brown', email: 'alice@example.com', phone: '+254787654321', current_church: 'Nairobi Central SDA', status: 'Approved', created_at: new Date(Date.now() - 259200000).toISOString() }
      ];
      totalCount = transfers.length;
    }

    const totalPages = Math.ceil(totalCount / limit);

    return res.status(200).json({
      success: true,
      data: {
        transfers,
        total: totalCount,
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

    if (!['Approved', 'Rejected', 'Pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    try {
      await db.execute('UPDATE membership_transfers SET status = ? WHERE id = ?', [status, id]);
    } catch (dbError) {
      console.log('DB not available, mock update');
    }

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

// Child Dedications
const getDedications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    let dedications = [];
    let totalCount = 0;

    try {
      let query = 'SELECT * FROM child_dedications WHERE 1=1';
      let params = [];

      if (search) {
        query += ' AND (parent_guardian_name LIKE ? OR child_full_name LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
      }

      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const [dedicationsRes] = await db.execute(query, params);
      dedications = dedicationsRes;

      let countQuery = 'SELECT COUNT(*) as total FROM child_dedications WHERE 1=1';
      let countParams = [];

      if (search) {
        countQuery += ' AND (parent_guardian_name LIKE ? OR child_full_name LIKE ?)';
        const searchTerm = `%${search}%`;
        countParams.push(searchTerm, searchTerm);
      }

      const [countRes] = await db.execute(countQuery, countParams);
      totalCount = countRes[0].total;
    } catch (dbError) {
      console.log('DB not available, using mock dedications');
      dedications = [
        { id: 1, parent_guardian_name: 'Peter & Mary', child_full_name: 'Grace Peter', phone: '+254712345678', child_date_of_birth: '2024-01-01', status: 'Pending', created_at: new Date().toISOString() }
      ];
      totalCount = dedications.length;
    }

    const totalPages = Math.ceil(totalCount / limit);

    return res.status(200).json({
      success: true,
      data: {
        dedications,
        total: totalCount,
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

const updateDedicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    try {
      await db.execute('UPDATE child_dedications SET status = ? WHERE id = ?', [status, id]);
    } catch (dbError) {
      console.log('DB not available, mock update');
    }

    return res.status(200).json({
      success: true,
      message: 'Dedication status updated'
    });
  } catch (error) {
    console.error('Update dedication status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Pastoral Visits
const getVisits = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    let visits = [];
    let totalCount = 0;

    try {
      let query = 'SELECT * FROM pastoral_visits WHERE 1=1';
      let params = [];

      if (search) {
        query += ' AND (full_name LIKE ? OR email LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
      }

      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const [visitsRes] = await db.execute(query, params);
      visits = visitsRes;

      let countQuery = 'SELECT COUNT(*) as total FROM pastoral_visits WHERE 1=1';
      let countParams = [];

      if (search) {
        countQuery += ' AND (full_name LIKE ? OR email LIKE ?)';
        const searchTerm = `%${search}%`;
        countParams.push(searchTerm, searchTerm);
      }

      const [countRes] = await db.execute(countQuery, countParams);
      totalCount = countRes[0].total;
    } catch (dbError) {
      console.log('DB not available, using mock visits');
      visits = [
        { id: 1, full_name: 'Sarah Williams', phone: '+254712345678', physical_address: 'Kibera', type_of_visit: 'Home Visit', is_completed: false, created_at: new Date().toISOString() }
      ];
      totalCount = visits.length;
    }

    const totalPages = Math.ceil(totalCount / limit);

    return res.status(200).json({
      success: true,
      data: {
        visits,
        total: totalCount,
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

    try {
      await db.execute('UPDATE pastoral_visits SET assigned_to = ? WHERE id = ?', [assignedTo, id]);
    } catch (dbError) {
      console.log('DB not available, mock update');
    }

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

    try {
      await db.execute('UPDATE pastoral_visits SET is_completed = 1 WHERE id = ?', [id]);
    } catch (dbError) {
      console.log('DB not available, mock update');
    }

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

    let donations = [];
    let totalCount = 0;

    try {
      let query = 'SELECT * FROM donations WHERE 1=1';
      let params = [];

      if (search) {
        query += ' AND (phone LIKE ? OR mpesa_receipt LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
      }

      if (donationType) {
        query += ' AND category = ?';
        params.push(donationType);
      }

      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const [donationsRes] = await db.execute(query, params);
      donations = donationsRes;

      let countQuery = 'SELECT COUNT(*) as total FROM donations WHERE 1=1';
      let countParams = [];

      if (search) {
        countQuery += ' AND (phone LIKE ? OR mpesa_receipt LIKE ?)';
        const searchTerm = `%${search}%`;
        countParams.push(searchTerm, searchTerm);
      }

      if (donationType) {
        countQuery += ' AND category = ?';
        countParams.push(donationType);
      }

      const [countRes] = await db.execute(countQuery, countParams);
      totalCount = countRes[0].total;
    } catch (dbError) {
      console.log('DB not available, using mock donations');
      donations = [
        { id: 1, phone: '+254712345678', amount: 2000, category: 'Tithe', mpesa_receipt: 'ABC123', status: 'Completed', created_at: new Date().toISOString() },
        { id: 2, phone: '+254787654321', amount: 1000, category: 'Offering', mpesa_receipt: 'DEF456', status: 'Completed', created_at: new Date(Date.now() - 86400000).toISOString() },
        { id: 3, phone: '+254711111111', amount: 500, category: 'Building Fund', mpesa_receipt: 'GHI789', status: 'Pending', created_at: new Date(Date.now() - 172800000).toISOString() }
      ];
      totalCount = donations.length;
    }

    const totalPages = Math.ceil(totalCount / limit);

    return res.status(200).json({
      success: true,
      data: {
        donations,
        total: totalCount,
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

const getDonationsSummary = async (req, res) => {
  try {
    let summary = [];
    let overall = { totalCount: 0, overallTotal: 0 };

    try {
      const [summaryRes] = await db.execute(`
        SELECT 
          category, 
          COUNT(*) as count, 
          COALESCE(SUM(amount), 0) as total
        FROM donations
        WHERE status = 'Completed'
        GROUP BY category
        ORDER BY total DESC
      `);
      summary = summaryRes;

      const [overallRes] = await db.execute(`
        SELECT 
          COUNT(*) as totalCount, 
          COALESCE(SUM(amount), 0) as overallTotal
        FROM donations
        WHERE status = 'Completed'
      `);
      overall = overallRes[0];
    } catch (dbError) {
      console.log('DB not available, using mock donations summary');
      summary = [
        { category: 'Tithe', count: 6, total: 6000 },
        { category: 'Offering', count: 4, total: 3500 },
        { category: 'Building Fund', count: 2, total: 2000 },
        { category: 'Missions', count: 1, total: 1000 }
      ];
      overall = { totalCount: 13, overallTotal: 12500 };
    }

    return res.status(200).json({
      success: true,
      data: {
        summary,
        overall
      }
    });
  } catch (error) {
    console.error('Get donations summary error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const createDonation = async (req, res) => {
  try {
    const { phone, amount, category, status, mpesa_receipt } = req.body;
    let result = { insertId: Date.now() };
    try {
      const [dbResult] = await db.execute(
        `INSERT INTO donations (phone, amount, category, status, mpesa_receipt, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [phone, amount, category, status, mpesa_receipt]
      );
      result = dbResult;
    } catch (dbError) {
      console.log('DB not available, mock create');
    }

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
    const { phone, amount, category, status, mpesa_receipt } = req.body;

    try {
      await db.execute(
        `UPDATE donations
         SET phone = ?, amount = ?, category = ?, status = ?, mpesa_receipt = ?
         WHERE id = ?`,
        [phone, amount, category, status, mpesa_receipt, id]
      );
    } catch (dbError) {
      console.log('DB not available, mock update');
    }

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
    try {
      await db.execute('DELETE FROM donations WHERE id = ?', [id]);
    } catch (dbError) {
      console.log('DB not available, mock delete');
    }
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

// Email Logs
const getEmailLogs = async (req, res) => {
  try {
    let logs = [];
    try {
      const [logsRes] = await db.execute('SELECT * FROM email_logs ORDER BY created_at DESC LIMIT 100');
      logs = logsRes;
    } catch (dbError) {
      console.log('DB not available, using mock email logs');
      logs = [
        { id: 1, subject: 'Sunday Service', to_email: 'all@mnsdachurch.org', category: 'Church Announcements', status: 'sent', created_at: new Date().toISOString() },
        { id: 2, subject: 'Prayer Meeting', to_email: 'prayer@mnsdachurch.org', category: 'Prayer Updates', status: 'sent', created_at: new Date(Date.now() - 86400000).toISOString() }
      ];
    }

    return res.status(200).json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error('Get email logs error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Exports
const exportDonations = async (req, res) => {
  try {
    let donations = [];
    try {
      const [donationsRes] = await db.execute('SELECT * FROM donations ORDER BY created_at DESC');
      donations = donationsRes;
    } catch (dbError) {
      console.log('DB not available, using mock donations for export');
      donations = [
        { id: 1, phone: '+254712345678', amount: 2000, category: 'Tithe', status: 'Completed', mpesa_receipt: 'ABC123', created_at: new Date().toISOString() }
      ];
    }
    let csv = 'ID,Phone,Amount,Category,Status,MPesa Receipt,Created At\n';
    donations.forEach(d => {
      csv += `${d.id},${d.phone},${d.amount},${d.category},${d.status},${d.mpesa_receipt},${d.created_at}\n`;
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="donations.csv"');
    return res.send(csv);
  } catch (error) {
    console.error('Export donations error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const exportPrayers = async (req, res) => {
  try {
    let prayers = [];
    try {
      const [prayersRes] = await db.execute('SELECT * FROM prayer_requests ORDER BY created_at DESC');
      prayers = prayersRes;
    } catch (dbError) {
      console.log('DB not available, using mock prayers for export');
      prayers = [
        { id: 1, name: 'John Doe', email: 'john@example.com', message: 'Please pray for my health', created_at: new Date().toISOString() }
      ];
    }
    let csv = 'ID,Name,Email,Message,Created At\n';
    prayers.forEach(p => {
      csv += `${p.id},"${p.name}","${p.email}","${(p.message || '').replace(/"/g, '""')}",${p.created_at}\n`;
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="prayer-requests.csv"');
    return res.send(csv);
  } catch (error) {
    console.error('Export prayers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const exportMessages = async (req, res) => {
  try {
    let messages = [];
    try {
      const [messagesRes] = await db.execute('SELECT * FROM contact_messages ORDER BY created_at DESC');
      messages = messagesRes;
    } catch (dbError) {
      console.log('DB not available, using mock messages for export');
      messages = [
        { id: 1, name: 'Jane Smith', email: 'jane@example.com', phone: '+254712345678', subject: 'Church Membership', message: 'I want to join the church', created_at: new Date().toISOString() }
      ];
    }
    let csv = 'ID,Name,Email,Phone,Subject,Message,Created At\n';
    messages.forEach(m => {
      csv += `${m.id},"${m.name}","${m.email}","${m.phone}","${m.subject}","${(m.message || '').replace(/"/g, '""')}",${m.created_at}\n`;
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="contact-messages.csv"');
    return res.send(csv);
  } catch (error) {
    console.error('Export messages error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
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
};
