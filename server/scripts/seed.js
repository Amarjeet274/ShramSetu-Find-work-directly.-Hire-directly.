require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const User = require('../src/models/User');

(async () => {
  await connectDB();
  const phone = process.argv[2] || process.env.ADMIN_PHONE;
  if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
    console.error('Usage: node scripts/seed.js <10-digit-phone>');
    process.exit(1);
  }

  let user = await User.findOne({ phone });
  if (user) {
    user.role = 'admin';
    user.verificationStatus = 'verified';
    user.status = 'active';
    await user.save();
    console.log(`✅ Promoted existing user ${phone} to admin`);
  } else {
    await User.create({
      phone, role: 'admin', language: 'en',
      isVerified: true, verificationStatus: 'verified',
    });
    console.log(`✅ Created admin with phone ${phone}`);
  }
  await mongoose.disconnect();
  process.exit(0);
})();