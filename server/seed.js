const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { pool, ensureDatabaseExists } = require('./db');

// Demo passwords for seeded accounts (hashed before insert, never stored
// or logged in plaintext). These are for local/demo/eval use only.
const SEED_ADMIN_PASSWORD = 'admin123';
const SEED_COOP_ADMIN_PASSWORD = 'coopadmin123';
const SEED_WORKER_PASSWORD = 'worker123';

const SEED_CATEGORIES = [
  { id: 'plumber', label: 'Plumber', icon: 'water', color: '#3B82F6', description: 'Pipe repair, leakage, sanitary installation' },
  { id: 'electrician', label: 'Electrician', icon: 'flash', color: '#F59E0B', description: 'Wiring, appliances, switches, fans' },
  { id: 'cleaner', label: 'Cleaner', icon: 'sparkles', color: '#22C55E', description: 'Deep home cleaning, sofa, carpet' },
  { id: 'cook', label: 'Cook', icon: 'restaurant', color: '#EF4444', description: 'Daily meal prep, regional cuisines, catering' },
  { id: 'carpenter', label: 'Carpenter', icon: 'construct', color: '#8B5CF6', description: 'Furniture repair, woodwork, cabinets' },
  { id: 'painter', label: 'Painter', icon: 'color-palette', color: '#06B6D4', description: 'Interior and exterior painting' },
  { id: 'caregiver', label: 'Caregiver', icon: 'heart', color: '#EC4899', description: 'Elder care and patient assistance' },
  { id: 'technician', label: 'Technician', icon: 'hardware-chip', color: '#6366F1', description: 'Electronics, AC, appliance repairs' },
  { id: 'driver', label: 'Driver', icon: 'car', color: '#0EA5E9', description: 'Personal driving, deliveries, errands' },
  { id: 'gardener', label: 'Gardener', icon: 'leaf', color: '#65A30D', description: 'Lawn care, landscaping, plant maintenance' },
];

const SEED_COOPERATIVES = [
  { id: 'coop_jp_nagar', name: 'JP Nagar Workers Cooperative', area: 'JP Nagar', city: 'Bengaluru' },
  { id: 'coop_south_blr', name: 'South Bangalore Women Cooperative', area: 'South Bangalore', city: 'Bengaluru' },
  { id: 'coop_jayanagar', name: 'Jayanagar Artisans Guild', area: 'Jayanagar', city: 'Bengaluru' },
];

const SEED_CUSTOMERS = [
  {
    id: 'c001',
    name: 'Deepa Sharma',
    avatar_url: 'https://i.pravatar.cc/150?img=48',
    latitude: 12.9416,
    longitude: 77.5661,
    primary_address: '42, 7th Cross, JP Nagar 3rd Phase, Bengaluru',
    phone: '+91 99887 76655',
    email: 'deepa.sharma@example.com',
    gender: 'Female',
    rating: 4.9,
    total_orders: 34,
    sahay_cash: 500,
    saved_addresses: [
      { id: 'a1', label: 'home', address: '42, 7th Cross, JP Nagar 3rd Phase, Bengaluru', is_default: true },
    ],
  },
  {
    id: 'c002',
    name: 'Arjun Mehta',
    avatar_url: 'https://i.pravatar.cc/150?img=12',
    latitude: 12.9480,
    longitude: 77.5630,
    primary_address: '15, 12th Main, JP Nagar 6th Phase, Bengaluru',
    phone: '+91 88776 65544',
    email: 'arjun.mehta@example.com',
    gender: 'Male',
    rating: 4.7,
    total_orders: 18,
    sahay_cash: 120,
    saved_addresses: [
      { id: 'a2', label: 'home', address: '15, 12th Main, JP Nagar 6th Phase, Bengaluru', is_default: true },
    ],
  },
  {
    id: 'c003',
    name: 'Kavitha Reddy',
    avatar_url: 'https://i.pravatar.cc/150?img=49',
    latitude: 12.9350,
    longitude: 77.5680,
    primary_address: '8, 3rd Block, Jayanagar, Bengaluru',
    phone: '+91 77665 54433',
    email: 'kavitha.reddy@example.com',
    gender: 'Female',
    rating: 4.8,
    total_orders: 52,
    sahay_cash: 0,
    saved_addresses: [
      { id: 'a3', label: 'home', address: '8, 3rd Block, Jayanagar, Bengaluru', is_default: true },
    ],
  },
];

