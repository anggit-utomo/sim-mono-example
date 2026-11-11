# Customer Sync Simulation - Product Requirements Document

Status: Draft v1 | Date: 9 Nov 2026 | Audience: AI coding agent and reviewer

## 1. Purpose

This project is a simulation of a real system that will be migrated from OutSystems to a Next.js + NestJS monorepo. It validates the target architecture before the real migration: third parties push customer data to an API, background workers process it, and operators monitor and manually re-run work from a dashboard.

The legacy system has two kinds of background work, and both must be reproduced:

- Cron jobs: batch work that runs on a schedule.
- Fast lane: data that must be processed immediately instead of waiting for the next cron run.

Goals:

- G1: Accept customer create/update requests from external callers (Postman or a real server) through a stable HTTP API.
- G2: Process each accepted request immediately through a fast-lane worker (BullMQ + Redis).
- G3: Run scheduled cron jobs, including a sweeper that recovers anything the fast lane missed.
- G4: Provide a dashboard to browse 300,000 customers and to monitor, retry and manually trigger queues, jobs and cron jobs.
- G5: Be realistic enough (data volume, failures, retries) to expose design problems before the real migration.

Non-goals: real customer data, production deployment, multi-tenancy, notifications, high-availability Redis or Postgres, bulk-import endpoints, rate limiting (any of these may come later).

## 2. Decisions and Assumptions

Decided (do not change without asking):

- Monorepo with pnpm workspaces and Turborepo.
- Dashboard: Next.js with shadcn/ui. API: NestJS. Worker: a separate NestJS process (application context, no HTTP server).
- Database: PostgreSQL with Prisma (ORM and migrations). Queue: BullMQ on Redis through @nestjs/bullmq.
- Local containers run with Podman, not Docker.
- Two queues: a fast-lane queue and a cron queue. The API only produces jobs; only the worker consumes them.
- Every accepted request is stored in a Postgres inbox table before any job is queued.

Defaults chosen for open questions (the owner can override; implement these meanwhile):

- Ingestion is asynchronous: respond 202 after the inbox row is saved and the job is queued.
- Customer fields: externalId (unique, supplied by the caller), name, email. Adding fields later must be easy.
- Both create-customer and update-customer perform an upsert keyed on externalId.
- Ingest auth: an API key in the x-api-key header, checked against a list in env. Admin auth: a bearer token from env, used only server-to-server by the dashboard.
- Dashboard login: none for the simulation. The dashboard server calls the API with the admin token so the token never reaches the browser.
- Time zone for the nightly cron: env CRON\_TZ, default UTC.

Open questions to confirm with the owner later (they must not block implementation): the real customer fields; expected requests per second; what the real cron jobs do; how the legacy fast lane is triggered; whether update for an unknown customer should be an error.

## 3. System Overview

Components: 3rd-party client, API (NestJS), Redis (BullMQ queues and schedulers), Worker (NestJS), PostgreSQL, Dashboard (Next.js).

Flow A - fast lane:

1. The caller sends POST /create-customer or /update-customer.
2. The API validates each row, saves one CustomerIngest row per item with status PENDING (single bulk write), adds one job per row to the fast-lane queue (single addBulk) and returns 202 with count plus items [{ ingestId, externalId }].
3. The fast-lane worker picks the job up immediately, upserts the Customer and marks the row DONE.
4. After retries are exhausted, the row is marked FAILED.

Flow B - cron:

1. The worker registers job schedulers in the cron queue on startup (idempotent).
2. The cron processor runs sweep-pending (every 2 minutes) and aggregate-stats (nightly).
3. The sweep finds stuck inbox rows and re-adds them to the fast-lane queue.

Flow C - operations:

1. The dashboard calls admin endpoints on the API (never Redis directly).
2. Admin endpoints list queues and jobs, retry failed jobs, requeue inbox rows, and trigger cron jobs by adding the same job to the cron queue immediately.

## 4. Repository Structure

- apps/dashboard: Next.js + shadcn/ui.
- apps/api: NestJS HTTP API (producers and admin endpoints only, no processors).
- apps/worker: NestJS application context (processors and schedulers). Env WORKER\_LANES=fast,cron selects which processors start.
- packages/shared: queue names, job names, payload types, job options, constants.
- packages/db: Prisma schema, migrations, seed script, PrismaService.
- infra/compose.yaml: PostgreSQL and Redis for Podman.
- scripts/: traffic simulator.
- Root: pnpm-workspace.yaml, turbo.json, .env.example, README.md.

Names to keep exactly: queues customer-fast-lane and customer-cron; jobs process-ingest, sweep-pending and aggregate-stats.

## 5. Data Model (Prisma)

Customer: id (uuid), externalId (unique), name, email, lastIngestAt, createdAt, updatedAt. Index on email.

CustomerIngest (the inbox and request history): id (uuid), externalId, operation (CREATE or UPDATE), payload (Json), status (PENDING, PROCESSING, DONE, FAILED), attempts (int), lastError (nullable), createdAt, updatedAt, processedAt (nullable). Indexes on (status, createdAt) and on externalId.

