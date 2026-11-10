# Customer Sync Simulation — User Guide

For operators and end users. No programming knowledge needed. If you are a
developer setting the system up, see `README.md` first, then come back here.

## 1. What is this system?

Outside companies send us customer records (an ID, a name, an email). This
system receives those records, saves them into our customer table, and gives
operators (you) screens to watch the work happen and fix anything that gets
stuck.

Think of it like a post office:

1. A sender drops a letter in the mailbox → a third party calls our API.
2. The clerk stamps it "received" → the API stores an **ingest record** and
   answers "accepted" within a fraction of a second. The sender never waits
   for delivery.
3. A courier delivers it immediately → the **fast-lane worker** writes the
   customer into the customer table, usually in under a second.
4. Every 2 minutes a supervisor checks for letters nobody picked up → the
   **sweeper** re-queues anything the courier missed (for example while the
   queue was down).
5. Once a night an auditor counts everything → **aggregate-stats** records
   totals for the Overview page.

Two guarantees to remember:

- **Nothing is lost.** Every accepted request is stored first. If anything
  breaks, the row sits in the inbox until a worker or the sweeper processes
  it. Every accepted request ends as DONE or FAILED — never silently dropped.
- **Newest wins.** If two updates for the same customer race each other, the
  newer request wins and the older one is skipped as stale.

## 2. Words used in this guide

| Word | Meaning |
| ---- | ------- |
| Customer | The current truth: one row per `externalId` with name and email. |
| Ingest (inbox row) | One accepted request, with a status: PENDING, PROCESSING, DONE, FAILED. |
| Queue | A waiting line of jobs. `customer-fast-lane` = deliver now, `customer-cron` = scheduled work. |
| Job | One unit of work in a queue (for example: process one ingest row). |
| Cron | Work on a schedule: the 2-minute sweeper and the nightly stats. |
| Job run (log) | A history entry saying a job finished or failed, with how long it took. |

## 3. The pages

### 3.1 Overview (`/`)

**What it is:** the health screen. Four cards:

- **Fast lane** — how many jobs are waiting, active, delayed, completed, failed.
- **Cron** — same counts for scheduled work.
- **Inbox** — ingest rows per status (PENDING / PROCESSING / DONE / FAILED).
- **Latest stats** — the last nightly count (total customers + inbox breakdown).

**How to use it:** open it first whenever something feels wrong. If PENDING or
FAILED is growing, go to Ingests. If `failed` jobs are growing, go to Queues.
If a card says *unavailable (Redis down?)*, the queue system is unreachable —
the inbox cards still work, and section 5 explains what to do.

**How to test it:** load `/` and confirm all four cards show numbers. Stop
Redis and reload: inbox cards still show numbers, queue cards show the
unavailable notice instead of hanging.

### 3.2 Customers (`/customers`)

**What it is:** the customer table — the "truth" the whole system maintains.
Seeded with 300,000 demo rows (`EXT-000001` …).

**How to use it:** type an exact customer ID (for example `EXT-000001`) or the
start of an email (for example `eloise`) and press Search. Flip pages with
Prev/Next; 50 rows per page so it stays fast at 300,000 rows.

**How to test it:** search `EXT-000001` → exactly 1 row. Search a short email
prefix → a list. Open page 2 → 50 different rows. After creating a customer
through the API (section 4, step 1), search its ID here to confirm delivery.

### 3.3 Queues (`/queues`)

**What it is:** the waiting lines, both lanes. Pick a lane (`fast-lane` or
`cron`) and a job state (`waiting`, `active`, `delayed`, `completed`,
`failed`) and page through the jobs. Each row shows the job id, name, how many
attempts it took, and — for failed jobs — the failure reason.

**How to use it:** when the Overview shows failed jobs, select
`fast-lane` + `failed`, read the `failedReason`, fix the underlying cause,
then press **Retry** on the job. Retry only works while the job is still
stored; if it says not found, the job aged out and you should requeue the
inbox row from Ingests instead.

