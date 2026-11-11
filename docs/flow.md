# System flow — how a customer record travels

Post-office version: a sender drops a parcel (JSON) at the counter (API).
The clerk logs it in the logbook (`CustomerIngest`) and hands back receipt
`202` — logged, not delivered. A courier (fast-lane worker) delivers it to
the house (`Customer`) and ticks the logbook `DONE`. A supervisor (cron)
checks the logbook every 2 minutes and re-sends anything forgotten; nightly
an auditor counts everything.

```
3rd party --POST json--> API --save PENDING+payload--> [INBOX: CustomerIngest]
                          |                              ^  |
                          | 202 (logbook receipt)          |  | DONE/FAILED
                          v                              |  v
                    [FAST-LANE queue] --job--> worker ----+
                          ^                      |
                          | re-queue             +--upsert--> [Customer]
                          |                      (canonical state)
                    [CRON: sweep every 2m + stats nightly]
                    (finds PENDING>60s / FAILED / PROCESSING-stale)
```

## Roles (one per box)

| Box | Code | Touches `Customer`? |
| --- | --- | --- |
| API | `apps/api/src/customers/customers.service.ts` | Never. Writes inbox rows, enqueues jobs. |
| fast-lane worker | `apps/worker/src/fast-lane.processor.ts` | Yes — the **only** writer. Reads inbox payload, upserts by `externalId`, ticks `DONE`. |
| cron worker | `apps/worker/src/cron.processor.ts` | Never. `sweep-pending` re-queues stuck rows; `aggregate-stats` counts + prunes. |
| scheduler | `apps/worker/src/scheduler.service.ts` | No. Registers both cron schedules idempotently on boot. |
| dashboard | via admin API, `ADMIN_TOKEN` | No. Reads state, triggers retries/requeues. |

```mermaid
flowchart TB
  C["3rd party<br/>POST { externalId, name, email }"] -->|x-api-key| API["API NestJS<br/>customers.service.ts"]
  API -->|1. createMany PENDING| INBOX[("CustomerIngest<br/>id · externalId · op<br/>payload JSON · status<br/>attempts · lastError<br/>createdAt · processedAt")]
  API -->|2. addBulk jobId=ingest-id-attempts| FLQ{{"fast-lane queue<br/>customer-fast-lane<br/>waiting / active / delayed<br/>completedx1000 · failedx7d"}}
  API -->|202 ACCEPTED| C
  FLQ -->|process-ingest { ingestId }| FLW["fast-lane worker<br/>concurrency 20 · 3 attempts<br/>exp backoff 2s"]
  FLW -->|PROCESSING attempts+1| INBOX
  FLW -->|read payload| INBOX
  FLW -->|upsert by externalId<br/>lastIngestAt guard| CUST[("Customer<br/>id · externalId UNIQUE<br/>name · email<br/>lastIngestAt · timestamps")]
  FLW -->|DONE + processedAt| INBOX
  FLW -.->|completed / failed event| JR1[("JobRun<br/>queue=fast-lane<br/>attemptsMade · durationMs<br/>error · result")]
  SCH["scheduler<br/>upsertJobScheduler<br/>on worker boot"] -->|every 2 min| CRQ{{"cron queue<br/>customer-cron<br/>concurrency 1"}}
  SCH -->|nightly 02:00 CRON_TZ| CRQ
  CRQ -->|sweep-pending| CRW["cron worker"]
  CRQ -->|aggregate-stats| CRW
  CRW -->|find PENDING>60s<br/>FAILED attempts&lt;10<br/>PROCESSING stale>10m| INBOX
  CRW -->|addBulk back| FLQ
  CRW -->|counts + prune JobRun>30d| CUST
  CRW -->|counts per status| INBOX
  CRW -.->|completed / failed event| JR2[("JobRun<br/>queue=customer-cron")]
  D["dashboard<br/>ADMIN_TOKEN"] -->|queues / jobs / retry| API
  D -->|ingests + requeue| API
  D -->|customers search| API
  D -->|cron trigger + job-runs| API
```

## Data at each hop (one request: rename `EXT-00042`)

1. **API stores inbox** (`customers.service.ts:34-37`) — immutable evidence:
   `CustomerIngest { id: a1…, externalId: EXT-00042, operation: UPDATE, payload: { externalId, name: "Budi Baru", email: "budi@x.id" }, status: PENDING, attempts: 0 }`
2. **API enqueues** (`:43-53`) — one Redis round-trip for the batch:
   job `{ id: ingest-a1…-0, name: process-ingest, data: { ingestId: a1… } }`. The payload lives in Postgres, not in Redis.
3. **API answers** (`:64-69`): `{ status: ACCEPTED, count, items: [{ ingestId, externalId }] }`. Redis down → same `202` after a 3s race; rows wait for the sweeper.
4. **fast-lane processes** (`fast-lane.processor.ts:25-77`): load row (skip if missing/`DONE`) → `PROCESSING`, `attempts+1` → transaction: skip as `stale` if `customer.lastIngestAt > ingest.createdAt`, else `customer.upsert` with `lastIngestAt = ingest.createdAt` → `DONE` + `processedAt`.
5. **history recorded** (`job-run.recorder.ts`): `JobRun { queue: customer-fast-lane, jobName: process-ingest, status: COMPLETED, attemptsMade, durationMs, result: { ingestId, result: applied } }`. Never throws — a history failure must not fail the job.
6. **sweeper recovers** (`cron.processor.ts:47-72`): `PENDING` older than 60s, `FAILED` with attempts < 10, `PROCESSING` stale > 10 min → `addBulk` back to fast-lane. Reprocessing is safe (`DONE` check + `lastIngestAt` guard).
7. **nightly stats** (`cron.processor.ts:74-88`, `0 2 * * *` in `CRON_TZ`): `{ customers: N, ingest: { DONE:…, PENDING:… }, prunedJobRuns: M }` for the Overview page; deletes `JobRun` rows older than 30 days.

## Why finished jobs are deleted

Redis is memory-only with no eviction. Every finished job keeps its data + result, so unbounded history OOMs it. Retention (`packages/shared/src/index.ts:20-25`, `scheduler.service.ts:14`):

- fast-lane: last 1,000 completed, failed kept 7 days (retry/debug window).
- cron schedules: last 100 each.
- Postgres `JobRun`: pruned after 30 days by `aggregate-stats`.

Nothing is lost: the durable proof is `CustomerIngest` (per-request payload + status) and `Customer` (current truth). Redis copies exist only briefly for retry/inspection; the dashboard Logs page reads `JobRun`, never Redis. Admin requeue/retry calls surface Redis outage honestly as `503` (`with-queue.ts`) — only public ingest degrades to accept-first `202`.

## Failure map

| Breaks | API | Recovery |
| --- | --- | --- |
| Redis down | still `202`, rows stay `PENDING` | sweeper re-enqueues when Redis returns |
| worker killed mid-job | row stuck `PROCESSING` | BullMQ retry, else sweeper after 10 min stale |
| poison payload (`__FAIL__` name) | `202`, then 3 attempts → `FAILED` + `lastError` | fix cause, Requeue from Ingests |
