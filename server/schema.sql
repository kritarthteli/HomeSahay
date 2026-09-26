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
