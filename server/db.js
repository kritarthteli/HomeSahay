const fs = require('fs');
const path = require('path');
const { Pool, Client } = require('pg');
require('dotenv').config();

// SECURITY: no hardcoded database password fallback. Configure
// server/.env (see .env.example) for every environment, including
// local dev. An empty fallback fails the connection loudly instead
// of silently succeeding against a shared/default credential.
if (!process.env.DB_PASSWORD) {
  console.warn(
    '⚠️  DB_PASSWORD is not set in the environment. Copy server/.env.example to server/.env and set it.'
  );
}

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
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

/**
 * Apply server/schema.sql idempotently. Every statement in schema.sql
 * uses CREATE TABLE IF NOT EXISTS / ADD COLUMN IF NOT EXISTS, so this
 * is safe to run on every boot -- it brings an already-seeded database
 * up to date with schema changes without requiring a manual migration
 * step or a full reseed.
 */
async function runSchema() {
  const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
  await pool.query('CREATE SCHEMA IF NOT EXISTS homesahay_app;');
  await pool.query('SET search_path TO homesahay_app, public;');
  await pool.query(schemaSql);
}

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
  ensureDatabaseExists,
  runSchema,
};
