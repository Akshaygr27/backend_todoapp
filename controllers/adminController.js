// controllers/adminController.js
const User = require('../models/userModel');
const Todo = require('../models/todoModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Admin login - Only pre-configured admin accounts can login
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Only allow users with admin role to login as admin
    const admin = await User.findOne({ email, role: 'admin' });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    if (!admin.isActive) {
      return res.status(401).json({ error: 'Admin account deactivated' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const token = jwt.sign(
      { 
        id: admin._id, 
        role: admin.role,
        email: admin.email 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Admin login successful',
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error during admin login' });
  }
};


// Admin User Report
exports.getUserReport = async (req, res) => {
  try {
    const { start, end, page = 1, limit = 10 } = req.query;

    let filter = {};

    // Date filtering if provided
    if (start || end) {
      filter.createdAt = {};
      if (start) filter.createdAt.$gte = new Date(start);
      if (end) {
        // include full end date
        let endDate = new Date(end);
        endDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDate;
      }
    }

    // Pagination values
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Total count (before pagination)
    const totalUsers = await User.countDocuments(filter);

    // Paginated result
    const users = await User.find(filter)
      .select('username email createdAt role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      totalUsers,
      page: pageNum,
      totalPages: Math.ceil(totalUsers / limitNum),
      count: users.length,
      users
    });
  } catch (err) {
    console.error('Error fetching user report:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user report'
    });
  }
};
