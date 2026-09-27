# services-booking (Person 3) — job lifecycle, matching hookup, mock payments, reviews, notifications, analytics

## How to apply
Drop these files into the matching paths under your `server/` directory
(overwriting `routes/jobs.js`, `routes/analytics.js`, `index.js`, and
`schema.sql`; adding everything else as new files), then restart the
server. `schema.sql` is applied automatically and idempotently on boot
(`db.js:runSchema()`), so no manual migration step is needed — the two
new tables (`notifications`, `payments`) will be created on next start.

No new npm dependencies were added. Node 18+ is required (job auto-matching
uses the global `fetch`, available since Node 18).

## Files
```
server/index.js                        modified — mounts 3 new routers
server/schema.sql                      modified — additive: notifications, payments tables
server/routes/jobs.js                  rewritten — status lifecycle + matching hookup
server/routes/analytics.js             modified — additive fields only
server/routes/notifications.js         new
server/routes/payments.js              new
server/routes/reviews.js               new
server/services/notificationService.js new
server/services/paymentService.js      new
```
Untouched: `auth.js`, `kyc.js`, `workers.js`, `customers.js`, `cooperatives.js`,
`config.js`, `middleware/`, `config/jwt.js` — no auth/RBAC/KYC/matching/
cooperative logic was touched.

## 1. Job lifecycle
`PENDING → ASSIGNED → ACCEPTED → IN_PROGRESS → COMPLETED` (+`CANCELLED`),
mapped onto the **existing** lowercase strings so nothing else in the app
needs to change:

| Brief name  | DB string             | Meaning |
|---|---|---|
| PENDING     | `pending`              | job row exists, no worker matched yet |
| ASSIGNED    | `pending_acceptance`   | worker matched, awaiting their accept/reject (existing string, unchanged) |
| ACCEPTED    | `accepted`             | existing string, unchanged |
| IN_PROGRESS | `in_progress`          | existing string, unchanged |
| COMPLETED   | `completed`            | existing string, unchanged |
| CANCELLED   | `cancelled`            | existing string, unchanged |
| (REJECTED)  | `rejected`             | worker declined — existing terminal state, kept |

`PATCH /api/jobs/:id/status` validates every transition against an explicit
allow-list and rejects anything else with 400, e.g. `pending_acceptance →
completed` is blocked (must pass through `accepted` and `in_progress`
first). Terminal states (`completed`/`cancelled`/`rejected`) reject any
further transition.

`GET /api/jobs` and `GET /api/jobs/:id` are unchanged in shape, plus an
optional `?status=` filter and the job's `rating`/`review` in the response.

## 2. Matching integration
No matching algorithm was reimplemented. The **existing** primary flow is
untouched: the customer app already calls `GET /api/workers/nearby`
(Person 2's fairness-ranked endpoint) client-side and passes the chosen
`workerId` to `POST /api/jobs` — that job is created directly at ASSIGNED.

**New, optional path**: if `POST /api/jobs` is called *without* `workerId`
(just `customerId` + `category`), the job is created `PENDING`, and the
server itself calls `GET /api/workers/nearby` (a plain HTTP self-request —
Person 2's endpoint, byte-for-byte, not touched) to fetch the ranked list
and assigns the top worker. If no worker is available, the job is left
`PENDING` and the response is `202` so the client can retry later.

## 3. Notifications
New `notifications` table (additive). No push notifications — in-app/DB only.

- `GET /api/notifications?userId=&userType=` — list for a user
- `PATCH /api/notifications/:id/read` — mark read

Fired automatically on: booking created, worker assigned, worker accepted,
worker rejected, job completed, job cancelled, demo payment success.

## 4. Payments — SAFE DEMO/MOCK ONLY
New `payments` table (additive). **No real payment gateway is integrated
anywhere.** Every response includes `isDemo: true` and a disclaimer string.

- `POST /api/payments/create` — `{ jobId, method? }` → `PENDING` (idempotent: re-posting returns the existing pending/success payment instead of duplicating)
- `POST /api/payments/verify` — `{ paymentId }` or `{ jobId }` → always resolves to `SUCCESS` (simulated gateway callback)
- `GET /api/payments/:jobId` — latest payment for a job

## 5. Reviews
**No new table.** Reuses the `jobs` table's existing (previously unused)
`customer_rating` / `customer_review` columns — a job row already implies
both `customer_id` and `worker_id`, so a separate reviews table would just
duplicate that FK.

- `POST /api/reviews` — `{ jobId, customerId, rating (1–5), comment }`
  - 400 if the job isn't `completed`
  - 409 if the job already has a rating (duplicate prevention)
  - on success, recomputes `workers.rating` as the average of that
    worker's reviewed jobs
- `GET /api/reviews?workerId=&jobId=` — read helper (not in the original
  spec, but trivial/low-risk and useful for the demo/tests)

## 6. Analytics
Existing Gini-coefficient fairness calculation is untouched.
Added, additively, to the `summary` object:
`totalJobsAllTime`, `completedJobs`, `cancelledJobs`, plus a new top-level
`jobsPerWorker` array (all-time job count per worker). The pre-existing
`totalJobs` field (today's jobs) keeps its old meaning for backward
compatibility.

## Testing performed
No live Postgres/network was available in the dev sandbox this was built
in, so the routes were exercised with an in-process test harness (a fake
`pg` pool + a minimal Express-compatible router + a stubbed `fetch`) that
runs the real route/service code — not a rewrite of the logic under test.
25/25 checks passed, covering:

- job creation with an explicit `workerId` (existing flow) + notifications fired
- rejection of an invalid transition (`pending_acceptance → completed`)
- full valid lifecycle: `pending_acceptance → accepted → in_progress → completed`,
  including the `workers.today_jobs`/`today_earnings`/`total_jobs` side-effect
- rejection of a transition out of a terminal state (`completed → cancelled`)
- cancellation from a live (`accepted`) state
- demo payment create → idempotent re-create → verify → get-by-job
- review blocked on a non-completed job, accepted on a completed one,
  duplicate blocked (409), worker rating recomputed
- notification mark-as-read
- job creation **without** `workerId`, correctly auto-matched via
  `GET /api/workers/nearby` to the top-ranked worker
- an unknown status value rejected with 400

This has **not** been run against a real Postgres instance — please run
`npm run seed` and smoke-test the endpoints (or re-run this repo's own
test suite if one exists) before the live demo.
