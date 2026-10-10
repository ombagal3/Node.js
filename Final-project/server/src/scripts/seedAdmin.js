require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Record = require('../models/Record');

const seedData = async () => {
  const adminName = process.env.ADMIN_NAME || 'System Administrator';
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@securemanagement.com').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@SecurePass2026!';

  console.log(`[Seed] Checking admin account: ${adminEmail}`);

  let admin = await User.findOne({ email: adminEmail });
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(adminPassword, salt);

  if (admin) {
    admin.name = adminName;
    admin.role = 'admin';
    admin.isActive = true;
    admin.passwordHash = passwordHash;
    await admin.save();
    console.log(`[Seed] Existing admin account updated successfully.`);
  } else {
    admin = await User.create({
      name: adminName,
      email: adminEmail,
      passwordHash,
      role: 'admin',
      isActive: true,
    });
    console.log(`[Seed] New admin account created successfully.`);
  }

  // Seed a standard demo user for easy evaluation
  const demoUserEmail = 'user@example.com';
  let demoUser = await User.findOne({ email: demoUserEmail });
  if (!demoUser) {
    const demoUserHash = await bcrypt.hash('User@123456', salt);
    demoUser = await User.create({
      name: 'Demo Standard User',
      email: demoUserEmail,
      passwordHash: demoUserHash,
      role: 'user',
      isActive: true,
    });
    console.log(`[Seed] Demo standard user created: ${demoUserEmail} (Password: User@123456)`);
  }

  // Seed sample records if database has no records
  const recordCount = await Record.countDocuments();
  if (recordCount === 0) {
    console.log('[Seed] Populating initial sample records...');
    await Record.create([
      {
        title: 'Quarterly Infrastructure Security Audit',
        description: 'Comprehensive evaluation of perimeter firewalls, VPC peering configurations, and database encryption at rest.',
        category: 'Security',
        status: 'Published',
        priority: 'High',
        visibility: 'All active users',
        assignedTo: [demoUser._id],
        createdBy: admin._id,
      },
      {
        title: 'Employee Data Privacy & Compliance Guidelines',
        description: 'Annual training checklist and regulatory requirements for handling confidential client metadata.',
        category: 'Compliance',
        status: 'Published',
        priority: 'Medium',
        visibility: 'All active users',
        assignedTo: [demoUser._id],
        createdBy: admin._id,
      },
      {
        title: 'API Gateway Rate Limiting & Throttling Policies',
        description: 'Technical specification for token bucket rate limit enforcement and DDoS mitigation strategies.',
        category: 'Engineering',
        status: 'Published',
        priority: 'High',
        visibility: 'Assigned users only',
        assignedTo: [demoUser._id],
        createdBy: admin._id,
      },
      {
        title: 'Internal Server Migration Blueprint (Confidential Draft)',
        description: 'Architectural documentation for cloud migration phases. Work in progress.',
        category: 'Operations',
        status: 'Draft',
        priority: 'Medium',
        visibility: 'Assigned users only',
        assignedTo: [],
        createdBy: admin._id,
      },
      {
        title: 'Personal Weekly Sprint Tasks',
        description: 'User-created task tracking for feature documentation and frontend component refactoring.',
        category: 'General',
        status: 'Published',
        priority: 'Low',
        visibility: 'Assigned users only',
        assignedTo: [demoUser._id],
        createdBy: demoUser._id,
      },
    ]);
    console.log('[Seed] Sample records created.');
  }

  console.log('==================================================');
  console.log(' SEED SUMMARY:');
  console.log(` Admin Credentials:`);
  console.log(`   Email:    ${adminEmail}`);
  console.log(`   Password: ${adminPassword}`);
  console.log(` Demo User Credentials:`);
  console.log(`   Email:    user@example.com`);
  console.log(`   Password: User@123456`);
  console.log('==================================================');

  return { admin, demoUser };
};

// If run directly from CLI
if (require.main === module) {
  (async () => {
    try {
      const mongoUri = process.env.MONGODB_URI;
      if (!mongoUri) {
        console.error('[Seed Error] MONGODB_URI environment variable is missing.');
        process.exit(1);
      }
      console.log('[Seed] Connecting to MongoDB...');
      await mongoose.connect(mongoUri);
      await seedData();
      await mongoose.disconnect();
      console.log('[Seed] Database disconnected cleanly.');
      process.exit(0);
    } catch (err) {
      console.error(`[Seed Error] ${err.message}`);
      process.exit(1);
    }
  })();
}

module.exports = { seedData };
