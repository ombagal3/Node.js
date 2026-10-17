require('dotenv').config();
const http = require('http');
const app = require('./app');
const { connectDB } = require('./config/db');
const Product = require('./models/Product');
const { seedDatabase } = require('./scripts/seed');

const PORT = parseInt(process.env.PORT || '5000', 10);
let server = null;
let retryCount = 0;
const MAX_RETRIES = 5;

function listenWithRetry(serverInstance, port) {
  serverInstance.once('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      if (retryCount < MAX_RETRIES) {
        retryCount++;
        console.warn(`[Server] Port ${port} is currently busy or recycling. Retrying in 1.5s (Attempt ${retryCount}/${MAX_RETRIES})...`);
        setTimeout(() => {
          serverInstance.close();
          const newServer = http.createServer(app);
          listenWithRetry(newServer, port);
        }, 1500);
      } else {
        console.error(`[Server Error] Port ${port} is already in use by another running process.`);
        console.error(`Please close any existing terminal running nodemon or free port ${port}.`);
        process.exit(1);
      }
    } else {
      console.error('[Server Error]', err.message);
      process.exit(1);
    }
  });

  serverInstance.listen(port, '0.0.0.0', () => {
    retryCount = 0;
    console.log(`===============================================`);
    console.log(`  E-Commerce API Server Running                `);
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`  Listening on: http://localhost:${port}        `);
    console.log(`  API Health:   http://localhost:${port}/api/health`);
    console.log(`===============================================`);
  });
}

async function startServer() {
  try {
    // Connect to database
    await connectDB();

    // In development mode, check if database is empty and auto-seed if needed
    if (process.env.NODE_ENV !== 'production') {
      const productCount = await Product.countDocuments();
      if (productCount === 0) {
        console.log('Database contains 0 products. Auto-seeding initial development catalog...');
        await seedDatabase();
      }
    }

    server = http.createServer(app);
    listenWithRetry(server, PORT);

    // Graceful error handling
    process.on('unhandledRejection', (err) => {
      console.error('Unhandled Rejection Error:', err.message);
    });

    process.on('uncaughtException', (err) => {
      if (err.code !== 'EADDRINUSE') {
        console.error('Uncaught Exception Error:', err.message);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
