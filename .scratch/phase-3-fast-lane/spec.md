Status: ready-for-agent

## Problem Statement

As an operator, I need each accepted request processed within about one second without polling, so that third parties see fast convergence.

## Solution

Run worker with fast-lane processor at high concurrency, idempotent upsert guarded by lastIngestAt, with 3-attempt retry then FAILED marking.

## User Stories

1. As an operator, I want a valid request to become DONE and visible as Customer within about one second when idle, so that fast lane is proven.
2. As a third party, I want a second request for the same externalId to update the customer, so that upsert works.
3. As an operator, I want a forced throw to end as FAILED after 3 attempts, so that retry policy is visible.
4. As an operator, I want an older ingest to never overwrite newer Customer state, so that out-of-order delivery is guarded.
5. As an operator, I want the worker to finish in-flight jobs on shutdown signal, so that deploys do not lose work.

## Implementation Decisions

- Worker is an application context with no HTTP; lane selection via env.
- Fast-lane concurrency from env with default 20.
- Processor skips when row missing or already DONE; marks PROCESSING with attempt increment; in one transaction skips as stale when customer lastIngestAt is newer than row creation else upserts and sets lastIngestAt; marks DONE with processedAt; returns small result.
- Final failure marks FAILED with truncated error; intermediate failures leave to queue retry.
- Structured logs include job plus ingest identifiers. Residual same-customer race documented in README later.

## Testing Decisions

- Good test asserts DB state transitions, not queue internals.
- Verify happy create and update, double-send same externalId yielding one customer with newer winning, forced failure yielding FAILED after 3, stale ingest skipped.
- Prior art: processor tests with real DB plus e2e timing check.

## Out of Scope

Cron schedulers, JobRun history writes, admin API, dashboard.

## Further Notes

- Sketch processor is largely correct; keep DONE check and add log fields plus shutdown behavior.
