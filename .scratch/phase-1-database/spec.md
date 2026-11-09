Status: ready-for-agent

## Problem Statement

As a trainee, I need the customer truth, inbox history, and job history tables so that ingest, processing, and observability have durable state.

## Solution

Implement schema with Customer, CustomerIngest, and JobRun, first migration, shared client service, and deterministic 300k seed. Reruns add zero rows.

## User Stories

1. As a trainee, I want Customer with unique externalId, so that upserts key correctly.
2. As a trainee, I want CustomerIngest inbox with PENDING, PROCESSING, DONE, FAILED plus attempts, last error, payload, and processedAt, so that nothing is lost if Redis is down.
3. As a trainee, I want JobRun history with queue, job name, job id, status, attempts, duration, error, result, and finish time, so that Logs works.
4. As a trainee, I want email and inbox status-time plus externalId indexes, so that 300k search stays fast.
5. As a trainee, I want seed to create exactly 300000 deterministic customers with sequential external IDs, so that the simulator has targets.
6. As a reviewer, I want a second seed run to insert zero, so that idempotency is proven.

## Implementation Decisions

- Customer holds truth with lastIngestAt guard; inbox holds intent plus retry state; JobRun holds observability only and never drives logic.
- lastIngestAt guards out-of-order updates; residual race documented in later phase.
- Seed uses fixed fake-data seed in batches with duplicate skipping so reruns insert zero; target a few minutes locally.
- Follow installed ORM major version config style for client and migrations.
- Shared client service connects on init and disconnects on destroy for API and worker.

## Testing Decisions

- Good test asserts row counts and constraints, not ORM internals.
- Verify migration applies cleanly from zero, seed count equals 300000, rerun inserts zero, unique externalId enforced.
- Prior art: manual count plus seed exit code; unit tests deferred to final phase.

## Out of Scope

Endpoints, processors, schedulers, dashboard, simulator. Only schema plus migration plus seed.

## Further Notes

- Sketch currently lacks JobRun; it must be added here. Retention delete lands in admin phase but the model lands here.
