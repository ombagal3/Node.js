require('dotenv').config();
const { MongoClient } = require('mongodb');

async function cleanAllData() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🧹 Bulletproof CRM — Database & Dummy Data Purge Script');
  console.log('═══════════════════════════════════════════════════════\n');

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || 'bulletproof_crm';

  if (!uri) {
    console.error('❌ Error: MONGODB_URI not found in .env');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    console.log(`🍃 Connecting to MongoDB Atlas: ${dbName}...`);
    await client.connect();
    const db = client.db(dbName);
    console.log('✅ Connected successfully!\n');

    const collections = [
      'leads',
      'calls',
      'proposals',
      'payments',
      'tasks',
      'meetings',
      'followups',
      'clients',
      'dead_leads',
      'activity_log',
      'meta_leads'
    ];

    console.log('🗑️  Purging old and dummy records from all MongoDB collections:');
    for (const colName of collections) {
      try {
        const col = db.collection(colName);
        const countBefore = await col.countDocuments();
        if (countBefore > 0) {
          await col.deleteMany({});
          console.log(`  ✓ [${colName}]: Deleted ${countBefore} documents (now 0)`);
        } else {
          console.log(`  ✓ [${colName}]: Already empty (0 documents)`);
        }
      } catch (colErr) {
        console.warn(`  ⚠️ [${colName}]:`, colErr.message);
      }
    }

    console.log('\n✅ ALL dummy and old data successfully purged from MongoDB Atlas!');
    console.log('👉 Next Steps:');
    console.log('   1. In your Google Sheet, delete any test rows (keep Row 1 headers).');
    console.log('   2. Start the server with: npm run dev');
    console.log('   3. Open the Dashboard in your browser and click "+ Add Lead" to enter your real data.');
    console.log('═══════════════════════════════════════════════════════\n');
  } catch (err) {
    console.error('❌ Failed to clean database:', err.message);
  } finally {
    await client.close();
  }
}

cleanAllData();
