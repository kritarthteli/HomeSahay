-- ============================================================
-- HomeSahay — Dummy worker data for testing the Fair Matching
-- Engine / Eligibility Service / AI parser (Person 2 scope).
--
-- Safe to run against an already-seeded DB: uses ON CONFLICT DO
-- NOTHING everywhere, so re-running it never duplicates rows or
-- breaks the base seed created by server/seed.js (Person 1).
--
-- Run with e.g.:
--   psql -U postgres -d homesahay -f server/tests/dummy_workers_bengaluru.sql
-- (schema is homesahay_app, matching server/db.js's search_path)
-- ============================================================

SET search_path TO homesahay_app, public;

-- All coordinates are real Bengaluru neighbourhoods so distances in
-- the demo look plausible on a map. Reference point used throughout
-- the scenarios below is JP Nagar 3rd Phase: 12.9416, 77.5661
-- (same point routes/workers.js already defaults to).

-- ------------------------------------------------------------
-- 1) FAIR-MATCHING DEMO SCENARIO (plumbing request near JP Nagar)
--    Worker A: excellent rating + excellent skill + HIGH workload
--    Worker B: slightly lower rating + excellent skill + LOW workload
--               + reasonable distance
--    Worker C: wrong skill (electrician) OR too far
-- ------------------------------------------------------------

INSERT INTO workers (
  id, name, avatar_url, category_id, cooperative_id, rating, total_jobs,
  today_jobs, today_earnings, is_verified, is_online, latitude, longitude,
  distance_km, eta_minutes, years_experience, price_per_hour, kyc_status,
  weekly_jobs, phone, email, service_area, availability
) VALUES
  -- Worker A: overworked star performer (JP Nagar, ~2.1km from ref point)
  ('w_demo_a', 'Manjunath Gowda', 'https://i.pravatar.cc/150?img=15',
   'plumber', 'coop_jp_nagar', 4.9, 512, 5, 2100, TRUE, TRUE,
   12.9583, 77.5720, 2.1, 9, 12, 380, 'approved',
   '{8,7,9,8,6,8,5}', '+91 90001 00001', 'manjunath.gowda@homesahay.org',
   'JP Nagar, Banashankari', 'Full-time'),

  -- Worker B: slightly-lower-rated but underutilized, same skill (JP Nagar, ~3.4km)
  ('w_demo_b', 'Nagesh Yadav', 'https://i.pravatar.cc/150?img=52',
   'plumber', 'coop_jp_nagar', 4.6, 96, 0, 0, TRUE, TRUE,
   12.9605, 77.5460, 3.4, 14, 4, 340, 'approved',
   '{1,0,1,0,0,0,0}', '+91 90001 00002', 'nagesh.yadav@homesahay.org',
   'JP Nagar, Jayanagar', 'Flexible'),

  -- Worker C1: wrong skill entirely — an electrician, not a plumber
  ('w_demo_c1', 'Farida Khan', 'https://i.pravatar.cc/150?img=32',
   'electrician', 'coop_south_blr', 4.7, 210, 1, 400, TRUE, TRUE,
   12.9430, 77.5670, 0.3, 5, 8, 400, 'approved',
   '{2,2,2,2,2,2,2}', '+91 90001 00003', 'farida.khan@homesahay.org',
   'JP Nagar', 'Flexible'),

  -- Worker C2: right skill, but far away — Whitefield, ~22km from JP Nagar
  ('w_demo_c2', 'Basavaraj Patil', 'https://i.pravatar.cc/150?img=59',
   'plumber', 'coop_jayanagar', 4.8, 300, 0, 0, TRUE, TRUE,
   12.9698, 77.7500, 22.4, 38, 9, 360, 'approved',
   '{3,3,3,3,3,3,3}', '+91 90001 00004', 'basavaraj.patil@homesahay.org',
   'Whitefield', 'Full-time')
ON CONFLICT (id) DO NOTHING;

