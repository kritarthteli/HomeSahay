# HomeSahay — Cooperative Gig Service Platform (SIH 2026)

Combined build: Person 1 (auth/RBAC/KYC/cooperatives — base project),
Person 2 (`matching-ai`: eligibility, fair matching, AI request
parsing, routing — see `server/MATCHING_AI_CHANGES.md`), and Person 3
(`services-booking`: job lifecycle, notifications, demo payments,
reviews, analytics — see `server/PERSON3_CHANGES.md`).

Nothing here touches auth, RBAC, or the KYC review flow.

---

## 0. Prerequisites

- **Node.js 18+** (check with `node -v`) — required for `fetch` used
  by the AI/routing services and Person 3's job auto-matching.
- **PostgreSQL** running somewhere you can connect to (local install,
  Docker, or a hosted instance). **PostGIS is optional** — the app
  detects it automatically and falls back to plain-JS distance math if
  it's not installed.
- **Ollama** is optional too — only needed if you want real AI parsing
  instead of the built-in keyword fallback (see step 4).

## 1. Get the database ready

Create an empty database (the app can also auto-create it for you if
the role you connect as has `CREATEDB`, but it's simplest to make it
yourself):

```bash
psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE homesahay;"
```

> Using a non-default Postgres port (e.g. **5433**)? Just remember the
> number — you'll put it in `.env` in the next step, nothing else
> needs to change.

## 2. Configure the backend

```bash
cd server
cp .env.example .env
```

Open `server/.env` and set at minimum:

```
DB_HOST=localhost
DB_PORT=5432          # change to 5433 (or whatever) if that's your setup
DB_USER=postgres
DB_PASSWORD=your_real_password
DB_NAME=homesahay

JWT_SECRET=paste_a_long_random_string_here
```

Generate a strong `JWT_SECRET` with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Everything else in `.env.example` (`OLLAMA_*`, `AI_MOCK_MODE`,
`OSRM_*`) has a safe default — leave it as-is unless you're running
Ollama/OSRM locally.

## 3. Install and start the backend

```bash
cd server
npm install
npm start
```

On first boot the server automatically:
- creates the database if it doesn't exist,
- applies `schema.sql` (idempotent — safe to run every time),
- seeds demo customers/workers/jobs if the `workers` table is empty.

You should see:
```
✅ Schema verified/updated.
🚀 HomeSahay PostgreSQL Backend running at http://localhost:5000
```

Confirm it's alive:
```bash
curl http://localhost:5000/api/health
```

### Run the backend unit tests (no live DB needed)
```bash
cd server
npm test
```
Should print `24 pass / 0 fail` — this covers eligibility filtering,
fair-matching scoring, and AI-parser validation with a mocked DB.

### Load extra demo workers (optional, for a richer matching demo)
```bash
psql -U postgres -h localhost -p 5432 -d homesahay -f server/tests/dummy_workers_bengaluru.sql
```

## 4. (Optional) Run Ollama for real AI parsing

Without this, `POST /api/ai/parse-request` automatically and silently
uses the deterministic keyword fallback — the app works fine either
way.

```bash
ollama pull qwen2.5:3b
ollama serve
```
Then in `server/.env`, leave `AI_MOCK_MODE=false` (default) so it
tries Ollama first.

## 5. Install and start the frontend (Expo app)

From the project root (not `server/`):

```bash
npm install
npm run web:customer     # customer app in the browser, port 8081
# or
npm run customer         # customer app on your phone via Expo Go, port 8081
npm run worker            # worker app, port 8082
npm run admin              # cooperative/platform admin app, port 8083
```

The frontend talks to the backend at `http://localhost:5000/api` by
default (`services/apiClient.js`). If your backend runs elsewhere,
set:
```bash
EXPO_PUBLIC_API_URL=http://<your-backend-host>:5000/api
```
before running the `npm run ...` command above.

## 6. Quick end-to-end smoke test (curl)

```bash
# 1. Parse a natural-language request
curl -X POST http://localhost:5000/api/ai/parse-request \
  -H "Content-Type: application/json" \
  -d '{"text": "My kitchen tap is leaking"}'

# 2. Rank eligible workers for that request (Bengaluru coords)
curl -X POST http://localhost:5000/api/matching/rank \
  -H "Content-Type: application/json" \
  -d '{"serviceCategory":"plumber","requiredSkill":"pipe_repair","latitude":12.9416,"longitude":77.5661}'

# 3. Create a job for the top-ranked worker (swap in a real workerId/customerId from your DB)
curl -X POST http://localhost:5000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{"customerId":"c001","workerId":"w_demo_b","category":"plumber"}'
```

## Project layout

```
HomeSahay/
├── app/                       Expo Router screens (customer/worker/admin)
├── components/                Shared UI components
├── services/                  Frontend API client, mock data, auth
├── store/                     App state (Zustand-style store)
├── server/
│   ├── index.js                Express app — mounts every router below
│   ├── db.js, schema.sql       Postgres connection + idempotent schema
│   ├── seed.js                 Demo data seeding
│   ├── routes/
│   │   ├── auth.js, kyc.js, workers.js, customers.js,
│   │   │   cooperatives.js, config.js      (Person 1 — base)
│   │   ├── matching.js, ai.js, routing.js  (Person 2 — matching-ai)
│   │   └── jobs.js, analytics.js,
│   │       notifications.js, payments.js,
│   │       reviews.js                       (Person 3 — services-booking)
│   ├── services/
│   │   ├── eligibilityService.js, matchingService.js,
│   │   │   aiService.js, routingService.js  (Person 2)
│   │   └── notificationService.js, paymentService.js (Person 3)
│   ├── tests/                                (Person 2 — unit tests + demo SQL)
│   ├── MATCHING_AI_CHANGES.md                 (Person 2 write-up)
│   └── PERSON3_CHANGES.md                     (Person 3 write-up)
```

## Notes / known limitations
- Payments are **demo/mock only** — `paymentService.js` never calls a
  real gateway; every response is marked `isDemo: true`.
- Notifications are in-app/DB only (no push notifications).
- PostGIS and OSRM are both optional — plain-JS fallbacks are used
  automatically if either is unavailable.
