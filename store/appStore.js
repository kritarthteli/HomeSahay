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

  // Worker JWT auth — kept fully separate from the customer fields
  // above (own token, own profile, own loading flag) so restoring or
  // clearing a worker session can never touch the customer session.
  authWorkerToken: null,
  authWorker: null, // the JWT-authenticated worker profile (from /auth/worker/me)
  workerAuthLoading: true, // starts true — we check for a saved worker token on boot

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

  // Legacy login (for DEMO workers/admin — kept for compatibility).
  // IMPORTANT: this is the demo/local-only path. It never touches the
  // worker JWT or authWorker profile below, so a demo login can never
  // be mistaken for — or overwrite — a real authenticated worker
  // session, and vice versa.
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

  // ── Worker JWT Auth Actions (REAL, PostgreSQL-backed workers) ────
  // These are additive alongside the legacy login/logout('worker', ...)
  // above, which remains exactly as-is for the "QUICK DEMO WORKERS"
  // shortcuts. A demo login never sets authWorkerToken/authWorker, and
  // a real login/restoreWorkerAuth below never disturbs demo state
  // beyond the shared `activeWorkerId`/`auth.worker` fields that both
  // paths always needed anyway.

  /**
   * Real worker login: phone + password against PostgreSQL via
   * POST /api/auth/worker/login. Throws on invalid credentials — the
   * screen is responsible for showing that error to the user.
   */
  loginWorkerWithPassword: async (phone, password) => {
    const result = await api.authWorkerLogin(phone, password);
    // result = { token, worker } — worker here is the auth-shaped
    // profile from formatWorkerAuth() on the backend (id, name, phone,
    // email, categoryId, cooperativeId, isVerified, kycStatus) — not
    // the full dashboard shape yet.
    await authStorage.setWorkerToken(result.token);
    await authStorage.setWorker(result.worker);

    set((state) => ({
      authWorkerToken: result.token,
      authWorker: result.worker,
      activeWorkerId: result.worker.id,
      auth: { ...state.auth, worker: true },
      workerAuthLoading: false,
    }));

    // Load the full, dashboard-ready worker record (avatar, rating,
    // pricePerHour, weeklyJobs, etc.) using the existing public
    // GET /api/workers/:id endpoint, and merge it into `workers` so
    // the dashboard/dispatch/track/profile screens — which all just
    // do `workers.find(w => w.id === activeWorkerId)` — pick up the
    // real worker's real data with no further changes.
    try {
      const full = await api.getWorkerById(result.worker.id);
      set((state) => {
        const exists = state.workers.some((w) => w.id === full.id);
        return {
          workers: exists
            ? state.workers.map((w) => (w.id === full.id ? full : w))
            : [...state.workers, full],
        };
      });
    } catch (e) {
      console.log('Could not load full worker profile after login:', e.message);
    }

    return result.worker;
  },

  /**
   * Check for a saved worker token and restore the session on app
   * start (mirrors restoreAuth() for customers, but fully separate).
   */
  restoreWorkerAuth: async () => {
    try {
      const token = await authStorage.getWorkerToken();
      if (!token) {
        set({ workerAuthLoading: false });
        return false;
      }

      try {
        const result = await api.authWorkerVerify();
        await authStorage.setWorker(result.worker);

        set((state) => ({
          authWorkerToken: token,
          authWorker: result.worker,
          activeWorkerId: result.worker.id,
          auth: { ...state.auth, worker: true },
          workerAuthLoading: false,
        }));

        try {
          const full = await api.getWorkerById(result.worker.id);
          set((state) => {
            const exists = state.workers.some((w) => w.id === full.id);
            return {
              workers: exists
                ? state.workers.map((w) => (w.id === full.id ? full : w))
                : [...state.workers, full],
            };
          });
        } catch (_) {}

        console.log('✅ Worker JWT session restored for:', result.worker.name);
        return true;
      } catch (serverErr) {
        // Token invalid/expired or server unreachable — clear it and
        // send the user back to worker login, same as the customer flow.
        console.log('⚠️ Worker token verify failed:', serverErr.message);
        await authStorage.removeWorkerToken();
        set((state) => ({
          authWorkerToken: null,
          authWorker: null,
          auth: { ...state.auth, worker: false },
          workerAuthLoading: false,
        }));
        return false;
      }
    } catch (err) {
      console.log('Worker auth restore error:', err);
      set({ workerAuthLoading: false });
      return false;
    }
  },

  // ── Cooperative Admin JWT Auth (REAL, PostgreSQL-backed) ─────────
  // Fully separate from the demo `login('admin')` path further above
  // and from customer/worker auth: own token, own profile, own
  // loading flag. `auth.admin` is still the flag the existing screens
  // (Redirect guards, sidebar, etc.) check, so real login/restore also
  // sets that — a demo login and a real login both flip the same
  // switch, they just get there through different, non-overlapping
  // state.
  authCoopAdminToken: null,
  authCoopAdmin: null, // { id, name, phone, email, cooperativeId, cooperativeName }
  coopAdminAuthLoading: true,

  /**
   * Real cooperative-admin login: phone-or-email + password against
   * PostgreSQL via POST /api/auth/cooperative-admin/login. Throws on
   * invalid credentials — the screen shows that error to the user.
   */
  loginCoopAdminWithPassword: async (identifier, password) => {
    const result = await api.authCooperativeAdminLogin(identifier, password);
    // result = { token, admin }
    await authStorage.setCoopAdminToken(result.token);
    await authStorage.setCoopAdmin(result.admin);

    set((state) => ({
      authCoopAdminToken: result.token,
      authCoopAdmin: result.admin,
      auth: { ...state.auth, admin: true },
      coopAdminAuthLoading: false,
    }));

    // Load this cooperative's real KYC queue + worker roster right
    // after login so the dashboard has data the moment it mounts.
    await get().fetchCoopAdminData();

    return result.admin;
  },

  /**
   * Check for a saved cooperative-admin token and restore the session
   * on app start (mirrors restoreWorkerAuth(), fully separate).
   */
  restoreCoopAdminAuth: async () => {
    try {
      const token = await authStorage.getCoopAdminToken();
      if (!token) {
        set({ coopAdminAuthLoading: false });
        return false;
      }

      try {
        const result = await api.authCooperativeAdminVerify();
        await authStorage.setCoopAdmin(result.admin);

        set((state) => ({
          authCoopAdminToken: token,
          authCoopAdmin: result.admin,
          auth: { ...state.auth, admin: true },
          coopAdminAuthLoading: false,
        }));

        await get().fetchCoopAdminData();

        console.log('✅ Cooperative admin JWT session restored for:', result.admin.name);
        return true;
      } catch (serverErr) {
        console.log('⚠️ Cooperative admin token verify failed:', serverErr.message);
        await authStorage.removeCoopAdminToken();
        set((state) => ({
          authCoopAdminToken: null,
          authCoopAdmin: null,
          auth: { ...state.auth, admin: false },
          coopAdminAuthLoading: false,
        }));
        return false;
      }
    } catch (err) {
      console.log('Cooperative admin auth restore error:', err);
      set({ coopAdminAuthLoading: false });
      return false;
    }
  },

  /**
   * Load the authenticated cooperative's own KYC queue and worker
   * roster from PostgreSQL — backend-scoped to req.user.cooperativeId,
   * so this can never return another cooperative's data.
   */
  fetchCoopAdminData: async () => {
    const { authCoopAdmin } = get();
    if (!authCoopAdmin) return;
    try {
      const [kycQueue, roster] = await Promise.allSettled([
        api.getKycQueue(),
        api.getCooperativeWorkers(authCoopAdmin.cooperativeId),
      ]);
      const updates = {};
      if (kycQueue.status === 'fulfilled') updates.kycQueue = kycQueue.value;
      if (roster.status === 'fulfilled') updates.coopRoster = roster.value;
      set(updates);
    } catch (err) {
      console.log('Error loading cooperative admin data:', err.message);
    }
  },

  logoutCoopAdmin: async () => {
    await authStorage.removeCoopAdminToken();
    set((state) => ({
      authCoopAdminToken: null,
      authCoopAdmin: null,
      auth: { ...state.auth, admin: false },
      kycQueue: [],
      coopRoster: [],
    }));
  },

  /**
   * Logout — clears the worker JWT/profile and the auth.worker flag.
   * Safe to call even for a demo session (there's simply no token to
   * remove), so both worker screens can call this on "Log out".
   */
  logoutWorker: async () => {
    await authStorage.removeWorkerToken();
    set((state) => ({
      authWorkerToken: null,
      authWorker: null,
      auth: { ...state.auth, worker: false },
      activeWorkerId: null,
    }));
  },

  // ── Workers ───────────────────────────────────────────────
  workers: MOCK_WORKERS,

  /**
   * Real worker registration: sends name/phone/email/password/skills/etc.
   * to POST /api/workers, which creates the PostgreSQL worker row (with
   * a bcrypt-hashed password) plus a pending kyc_applications row.
   *
   * Deliberately does NOT log the worker in or add a fabricated local
   * worker object — a worker is not verified just by registering, and
   * the real profile should come from the backend once they actually
   * log in. Throws on failure (e.g. duplicate phone/email) so the
   * registration screen can show the real backend error.
   */
  registerWorker: async (profile) => {
    // The registration form now collects exactly ONE category
    // (`profile.category`, e.g. "plumber") instead of a `skills` array.
    // `categoryId` is sent as the canonical field; `skills` is also sent
    // as a single-element array purely for backward compatibility with
    // the existing POST /api/workers contract.
    const result = await api.registerWorker({
      name: profile.name.trim(),
      phone: profile.phone,
      email: profile.email,
      password: profile.password,
      categoryId: profile.category,
      skills: profile.category ? [profile.category] : [],
      yearsExperience: profile.yearsExperience,
      cooperative: profile.cooperative,
      serviceArea: profile.serviceArea,
      availability: profile.availability,
    });
    // result = { id, message, kycId }
    return result;
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

  // Worker-initiated job lifecycle transitions. These now AWAIT the
  // real PostgreSQL-backed PATCH /api/jobs/:id/status call (with the
  // worker's own JWT) before touching local state, so a 401/404/invalid
  // transition throws back to the screen instead of the UI silently
  // pretending the job moved forward.
  acceptJob: async (jobId) => {
    await api.updateJobStatus(jobId, 'accepted', 'worker');
    set((state) => ({
      jobs: state.jobs.map((j) =>
        j.id === jobId ? { ...j, status: 'accepted' } : j
      ),
      incomingJob: null,
    }));
  },

  rejectJob: async (jobId) => {
    await api.updateJobStatus(jobId, 'rejected', 'worker');
    set((state) => ({
      jobs: state.jobs.map((j) =>
        j.id === jobId ? { ...j, status: 'rejected' } : j
      ),
      incomingJob: null,
    }));
  },

  // ACCEPTED -> IN_PROGRESS. Worker taps "start work" on the track
  // screen; the customer's tracking poll picks this up within ~2s.
  startJob: async (jobId) => {
    await api.updateJobStatus(jobId, 'in_progress', 'worker');
    set((state) => ({
      jobs: state.jobs.map((j) =>
        j.id === jobId ? { ...j, status: 'in_progress' } : j
      ),
    }));
  },

  completeJob: async (jobId) => {
    await api.updateJobStatus(jobId, 'completed', 'worker');
    set((state) => ({
      jobs: state.jobs.map((j) =>
        j.id === jobId ? { ...j, status: 'completed' } : j
      ),
      activeJob: null,
    }));
  },

  // ── KYC Queue ─────────────────────────────────────────────
  // Real data once a cooperative admin is authenticated (see
  // fetchCoopAdminData above); starts as the local seed array only so
  // screens have something to render before that fetch resolves.
  kycQueue: PENDING_KYC,
  coopRoster: [],

  /**
   * Approve a KYC application. Awaits the real backend call (instead
   * of firing-and-forgetting it) so a 401/403/network failure is
   * thrown back to the screen instead of the UI quietly pretending it
   * worked — the previous behavior masked the cooperative-admin auth
   * gap entirely.
   */
  approveKYC: async (kycId) => {
    await api.reviewKyc(kycId, 'approved');
    set((state) => ({
      kycQueue: state.kycQueue.filter((k) => k.id !== kycId),
      workers: state.workers.map((w) => {
        const kyc = state.kycQueue.find((k) => k.id === kycId);
        return kyc && w.id === kyc.workerId ? { ...w, isVerified: true, kyc_status: 'approved' } : w;
      }),
      coopRoster: state.coopRoster.map((w) =>
        w.id === state.kycQueue.find((k) => k.id === kycId)?.workerId
          ? { ...w, isVerified: true, kycStatus: 'approved' }
          : w
      ),
    }));
  },

  rejectKYC: async (kycId, rejectionReason = 'Application rejected by cooperative') => {
    await api.reviewKyc(kycId, 'rejected', rejectionReason);
    set((state) => ({
      kycQueue: state.kycQueue.filter((k) => k.id !== kycId),
      coopRoster: state.coopRoster.map((w) =>
        w.id === state.kycQueue.find((k) => k.id === kycId)?.workerId
          ? { ...w, isVerified: false, kycStatus: 'rejected' }
          : w
      ),
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
    const { workers, activeWorkerId, authWorker } = get();
    const found = workers.find((w) => w.id === activeWorkerId);

    // For a REAL authenticated worker, verification/KYC status must
    // always come from the JWT-backed authWorker profile (the server's
    // source of truth), never from whatever happens to be cached in
    // the `workers` list — a client-side value here must not be able
    // to grant verified status.
    if (authWorker && authWorker.id === activeWorkerId) {
      if (found) {
        return { ...found, isVerified: authWorker.isVerified, kyc_status: authWorker.kycStatus };
      }
      // Full dashboard record hasn't loaded yet (e.g. right after
      // login, before getWorkerById resolves) — fall back to the
      // auth-shaped profile alone so the screens still have *something*
      // to render instead of nothing.
      return {
        id: authWorker.id,
        name: authWorker.name,
        avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(authWorker.id)}`,
        skills: [authWorker.categoryId],
        category: authWorker.categoryId,
        cooperative: authWorker.cooperativeId,
        rating: 0,
        totalJobs: 0,
        todayJobs: 0,
        todayEarnings: 0,
        isVerified: authWorker.isVerified,
        isOnline: false,
        location: null,
        distanceKm: null,
        etaMinutes: null,
        yearsExperience: 0,
        pricePerHour: 0,
        kyc_status: authWorker.kycStatus,
        weeklyJobs: [0, 0, 0, 0, 0, 0, 0],
        phone: authWorker.phone,
        email: authWorker.email,
      };
    }

    return found;
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
      // NOTE: the KYC queue is intentionally NOT fetched here. It is
      // cooperative-scoped and requires a real COOPERATIVE_ADMIN JWT —
      // see fetchCoopAdminData(), which runs once an admin actually
      // logs in or restores a session. Fetching it here unauthenticated
      // used to silently 401 and mask the whole cooperative auth gap.
      const [workers, customers, jobs, rankingWeights] = await Promise.allSettled([
        api.getWorkers(),
        api.getCustomers(),
        api.getJobs(),
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
    store.restoreWorkerAuth();
    store.restoreCoopAdminAuth();
    store.fetchInitialData();
  }, 100);
}
