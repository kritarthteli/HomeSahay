// ============================================================
// HomeSahay PostgreSQL API Client
// Connects frontend to the Express + PostgreSQL Backend
// Now includes JWT auth token in all requests
// ============================================================

import { authStorage } from './authService';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

const fetchWithTimeout = async (url, options = {}, timeoutMs = 5000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  // Auto-attach JWT token if available
  let token = null;
  try {
    token = await authStorage.getToken();
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

  // ── Workers ──────────────────────────────────────────────
  async getWorkers() {
    const res = await fetchWithTimeout(`${BASE_URL}/workers`);
    if (!res.ok) throw new Error('Failed to fetch workers');
    return res.json();
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
    const res = await fetchWithTimeout(`${BASE_URL}/workers/${workerId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ isOnline }),
    });
    if (!res.ok) throw new Error('Failed to update worker status');
    return res.json();
  },

  async registerWorker(data) {
    const res = await fetchWithTimeout(`${BASE_URL}/workers`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to register worker');
    return res.json();
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
  async getJobs(params = {}) {
    const query = new URLSearchParams(params);
    const res = await fetchWithTimeout(`${BASE_URL}/jobs?${query}`);
    if (!res.ok) throw new Error('Failed to fetch jobs');
    return res.json();
  },

  async createJob(jobData) {
    const res = await fetchWithTimeout(`${BASE_URL}/jobs`, {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
    if (!res.ok) throw new Error('Failed to create job');
    return res.json();
  },

  async updateJobStatus(jobId, status) {
    const res = await fetchWithTimeout(`${BASE_URL}/jobs/${jobId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update job status');
    return res.json();
  },

  // ── KYC ──────────────────────────────────────────────────
  async getKycQueue() {
    const res = await fetchWithTimeout(`${BASE_URL}/kyc`);
    if (!res.ok) throw new Error('Failed to fetch KYC queue');
    return res.json();
  },

  async reviewKyc(kycId, action) {
    const res = await fetchWithTimeout(`${BASE_URL}/kyc/${kycId}/review`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
    if (!res.ok) throw new Error('Failed to review KYC');
    return res.json();
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
