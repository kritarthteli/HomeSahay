# HomeSahay (Cooperative Gig Services Platform)

This is the frontend prototype and backend API for HomeSahay, built for SIH 2026. The platform consists of a unified React Native frontend (built with Expo SDK 51+) that serves three distinct roles, backed by a Node.js/PostgreSQL backend featuring AI-powered matching.

## Table of Contents
- [Project Overview](#project-overview)
- [Prerequisites](#prerequisites)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Combined / Hackathon Demo Mode](#combined--hackathon-demo-mode)
- [Features & Architecture](#features--architecture)
- [Project Layout](#project-layout)
- [Build Profiles](#build-profiles-eas)
- [Development Tasks](#development-tasks)
- [Notes & Known Limitations](#notes--known-limitations)

---

## Project Overview
The repository contains a combined build covering:
- **Base Project (Person 1)**: Auth, RBAC, KYC, cooperatives, base schema.
- **Matching & AI (Person 2)**: Worker eligibility, fair matching (skill + distance + rating + workload), basic AI request understanding via Ollama/Qwen, routing.
- **Services & Booking (Person 3)**: Job lifecycle, notifications, demo payments, reviews, analytics.

### 3 Independent Apps in One Frontend
Each role runs as its own standalone application on a dedicated port with its own branding and routes:
| App | Command (Web) | Native / Dev Server | Port | App Name & Bundle |
|---|---|---|---|---|
| **Customer App** | `npm run web:customer` | `npm run customer` | `8081` | **HomeSahay** (`com.homesahay.app`) |
| **Worker Partner** | `npm run web:worker` | `npm run worker` | `8082` | **HomeSahay Partner** (`com.homesahay.worker`) |
| **Cooperative Admin** | `npm run web:admin` | `npm run admin` | `8083` | **HomeSahay Admin** (`com.homesahay.admin`) |

---

## Prerequisites
- **Node.js 18+** — Required for `fetch` used by the AI/routing services and job auto-matching.
- **PostgreSQL** — Local install, Docker, or a hosted instance. **PostGIS is optional** (falls back to plain-JS distance math).
- **Ollama (Optional)** — For real AI request parsing (falls back to keyword-based parsing if not installed).

---

## Backend Setup

1. **Database Ready**
   Create an empty database:
   ```bash
   psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE homesahay;"
   ```

2. **Configure Environment**
   ```bash
   cd server
   cp .env.example .env
   ```
   Open `server/.env` and configure your database variables:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=your_real_password
   DB_NAME=homesahay
   JWT_SECRET=paste_a_long_random_string_here
   ```
   *(Generate a secure JWT secret: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`)*

3. **Install & Start Backend**
   ```bash
   cd server
   npm install
   npm start
   ```
   *The server will auto-create tables via `schema.sql` and seed demo data if empty.*
   - Test health check: `curl http://localhost:5000/api/health`
   - Run tests: `npm test` (No live DB needed, covers AI, eligibility, fair-matching)

4. **(Optional) Demo Workers**
   Load extra demo workers for richer matching:
   ```bash
   psql -U postgres -h localhost -p 5432 -d homesahay -f tests/dummy_workers_bengaluru.sql
   ```

5. **(Optional) AI Setup (Ollama)**
   ```bash
   ollama pull qwen2.5:3b
   ollama serve
   ```
   *Ensure `AI_MOCK_MODE=false` in `.env` to try Ollama first.*

---

## Frontend Setup

From the project root:
```bash
npm install

# Start the app for a specific role
npm run web:customer   # Browser, port 8081
npm run customer       # Expo Go / Simulator, port 8081
npm run worker         # Worker app, port 8082
npm run admin          # Admin app, port 8083
```

By default, the frontend points to `http://localhost:5000/api`. If your backend runs elsewhere, prefix the start command:
```bash
EXPO_PUBLIC_API_URL=http://<backend-ip>:5000/api npm run customer
```

---

## Combined / Hackathon Demo Mode
Run `npm run web` (or `npx expo start --web`) without setting any role to boot into **Demo Mode**. It features a Role Picker splash screen and a floating Role Switcher for easy side-by-side presentation.

---

## Features & Architecture

### Matching Formula
- **Skill:** 35% | **Distance:** 25% | **Rating:** 20% | **Workload:** 20%
- Workload fairness uses min-max normalization of `today_jobs + sum(weekly_jobs)` within the eligible pool.

### AI Behavior
- `POST /api/ai/parse-request` attempts Ollama (Qwen) first (4s timeout).
- Automatically falls back to deterministic keyword parsing on failure.
- Responses strictly validated against a whitelist.

---

## Project Layout

```
HomeSahay/
├── app/                       Expo Router screens (customer/worker/admin)
├── components/                Shared UI components
├── services/                  Frontend API client, mock data, auth
├── store/                     App state (Zustand-style store)
├── server/
│   ├── index.js               Express app — mounts all routers
│   ├── db.js, schema.sql      PostgreSQL connection + idempotent schema
│   ├── seed.js                Demo data seeding
│   ├── routes/                API endpoints (auth, matching, ai, jobs, etc.)
│   ├── services/              Backend services (matching, AI, eligibility, etc.)
│   └── tests/                 Unit tests and demo SQL
```

---

## Build Profiles (EAS)

The `eas.json` is configured to build distinct standalone binaries.
To build a specific variant, use the `--profile` flag:
```bash
eas build --profile production-worker --platform android
```

---

## Development Tasks (SIH26089)
- [x] package.json, app.json, babel.config.js
- [ ] **Foundation**: `constants/theme.js`, `data/seedData.js`, `services/mockApi.js`, `store/appStore.js`
- [ ] **Components**: `RoleSwitcher`, `MapViewComponent`, `WorkerCard`, `SOSButton`, `AIInputBar`, `CheckoutSheet`, `JobModal`, `AnalyticsChart`, `RankingSliders`
- [ ] **Screens**: Routing structures for customer, worker, and admin interfaces

---

## Notes & Known Limitations
- **Payments:** Demo/mock only. `paymentService.js` never calls a real gateway (`isDemo: true`).
- **Notifications:** In-app/DB only (no push notifications).
- **PostGIS & OSRM:** Optional. Plain-JS fallbacks are used if they are unavailable.
- **Testing Gap:** Integration tests run against mocked queries due to unavailable live DB during initial implementation.
