const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');
require('dotenv').config();

const setupAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminEmail || !adminPassword) {
      throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required');
    }
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail, role: 'admin' });
    
    if (existingAdmin) {
      console.log('Admin account already exists');
      await mongoose.disconnect();
      return;
    }
    
    // Create admin user
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const adminUser = new User({
      username: 'System Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin'
    });
    
    await adminUser.save();
    console.log('Admin account created successfully');
    console.log(`Email: ${adminEmail}`);
    
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error setting up admin account:', err.message);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  setupAdmin();
}

module.exports = setupAdmin;