INSERT INTO worker_skills (worker_id, skill) VALUES
  ('w_demo_a', 'plumber'), ('w_demo_a', 'pipe_repair'), ('w_demo_a', 'drainage'),
  ('w_demo_b', 'plumber'), ('w_demo_b', 'pipe_repair'),
  ('w_demo_c1', 'electrician'), ('w_demo_c1', 'wiring'),
  ('w_demo_c2', 'plumber'), ('w_demo_c2', 'pipe_repair')
ON CONFLICT DO NOTHING;

INSERT INTO worker_languages (worker_id, language) VALUES
  ('w_demo_a', 'Kannada'), ('w_demo_a', 'Hindi'),
  ('w_demo_b', 'Kannada'), ('w_demo_b', 'English'),
  ('w_demo_c1', 'Kannada'), ('w_demo_c1', 'Urdu'),
  ('w_demo_c2', 'Kannada'), ('w_demo_c2', 'Telugu')
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------
-- 2) ELIGIBILITY-FILTER EDGE CASES
--    One worker excluded per rule, so eligibilityService's filters
--    can each be demonstrated independently.
-- ------------------------------------------------------------

INSERT INTO workers (
  id, name, avatar_url, category_id, cooperative_id, rating, total_jobs,
  today_jobs, today_earnings, is_verified, is_online, latitude, longitude,
  distance_km, eta_minutes, years_experience, price_per_hour, kyc_status,
  weekly_jobs, phone, email, service_area, availability
) VALUES
  -- Not verified yet (KYC pending) — must never be matched
  ('w_edge_unverified', 'Prakash Rao', 'https://i.pravatar.cc/150?img=21',
   'plumber', 'coop_jp_nagar', 0.0, 0, 0, 0, FALSE, TRUE,
   12.9420, 77.5665, 0.1, 4, 1, 300, 'pending',
   '{0,0,0,0,0,0,0}', '+91 90001 00005', 'prakash.rao@homesahay.org',
   'JP Nagar', 'Flexible'),

  -- Verified but currently offline — must never be matched
  ('w_edge_offline', 'Chandrika Bai', 'https://i.pravatar.cc/150?img=44',
   'plumber', 'coop_jp_nagar', 4.5, 140, 0, 0, TRUE, FALSE,
   12.9422, 77.5670, 0.2, 4, 6, 320, 'approved',
   '{4,4,4,4,4,4,4}', '+91 90001 00006', 'chandrika.bai@homesahay.org',
   'JP Nagar', 'Flexible'),

  -- Verified, online, right skill, walking distance — will be marked
  -- "busy" via the jobs insert below (has an in_progress job).
  ('w_edge_busy', 'Ravi Shankar', 'https://i.pravatar.cc/150?img=13',
   'plumber', 'coop_jp_nagar', 4.6, 180, 1, 350, TRUE, TRUE,
   12.9418, 77.5658, 0.05, 3, 5, 340, 'approved',
   '{3,3,3,3,3,3,3}', '+91 90001 00007', 'ravi.shankar@homesahay.org',
   'JP Nagar', 'Flexible')
ON CONFLICT (id) DO NOTHING;

INSERT INTO worker_skills (worker_id, skill) VALUES
  ('w_edge_unverified', 'plumber'), ('w_edge_unverified', 'pipe_repair'),
  ('w_edge_offline', 'plumber'), ('w_edge_offline', 'pipe_repair'),
  ('w_edge_busy', 'plumber'), ('w_edge_busy', 'pipe_repair')
ON CONFLICT DO NOTHING;

-- A customer for the "busy" job to reference (reuses existing seed
-- customer c001 if present; falls back to inserting one otherwise).
INSERT INTO customers (id, name, phone, latitude, longitude, primary_address)
VALUES ('c_demo_dummy', 'Test Customer', '+91 90009 00009', 12.9416, 77.5661, 'JP Nagar 3rd Phase, Bengaluru')
ON CONFLICT (id) DO NOTHING;

INSERT INTO jobs (id, worker_id, customer_id, category_id, amount, status, urgency, job_date, job_time)
VALUES ('j_demo_busy', 'w_edge_busy', 'c_demo_dummy', 'plumber', 400, 'in_progress', 'normal', CURRENT_DATE, '11:00')
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- 3) GENERAL SPREAD — one verified/online worker per remaining
--    category, across different Bengaluru neighbourhoods, so
--    /api/ai/parse-request -> /api/matching/rank can be demoed
--    end-to-end for every service type.
-- ------------------------------------------------------------

