const mongoose = require('mongoose');

let mongod = null;

/**
 * Connect to MongoDB.
 * Supports explicit MONGODB_URI (e.g. MongoDB Atlas, local daemon),
 * or falls back gracefully to in-memory MongoDB in development.
 */
async function connectDB() {
  let uri = process.env.MONGODB_URI;

  if (!uri || uri.trim() === '') {
    try {
      console.log('No MONGODB_URI provided in environment. Initializing development in-memory MongoDB...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create();
      uri = mongod.getUri();
      console.log(`In-memory MongoDB instance started at: ${uri}`);
    } catch (err) {
      console.warn('Could not start MongoMemoryServer, falling back to default local mongodb://127.0.0.1:27017/ecommerce', err.message);
      uri = 'mongodb://127.0.0.1:27017/ecommerce';
    }
  }

  try {
    const conn = await mongoose.connect(uri, {
      autoIndex: true
    });
    console.log(`MongoDB Connected: ${conn.connection.host} / Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // If local connection failed and we haven't tried memory server yet:
    if (!mongod && process.env.NODE_ENV !== 'production') {
      try {
        console.log('Attempting fallback to in-memory MongoDB for local development...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongod = await MongoMemoryServer.create();
        const memUri = mongod.getUri();
        const conn = await mongoose.connect(memUri);
        console.log(`Fallback in-memory MongoDB connected: ${memUri}`);
        return conn;
      } catch (memErr) {
        console.error('Failed to initialize in-memory fallback:', memErr.message);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
}

/**
 * Disconnect MongoDB
 */
async function disconnectDB() {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
}

module.exports = { connectDB, disconnectDB };
