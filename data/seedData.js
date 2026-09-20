// ============================================================
// Seed Data — Bengaluru-centered mock dataset
// Center: 12.9416° N, 77.5661° E (JP Nagar area)
// ============================================================

export const BENGALURU_CENTER = {
  latitude: 12.9416,
  longitude: 77.5661,
};

// ── Workers ─────────────────────────────────────────────────
export const MOCK_WORKERS = [
  {
    id: 'w001',
    name: 'Rajan Kumar',
    avatar: 'https://i.pravatar.cc/150?img=11',
    skills: ['plumber', 'pipe_repair', 'drainage'],
    category: 'plumber',
    rating: 4.8,
    totalJobs: 312,
    todayJobs: 2,
    todayEarnings: 850,
    isVerified: true,
    isOnline: true,
    location: { latitude: 12.9388, longitude: 77.5710 }, // ~0.4 km SE
    distanceKm: 0.4,
    etaMinutes: 8,
    cooperative: 'JP Nagar Workers Cooperative',
    yearsExperience: 7,
    languages: ['Kannada', 'Hindi', 'English'],
    pricePerHour: 350,
    kyc_status: 'approved',
    weeklyJobs: [4, 5, 3, 6, 2, 4, 2],
  },
  {
    id: 'w002',
    name: 'Meenakshi Devi',
    avatar: 'https://i.pravatar.cc/150?img=47',
    skills: ['electrician', 'wiring', 'appliance_repair', 'fan_installation'],
    category: 'electrician',
    rating: 4.9,
    totalJobs: 428,
    todayJobs: 5,
    todayEarnings: 2200,
    isVerified: true,
    isOnline: true,
    location: { latitude: 12.9460, longitude: 77.5590 }, // ~0.6 km NW
    distanceKm: 0.6,
    etaMinutes: 12,
    cooperative: 'South Bangalore Women Cooperative',
    yearsExperience: 11,
    languages: ['Kannada', 'Tamil', 'English'],
    pricePerHour: 400,
    kyc_status: 'approved',
    weeklyJobs: [8, 7, 9, 8, 6, 8, 5],
  },
  {
    id: 'w003',
    name: 'Suresh Babu',
    avatar: 'https://i.pravatar.cc/150?img=33',
    skills: ['cleaner', 'deep_cleaning', 'carpet_cleaning', 'sofa_cleaning'],
    category: 'cleaner',
    rating: 4.5,
    totalJobs: 187,
    todayJobs: 1,
    todayEarnings: 400,
    isVerified: true,
    isOnline: false,
    location: { latitude: 12.9370, longitude: 77.5640 }, // ~0.5 km SW
    distanceKm: 0.5,
    etaMinutes: 10,
    cooperative: 'JP Nagar Workers Cooperative',
    yearsExperience: 3,
    languages: ['Kannada', 'Telugu'],
    pricePerHour: 280,
    kyc_status: 'approved',
    weeklyJobs: [2, 3, 1, 2, 2, 1, 1],
  },
  {
    id: 'w004',
    name: 'Anitha Krishnamurthy',
    avatar: 'https://i.pravatar.cc/150?img=44',
    skills: ['cook', 'south_indian', 'north_indian', 'catering'],
    category: 'cook',
    rating: 4.7,
    totalJobs: 256,
    todayJobs: 3,
    todayEarnings: 1050,
    isVerified: true,
    isOnline: true,
    location: { latitude: 12.9440, longitude: 77.5700 }, // ~0.4 km NE
    distanceKm: 0.4,
    etaMinutes: 9,
    cooperative: 'South Bangalore Women Cooperative',
    yearsExperience: 6,
    languages: ['Kannada', 'Hindi', 'Telugu', 'English'],
    pricePerHour: 320,
    kyc_status: 'approved',
    weeklyJobs: [5, 4, 6, 5, 3, 5, 3],
  },
  {
    id: 'w005',
    name: 'Vijay Shankar',
    avatar: 'https://i.pravatar.cc/150?img=15',
    skills: ['carpenter', 'furniture_repair', 'door_fitting', 'cabinet_making'],
    category: 'carpenter',
    rating: 4.6,
    totalJobs: 143,
    todayJobs: 0,
    todayEarnings: 0,
    isVerified: false,
    isOnline: false,
    location: { latitude: 12.9350, longitude: 77.5720 }, // ~0.9 km S
    distanceKm: 0.9,
    etaMinutes: 18,
    cooperative: 'JP Nagar Workers Cooperative',
    yearsExperience: 9,
    languages: ['Kannada', 'Hindi'],
    pricePerHour: 450,
    kyc_status: 'pending',
    weeklyJobs: [1, 0, 1, 2, 0, 0, 0],
  },
];

