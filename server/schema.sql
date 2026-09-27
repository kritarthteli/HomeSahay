-- Enable PostGIS if available (optional for GIS geometry operations)
DO $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS postgis;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'PostGIS extension not enabled or not available, proceeding with numeric coordinates.';
END $$;

CREATE SCHEMA IF NOT EXISTS homesahay_app;
SET search_path TO homesahay_app, public;

-- 1. Cooperatives
CREATE TABLE IF NOT EXISTS cooperatives (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    area VARCHAR(100) NOT NULL,
    city VARCHAR(100) DEFAULT 'Bengaluru',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Service Categories
CREATE TABLE IF NOT EXISTS service_categories (
    id VARCHAR(50) PRIMARY KEY,
    label VARCHAR(100) NOT NULL,
    icon VARCHAR(50) NOT NULL,
    color VARCHAR(20) NOT NULL,
    description TEXT
);

-- 3. Customers
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(30) UNIQUE NOT NULL,
    email VARCHAR(150),
    avatar_url TEXT,
    gender VARCHAR(20),
    rating NUMERIC(3, 2) DEFAULT 5.0,
    total_orders INTEGER DEFAULT 0,
    sahay_cash NUMERIC(10, 2) DEFAULT 0.00,
    latitude NUMERIC(9, 6),
    longitude NUMERIC(9, 6),
    primary_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Customer Addresses
CREATE TABLE IF NOT EXISTS customer_addresses (
    id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50) REFERENCES customers(id) ON DELETE CASCADE,
    label VARCHAR(50) DEFAULT 'home',
    address TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE
);

-- 5. Workers
CREATE TABLE IF NOT EXISTS workers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    avatar_url TEXT,
    category_id VARCHAR(50) REFERENCES service_categories(id),
    cooperative_id VARCHAR(100) REFERENCES cooperatives(id),
    rating NUMERIC(3, 2) DEFAULT 0.0,
    total_jobs INTEGER DEFAULT 0,
    today_jobs INTEGER DEFAULT 0,
    today_earnings NUMERIC(10, 2) DEFAULT 0.00,
    is_verified BOOLEAN DEFAULT FALSE,
    is_online BOOLEAN DEFAULT FALSE,
    latitude NUMERIC(9, 6),
    longitude NUMERIC(9, 6),
    distance_km NUMERIC(5, 2),
    eta_minutes INTEGER,
    years_experience INTEGER DEFAULT 0,
    price_per_hour NUMERIC(10, 2) NOT NULL,
    kyc_status VARCHAR(20) DEFAULT 'pending',
    weekly_jobs INTEGER[] DEFAULT '{0,0,0,0,0,0,0}',
    phone VARCHAR(30),
    email VARCHAR(150),
    service_area TEXT,
    availability VARCHAR(50) DEFAULT 'Flexible',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Worker Skills & Languages
CREATE TABLE IF NOT EXISTS worker_skills (
    worker_id VARCHAR(50) REFERENCES workers(id) ON DELETE CASCADE,
    skill VARCHAR(100) NOT NULL,
    PRIMARY KEY (worker_id, skill)
);

CREATE TABLE IF NOT EXISTS worker_languages (
    worker_id VARCHAR(50) REFERENCES workers(id) ON DELETE CASCADE,
    language VARCHAR(50) NOT NULL,
    PRIMARY KEY (worker_id, language)
);