JobRun (history for the dashboard logs page): id, queue, jobName, jobId, status (COMPLETED or FAILED), attemptsMade, durationMs, error (nullable), result (Json, nullable), finishedAt. Indexes on (queue, finishedAt) and (status, finishedAt). Written by worker events for both lanes. A cron job deletes rows older than 30 days.

## 6. API Requirements

### 6.1 Public (3rd party), protected by x-api-key

- POST /create-customer and POST /update-customer. Body: a single object, a raw array, or `{ items: [...] }` (1-100 rows); each row: externalId (non-empty string), name (non-empty string), email (valid email). Unknown fields are rejected.
- 202 response: `{ status: ACCEPTED, delayMs, count, items: [{ ingestId, externalId }] }` — one entry per row. 400 for validation errors. 401 for a missing or invalid key.
- If the queue is unavailable the API must still return 202, because the inbox row exists. It logs the error and the sweeper recovers the row.

### 6.2 Admin (dashboard), protected by bearer ADMIN\_TOKEN

- GET /admin/queues: job counts per state for both queues.
- GET /admin/queues/:lane/jobs?state=&page=: list jobs (lane is fast-lane or cron; states waiting, active, delayed, completed, failed) with id, name, attempts, failedReason and timestamps.
- POST /admin/fast-lane/jobs/:id/retry: retry a failed job.
- GET /admin/cron: list schedulers with name, pattern, next run time and last result from JobRun.
- POST /admin/cron/:name/trigger: run a cron job now (name must be sweep-pending or aggregate-stats).
- GET /admin/ingests?status=&page=: inbox rows with a status filter.
- POST /admin/ingests/:id/requeue and POST /admin/ingests/requeue-failed: add fast-lane jobs for FAILED or stuck rows.
- GET /admin/customers?page=&q=: server-side pagination (page size 50) and search by exact externalId or email prefix.
- GET /admin/job-runs?queue=&status=&page=: history for the logs page.

## 7. Queue and Worker Requirements

Fast-lane queue (customer-fast-lane), job process-ingest, data { ingestId }:

- Concurrency from env FAST\_LANE\_CONCURRENCY, default 20.
- Job options: 3 attempts, exponential backoff starting at 2 seconds, keep the last 1,000 completed jobs, keep failed jobs for 7 days.
- jobId is ingest-{ingestId}-{attempts}. Custom job ids must not contain a colon. This makes duplicate adds harmless.
- Processor steps: load the row; skip if it is missing or already DONE; mark PROCESSING and increment attempts; in one transaction, skip as stale if the customer's lastIngestAt is newer than the row's createdAt, otherwise upsert the customer and set lastIngestAt; mark the row DONE with processedAt; return a small result object.
- On the final failed attempt, mark the row FAILED with a truncated lastError.

Cron queue (customer-cron), concurrency 1 so runs never overlap:

- sweep-pending, every 2 minutes. Select rows that are PENDING for more than 60 seconds, FAILED with attempts below 10, or PROCESSING with updatedAt older than 10 minutes. Order by createdAt, limit 5,000, add them to the fast-lane queue in bulk, and return the number enqueued.
- aggregate-stats, nightly at 02:00 in CRON\_TZ. Return total customers and inbox counts per status.
- Schedulers are registered with upsertJobScheduler at worker startup, so restarts never duplicate them.
- A manual trigger from the admin API adds the same job to the cron queue immediately.

Both processors write a JobRun row on completed and failed events. A failure to write history must never fail the job.

Known limitation to document in the README: two updates for the same customer processed concurrently can still race. The lastIngestAt check reduces this but does not eliminate it.

## 8. Dashboard Requirements (Next.js + shadcn/ui)

Server components or route handlers call the admin API with ADMIN\_TOKEN from env. Pages:

- Overview: counts per queue state for both lanes, inbox counts per status, latest aggregate-stats result.
- Customers: table with server-side pagination and search. Must stay responsive with 300,000 rows.
- Queues: choose a lane and state, list jobs, show the failure reason, retry button for failed fast-lane jobs.
- Cron: scheduler list with pattern, next run and last result, plus a Trigger now button with confirmation.
- Ingests: inbox table with a status filter, error text, and Requeue and Requeue all failed actions.
- Logs: JobRun history with filters for queue and status.

All actions show success or error feedback. Use shadcn/ui components. A plain, functional UI is enough.

## 9. Seed and Traffic Simulation

- Seed (pnpm db:seed): create 300,000 customers with deterministic fake data (fixed faker seed), externalId like EXT-000001, using createMany with skipDuplicates in batches of 5,000. Re-running must not create duplicates. Target: completes in a few minutes locally.
- Traffic simulator (scripts/simulate-traffic): CLI arguments for total requests, requests per second, percent updates versus creates, and percent invalid payloads. Updates target existing seeded externalIds. Prints a summary of status codes and latency percentiles.

## 10. Non-Functional Requirements

