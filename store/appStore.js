// ============================================================
// Zustand Global State Store — SIH Cooperative Gig Platform
// ============================================================

import { create } from 'zustand';
import { MOCK_WORKERS, MOCK_CUSTOMERS, PENDING_KYC, JOB_HISTORY, DEFAULT_RANKING_WEIGHTS } from '../data/seedData';

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

  setRole: (role) => set({ role }),
  setActiveCustomer: (id) => set({ activeCustomerId: id }),
  setActiveWorker: (id) => set({ activeWorkerId: id }),

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

  updateWorkerOnlineStatus: (workerId, isOnline) =>
    set((state) => ({
      workers: state.workers.map((w) =>
        w.id === workerId ? { ...w, isOnline } : w
      ),
    })),

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
  activeCustomerId: MOCK_CUSTOMERS[0].id,
  setActiveCustomer: (id) => set({ activeCustomerId: id }),
  updateCustomerProfile: (id, updates) =>
    set((state) => ({
      customers: state.customers.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),

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

  acceptJob: (jobId) =>
    set((state) => ({
      jobs: state.jobs.map((j) =>
        j.id === jobId ? { ...j, status: 'accepted' } : j
      ),
      incomingJob: null,
    })),

  rejectJob: (jobId) =>
    set((state) => ({
      jobs: state.jobs.map((j) =>
        j.id === jobId ? { ...j, status: 'rejected' } : j
      ),
      incomingJob: null,
    })),

  completeJob: (jobId) =>
    set((state) => ({
      jobs: state.jobs.map((j) =>
        j.id === jobId ? { ...j, status: 'completed' } : j
      ),
      activeJob: null,
    })),

  // ── KYC Queue ─────────────────────────────────────────────
  kycQueue: PENDING_KYC,

  approveKYC: (kycId) =>
    set((state) => ({
      kycQueue: state.kycQueue.filter((k) => k.id !== kycId),
      workers: state.workers.map((w) => {
        const kyc = state.kycQueue.find((k) => k.id === kycId);
        return kyc && w.id === kyc.workerId ? { ...w, isVerified: true, kyc_status: 'approved' } : w;
      }),
    })),

  rejectKYC: (kycId) =>
    set((state) => ({
      kycQueue: state.kycQueue.filter((k) => k.id !== kycId),
    })),

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
    const { customers, activeCustomerId } = get();
    return customers.find((c) => c.id === activeCustomerId);
  },
  getActiveWorker: () => {
    const { workers, activeWorkerId } = get();
    return workers.find((w) => w.id === activeWorkerId);
  },
  getTodayJobs: (workerId) => {
    const { jobs } = get();
    const id = workerId ?? get().activeWorkerId;
    return jobs.filter((j) => j.workerId === id && j.date === '2026-09-19');
  },
}));
