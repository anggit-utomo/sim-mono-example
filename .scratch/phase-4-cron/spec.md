Status: ready-for-agent

## Problem Statement

As an operator, I need scheduled safety-net and stats jobs so that anything the fast lane missed is recovered automatically.

## Solution

Register idempotent schedulers on worker startup; run pending sweep every 2 minutes and aggregate stats nightly with concurrency one; manual trigger reuses the same cron queue.

## User Stories

1. As an operator, I want PENDING older than 60s, FAILED below total cap, and PROCESSING stale over 10m re-enqueued oldest-first up to a bound, so that outages and crashes recover.
2. As an operator, I want nightly stats returning total customers plus per-status inbox counts, so that Overview has a source.
3. As an operator, I want restarts to never duplicate schedulers, so that runs stay single.
4. As an operator, I want cron concurrency of one, so that sweeps never overlap.
5. As a reviewer, I want stopped worker plus new requests plus cron-only start to re-enqueue within about 2 minutes and process once fast lane returns.

## Implementation Decisions

- Scheduler uses idempotent upsert with sweep cadence every 2 minutes and nightly 02:00 run in configured timezone default UTC.
- Sweeper bulk-adds to fast lane with identifier including current attempts and returns enqueued count.
- Manual trigger adds the same job name to the cron queue immediately.
- Cron processor switches on job name and throws on unknown.

## Testing Decisions

- Good test asserts recovery behavior with clocks, not cron string parsing.
- Verify Redis-down ingest recovered, stale PROCESSING recovered, repeated restarts yield exactly one scheduler per job, aggregate counts correct.
- Prior art: integration test with time-shifted rows plus cron-only lane.

## Out of Scope

JobRun writes, admin HTTP surface, dashboard UI.

## Further Notes

- Sketch scheduler plus sweeper query already match PRD; keep and verify bulk path under load.
