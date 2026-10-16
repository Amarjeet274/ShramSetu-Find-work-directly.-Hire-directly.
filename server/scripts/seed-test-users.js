require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const User = require('../src/models/User');
const WorkerProfile = require('../src/models/WorkerProfile');
const EmployerProfile = require('../src/models/EmployerProfile');

const USERS = [
  {
    phone: '9000000001',
    role: 'worker',
    language: 'hi',
    profile: {
      fullName: 'Rajan Kumar',
      skills: ['Delivery', 'Driver'],
      experienceYears: 5,
      availability: 'flexible',
      address: 'Koramangala, Bengaluru',
      location: { type: 'Point', coordinates: [77.6205, 12.9352] }, // Bengaluru
      rating: 4.8,
      totalReviews: 23,
      totalJobsCompleted: 7,
      totalEarnings: 58700,
      verification: { idVerified: true },
    },
  },
  {
    phone: '9000000002',
    role: 'employer',
    language: 'hi',
    profile: {
      businessName: 'QuickMart',
      contactName: 'Vikram Singh',
      description: 'Grocery delivery across Bengaluru',
      address: 'Koramangala, Bengaluru',
      location: { type: 'Point', coordinates: [77.6205, 12.9352] },
      rating: 4.7,
      totalReviews: 18,
      jobsPosted: 12,
      workersHired: 4,
      verification: { businessVerified: true },
    },
  },
  {
    phone: '9000000003',
    role: 'admin',
    language: 'en',
    profile: null,
  },
];

(async () => {
  await connectDB();

  for (const u of USERS) {
    const existing = await User.findOne({ phone: u.phone });

    let user;
    if (!existing) {
      user = await User.create({
        phone: u.phone,
        role: u.role,
        language: u.language,
        isVerified: true,
        verificationStatus: 'verified',
        status: 'active',
      });
      console.log(`✅ Created ${u.role}: ${u.phone}`);
    } else {
      // Force the correct state on every run — no more stale docs
      existing.role = u.role;
      existing.language = u.language;
      existing.isVerified = true;
      existing.verificationStatus = 'verified';
      existing.status = 'active';
      await existing.save();
      user = existing;
      console.log(`🔄 Updated ${u.role}: ${u.phone}`);
    }

    if (u.role === 'worker') {
      const exists = await WorkerProfile.findOne({ user: user._id });
      if (!exists) {
        await WorkerProfile.create({ user: user._id, ...u.profile });
        console.log('   ↳ Worker profile created');
      }
    }
    if (u.role === 'employer') {
      const exists = await EmployerProfile.findOne({ user: user._id });
      if (!exists) {
        await EmployerProfile.create({ user: user._id, ...u.profile });
        console.log('   ↳ Employer profile created');
      }
    }
  }

  console.log('\n🎉 Seed complete. Use these to log in from /dev-login:\n');
USERS.forEach((u) => console.log(`   ${u.role.padEnd(10)} → ${u.phone}`));

  await mongoose.disconnect();
  process.exit(0);
})();