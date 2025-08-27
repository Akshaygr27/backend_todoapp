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