// ============================================================
// HomeSahay Auth Service — JWT Token Management
// Handles token storage, retrieval, and auth state for web/native
// ============================================================

import { Platform } from 'react-native';

const TOKEN_KEY = 'homesahay_jwt_token';
const CUSTOMER_KEY = 'homesahay_customer';

// ── Token Storage (works on both web localStorage and React Native) ──

export const authStorage = {
  async getToken() {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(TOKEN_KEY);
      }
      // For React Native, use AsyncStorage (optional)
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  async setToken(token) {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(TOKEN_KEY, token);
        return;
      }
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (err) {
      console.warn('Failed to store auth token:', err);
    }
  },

  async removeToken() {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(CUSTOMER_KEY);
        return;
      }
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.multiRemove([TOKEN_KEY, CUSTOMER_KEY]);
    } catch (err) {
      console.warn('Failed to remove auth token:', err);
    }
  },

  async getCustomer() {
    try {
      if (Platform.OS === 'web') {
        const data = localStorage.getItem(CUSTOMER_KEY);
        return data ? JSON.parse(data) : null;
      }
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const data = await AsyncStorage.getItem(CUSTOMER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  async setCustomer(customer) {
    try {
      const data = JSON.stringify(customer);
      if (Platform.OS === 'web') {
        localStorage.setItem(CUSTOMER_KEY, data);
        return;
      }
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem(CUSTOMER_KEY, data);
    } catch (err) {
      console.warn('Failed to store customer data:', err);
    }
  },
};