INSERT INTO workers (
  id, name, avatar_url, category_id, cooperative_id, rating, total_jobs,
  today_jobs, today_earnings, is_verified, is_online, latitude, longitude,
  distance_km, eta_minutes, years_experience, price_per_hour, kyc_status,
  weekly_jobs, phone, email, service_area, availability
) VALUES
  ('w_gen_cleaner', 'Lakshmi Narayana', 'https://i.pravatar.cc/150?img=25',
   'cleaner', 'coop_jayanagar', 4.4, 88, 2, 500, TRUE, TRUE,
   12.9250, 77.5938, 3.1, 12, 3, 280, 'approved',
   '{2,3,2,1,2,2,1}', '+91 90001 00008', 'lakshmi.n@homesahay.org',
   'Jayanagar', 'Flexible'),

  ('w_gen_electrician', 'Imran Sheikh', 'https://i.pravatar.cc/150?img=51',
   'electrician', 'coop_south_blr', 4.8, 260, 3, 900, TRUE, TRUE,
   12.9352, 77.6245, 6.7, 20, 9, 420, 'approved',
   '{6,6,5,7,6,6,4}', '+91 90001 00009', 'imran.sheikh@homesahay.org',
   'Koramangala', 'Full-time'),

  ('w_gen_carpenter', 'Govind Setty', 'https://i.pravatar.cc/150?img=8',
   'carpenter', 'coop_jp_nagar', 4.3, 64, 0, 0, TRUE, TRUE,
   12.9166, 77.6101, 5.0, 17, 6, 360, 'approved',
   '{1,2,1,0,1,1,0}', '+91 90001 00010', 'govind.setty@homesahay.org',
   'BTM Layout', 'Flexible'),

  ('w_gen_technician', 'Sunitha Poojary', 'https://i.pravatar.cc/150?img=39',
   'technician', 'coop_south_blr', 4.6, 150, 1, 600, TRUE, TRUE,
   12.9121, 77.6446, 8.9, 25, 5, 450, 'approved',
   '{3,4,3,3,4,3,2}', '+91 90001 00011', 'sunitha.p@homesahay.org',
   'HSR Layout', 'Flexible'),

  ('w_gen_painter', 'Dilip Kumar', 'https://i.pravatar.cc/150?img=17',
   'painter', 'coop_jayanagar', 4.2, 40, 0, 0, TRUE, TRUE,
   12.9719, 77.6412, 12.5, 30, 4, 300, 'approved',
   '{0,1,0,0,1,0,0}', '+91 90001 00012', 'dilip.kumar@homesahay.org',
   'Indiranagar', 'Flexible')
ON CONFLICT (id) DO NOTHING;

INSERT INTO worker_skills (worker_id, skill) VALUES
  ('w_gen_cleaner', 'cleaner'), ('w_gen_cleaner', 'deep_cleaning'), ('w_gen_cleaner', 'sofa_cleaning'),
  ('w_gen_electrician', 'electrician'), ('w_gen_electrician', 'wiring'), ('w_gen_electrician', 'appliance_repair'),
  ('w_gen_carpenter', 'carpenter'), ('w_gen_carpenter', 'furniture_repair'), ('w_gen_carpenter', 'door_fitting'),
  ('w_gen_technician', 'technician'), ('w_gen_technician', 'appliance_repair'),
  ('w_gen_painter', 'painter'), ('w_gen_painter', 'interior_painting')
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------
-- Sanity check queries (run manually after the inserts above):
-- ------------------------------------------------------------
-- SELECT id, name, category_id, is_verified, is_online, rating,
--        today_jobs, weekly_jobs, latitude, longitude
-- FROM workers WHERE id LIKE 'w_demo_%' OR id LIKE 'w_edge_%' OR id LIKE 'w_gen_%'
-- ORDER BY id;