-- 7. Jobs / Bookings
CREATE TABLE IF NOT EXISTS jobs (
    id VARCHAR(50) PRIMARY KEY,
    worker_id VARCHAR(50) REFERENCES workers(id),
    customer_id VARCHAR(50) REFERENCES customers(id),
    category_id VARCHAR(50) REFERENCES service_categories(id),
    amount NUMERIC(10, 2) NOT NULL,
    labor_cost NUMERIC(10, 2),
    convenience_fee NUMERIC(10, 2),
    cooperative_levy NUMERIC(10, 2),
    status VARCHAR(30) DEFAULT 'completed',
    urgency VARCHAR(20) DEFAULT 'normal',
    job_date DATE DEFAULT CURRENT_DATE,
    job_time VARCHAR(20),
    customer_rating INTEGER,
    customer_review TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. KYC Queue
CREATE TABLE IF NOT EXISTS kyc_applications (
    id VARCHAR(50) PRIMARY KEY,
    worker_id VARCHAR(50) REFERENCES workers(id),
    status VARCHAR(20) DEFAULT 'pending',
    cooperative_id VARCHAR(100) REFERENCES cooperatives(id),
    phone VARCHAR(30),
    notes TEXT,
    aadhar_uploaded BOOLEAN DEFAULT FALSE,
    aadhar_verified BOOLEAN DEFAULT FALSE,
    skill_cert_uploaded BOOLEAN DEFAULT FALSE,
    skill_cert_verified BOOLEAN DEFAULT FALSE,
    address_proof_uploaded BOOLEAN DEFAULT FALSE,
    address_proof_verified BOOLEAN DEFAULT FALSE,
    photo_uploaded BOOLEAN DEFAULT FALSE,
    photo_verified BOOLEAN DEFAULT FALSE,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP WITH TIME ZONE
);

-- 9. Ranking Weights
CREATE TABLE IF NOT EXISTS ranking_weights (
    id SERIAL PRIMARY KEY,
    skill_match NUMERIC(3, 2) DEFAULT 0.35,
    distance NUMERIC(3, 2) DEFAULT 0.25,
    rating NUMERIC(3, 2) DEFAULT 0.20,
    fairness_penalty NUMERIC(3, 2) DEFAULT 0.20,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================
-- BACKEND-CORE ADDITIONS (auth, RBAC, cooperative membership, KYC
-- lifecycle, worker availability, skills catalog). Everything below
-- is additive and idempotent so it is safe to re-run against an
-- already-seeded database -- see db.js:runSchema().
-- =================================================================

-- Auth: workers can now have their own login, same as customers.
ALTER TABLE workers ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- A worker's phone/email should be unique when present, but many
-- legacy/demo rows have no email, so we allow multiple NULLs via a
-- partial unique index rather than a plain UNIQUE column constraint.
CREATE UNIQUE INDEX IF NOT EXISTS uq_workers_phone ON workers (phone) WHERE phone IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_workers_email ON workers (email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_customers_email ON customers (email) WHERE email IS NOT NULL;

-- 10. Platform Admins — PLATFORM_ADMIN role, full-system access.
CREATE TABLE IF NOT EXISTS platform_admins (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(30) UNIQUE,
    email VARCHAR(150) UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Cooperative Members — accounts that administer a cooperative
-- (COOPERATIVE_ADMIN role). A member can optionally be linked to an
-- existing worker row (worker_id); a worker's day-to-day roster
-- membership is still represented by workers.cooperative_id — this
-- table is specifically for people who can log in and manage a
-- cooperative (admins), plus a generic membership record if needed.
CREATE TABLE IF NOT EXISTS cooperative_members (
    id VARCHAR(50) PRIMARY KEY,
    cooperative_id VARCHAR(100) NOT NULL REFERENCES cooperatives(id) ON DELETE CASCADE,
    worker_id VARCHAR(50) REFERENCES workers(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'ADMIN' CHECK (role IN ('ADMIN', 'WORKER')),
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(30),
    email VARCHAR(150),
    password_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- A given worker should only hold one membership record per cooperative.
CREATE UNIQUE INDEX IF NOT EXISTS uq_coop_member_worker
    ON cooperative_members (cooperative_id, worker_id) WHERE worker_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_coop_admin_phone ON cooperative_members (phone) WHERE phone IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_coop_admin_email ON cooperative_members (email) WHERE email IS NOT NULL;

-- 12. Skills catalog — canonical list of skills, distinct from the
-- free-text worker_skills join table so skills can be validated,
-- reused, and (later) categorized/searched consistently.
CREATE TABLE IF NOT EXISTS skills (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    category_id VARCHAR(50) REFERENCES service_categories(id)
);

-- Optional link from a worker's skill tag to the catalog entry. Kept
-- nullable and additive: existing code reads worker_skills.skill as
-- free text and continues to work unchanged.
ALTER TABLE worker_skills ADD COLUMN IF NOT EXISTS skill_id VARCHAR(100) REFERENCES skills(id);

-- 13. Worker Availability — base structure only (day-of-week / time
-- window slots). The actual scheduling and matching logic that reads
-- this belongs to the Fair Matching Engine (Person 2), not here.
CREATE TABLE IF NOT EXISTS worker_availability (
    id VARCHAR(50) PRIMARY KEY,
    worker_id VARCHAR(50) NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday .. 6=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CHECK (end_time > start_time)
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_worker_availability_slot
    ON worker_availability (worker_id, day_of_week, start_time);

-- KYC lifecycle: record who reviewed an application and why it was
-- rejected, in addition to the existing pending/approved/rejected status.
ALTER TABLE kyc_applications ADD COLUMN IF NOT EXISTS reviewer_id VARCHAR(50);
ALTER TABLE kyc_applications ADD COLUMN IF NOT EXISTS reviewer_type VARCHAR(20);
ALTER TABLE kyc_applications ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Indexes for the query patterns backend-core actually runs
-- (worker lookups by cooperative/category, jobs by worker/customer,
-- pending KYC queues, cooperative admin rosters).
CREATE INDEX IF NOT EXISTS idx_workers_cooperative_id ON workers (cooperative_id);
CREATE INDEX IF NOT EXISTS idx_workers_category_id ON workers (category_id);
CREATE INDEX IF NOT EXISTS idx_workers_kyc_status ON workers (kyc_status);
CREATE INDEX IF NOT EXISTS idx_jobs_worker_id ON jobs (worker_id);
CREATE INDEX IF NOT EXISTS idx_jobs_customer_id ON jobs (customer_id);
CREATE INDEX IF NOT EXISTS idx_kyc_worker_id ON kyc_applications (worker_id);
CREATE INDEX IF NOT EXISTS idx_kyc_status ON kyc_applications (status);
CREATE INDEX IF NOT EXISTS idx_kyc_cooperative_id ON kyc_applications (cooperative_id);
CREATE INDEX IF NOT EXISTS idx_cooperative_members_cooperative_id ON cooperative_members (cooperative_id);
CREATE INDEX IF NOT EXISTS idx_worker_availability_worker_id ON worker_availability (worker_id);
CREATE INDEX IF NOT EXISTS idx_customer_addresses_customer_id ON customer_addresses (customer_id);
CREATE INDEX IF NOT EXISTS idx_worker_skills_skill ON worker_skills (skill);

-- =================================================================
-- SERVICES-BOOKING ADDITIONS (Person 3): notifications and demo
-- payments. Additive and idempotent, same as the block above --
-- CREATE TABLE IF NOT EXISTS / CREATE INDEX IF NOT EXISTS throughout
-- so this is safe to re-run against an already-seeded database (see
-- db.js:runSchema()). Job status lifecycle and reviews reuse the
-- existing `jobs` table (jobs.status, jobs.customer_rating,
-- jobs.customer_review) and do NOT need new tables/columns.
-- =================================================================

-- 14. Notifications — simple in-app/database notifications for
-- customers and workers. No push notifications; the client polls
-- GET /api/notifications.
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('customer', 'worker')),
    job_id VARCHAR(50) REFERENCES jobs(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications (user_id, user_type);
CREATE INDEX IF NOT EXISTS idx_notifications_job_id ON notifications (job_id);

-- 15. Payments — SAFE DEMO/TEST payments only. is_demo is always TRUE;
-- no real payment gateway is integrated. One row per attempt so a
-- failed/expired attempt can be retried without losing history.
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(50) PRIMARY KEY,
    job_id VARCHAR(50) NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    customer_id VARCHAR(50) REFERENCES customers(id),
    amount NUMERIC(10, 2) NOT NULL,
    method VARCHAR(30) DEFAULT 'demo_upi',
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED')),
    is_demo BOOLEAN NOT NULL DEFAULT TRUE,
    demo_reference VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP WITH TIME ZONE
);
CREATE INDEX IF NOT EXISTS idx_payments_job_id ON payments (job_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments (customer_id);