- TypeScript strict mode everywhere; shared types come from packages/shared.
- Configuration only through env, with a committed .env.example. No secrets in git.
- Graceful shutdown: the worker finishes in-flight jobs on SIGTERM.
- Structured logs with the job id and ingest id on every worker log line.
- Initial targets, to measure and not to guarantee: ingest endpoint p95 under 150 ms at 100 requests per second on a developer machine; fast-lane jobs start within one second when workers are idle; no lost requests when the worker or Redis is restarted during a traffic run.

## 11. Implementation Plan for the Coding Agent

Work in phases. Finish and verify each phase before starting the next. Commit once per phase. Each phase lists its acceptance criteria.

Phase 0 - Scaffold and infra

- Create the pnpm workspace and Turborepo config, the apps and packages from section 4, and shared tsconfig and lint config.
- Add infra/compose.yaml for PostgreSQL 17 and Redis 7 with volumes and healthchecks, runnable with podman compose. Configure Redis to never evict keys.
- Add .env.example (DATABASE\_URL, REDIS\_HOST, REDIS\_PORT, INGEST\_API\_KEYS, ADMIN\_TOKEN, WORKER\_LANES, FAST\_LANE\_CONCURRENCY, CRON\_TZ, API\_URL) and a README with run commands.
- Accept: pnpm install, podman compose up and pnpm dev start the dashboard, API and worker; typecheck and lint pass.

Phase 1 - Database

- Implement the Prisma schema from section 5, the first migration, the shared PrismaService and the seed script. Check the installed Prisma major version and follow its configuration style.
- Accept: the migration applies cleanly; the seed inserts exactly 300,000 customers; a second run adds none.

Phase 2 - Ingest API

- Implement the packages/shared constants and types, the two public endpoints, validation, the API-key guard and the producer service from section 6.1.
- Accept: a valid request returns 202, creates a PENDING row and a Redis job; an invalid body returns 400; a missing key returns 401; with Redis stopped the API still returns 202 and the row stays PENDING.

Phase 3 - Fast-lane worker

- Implement the worker app, WORKER\_LANES handling and the fast-lane processor with failure handling.
- Accept: with the worker running, a request becomes DONE and the customer exists within about one second; a second request for the same externalId updates it; a forced failure ends as FAILED after 3 attempts; an older ingest never overwrites a newer one.

Phase 4 - Cron lane

- Implement the scheduler service and the cron processor with sweep-pending and aggregate-stats.
- Accept: stop the worker, send requests, then start only the cron lane: rows are re-enqueued within about 2 minutes and processed once the fast lane runs; restarting the worker never duplicates schedulers; aggregate-stats returns correct counts.

Phase 5 - Job history and admin API

- Add JobRun, the worker event handlers, the admin guard, all endpoints in section 6.2 and the retention cron job.
- Accept: each endpoint works against real data; retry, requeue and manual trigger demonstrably re-run work; unauthorized calls return 401.

Phase 6 - Dashboard

- Build the pages in section 8.
- Accept: all pages load against the seeded 300,000 rows; customer search and pagination respond quickly; trigger, retry and requeue actions work from the UI.

Phase 7 - Traffic simulator, tests and docs

- Build the simulator, unit tests for processor and sweeper logic, and an end-to-end test covering the scenarios in section 12. Finalize the README (setup, commands, architecture, known limitations).
- Accept: tests pass; a 10,000-request simulator run ends with every accepted request DONE or FAILED and none stuck.

## 12. Test Scenarios

1. Happy path create and update.
2. The same externalId sent twice quickly: one customer, final data from the newer request.
3. Invalid payload and missing API key.
4. Redis down during ingest: 202 returned, row PENDING, the sweeper recovers it after Redis returns.
5. Worker killed mid-processing: the job is retried or the sweeper requeues the PROCESSING row.
6. The processor throws on purpose: 3 attempts, then FAILED, visible in the dashboard, then requeue succeeds after the fault is removed.
7. Manual cron trigger from the dashboard produces a JobRun entry.
8. Worker restarted several times: exactly one scheduler per cron job.

## 13. Rules for the Coding Agent

- Follow this document. If something conflicts or is unclear, stop and ask instead of choosing silently.
- Do not add services, queues or tables beyond this document without approval.
- Keep queue names, job names and the job id format exactly as specified.
- The API never registers processors; the worker never exposes HTTP.
- Verify library APIs against the installed versions (BullMQ, @nestjs/bullmq, Prisma, Next.js) rather than relying on memory.
- Run typecheck, lint and tests before each commit; keep commits small and named by phase.
- Never commit secrets or real data.

## 14. Risks

- Same-customer ordering under concurrency (see section 7).
- Redis data loss or eviction: mitigated by the inbox table and the sweeper; configure Redis with no eviction.
- Sweeper and fast lane processing the same row: mitigated by the idempotent upsert and the DONE check.
- Large queues in the dashboard: list jobs with pagination only.

## 15. Reference Material

An earlier code sketch (api, worker, shared and db files) exists as a starting point. It is untested and may be adapted. Where it differs from this document, this document wins. Attach the sketch files when briefing the agent if available.
