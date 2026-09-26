const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { pool, ensureDatabaseExists } = require('./db');
const { runSeed } = require('./seed');

const authRoute = require('./routes/auth');
const workersRoute = require('./routes/workers');
const customersRoute = require('./routes/customers');
const jobsRoute = require('./routes/jobs');
const kycRoute = require('./routes/kyc');
const analyticsRoute = require('./routes/analytics');
const configRoute = require('./routes/config');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
app.use('/api/auth', authRoute);
app.use('/api/workers', workersRoute);
app.use('/api/customers', customersRoute);
app.use('/api/jobs', jobsRoute);
app.use('/api/kyc', kycRoute);
app.use('/api/analytics', analyticsRoute);
app.use('/api', configRoute);

// Root Healthcheck
app.get('/api/health', async (req, res) => {
  try {
    const dbTest = await pool.query('SELECT NOW() as current_time, current_database() as database;');
    res.json({
      status: 'online',
      service: 'HomeSahay PostgreSQL Backend API',
      database: dbTest.rows[0].database,
      dbTime: dbTest.rows[0].current_time,
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Start Server & Auto-seed if needed
async function startServer() {
  try {
    console.log('Checking database connection...');
    await ensureDatabaseExists();

    // Auto-migrate: ensure password_hash column exists for JWT auth
    try {
      await pool.query(`ALTER TABLE customers ADD COLUMN IF NOT EXISTS password_hash TEXT;`);
      console.log('✅ password_hash column verified on customers table.');
    } catch (migErr) {
      console.log('Migration note:', migErr.message);
    }

    // Check if workers table has records
    const checkWorkers = await pool.query(
      `SELECT to_regclass('homesahay_app.workers') as exists;`
    );
    if (!checkWorkers.rows[0].exists) {
      console.log('Database tables not found. Running initial seed...');
      await runSeed();
    } else {
      const countRes = await pool.query('SELECT COUNT(*) FROM workers;');
      if (parseInt(countRes.rows[0].count, 10) === 0) {
        console.log('Workers table empty. Running seed...');
        await runSeed();
      } else {
        console.log(`PostgreSQL connected. ${countRes.rows[0].count} workers ready in database.`);
      }
    }

    app.listen(PORT, () => {
      console.log(`🚀 HomeSahay PostgreSQL Backend running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
}

startServer();
