// ============================================================
// HomeSahay PostgreSQL API Client
// Connects frontend to the Express + PostgreSQL Backend
// Now includes JWT auth token in all requests
// ============================================================

import { authStorage } from './authService';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

// `authRole` picks which stored JWT (if any) gets attached automatically:
//   'customer' (default, unchanged) — homesahay_jwt_token
//   'worker'                        — homesahay_worker_jwt_token
//   'coop'                          — homesahay_coop_admin_jwt_token
//   'none'                          — no Authorization header at all
// This keeps customer, worker and cooperative-admin requests from ever
// borrowing each other's token, while every existing call site (which
// doesn't pass this argument) keeps behaving exactly as it did before.
const fetchWithTimeout = async (url, options = {}, timeoutMs = 5000, authRole = 'customer') => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  // Auto-attach JWT token if available
  let token = null;
  try {
    if (authRole === 'worker') {
      token = await authStorage.getWorkerToken();
    } else if (authRole === 'coop') {
      token = await authStorage.getCoopAdminToken();
    } else if (authRole === 'customer') {
      token = await authStorage.getToken();
    }
  } catch (_) {}

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
};

export const api = {
  // ── Auth ─────────────────────────────────────────────────
  async authRegister(data) {
    const res = await fetchWithTimeout(`${BASE_URL}/auth/register`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Registration failed');
    return json; // { token, customer }
  },

  async authLogin(phone, password) {
    const res = await fetchWithTimeout(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ phone, password }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Login failed');
    return json; // { token, customer }
  },

  async authVerify() {
    const res = await fetchWithTimeout(`${BASE_URL}/auth/me`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Token verification failed');
    return json; // { customer }
  },

  // ── Worker Auth ──────────────────────────────────────────
  // Separate from customer auth above: uses its own JWT (see
  // authService.js) so a worker session can never be confused with,
  // or overwrite, a customer session on the same device.
  async authWorkerLogin(phone, password) {
    const res = await fetchWithTimeout(
      `${BASE_URL}/auth/worker/login`,
      { method: 'POST', body: JSON.stringify({ phone, password }) },
      5000,
      'none' // logging in doesn't need — and shouldn't send — any existing token
    );
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Login failed');
    return json; // { token, worker }
  },

  async authWorkerVerify() {
    const res = await fetchWithTimeout(`${BASE_URL}/auth/worker/me`, {}, 5000, 'worker');
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Token verification failed');
    return json; // { worker }
  },

  // ── Cooperative Admin Auth ───────────────────────────────
  // Separate from customer/worker auth: its own JWT (see
  // authService.js) so a cooperative-admin session can never be
  // confused with, or overwrite, a customer or worker session.
  async authCooperativeAdminLogin(identifier, password) {
    // `identifier` may be a phone number or an email address — send it
    // as whichever the backend expects based on a loose phone check.
    const isPhone = /^[+()\d\s-]{6,}$/.test(identifier.trim());
    const body = isPhone ? { phone: identifier.trim(), password } : { email: identifier.trim(), password };
    const res = await fetchWithTimeout(
      `${BASE_URL}/auth/cooperative-admin/login`,
      { method: 'POST', body: JSON.stringify(body) },
      5000,
      'none' // logging in doesn't need — and shouldn't send — any existing token
    );
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Login failed');
    return json; // { token, admin }
  },

  async authCooperativeAdminVerify() {
    const res = await fetchWithTimeout(`${BASE_URL}/auth/cooperative-admin/me`, {}, 5000, 'coop');
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Token verification failed');
    return json; // { admin }
  },

  // ── Cooperative Roster ───────────────────────────────────
  // Backend-enforced: a COOPERATIVE_ADMIN may only ever fetch their
  // own cooperative's roster — see requireAnyRole + the cooperativeId
  // check in server/routes/cooperatives.js.
  async getCooperativeWorkers(cooperativeId) {
    const res = await fetchWithTimeout(`${BASE_URL}/cooperatives/${cooperativeId}/workers`, {}, 5000, 'coop');
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch cooperative roster');
    return json;
  },

  // ── Workers ──────────────────────────────────────────────
  async getWorkers() {
    const res = await fetchWithTimeout(`${BASE_URL}/workers`);
    if (!res.ok) throw new Error('Failed to fetch workers');
    return res.json();
  },

  async getWorkerById(id) {
    const res = await fetchWithTimeout(`${BASE_URL}/workers/${id}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch worker');
    return json; // full worker record, same shape as getWorkers() entries
  },

  async getNearbyWorkers(category, userLocation, radiusKm = 10) {
    const query = new URLSearchParams({
      category: category || 'general',
      latitude: userLocation?.latitude || 12.9416,
      longitude: userLocation?.longitude || 77.5661,
      radius: radiusKm,
    });
    const res = await fetchWithTimeout(`${BASE_URL}/workers/nearby?${query}`);
    if (!res.ok) throw new Error('Failed to fetch nearby workers');
    return res.json();
  },

  async updateWorkerStatus(workerId, isOnline) {
    // The status endpoint requires the caller to BE this worker (or a
    // cooperative/platform admin) — see requireSelfOrRoles on the
    // backend — so this must carry the worker's own JWT, never the
    // customer one.
    const res = await fetchWithTimeout(
      `${BASE_URL}/workers/${workerId}/status`,
      { method: 'PUT', body: JSON.stringify({ isOnline }) },
      5000,
      'worker'
    );
    if (!res.ok) throw new Error('Failed to update worker status');
    return res.json();
  },

  async registerWorker(data) {
    // Public endpoint (no auth required to register), but registration
    // errors (duplicate phone/email, validation) carry a useful message
    // from the backend that the UI should show, not swallow.
    const res = await fetchWithTimeout(`${BASE_URL}/workers`, {
      method: 'POST',
      body: JSON.stringify(data),
    }, 8000, 'none');
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to register worker');
    return json; // { id, message, kycId }
  },

  // ── Customers ────────────────────────────────────────────
  async getCustomers() {
    const res = await fetchWithTimeout(`${BASE_URL}/customers`);
    if (!res.ok) throw new Error('Failed to fetch customers');
    return res.json();
  },

  async getCustomer(id) {
    const res = await fetchWithTimeout(`${BASE_URL}/customers/${id}`);
    if (!res.ok) throw new Error('Failed to fetch customer');
    return res.json();
  },

  async registerCustomer(data) {
    const res = await fetchWithTimeout(`${BASE_URL}/customers`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to register customer');
    return res.json();
  },

  async updateCustomer(id, data) {
    const res = await fetchWithTimeout(`${BASE_URL}/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update customer');
    return res.json();
  },

  async addCustomerAddress(customerId, addressData) {
    const res = await fetchWithTimeout(`${BASE_URL}/customers/${customerId}/addresses`, {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to add address');
    return json;
  },

  async deleteCustomerAddress(customerId, addressId) {
    const res = await fetchWithTimeout(`${BASE_URL}/customers/${customerId}/addresses/${addressId}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to delete address');
    return json;
  },

  // ── Jobs ─────────────────────────────────────────────────
  // `authRole` defaults to 'customer' everywhere here (unchanged
  // behaviour for every existing call site). Worker screens now pass
  // 'worker' explicitly so polling/accept/reject/status calls always
  // carry the worker's own JWT instead of borrowing the customer's.
  async getJobs(params = {}, authRole = 'customer') {
    const query = new URLSearchParams(params);
    const res = await fetchWithTimeout(`${BASE_URL}/jobs?${query}`, {}, 5000, authRole);
    if (!res.ok) throw new Error('Failed to fetch jobs');
    return res.json();
  },

  // GET /api/jobs/:id — used for live polling of a single job's real
  // status (e.g. customer tracking, worker's own active job).
  async getJobById(jobId, authRole = 'customer') {
    const res = await fetchWithTimeout(`${BASE_URL}/jobs/${jobId}`, {}, 5000, authRole);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch job');
    return json;
  },

  async createJob(jobData, authRole = 'customer') {
    const res = await fetchWithTimeout(`${BASE_URL}/jobs`, {
      method: 'POST',
      body: JSON.stringify(jobData),
    }, 5000, authRole);
    if (!res.ok) throw new Error('Failed to create job');
    return res.json();
  },

  async updateJobStatus(jobId, status, authRole = 'customer') {
    const res = await fetchWithTimeout(`${BASE_URL}/jobs/${jobId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }, 5000, authRole);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update job status');
    return json;
  },

  // ── KYC ──────────────────────────────────────────────────
  // Both endpoints require a COOPERATIVE_ADMIN (or PLATFORM_ADMIN) JWT
  // on the backend (see requireAnyRole in server/routes/kyc.js), so
  // these must carry the cooperative-admin token, never the customer
  // one — otherwise every call 401s and silently falls back to stale
  // local state.
  async getKycQueue() {
    const res = await fetchWithTimeout(`${BASE_URL}/kyc`, {}, 5000, 'coop');
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch KYC queue');
    return json;
  },

  async reviewKyc(kycId, action, rejectionReason) {
    const res = await fetchWithTimeout(
      `${BASE_URL}/kyc/${kycId}/review`,
      { method: 'POST', body: JSON.stringify({ action, rejectionReason }) },
      5000,
      'coop'
    );
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to review KYC');
    return json;
  },

  // ── Analytics ────────────────────────────────────────────
  async getAnalytics() {
    const res = await fetchWithTimeout(`${BASE_URL}/analytics`);
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  },

  // ── Config ───────────────────────────────────────────────
  async getCategories() {
    const res = await fetchWithTimeout(`${BASE_URL}/categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  async getCooperatives() {
    const res = await fetchWithTimeout(`${BASE_URL}/cooperatives`);
    if (!res.ok) throw new Error('Failed to fetch cooperatives');
    return res.json();
  },

  async getRankingWeights() {
    const res = await fetchWithTimeout(`${BASE_URL}/ranking-weights`);
    if (!res.ok) throw new Error('Failed to fetch ranking weights');
    return res.json();
  },

  async updateRankingWeights(weights) {
    const res = await fetchWithTimeout(`${BASE_URL}/ranking-weights`, {
      method: 'PUT',
      body: JSON.stringify(weights),
    });
    if (!res.ok) throw new Error('Failed to update ranking weights');
    return res.json();
  },
};