const SEED_WORKERS = [
  {
    id: 'w001',
    name: 'Rajan Kumar',
    avatar_url: 'https://i.pravatar.cc/150?img=11',
    category_id: 'plumber',
    cooperative_name: 'JP Nagar Workers Cooperative',
    cooperative_id: 'coop_jp_nagar',
    skills: ['plumber', 'pipe_repair', 'drainage'],
    rating: 4.8,
    total_jobs: 312,
    today_jobs: 2,
    today_earnings: 850,
    is_verified: true,
    is_online: true,
    latitude: 12.9388,
    longitude: 77.5710,
    distance_km: 0.4,
    eta_minutes: 8,
    years_experience: 7,
    languages: ['Kannada', 'Hindi', 'English'],
    price_per_hour: 350,
    kyc_status: 'approved',
    weekly_jobs: [4, 5, 3, 6, 2, 4, 2],
    phone: '+91 98765 11111',
    email: 'rajan.kumar@homesahay.org',
  },
  {
    id: 'w002',
    name: 'Meenakshi Devi',
    avatar_url: 'https://i.pravatar.cc/150?img=47',
    category_id: 'electrician',
    cooperative_name: 'South Bangalore Women Cooperative',
    cooperative_id: 'coop_south_blr',
    skills: ['electrician', 'wiring', 'appliance_repair', 'fan_installation'],
    rating: 4.9,
    total_jobs: 428,
    today_jobs: 5,
    today_earnings: 2200,
    is_verified: true,
    is_online: true,
    latitude: 12.9460,
    longitude: 77.5590,
    distance_km: 0.6,
    eta_minutes: 12,
    years_experience: 11,
    languages: ['Kannada', 'Tamil', 'English'],
    price_per_hour: 400,
    kyc_status: 'approved',
    weekly_jobs: [8, 7, 9, 8, 6, 8, 5],
    phone: '+91 98765 22222',
    email: 'meenakshi.devi@homesahay.org',
  },
  {
    id: 'w003',
    name: 'Suresh Babu',
    avatar_url: 'https://i.pravatar.cc/150?img=33',
    category_id: 'cleaner',
    cooperative_name: 'JP Nagar Workers Cooperative',
    cooperative_id: 'coop_jp_nagar',
    skills: ['cleaner', 'deep_cleaning', 'carpet_cleaning', 'sofa_cleaning'],
    rating: 4.5,
    total_jobs: 187,
    today_jobs: 1,
    today_earnings: 400,
    is_verified: true,
    is_online: false,
    latitude: 12.9370,
    longitude: 77.5640,
    distance_km: 0.5,
    eta_minutes: 10,
    years_experience: 3,
    languages: ['Kannada', 'Telugu'],
    price_per_hour: 280,
    kyc_status: 'approved',
    weekly_jobs: [2, 3, 1, 2, 2, 1, 1],
    phone: '+91 98765 33333',
    email: 'suresh.babu@homesahay.org',
  },
  {
    id: 'w004',
    name: 'Anitha Krishnamurthy',
    avatar_url: 'https://i.pravatar.cc/150?img=44',
    category_id: 'cook',
    cooperative_name: 'South Bangalore Women Cooperative',
    cooperative_id: 'coop_south_blr',
    skills: ['cook', 'south_indian', 'north_indian', 'catering'],
    rating: 4.7,
    total_jobs: 256,
    today_jobs: 3,
    today_earnings: 1050,
    is_verified: true,
    is_online: true,
    latitude: 12.9440,
    longitude: 77.5700,
    distance_km: 0.4,
    eta_minutes: 9,
    years_experience: 6,
    languages: ['Kannada', 'Hindi', 'Telugu', 'English'],
    price_per_hour: 320,
    kyc_status: 'approved',
    weekly_jobs: [5, 4, 6, 5, 3, 5, 3],
    phone: '+91 98765 44444',
    email: 'anitha.k@homesahay.org',
  },
  {
    id: 'w005',
    name: 'Vijay Shankar',
    avatar_url: 'https://i.pravatar.cc/150?img=15',
    category_id: 'carpenter',
    cooperative_name: 'JP Nagar Workers Cooperative',
    cooperative_id: 'coop_jp_nagar',
    skills: ['carpenter', 'furniture_repair', 'door_fitting', 'cabinet_making'],
    rating: 4.6,
    total_jobs: 143,
    today_jobs: 0,
    today_earnings: 0,
    is_verified: false,
    is_online: false,
    latitude: 12.9350,
    longitude: 77.5720,
    distance_km: 0.9,
    eta_minutes: 18,
    years_experience: 9,
    languages: ['Kannada', 'Hindi'],
    price_per_hour: 450,
    kyc_status: 'pending',
    weekly_jobs: [1, 0, 1, 2, 0, 0, 0],
    phone: '+91 98765 43210',
    email: 'vijay.shankar@homesahay.org',
  },
  {
    id: 'w006',
    name: 'Priya Nair',
    avatar_url: 'https://i.pravatar.cc/150?img=56',
    category_id: 'cleaner',
    cooperative_name: 'South Bangalore Women Cooperative',
    cooperative_id: 'coop_south_blr',
    skills: ['cleaner', 'housekeeping', 'laundry'],
    rating: 4.7,
    total_jobs: 94,
    today_jobs: 0,
    today_earnings: 0,
    is_verified: false,
    is_online: false,
    latitude: 12.9400,
    longitude: 77.5610,
    distance_km: 0.7,
    eta_minutes: 14,
    years_experience: 4,
    languages: ['Malayalam', 'Kannada', 'English'],
    price_per_hour: 300,
    kyc_status: 'pending',
    weekly_jobs: [0, 1, 2, 1, 1, 0, 0],
    phone: '+91 87654 32109',
    email: 'priya.nair@homesahay.org',
  },
];

