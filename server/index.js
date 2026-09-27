const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { pool, ensureDatabaseExists, runSchema } = require('./db');
const { runSeed } = require('./seed');

const authRoute = require('./routes/auth');
const workersRoute = require('./routes/workers');
const customersRoute = require('./routes/customers');
const jobsRoute = require('./routes/jobs');
const kycRoute = require('./routes/kyc');
const analyticsRoute = require('./routes/analytics');
const configRoute = require('./routes/config');
const cooperativesRoute = require('./routes/cooperatives');
const matchingRoute = require('./routes/matching');
const aiRoute = require('./routes/ai');
const routingRoute = require('./routes/routing');
const notificationsRoute = require('./routes/notifications');
const paymentsRoute = require('./routes/payments');
const reviewsRoute = require('./routes/reviews');

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
// configRoute still owns GET /api/cooperatives (list) for backward
// compatibility with existing clients; cooperativesRoute adds the
// detail/create/update/roster endpoints that didn't exist before.
app.use('/api', configRoute);
app.use('/api/cooperatives', cooperativesRoute);
// Fair Matching / AI / Routing (Person 2 — matching-ai branch)
app.use('/api/matching', matchingRoute);
app.use('/api/ai', aiRoute);
app.use('/api/routing', routingRoute);
// Job lifecycle add-ons (Person 3 — services-booking branch)
app.use('/api/notifications', notificationsRoute);
app.use('/api/payments', paymentsRoute);
app.use('/api/reviews', reviewsRoute);

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

    // Always apply schema.sql (idempotent: CREATE TABLE IF NOT EXISTS /
    // ADD COLUMN IF NOT EXISTS throughout) so an already-seeded database
    // picks up new tables/columns without a manual migration step.
    try {
      await runSchema();
      console.log('✅ Schema verified/updated.');
    } catch (schemaErr) {
      console.log('Schema update note:', schemaErr.message);
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
