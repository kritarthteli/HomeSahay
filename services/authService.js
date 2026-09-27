// ============================================================
// HomeSahay Auth Service — JWT Token Management
// Handles token storage, retrieval, and auth state for web/native
//
// Two independent, non-overlapping storage namespaces:
//   - Customer:  homesahay_jwt_token / homesahay_customer   (unchanged)
//   - Worker:    homesahay_worker_jwt_token / homesahay_worker (new)
// Keeping separate keys means a worker session can never overwrite a
// customer session (or vice versa) on a device where both happen to
// be present.
//
// NOTE ON AsyncStorage: this project previously called
// `require('@react-native-async-storage/async-storage')` *inside*
// every function body. On native, a conditional/dynamic require like
// that still gets bundled by Metro but can misbehave (double-require,
// stale module instances) depending on bundler version. Since the
// package is now a real project dependency, we use one static,
// top-level import instead and guard its use with try/catch so a web
// build (which uses localStorage and never touches this import) is
// unaffected either way.
// ============================================================

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'homesahay_jwt_token';
const CUSTOMER_KEY = 'homesahay_customer';

const WORKER_TOKEN_KEY = 'homesahay_worker_jwt_token';
const WORKER_KEY = 'homesahay_worker';

const COOP_ADMIN_TOKEN_KEY = 'homesahay_coop_admin_jwt_token';
const COOP_ADMIN_KEY = 'homesahay_coop_admin';

// ── Generic storage helpers (web localStorage vs native AsyncStorage) ──

async function storageGet(key) {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
}

async function storageSet(key, value) {
  try {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    await AsyncStorage.setItem(key, value);
  } catch (err) {
    console.warn(`Failed to store value for ${key}:`, err);
  }
}

async function storageRemoveMany(keys) {
  try {
    if (Platform.OS === 'web') {
      keys.forEach((k) => localStorage.removeItem(k));
      return;
    }
    await AsyncStorage.multiRemove(keys);
  } catch (err) {
    console.warn(`Failed to remove keys ${keys.join(', ')}:`, err);
  }
}

// ── Token Storage (works on both web localStorage and React Native) ──

export const authStorage = {
  // ── Customer (unchanged behavior/keys) ───────────────────
  async getToken() {
    return storageGet(TOKEN_KEY);
  },

  async setToken(token) {
    return storageSet(TOKEN_KEY, token);
  },

  async removeToken() {
    return storageRemoveMany([TOKEN_KEY, CUSTOMER_KEY]);
  },

  async getCustomer() {
    const data = await storageGet(CUSTOMER_KEY);
    try {
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  async setCustomer(customer) {
    return storageSet(CUSTOMER_KEY, JSON.stringify(customer));
  },

  // ── Worker (new, separate namespace) ─────────────────────
  async getWorkerToken() {
    return storageGet(WORKER_TOKEN_KEY);
  },

  async setWorkerToken(token) {
    return storageSet(WORKER_TOKEN_KEY, token);
  },

  async removeWorkerToken() {
    return storageRemoveMany([WORKER_TOKEN_KEY, WORKER_KEY]);
  },

  async getWorker() {
    const data = await storageGet(WORKER_KEY);
    try {
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  async setWorker(worker) {
    return storageSet(WORKER_KEY, JSON.stringify(worker));
  },

  // ── Cooperative Admin (new, separate namespace) ──────────
  // Same isolation guarantee as the worker namespace above: a
  // cooperative-admin session can never overwrite or be confused with
  // a customer or worker session on the same device.
  async getCoopAdminToken() {
    return storageGet(COOP_ADMIN_TOKEN_KEY);
  },

  async setCoopAdminToken(token) {
    return storageSet(COOP_ADMIN_TOKEN_KEY, token);
  },

  async removeCoopAdminToken() {
    return storageRemoveMany([COOP_ADMIN_TOKEN_KEY, COOP_ADMIN_KEY]);
  },

  async getCoopAdmin() {
    const data = await storageGet(COOP_ADMIN_KEY);
    try {
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  async setCoopAdmin(admin) {
    return storageSet(COOP_ADMIN_KEY, JSON.stringify(admin));
  },
};
