Status: ready-for-agent

## Problem Statement

As a trainee preparing for a real OutSystems to Next.js + NestJS migration, I need a realistic simulation where third parties push customer data to an HTTP API, background workers process it immediately and on schedule, and operators monitor and re-run work from a dashboard, so that architecture risks surface before the real migration.

Legacy has two kinds of background work that must both be reproduced: scheduled batch cron work and immediate fast-lane processing that cannot wait for the next cron run.

## Solution

Build a pnpm/Turborepo monorepo with a NestJS API that accepts customer create/update and enqueues fast-lane jobs inbox-first, a NestJS worker that processes fast-lane jobs immediately and runs cron schedulers for sweep recovery and nightly stats, Postgres with Prisma for Customer truth plus CustomerIngest inbox plus JobRun history, BullMQ on Redis for two queues, a Next.js dashboard that operates only via admin API, a deterministic 300k seed, and a traffic simulator. Every accepted request ends DONE or FAILED, never stuck.

## User Stories

1. As a third party, I want to POST create-customer with externalId, name, email, so that a new customer is accepted for processing.
2. As a third party, I want to POST update-customer with the same shape, so that I can correct customer data using one key.
3. As a third party, I want both operations to upsert keyed on externalId, so that I do not need to know if the customer exists.
4. As a third party, I want a 202 response with ingestId and ACCEPTED status, so that I know the request is durably stored without waiting.
5. As a third party, I want a 400 on validation errors and unknown fields, so that contract violations are visible.
6. As a third party, I want a 401 generic Unauthorized on missing or invalid API key, so that auth failures are distinguishable from validation.
7. As an operator, I want the API to return 202 with a PENDING inbox row even when Redis is down, so that no request is lost.
8. As an operator, I want each accepted request processed within about one second when idle, so that fast-lane immediacy is proven.
9. As an operator, I want a second request for the same externalId to update the customer, so that upsert works end to end.
10. As an operator, I want a forced failure to retry 3 times then mark FAILED with truncated error, so that retry policy is observable.
11. As an operator, I want an older ingest to never overwrite newer customer state, so that out-of-order delivery is guarded.
12. As an operator, I want stuck inbox rows (PENDING older than 60s, FAILED with attempts below total cap, PROCESSING stale over 10m) re-enqueued oldest-first up to a bound, so that crashes and Redis outages self-heal.
13. As an operator, I want nightly aggregate stats with total customers and per-status inbox counts, so that health trends exist.
14. As an operator, I want scheduler registration idempotent across restarts, so that exactly one scheduler per cron job exists.
15. As an operator, I want cron concurrency of one, so that sweeps never overlap.
16. As an operator, I want JobRun history for both lanes on completed and failed, so that Logs show what ran.
17. As an operator, I want JobRun rows older than 30 days deleted, so that history stays bounded.
18. As a dashboard user, I want an Overview with per-queue state counts, inbox per-status, and latest stats result, so that health is one screen.
19. As a dashboard user, I want a Customers table with server pagination (50 per page) and search by exact externalId or email prefix responsive at 300k rows, so that browsing scales.
20. As a dashboard user, I want a Queues view with lane and state selector, job list with failure reason, and retry for failed fast-lane jobs, so that failures are actionable.
21. As a dashboard user, I want a Cron view with pattern, next run, last result, plus Trigger now with confirmation, so that manual runs are safe.
22. As a dashboard user, I want an Ingests view with status filter, error text, Requeue single and Requeue-all-failed, so that inbox recovery is clickable.
23. As a dashboard user, I want a Logs view of JobRun history filtered by queue and status, so that audits are possible.
24. As a dashboard user, I want success or error feedback on every action, so that I know what happened.
25. As a trainee, I want a CLI simulator with total, rate, percent updates, percent invalid args targeting seeded IDs and printing status codes plus latency percentiles, so that realistic load is reproducible.
26. As a reviewer, I want a 10000-request simulator run to end with every accepted request DONE or FAILED and none stuck, so that no-loss is proven.
27. As a reviewer, I want phase-by-phase commits with typecheck, lint, and tests green before each commit, so that training builds migration discipline.

## Implementation Decisions