// ── Pending KYC Applications ────────────────────────────────
export const PENDING_KYC = [
  {
    id: 'kyc001',
    workerId: 'w005',
    name: 'Vijay Shankar',
    avatar: 'https://i.pravatar.cc/150?img=15',
    category: 'carpenter',
    submittedAt: '2026-09-18T10:30:00Z',
    documents: {
      aadhar: { uploaded: true, verified: false },
      skill_cert: { uploaded: true, verified: false },
      address_proof: { uploaded: true, verified: false },
      photo: { uploaded: true, verified: false },
    },
    cooperative: 'JP Nagar Workers Cooperative',
    phone: '+91 98765 43210',
    notes: 'Has 9 years experience, references from 3 clients provided.',
  },
  {
    id: 'kyc002',
    workerId: 'w006',
    name: 'Priya Nair',
    avatar: 'https://i.pravatar.cc/150?img=56',
    category: 'cleaner',
    submittedAt: '2026-09-19T08:15:00Z',
    documents: {
      aadhar: { uploaded: true, verified: false },
      skill_cert: { uploaded: false, verified: false },
      address_proof: { uploaded: true, verified: false },
      photo: { uploaded: true, verified: false },
    },
    cooperative: 'South Bangalore Women Cooperative',
    phone: '+91 87654 32109',
    notes: 'Skill certificate pending — says will upload by tomorrow.',
  },
];

// ── Customers ───────────────────────────────────────────────
export const MOCK_CUSTOMERS = [
  {
    id: 'c001',
    name: 'Deepa Sharma',
    avatar: 'https://i.pravatar.cc/150?img=48',
    location: { latitude: 12.9416, longitude: 77.5661 }, // center
    address: '42, 7th Cross, JP Nagar 3rd Phase, Bengaluru',
    phone: '+91 99887 76655',
    rating: 4.9,
    totalOrders: 34,
    email: 'deepa.sharma@example.com',
    gender: 'Female',
    sahayCash: 500,
    savedAddresses: [
      { id: 'a1', label: 'home', address: '42, 7th Cross, JP Nagar 3rd Phase, Bengaluru', isDefault: true },
    ]
  },
  {
    id: 'c002',
    name: 'Arjun Mehta',
    avatar: 'https://i.pravatar.cc/150?img=12',
    location: { latitude: 12.9480, longitude: 77.5630 },
    address: '15, 12th Main, JP Nagar 6th Phase, Bengaluru',
    phone: '+91 88776 65544',
    rating: 4.7,
    totalOrders: 18,
    email: 'arjun.mehta@example.com',
    gender: 'Male',
    sahayCash: 120,
    savedAddresses: [
      { id: 'a1', label: 'home', address: '15, 12th Main, JP Nagar 6th Phase, Bengaluru', isDefault: true },
    ]
  },
  {
    id: 'c003',
    name: 'Kavitha Reddy',
    avatar: 'https://i.pravatar.cc/150?img=49',
    location: { latitude: 12.9350, longitude: 77.5680 },
    address: '8, 3rd Block, Jayanagar, Bengaluru',
    phone: '+91 77665 54433',
    rating: 4.8,
    totalOrders: 52,
  },
];

// ── Pre-seeded Job History (for admin analytics) ────────────
export const JOB_HISTORY = [
  { id: 'j001', workerId: 'w001', customerId: 'c001', category: 'plumber',     amount: 450, status: 'completed', date: '2026-09-19', time: '09:30' },
  { id: 'j002', workerId: 'w002', customerId: 'c002', category: 'electrician', amount: 600, status: 'completed', date: '2026-09-19', time: '10:00' },
  { id: 'j003', workerId: 'w004', customerId: 'c003', category: 'cook',        amount: 350, status: 'completed', date: '2026-09-19', time: '07:30' },
  { id: 'j004', workerId: 'w002', customerId: 'c001', category: 'electrician', amount: 800, status: 'completed', date: '2026-09-19', time: '11:30' },
  { id: 'j005', workerId: 'w001', customerId: 'c003', category: 'plumber',     amount: 400, status: 'completed', date: '2026-09-19', time: '13:00' },
  { id: 'j006', workerId: 'w004', customerId: 'c002', category: 'cook',        amount: 350, status: 'completed', date: '2026-09-19', time: '13:30' },
  { id: 'j007', workerId: 'w002', customerId: 'c003', category: 'electrician', amount: 750, status: 'completed', date: '2026-09-19', time: '14:00' },
  { id: 'j008', workerId: 'w003', customerId: 'c001', category: 'cleaner',     amount: 400, status: 'completed', date: '2026-09-19', time: '10:00' },
  { id: 'j009', workerId: 'w004', customerId: 'c001', category: 'cook',        amount: 350, status: 'in_progress', date: '2026-09-19', time: '16:30' },
  { id: 'j010', workerId: 'w002', customerId: 'c002', category: 'electrician', amount: 550, status: 'in_progress', date: '2026-09-19', time: '16:45' },
];

// ── Service Categories ───────────────────────────────────────
export const SERVICE_CATEGORIES = [
  { id: 'plumber',     label: 'Plumber',     icon: 'water',          color: '#3B82F6' },
  { id: 'electrician', label: 'Electrician', icon: 'flash',          color: '#F59E0B' },
  { id: 'cleaner',     label: 'Cleaner',     icon: 'sparkles',       color: '#22C55E' },
  { id: 'cook',        label: 'Cook',        icon: 'restaurant',     color: '#EF4444' },
  { id: 'carpenter',   label: 'Carpenter',   icon: 'construct',      color: '#8B5CF6' },
];

// ── Default Ranking Weights ──────────────────────────────────
export const DEFAULT_RANKING_WEIGHTS = {
  skillMatch: 0.35,
  distance: 0.25,
  rating: 0.20,
  fairnessPenalty: 0.20,
};