const SEED_KYC = [
  {
    id: 'kyc001',
    worker_id: 'w005',
    cooperative_id: 'coop_jp_nagar',
    status: 'pending',
    phone: '+91 98765 43210',
    notes: 'Has 9 years experience, references from 3 clients provided.',
    aadhar_uploaded: true,
    aadhar_verified: false,
    skill_cert_uploaded: true,
    skill_cert_verified: false,
    address_proof_uploaded: true,
    address_proof_verified: false,
    photo_uploaded: true,
    photo_verified: false,
    submitted_at: '2026-09-18T10:30:00Z',
  },
  {
    id: 'kyc002',
    worker_id: 'w006',
    cooperative_id: 'coop_south_blr',
    status: 'pending',
    phone: '+91 87654 32109',
    notes: 'Skill certificate pending — says will upload by tomorrow.',
    aadhar_uploaded: true,
    aadhar_verified: false,
    skill_cert_uploaded: false,
    skill_cert_verified: false,
    address_proof_uploaded: true,
    address_proof_verified: false,
    photo_uploaded: true,
    photo_verified: false,
    submitted_at: '2026-09-19T08:15:00Z',
  },
];

// One PLATFORM_ADMIN account, for testing POST /api/auth/admin/login end
// to end. password_hash is filled in at seed time (see runSeed below).
const SEED_PLATFORM_ADMINS = [
  { id: 'padmin001', name: 'HomeSahay Platform Admin', phone: '+91 90000 00001', email: 'admin@homesahay.org' },
];

