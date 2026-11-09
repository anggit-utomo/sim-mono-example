Status: ready-for-agent

## Problem Statement

As a trainee, I need realistic load plus automated tests plus docs so that design problems surface before real migration and the project is handoff-ready.

## Solution

Build CLI traffic simulator, unit plus e2e tests covering eight scenarios, and finalize README with setup, commands, architecture, and limitations.

## User Stories

1. As a trainee, I want CLI with total, rate, percent updates, and percent invalid args with updates hitting seeded IDs and a summary with status codes plus latency percentiles, so that I can run a 10k proof.
2. As a reviewer, I want unit tests for processor plus sweeper logic, so that stale-check and selection rules are pinned.
3. As a reviewer, I want e2e covering happy create and update, same externalId twice quickly yielding one customer with newer winning, invalid plus missing key, Redis-down 202 to PENDING to sweeper recovery, worker-killed-mid-processing retry or requeue, intentional throw 3 times to FAILED then requeue success after fix, manual cron trigger creating history, and repeated restarts yielding one scheduler per job.
4. As a trainee, I want a 10k run to end with all accepted DONE or FAILED and none stuck, so that no-loss is proven.
5. As a reader, I want README with setup, commands, architecture, and known limitations, so that handoff needs no tribal knowledge.

## Implementation Decisions

- Simulator lives in scripts and uses the same public API plus keys; prints code counts and latency percentiles.
- Targets measured not guaranteed: ingest p95 under 150ms at 100 rps on dev machine, jobs start under one second idle, no loss on worker or Redis restart during run.
- Keep commits small named by phase with typecheck, lint, and tests before each commit and never commit secrets or real data.
- Verify library APIs against installed versions rather than memory.

## Testing Decisions

- Good test asserts external behavior through HTTP plus DB with one logical seam preferred.
- Modules tested: fast-lane processor, sweeper selection, admin requeue plus retry plus trigger, full ingest to DONE path.
- Prior art: earlier e2e fixtures reused; simulator doubles as load fixture.

## Out of Scope

Production deploy, high-availability stores, multi-tenancy, notifications, bulk import, rate limiting.

## Further Notes

- This phase closes training success: full run plus loss-recovery explanation.
