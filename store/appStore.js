// ============================================================
// Zustand Global State Store — SIH Cooperative Gig Platform
// Now with JWT-based authentication
// ============================================================

import { create } from 'zustand';
import { MOCK_WORKERS, MOCK_CUSTOMERS, PENDING_KYC, JOB_HISTORY, DEFAULT_RANKING_WEIGHTS } from '../data/seedData';
import { api } from '../services/apiClient';
import { authStorage } from '../services/authService';

export const useAppStore = create((set, get) => ({
  // ── Active Role & Auth ───────────────────────────────────
  role: process.env.EXPO_PUBLIC_APP_ROLE || 'customer', // 'customer' | 'worker' | 'admin'
  activeCustomerId: 'c001',
  activeWorkerId: 'w001',
  auth: {
    customer: false,
    worker: false,
    admin: false,
  },
  authToken: null,
  authLoading: true, // starts true — we check for saved token on boot
  authCustomer: null, // the JWT-authenticated customer profile

  setRole: (role) => set({ role }),
  setActiveCustomer: (id) => set({ activeCustomerId: id }),
  setActiveWorker: (id) => set({ activeWorkerId: id }),

  // ── JWT Auth Actions ─────────────────────────────────────

  /**
   * Login with phone + password → gets JWT from server
   */
  loginWithPassword: async (phone, password) => {
    const result = await api.authLogin(phone, password);
    // result = { token, customer }
    await authStorage.setToken(result.token);
    await authStorage.setCustomer(result.customer);

    set({
      authToken: result.token,
      authCustomer: result.customer,
      activeCustomerId: result.customer.id,
      auth: { ...get().auth, customer: true },
      authLoading: false,
      checkoutData: null,
      searchResults: [],
      parsedIntent: null,
      selectedWorker: null,
    });

    // Also update the customers list if this customer isn't in it
    const { customers } = get();
    const exists = customers.some((c) => c.id === result.customer.id);
    if (!exists) {
      set({ customers: [...customers, result.customer] });
    } else {
      set({
        customers: customers.map((c) =>
          c.id === result.customer.id ? result.customer : c
        ),
      });
    }

    return result.customer;
  },

  /**
   * Register new customer with password → auto-login with JWT
   */
  registerWithPassword: async (profile) => {
    const result = await api.authRegister(profile);
    // result = { token, customer }
    await authStorage.setToken(result.token);
    await authStorage.setCustomer(result.customer);

    set((state) => ({
      authToken: result.token,
      authCustomer: result.customer,
      activeCustomerId: result.customer.id,
      auth: { ...state.auth, customer: true },
      authLoading: false,
      checkoutData: null,
      searchResults: [],
      parsedIntent: null,
      selectedWorker: null,
      customers: [...state.customers.filter((c) => c.id !== result.customer.id), result.customer],
    }));

    return result.customer;
  },

  /**
   * Check for saved token and restore session on app start
   */
  restoreAuth: async () => {
    try {
      const token = await authStorage.getToken();
      if (!token) {
        set({ authLoading: false });
        return false;
      }

      // Try to verify the token with the server
      try {
        const result = await api.authVerify();
        await authStorage.setCustomer(result.customer);

        set({
          authToken: token,
          authCustomer: result.customer,
          activeCustomerId: result.customer.id,
          auth: { ...get().auth, customer: true },
          authLoading: false,
        });
        console.log('✅ JWT session restored for:', result.customer.name);
        return true;
      } catch (serverErr) {
        // Token invalid or server unreachable — try cached customer
        console.log('⚠️ Token verify failed, trying cached data:', serverErr.message);
        const cached = await authStorage.getCustomer();
        if (cached) {
          set({
            authToken: token,
            authCustomer: cached,
            activeCustomerId: cached.id,
            auth: { ...get().auth, customer: true },
            authLoading: false,
          });
          console.log('✅ Using cached customer session:', cached.name);
          return true;
        }
        // Token and cache both invalid — clear and go to login
        await authStorage.removeToken();
        set({ authLoading: false });
        return false;
      }
    } catch (err) {
      console.log('Auth restore error:', err);
      set({ authLoading: false });
      return false;
    }
  },

  /**
   * Logout — clear token and auth state
   */
  logoutCustomer: async () => {
    await authStorage.removeToken();
    set({
      authToken: null,
      authCustomer: null,
      auth: { ...get().auth, customer: false },
      activeCustomerId: null,
      checkoutData: null,
      searchResults: [],
      parsedIntent: null,
      selectedWorker: null,
    });
  },

  // Legacy login (for worker/admin — kept for compatibility)
  login: (role, id) =>
    set((state) => {
      const updates = {
        auth: { ...state.auth, [role]: true },
      };
      if (role === 'customer' && id) updates.activeCustomerId = id;
      if (role === 'worker' && id) updates.activeWorkerId = id;
      return updates;
    }),

  logout: (role) =>
    set((state) => ({
      auth: { ...state.auth, [role]: false },
    })),

  // ── Workers ───────────────────────────────────────────────
  workers: MOCK_WORKERS,

  registerWorker: (profile) => {
    const id = `w${Date.now()}`;
    const worker = {
      id,
      name: profile.name.trim(),
      avatar: '',
      skills: profile.skills,
      category: profile.skills[0],
      rating: null,
      totalJobs: 0,
      todayJobs: 0,
      todayEarnings: 0,
      isVerified: false,
      isOnline: false,
      location: null,
      serviceArea: profile.serviceArea,
      distanceKm: null,
      etaMinutes: null,
      cooperative: profile.cooperative,
      yearsExperience: Number(profile.yearsExperience) || null,
      certifications: profile.certifications,
      availability: profile.availability,
      phone: profile.phone,
      email: profile.email,
      kyc_status: 'pending',
      profileNote: 'Registration details are saved in this demo session only.',
    };
    set((state) => ({ workers: [...state.workers, worker] }));
    api.registerWorker({
      name: profile.name.trim(),
      phone: profile.phone,
      email: profile.email,
      skills: profile.skills,
      yearsExperience: profile.yearsExperience,
      cooperative: profile.cooperative,
      serviceArea: profile.serviceArea,
      availability: profile.availability,
    }).catch((e) => console.log('Background worker registration sync error:', e.message));
    return id;
  },

  feedback: [],
  submitFeedback: (entry) =>
    set((state) => {
      const duplicate = state.feedback.some((item) => item.jobId === entry.jobId && item.fromRole === entry.fromRole);
      if (duplicate) return state;
      const nextFeedback = { ...entry, id: `f${Date.now()}`, createdAt: new Date().toISOString() };
      return {
        feedback: [...state.feedback, nextFeedback],
        jobs: state.jobs.map((job) => job.id === entry.jobId ? { ...job, [`${entry.fromRole}FeedbackSubmitted`]: true } : job),
        workers: entry.fromRole === 'customer' ? state.workers.map((worker) => {
          if (worker.id !== entry.toWorkerId) return worker;
          const count = worker.feedbackCount ?? worker.totalJobs ?? 0;
          const previousAverage = worker.feedbackAverage ?? worker.rating;
          const nextCount = count + 1;
          const nextAverage = previousAverage == null ? entry.rating : ((previousAverage * count) + entry.rating) / nextCount;
          return { ...worker, feedbackCount: nextCount, feedbackAverage: Number(nextAverage.toFixed(1)), rating: Number(nextAverage.toFixed(1)) };
        }) : state.workers,
      };
    }),

  updateWorkerOnlineStatus: (workerId, isOnline) => {
    api.updateWorkerStatus(workerId, isOnline).catch((e) => console.log('Background worker status sync error:', e.message));
    set((state) => ({
      workers: state.workers.map((w) =>
        w.id === workerId ? { ...w, isOnline } : w
      ),
    }));
  },

  incrementWorkerJobs: (workerId, amount) =>
    set((state) => ({
      workers: state.workers.map((w) =>
        w.id === workerId
          ? { ...w, todayJobs: w.todayJobs + 1, todayEarnings: w.todayEarnings + amount }
          : w
      ),
    })),

  // ── Customer State ────────────────────────────────────────
  customers: MOCK_CUSTOMERS,
  updateCustomerProfile: (id, updates) => {
    api.updateCustomer(id, updates).catch((e) =>
      console.log('Background customer update sync error:', e.message)
    );
    set((state) => {
      const updatedCustomers = state.customers.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      );
      const updatedAuthCustomer =
        state.authCustomer && state.authCustomer.id === id
          ? { ...state.authCustomer, ...updates }
          : state.authCustomer;
      if (updatedAuthCustomer) {
        authStorage.setCustomer(updatedAuthCustomer);
      }
      return {
        customers: updatedCustomers,
        authCustomer: updatedAuthCustomer,
      };
    });
  },

  addCustomerAddress: async (customerId, addressData) => {
    try {
      const res = await api.addCustomerAddress(customerId, addressData);
      set((state) => {
        const defaultAddr = res.savedAddresses?.find((a) => a.isDefault) || res.savedAddresses?.[0];
        const updateAddress = (c) => ({
          ...c,
          address: defaultAddr ? defaultAddr.address : (c.address || ''),
          savedAddresses: res.savedAddresses || [],
        });
        const updatedCustomers = state.customers.map((c) =>
          c.id === customerId ? updateAddress(c) : c
        );
        const updatedAuthCustomer =
          state.authCustomer && state.authCustomer.id === customerId
            ? updateAddress(state.authCustomer)
            : state.authCustomer;
        if (updatedAuthCustomer) {
          authStorage.setCustomer(updatedAuthCustomer);
        }
        return {
          customers: updatedCustomers,
          authCustomer: updatedAuthCustomer,
        };
      });
      return res.savedAddresses;
    } catch (err) {
      // Fallback local update if offline
      const newAddr = {
        id: `a${Date.now()}`,
        label: addressData.label || 'home',
        address: addressData.address,
        isDefault: !!addressData.isDefault,
      };
      set((state) => {
        const updateAddress = (c) => {
          const list = c.savedAddresses || [];
          const updatedList = newAddr.isDefault
            ? list.map((a) => ({ ...a, isDefault: false }))
            : list;
          const newList = [...updatedList, newAddr];
          const def = newList.find((a) => a.isDefault) || newList[0];
          return {
            ...c,
            address: def ? def.address : (c.address || ''),
            savedAddresses: newList,
          };
        };
        const updatedCustomers = state.customers.map((c) =>
          c.id === customerId ? updateAddress(c) : c
        );
        const updatedAuthCustomer =
          state.authCustomer && state.authCustomer.id === customerId
            ? updateAddress(state.authCustomer)
            : state.authCustomer;
        if (updatedAuthCustomer) {
          authStorage.setCustomer(updatedAuthCustomer);
        }
        return {
          customers: updatedCustomers,
          authCustomer: updatedAuthCustomer,
        };
      });
    }
  },

  deleteCustomerAddress: async (customerId, addressId) => {
    try {
      const res = await api.deleteCustomerAddress(customerId, addressId);
      set((state) => {
        const defaultAddr = res.savedAddresses?.find((a) => a.isDefault) || res.savedAddresses?.[0];
        const updateAddress = (c) => ({
          ...c,
          address: defaultAddr ? defaultAddr.address : '',
          savedAddresses: res.savedAddresses || [],
        });
        const updatedCustomers = state.customers.map((c) =>
          c.id === customerId ? updateAddress(c) : c
        );
        const updatedAuthCustomer =
          state.authCustomer && state.authCustomer.id === customerId
            ? updateAddress(state.authCustomer)
            : state.authCustomer;
        if (updatedAuthCustomer) {
          authStorage.setCustomer(updatedAuthCustomer);
        }
        return {
          customers: updatedCustomers,
          authCustomer: updatedAuthCustomer,
        };
      });
    } catch (err) {
      // Fallback local deletion
      set((state) => {
        const updateAddress = (c) => {
          const remaining = (c.savedAddresses || []).filter((a) => a.id !== addressId);
          const def = remaining.find((a) => a.isDefault) || remaining[0];
          return {
            ...c,
            address: def ? def.address : '',
            savedAddresses: remaining,
          };
        };
        const updatedCustomers = state.customers.map((c) =>
          c.id === customerId ? updateAddress(c) : c
        );
        const updatedAuthCustomer =
          state.authCustomer && state.authCustomer.id === customerId
            ? updateAddress(state.authCustomer)
            : state.authCustomer;
        if (updatedAuthCustomer) {
          authStorage.setCustomer(updatedAuthCustomer);
        }
        return {
          customers: updatedCustomers,
          authCustomer: updatedAuthCustomer,
        };
      });
    }
  },

  // ── Jobs ──────────────────────────────────────────────────
  jobs: JOB_HISTORY,
  activeJob: null,
  incomingJob: null, // For worker dispatch modal

  addJob: (job) =>
    set((state) => ({
      jobs: [...state.jobs, job],
      activeJob: job,
    })),

  setActiveJob: (job) => set({ activeJob: job }),

  setIncomingJob: (job) => set({ incomingJob: job }),

  clearIncomingJob: () => set({ incomingJob: null }),

  acceptJob: (jobId) => {
    api.updateJobStatus(jobId, 'accepted').catch((e) => console.log('Background job status sync error:', e.message));
    set((state) => ({
      jobs: state.jobs.map((j) =>
        j.id === jobId ? { ...j, status: 'accepted' } : j
      ),
      incomingJob: null,
    }));
  },

  rejectJob: (jobId) => {
    api.updateJobStatus(jobId, 'rejected').catch((e) => console.log('Background job status sync error:', e.message));
    set((state) => ({
      jobs: state.jobs.map((j) =>
        j.id === jobId ? { ...j, status: 'rejected' } : j
      ),
      incomingJob: null,
    }));
  },

  completeJob: (jobId) => {
    api.updateJobStatus(jobId, 'completed').catch((e) => console.log('Background job status sync error:', e.message));
    set((state) => ({
      jobs: state.jobs.map((j) =>
        j.id === jobId ? { ...j, status: 'completed' } : j
      ),
      activeJob: null,
    }));
  },

  // ── KYC Queue ─────────────────────────────────────────────
  kycQueue: PENDING_KYC,

  approveKYC: (kycId) => {
    api.reviewKyc(kycId, 'approved').catch((e) => console.log('Background KYC review sync error:', e.message));
    set((state) => ({
      kycQueue: state.kycQueue.filter((k) => k.id !== kycId),
      workers: state.workers.map((w) => {
        const kyc = state.kycQueue.find((k) => k.id === kycId);
        return kyc && w.id === kyc.workerId ? { ...w, isVerified: true, kyc_status: 'approved' } : w;
      }),
    }));
  },

  rejectKYC: (kycId) => {
    api.reviewKyc(kycId, 'rejected').catch((e) => console.log('Background KYC review sync error:', e.message));
    set((state) => ({
      kycQueue: state.kycQueue.filter((k) => k.id !== kycId),
    }));
  },

  // ── Ranking Weights ───────────────────────────────────────
  rankingWeights: { ...DEFAULT_RANKING_WEIGHTS },

  updateRankingWeight: (key, value) =>
    set((state) => ({
      rankingWeights: { ...state.rankingWeights, [key]: value },
    })),

  resetRankingWeights: () =>
    set({ rankingWeights: { ...DEFAULT_RANKING_WEIGHTS } }),

  // ── Customer Search State ─────────────────────────────────
  searchResults: [],
  searchLoading: false,
  parsedIntent: null,
  selectedWorker: null,
  checkoutData: null,

  setSearchResults: (results) => set({ searchResults: results }),
  setSearchLoading: (loading) => set({ searchLoading: loading }),
  setParsedIntent: (intent) => set({ parsedIntent: intent }),
  setSelectedWorker: (worker) => set({ selectedWorker: worker }),
  setCheckoutData: (data) => set({ checkoutData: data }),

  // ── Notifications ─────────────────────────────────────────
  notifications: [],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        { id: Date.now(), timestamp: new Date().toISOString(), ...notification },
        ...state.notifications,
      ],
    })),
  clearNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  // ── Training Portal ───────────────────────────────────────
  traineeProgress: 0,
  isCertified: false,
  completeModule: () =>
    set((state) => {
      const nextProgress = Math.min(state.traineeProgress + 34, 100);
      return {
        traineeProgress: nextProgress,
        isCertified: nextProgress >= 100,
      };
    }),
  resetTraining: () => set({ traineeProgress: 0, isCertified: false }),


  // ── Getters (derived state) ───────────────────────────────
  getActiveCustomer: () => {
    const { authCustomer, customers, activeCustomerId } = get();
    // Prefer JWT-authenticated customer
    if (authCustomer) return authCustomer;
    return customers.find((c) => c.id === activeCustomerId);
  },
  getActiveWorker: () => {
    const { workers, activeWorkerId } = get();
    return workers.find((w) => w.id === activeWorkerId);
  },
  getTodayJobs: (workerId) => {
    const { jobs } = get();
    const id = workerId ?? get().activeWorkerId;
    return jobs.filter((j) => j.workerId === id && (j.date === '2026-09-19' || j.date === new Date().toISOString().split('T')[0]));
  },

  // ── Database Sync ─────────────────────────────────────────
  isDbConnected: false,
  fetchInitialData: async () => {
    try {
      const [workers, customers, jobs, kycQueue, rankingWeights] = await Promise.allSettled([
        api.getWorkers(),
        api.getCustomers(),
        api.getJobs(),
        api.getKycQueue(),
        api.getRankingWeights(),
      ]);

      const updates = { isDbConnected: true };
      if (workers.status === 'fulfilled' && workers.value?.length > 0) {
        updates.workers = workers.value;
      }
      if (customers.status === 'fulfilled' && customers.value?.length > 0) {
        updates.customers = customers.value;
      }
      if (jobs.status === 'fulfilled' && jobs.value?.length > 0) {
        updates.jobs = jobs.value;
      }
      if (kycQueue.status === 'fulfilled' && kycQueue.value?.length > 0) {
        updates.kycQueue = kycQueue.value;
      }
      if (rankingWeights.status === 'fulfilled' && rankingWeights.value) {
        updates.rankingWeights = rankingWeights.value;
      }

      set((state) => ({ ...state, ...updates }));
      console.log('✅ Synchronized state with PostgreSQL database');
    } catch (err) {
      console.log('⚠️ PostgreSQL backend not reachable yet, running with local seed state:', err.message);
    }
  },
}));

// Auto-trigger sync + auth restore when store initializes
if (typeof window !== 'undefined' || typeof global !== 'undefined') {
  setTimeout(() => {
    const store = useAppStore.getState();
    store.restoreAuth();
    store.fetchInitialData();
  }, 100);
}