- Topology: API produces jobs only and never registers processors; worker consumes via application context with no HTTP server; dashboard never talks to Redis directly, only to admin API server-side with admin token from env so the token never reaches the browser; no login for simulation.
- Queues and jobs: fast-lane queue and cron queue with job names for ingest processing, pending sweep, and aggregate stats; fast-lane job options of 3 attempts with exponential backoff from 2 seconds, bounded completed retention and week-long failed retention; idempotent job identifier derived from ingest id plus attempt count without colon characters so duplicate adds are harmless; total attempt cap across retries and sweeps.
- Inbox-first ingest: persist CustomerIngest as PENDING before enqueue; on enqueue failure log and still accept, leaving recovery to the sweeper.
- Auth: ingest key list in env checked via header; admin bearer token in env checked server-to-server; generic unauthorized body with no enumeration; unauthorized returns 401.
- Domain model: Customer holds current truth with lastIngestAt guard; CustomerIngest holds intent plus retry state through PENDING, PROCESSING, DONE, FAILED with attempts, last error, and processedAt; JobRun holds observability only and never drives logic, with queue, job name, job id, COMPLETED or FAILED status, attempts made, duration, error, result, and finish time.
- Fast-lane processing: skip when row missing or already DONE; mark PROCESSING with attempt increment; in one transaction skip as stale when customer lastIngestAt is newer than row creation time else upsert customer and set lastIngestAt; mark DONE with processedAt; on final failure mark FAILED with truncated error.
- Cron: sweep selects the three stuck classes ordered oldest-first with a 5000 cap and bulk-enqueues to fast lane returning enqueued count; stats returns customer total plus per-status inbox counts; schedulers registered idempotently on startup with 2-minute sweep cadence and nightly 02:00 run in configured timezone defaulting to UTC; manual trigger adds the same job to the cron queue immediately.
- History: both processors emit JobRun on completed and failed events; history write failure never fails the job.
- Admin contract: queue counts per state for both lanes; paged job listing with id, name, attempts, failure reason, timestamps; failed fast-lane retry; scheduler list with pattern, next run, last result; cron trigger by name allowlist; inbox listing with status filter plus single and bulk-failed requeue; customer search plus pagination; job-run history with queue and status filters.
- Dashboard: server components or route handlers hold the admin token; page size 50; shadcn/ui components; plain functional styling suffices.
- Seed and config: deterministic fake data with fixed seed and sequential external IDs in 5000-row batches with duplicate skipping so reruns insert zero; strict TypeScript with shared types; env-only config with committed example and no secrets; graceful shutdown finishing in-flight jobs; structured worker logs carrying job and ingest identifiers.
- Starting point: adapt the existing untested sketch where it matches; this spec wins on any conflict; do not add services, queues, or tables beyond this spec without approval; verify library APIs against installed versions rather than memory.
- No ADR conflicts: no ADRs exist yet; the 401-over-404 choice and inbox-plus-sweeper loss strategy were settled in grilling and are recorded here.

## Testing Decisions

- What makes a good test: assert external behavior at the highest seam (HTTP status and body plus database row states and counts, queue counts observed only), never processor or framework internals; one logical seam preferred.
- Seams used (approved): public ingest endpoints plus all admin endpoints; Customer, CustomerIngest, and JobRun tables; job counts and presence in both queues observe-only; dashboard verified through admin seam plus rendered rows. No new seams.
- Modules tested: ingest validation and guards and producer; fast-lane processor including stale guard and failure marking; sweeper selection and bulk re-enqueue; scheduler idempotency; JobRun writers and retention; all admin requeue, retry, and trigger paths; dashboard pages against seeded 300k; simulator summary.
- Prior art: no existing tests; sketch is untested. New e2e uses real Postgres and Redis. Scenarios covered: happy create and update; same externalId twice quickly yielding one customer with newer data winning; invalid payload and missing key; Redis down during ingest yielding 202 plus PENDING then sweeper recovery; worker killed mid-processing yielding retry or PROCESSING requeue; intentional throw yielding 3 attempts then FAILED visible then requeue success after fix; manual cron trigger producing a JobRun entry; repeated worker restarts yielding exactly one scheduler per cron job.
- Initial targets to measure not guarantee: ingest p95 under 150ms at 100 requests per second on a dev machine; fast-lane start under one second idle; no lost requests across worker or Redis restarts.

## Out of Scope

Real customer data, production deployment, multi-tenancy, notifications, high-availability Redis or Postgres, bulk-import endpoints, rate limiting, real customer field expansion, dashboard login, and any extra queues, tables, or services.

## Further Notes

- Training success means Phase 0 through 7 running locally plus the ability to explain inbox plus idempotent job id plus sweeper recovery and the residual same-customer concurrency race.
- Known limitations to document in README: concurrent same-customer updates can still race despite the lastIngestAt check; Redis loss is mitigated by inbox plus sweeper with no-evict config; sweeper and fast lane may touch the same row, mitigated by idempotent upsert plus DONE check; large queues listed with pagination only.
- Environment baseline: WSL with 8GB, Node 24, pnpm 12, Podman 5.7, Postgres 17, Redis 7.