// One COOPERATIVE_ADMIN member per seeded cooperative, for testing
// POST /api/auth/cooperative-admin/login end to end. Not linked to an
// existing worker row (worker_id left null) -- these are standalone
// admin accounts, distinct from the workers who happen to belong to
// the same cooperative.
const SEED_COOPERATIVE_ADMINS = [
  { id: 'cadmin_jp_nagar', cooperative_id: 'coop_jp_nagar', name: 'JP Nagar Cooperative Admin', phone: '+91 90000 00011', email: 'admin.jpnagar@homesahay.org' },
  { id: 'cadmin_south_blr', cooperative_id: 'coop_south_blr', name: 'South Bangalore Cooperative Admin', phone: '+91 90000 00012', email: 'admin.southblr@homesahay.org' },
  { id: 'cadmin_jayanagar', cooperative_id: 'coop_jayanagar', name: 'Jayanagar Cooperative Admin', phone: '+91 90000 00013', email: 'admin.jayanagar@homesahay.org' },
];

// A couple of simple Mon-Fri availability slots, just to prove the
// schema/endpoints work -- no real scheduling logic (that's Person 2's).
const SEED_WORKER_AVAILABILITY = [
  { id: 'wa_w001_mon', worker_id: 'w001', day_of_week: 1, start_time: '09:00', end_time: '17:00' },
  { id: 'wa_w001_tue', worker_id: 'w001', day_of_week: 2, start_time: '09:00', end_time: '17:00' },
  { id: 'wa_w001_wed', worker_id: 'w001', day_of_week: 3, start_time: '09:00', end_time: '17:00' },
  { id: 'wa_w001_thu', worker_id: 'w001', day_of_week: 4, start_time: '09:00', end_time: '17:00' },
  { id: 'wa_w001_fri', worker_id: 'w001', day_of_week: 5, start_time: '09:00', end_time: '17:00' },
  { id: 'wa_w002_mon', worker_id: 'w002', day_of_week: 1, start_time: '10:00', end_time: '18:00' },
  { id: 'wa_w002_wed', worker_id: 'w002', day_of_week: 3, start_time: '10:00', end_time: '18:00' },
  { id: 'wa_w002_fri', worker_id: 'w002', day_of_week: 5, start_time: '10:00', end_time: '18:00' },
];

const SEED_JOBS = [
  { id: 'j001', worker_id: 'w001', customer_id: 'c001', category_id: 'plumber',     amount: 450, status: 'completed', job_date: '2026-09-19', job_time: '09:30' },
  { id: 'j002', worker_id: 'w002', customer_id: 'c002', category_id: 'electrician', amount: 600, status: 'completed', job_date: '2026-09-19', job_time: '10:00' },
  { id: 'j003', worker_id: 'w004', customer_id: 'c003', category_id: 'cook',        amount: 350, status: 'completed', job_date: '2026-09-19', job_time: '07:30' },
  { id: 'j004', worker_id: 'w002', customer_id: 'c001', category_id: 'electrician', amount: 800, status: 'completed', job_date: '2026-09-19', job_time: '11:30' },
  { id: 'j005', worker_id: 'w001', customer_id: 'c003', category_id: 'plumber',     amount: 400, status: 'completed', job_date: '2026-09-19', job_time: '13:00' },
  { id: 'j006', worker_id: 'w004', customer_id: 'c002', category_id: 'cook',        amount: 350, status: 'completed', job_date: '2026-09-19', job_time: '13:30' },
  { id: 'j007', worker_id: 'w002', customer_id: 'c003', category_id: 'electrician', amount: 750, status: 'completed', job_date: '2026-09-19', job_time: '14:00' },
  { id: 'j008', worker_id: 'w003', customer_id: 'c001', category_id: 'cleaner',     amount: 400, status: 'completed', job_date: '2026-09-19', job_time: '10:00' },
  { id: 'j009', worker_id: 'w004', customer_id: 'c001', category_id: 'cook',        amount: 350, status: 'in_progress', job_date: '2026-09-19', job_time: '16:30' },
  { id: 'j010', worker_id: 'w002', customer_id: 'c002', category_id: 'electrician', amount: 550, status: 'in_progress', job_date: '2026-09-19', job_time: '16:45' },
];

