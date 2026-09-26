const { Pool, Client } = require('pg');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Klath@2902',
};

const targetDb = process.env.DB_NAME || 'homesahay';

// Function to guarantee the database exists before initializing pool
async function ensureDatabaseExists() {
  const adminClient = new Client({
    ...dbConfig,
    database: 'postgres',
  });

  try {
    await adminClient.connect();
    const res = await adminClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1;`,
      [targetDb]
    );
    if (res.rowCount === 0) {
      console.log(`Database "${targetDb}" does not exist. Creating it...`);
      await adminClient.query(`CREATE DATABASE "${targetDb}";`);
      console.log(`Database "${targetDb}" created successfully.`);
    } else {
      console.log(`Database "${targetDb}" already exists.`);
    }
  } catch (err) {
    console.error('Error verifying database existence:', err.message);
  } finally {
    await adminClient.end();
  }
}

const pool = new Pool({
  ...dbConfig,
  database: targetDb,
  options: '-c search_path=homesahay_app,public',
});

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
  ensureDatabaseExists,
};