**How to test it:** create a customer with name `__FAIL__boom` through the
API (a deliberate poison used for training). Within ~10 seconds it appears
under `failed` with reason `injected fault`. Press Retry → it runs again and
fails again, proving retries execute. Remove the cause in real use and it
would succeed.

### 3.4 Cron (`/cron`)

**What it is:** the two schedules — `sweep-pending` (every 2 minutes) and
`aggregate-stats` (nightly 02:00) — with their pattern, timezone, and the
result of their last run.

**How to use it:** press **Trigger now** (you get a confirmation dialog) to
run a schedule immediately instead of waiting. Use it after an outage: trigger
`sweep-pending` and watch PENDING rows get picked up. Do not trigger
repeatedly — one run is enough; duplicates are harmless but noisy.

**How to test it:** press Trigger now on `aggregate-stats`, confirm, wait a
few seconds, reload: its last result updates with fresh customer totals, and a
new COMPLETED row appears on the Logs page.

### 3.5 Ingests (`/ingests`)

**What it is:** the inbox — every accepted request and its status. Filter by
status. Each row shows the customer ID, whether it was a CREATE or UPDATE, the
attempt count, and the error text when it failed.

**How to use it:** this is your main recovery tool.

- One stuck row → **Requeue** sends it back to the fast lane.
- Many failed rows → **Requeue all failed** sends every recoverable FAILED
  row (fewer than 10 attempts) back at once.
- Requeueing a DONE row is safe: the worker sees it is already done and
  skips it.

**How to test it:** filter FAILED → find the `__FAIL__boom` row with its
error text. Press Requeue → it runs again (and fails again until the cause is
fixed, which is the point: the loop is visible and controllable). This page
keeps working even when Redis is down — that is intentional, so you can always
see what is waiting.

### 3.6 Logs (`/logs`)

**What it is:** the history of everything workers did — which queue, which
job, COMPLETED or FAILED, attempts used, duration, error, and finish time.
Filter by queue and status. Read-only: nothing here can be clicked to change
anything, which makes it safe for auditing.

**How to test it:** trigger a cron job, requeue a row, or retry a job, then
filter Logs — a matching row appears within seconds. Filter
`customer-fast-lane` + `FAILED` to see every failed delivery attempt.

## 4. End-to-end walkthrough (the happy path)

1. Send a customer through the API (replace the ID to repeat):
   `POST /create-customer` with `{"externalId":"EXT-990001","name":"Ada","email":"ada@example.com"}`
   and header `x-api-key: dev-key-1`. You get `{"ingestId":"…","status":"ACCEPTED"}`.
2. Open **Ingests**, filter PENDING — your row appears, then flips to DONE
   within about a second.
   (Training tip: set `FAST_LANE_DELAY_MS=20000` in `.env` and restart the
   API to hold new rows in PENDING for 20 seconds so you can catch them here.
   Default `0` delivers immediately.)
3. Open **Customers**, search `EXT-990001` — Ada is there.
4. Send an **update** for the same ID with a new name. Customers shows one
   row with the new name — newest wins.
5. Open **Logs** — one COMPLETED run for your ingest.

## 5. When something looks wrong

| Symptom | Meaning | What to do |
| ------- | ------- | ---------- |
| PENDING rows growing | Worker stopped or Redis down | Start the worker / Redis; the sweeper catches up automatically. Trigger `sweep-pending` from Cron to hurry it. |
| FAILED rows | Payload or system fault | Read `lastError` on Ingests; fix the cause; Requeue. |
| Queue cards say unavailable | Redis unreachable | Ingest API still accepts (202); inbox pages keep working; restart Redis, then trigger the sweeper. Nothing accepted is lost. |
| Retry says "not found" | Job aged out of Redis | Requeue the inbox row from Ingests instead. |
| Same customer updated twice, older data showing | Race (known limitation) | Re-send the newer update; newest write wins on reprocessing. |

## 6. Demo data and keys (training only)

- API key header: `x-api-key: dev-key-1`. Admin dashboard calls use a
  server-side token — you never type it.
- Seeded customers: `EXT-000001` … `EXT-300000`.
- Poison name for failure drills: any name starting with `__FAIL__`.