async function runSeed() {
  console.log('Ensuring PostgreSQL database exists...');
  await ensureDatabaseExists();

  const client = await pool.connect();
  try {
    await client.query('CREATE SCHEMA IF NOT EXISTS homesahay_app;');
    await client.query('SET search_path TO homesahay_app, public;');
    console.log('Executing schema.sql...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    await client.query(schemaSql);
    console.log('Schema executed successfully.');

    // 1. Cooperatives
    for (const c of SEED_COOPERATIVES) {
      await client.query(
        `INSERT INTO cooperatives (id, name, area, city)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area;`,
        [c.id, c.name, c.area, c.city]
      );
    }
    console.log('Cooperatives seeded.');

    // 2. Categories
    for (const cat of SEED_CATEGORIES) {
      await client.query(
        `INSERT INTO service_categories (id, label, icon, color, description)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, icon = EXCLUDED.icon, color = EXCLUDED.color;`,
        [cat.id, cat.label, cat.icon, cat.color, cat.description]
      );
    }
    console.log('Service categories seeded.');

    // 3. Customers
    for (const cust of SEED_CUSTOMERS) {
      await client.query(
        `INSERT INTO customers (id, name, phone, email, avatar_url, gender, rating, total_orders, sahay_cash, latitude, longitude, primary_address)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           phone = EXCLUDED.phone,
           email = EXCLUDED.email,
           rating = EXCLUDED.rating,
           sahay_cash = EXCLUDED.sahay_cash;`,
        [cust.id, cust.name, cust.phone, cust.email, cust.avatar_url, cust.gender, cust.rating, cust.total_orders, cust.sahay_cash, cust.latitude, cust.longitude, cust.primary_address]
      );

      for (const addr of cust.saved_addresses) {
        await client.query(
          `INSERT INTO customer_addresses (id, customer_id, label, address, is_default)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (id) DO UPDATE SET address = EXCLUDED.address;`,
          [addr.id, cust.id, addr.label, addr.address, addr.is_default]
        );
      }
    }
    console.log('Customers and addresses seeded.');

    // 4. Workers
    // Only w001 gets a demo password, so POST /api/auth/worker/login is
    // testable end-to-end without giving every seed worker a login.
    const w001PasswordHash = await bcrypt.hash(SEED_WORKER_PASSWORD, await bcrypt.genSalt(10));

    for (const w of SEED_WORKERS) {
      const passwordHash = w.id === 'w001' ? w001PasswordHash : null;
      await client.query(
        `INSERT INTO workers (
           id, name, avatar_url, category_id, cooperative_id, rating, total_jobs,
           today_jobs, today_earnings, is_verified, is_online, latitude, longitude,
           distance_km, eta_minutes, years_experience, price_per_hour, kyc_status,
           weekly_jobs, phone, email, password_hash
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           category_id = EXCLUDED.category_id,
           price_per_hour = EXCLUDED.price_per_hour,
           rating = EXCLUDED.rating,
           today_jobs = EXCLUDED.today_jobs,
           today_earnings = EXCLUDED.today_earnings,
           is_verified = EXCLUDED.is_verified,
           is_online = EXCLUDED.is_online,
           kyc_status = EXCLUDED.kyc_status,
           password_hash = COALESCE(EXCLUDED.password_hash, workers.password_hash);`,
        [
          w.id, w.name, w.avatar_url, w.category_id, w.cooperative_id, w.rating, w.total_jobs,
          w.today_jobs, w.today_earnings, w.is_verified, w.is_online, w.latitude, w.longitude,
          w.distance_km, w.eta_minutes, w.years_experience, w.price_per_hour, w.kyc_status,
          w.weekly_jobs, w.phone, w.email, passwordHash
        ]
      );

      // Skills
      for (const sk of w.skills) {
        await client.query(
          `INSERT INTO worker_skills (worker_id, skill)
           VALUES ($1, $2)
           ON CONFLICT (worker_id, skill) DO NOTHING;`,
          [w.id, sk]
        );
      }

      // Languages
      for (const lang of w.languages) {
        await client.query(
          `INSERT INTO worker_languages (worker_id, language)
           VALUES ($1, $2)
           ON CONFLICT (worker_id, language) DO NOTHING;`,
          [w.id, lang]
        );
      }
    }
    console.log('Workers, skills, and languages seeded.');

    // 5. KYC Applications
    for (const k of SEED_KYC) {
      await client.query(
        `INSERT INTO kyc_applications (
           id, worker_id, cooperative_id, status, phone, notes,
           aadhar_uploaded, aadhar_verified, skill_cert_uploaded, skill_cert_verified,
           address_proof_uploaded, address_proof_verified, photo_uploaded, photo_verified,
           submitted_at
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
         ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status;`,
        [
          k.id, k.worker_id, k.cooperative_id, k.status, k.phone, k.notes,
          k.aadhar_uploaded, k.aadhar_verified, k.skill_cert_uploaded, k.skill_cert_verified,
          k.address_proof_uploaded, k.address_proof_verified, k.photo_uploaded, k.photo_verified,
          k.submitted_at
        ]
      );
    }
    console.log('KYC applications seeded.');

    // 6. Platform Admins
    const adminPasswordHash = await bcrypt.hash(SEED_ADMIN_PASSWORD, await bcrypt.genSalt(10));
    for (const a of SEED_PLATFORM_ADMINS) {
      await client.query(
        `INSERT INTO platform_admins (id, name, phone, email, password_hash)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           password_hash = COALESCE(platform_admins.password_hash, EXCLUDED.password_hash);`,
        [a.id, a.name, a.phone, a.email, adminPasswordHash]
      );
    }
    console.log('Platform admins seeded.');

    // 7. Cooperative Admins (cooperative_members, role=ADMIN)
    const coopAdminPasswordHash = await bcrypt.hash(SEED_COOP_ADMIN_PASSWORD, await bcrypt.genSalt(10));
    for (const ca of SEED_COOPERATIVE_ADMINS) {
      await client.query(
        `INSERT INTO cooperative_members (id, cooperative_id, worker_id, role, name, phone, email, password_hash)
         VALUES ($1, $2, NULL, 'ADMIN', $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           password_hash = COALESCE(cooperative_members.password_hash, EXCLUDED.password_hash);`,
        [ca.id, ca.cooperative_id, ca.name, ca.phone, ca.email, coopAdminPasswordHash]
      );
    }
    console.log('Cooperative admins seeded.');

    // 8. Worker Availability (base structure demo rows)
    for (const av of SEED_WORKER_AVAILABILITY) {
      await client.query(
        `INSERT INTO worker_availability (id, worker_id, day_of_week, start_time, end_time, is_available)
         VALUES ($1, $2, $3, $4, $5, TRUE)
         ON CONFLICT (id) DO UPDATE SET start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time;`,
        [av.id, av.worker_id, av.day_of_week, av.start_time, av.end_time]
      );
    }
    console.log('Worker availability seeded.');

    // 9. Jobs
    for (const j of SEED_JOBS) {
      await client.query(
        `INSERT INTO jobs (id, worker_id, customer_id, category_id, amount, status, job_date, job_time)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, amount = EXCLUDED.amount;`,
        [j.id, j.worker_id, j.customer_id, j.category_id, j.amount, j.status, j.job_date, j.job_time]
      );
    }
    console.log('Job history seeded.');

    // 7. Default Ranking Weights
    const weightsCount = await client.query('SELECT COUNT(*) FROM ranking_weights;');
    if (parseInt(weightsCount.rows[0].count, 10) === 0) {
      await client.query(
        `INSERT INTO ranking_weights (skill_match, distance, rating, fairness_penalty)
         VALUES (0.35, 0.25, 0.20, 0.20);`
      );
      console.log('Ranking weights initialized.');
    }

    console.log('🎉 PostgreSQL database seeding completed successfully!');
  } catch (err) {
    console.error('Seeding failed with error:', err);
    throw err;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  runSeed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { runSeed };
