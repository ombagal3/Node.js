const mongoose = require('mongoose');

let memoryServerInstance = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/secure_management_system';

  try {
    const conn = await mongoose.connect(uri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 2500, // Short timeout in dev to detect if local mongod is absent
    });
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn(`[MongoDB] Could not reach external MongoDB at ${uri}: ${error.message}`);
      console.log(`[MongoDB] Launching embedded MongoDB database for instant development...`);

      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        memoryServerInstance = await MongoMemoryServer.create();
        const memUri = memoryServerInstance.getUri();
        const conn = await mongoose.connect(memUri, { autoIndex: true });
        console.log(`[MongoDB] Embedded in-memory MongoDB initialized successfully!`);

        // Automatically populate seed data so the user can immediately evaluate
        const { seedData } = require('../scripts/seedAdmin');
        await seedData();

        return conn;
      } catch (memErr) {
        console.error(`[MongoDB] Failed to start embedded MongoDB: ${memErr.message}`);
        process.exit(1);
      }
    }
    throw error;
  }
};

module.exports = connectDB;
