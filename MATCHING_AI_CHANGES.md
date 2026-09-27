# matching-ai branch — Person 2 deliverables

Scope: worker eligibility, fair worker matching, basic AI request
understanding, location-based matching. Auth, RBAC, KYC, cooperative
management and the existing schema were **not** modified beyond one
additive `.env.example` section.

## Files added
```
server/config/matching.js              weights, thresholds, skill/category vocab
server/services/eligibilityService.js  eligibility filter (PostGIS-aware, Haversine fallback)
server/services/matchingService.js     fair scoring + ranking engine
server/services/aiService.js           Ollama+Qwen with validated keyword fallback
server/services/routingService.js      OSRM with Haversine fallback
server/routes/matching.js              POST /api/matching/rank
server/routes/ai.js                    POST /api/ai/parse-request
server/routes/routing.js               GET  /api/routing/route
server/tests/*.test.js                 24 unit tests (mocked DB, no live Postgres needed)
server/tests/dummy_workers_bengaluru.sql  demo/test data seeded around Bengaluru
```

## Files modified
```
server/index.js        +4 lines: require & mount the 3 new routers
server/.env.example     new optional OLLAMA_*/AI_MOCK_MODE/OSRM_* vars, all safe defaults
server/package.json     added "test": "node --test"
```

## Run it
```bash
cd server
npm install
cp .env.example .env        # fill in DB_PASSWORD and JWT_SECRET at minimum
npm test                    # 24/24 unit tests, no DB required
npm start                   # starts the full API on :5000
```

Load `server/tests/dummy_workers_bengaluru.sql` into your Postgres
instance (matches `homesahay_app` schema) to get realistic Bengaluru
workers for a live demo of `/api/matching/rank`.

## Matching formula
Skill 35% / Distance 25% / Rating 20% / Workload 20%
(`MATCHING_WEIGHTS` in `server/config/matching.js`).

Workload fairness = min-max normalization of
`today_jobs + sum(weekly_jobs)` **within the current eligible pool**
— not a fixed `1/rating` penalty. Demonstrated in
`server/tests/matchingService.test.js`: an overworked 4.9★ worker
loses to a 4.6★ worker with a light recent load.

## AI behavior
`POST /api/ai/parse-request` tries Ollama+Qwen first (configurable via
`OLLAMA_BASE_URL` / `OLLAMA_MODEL`, 4s timeout), and falls back
automatically to a deterministic keyword parser on any failure, or
always when `AI_MOCK_MODE=true`. Every field returned is validated
against a strict whitelist before leaving the service — the AI can
never select or return a worker.

## Known gap
No live Postgres was available in the environment used to build this,
so integration testing was done against a mocked `pool.query`, not a
running database. All logic is covered by unit tests; please run
`npm start` + the SQL file against your real DB for the live demo.
