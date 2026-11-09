Status: ready-for-agent

## Problem Statement

As an operator, I need server-side admin endpoints to observe and re-run work without touching Redis, so that the dashboard can stay dumb and safe.

## Solution

Add JobRun writers on worker events for both lanes without ever failing the job, plus retention cleanup and full admin API behind bearer guard.

## User Stories

1. As a dashboard, I want queue counts per state for both lanes, so that Overview renders.
2. As a dashboard, I want paged job listing with id, name, attempts, failure reason, and timestamps, so that Queues paginates.
3. As a dashboard, I want failed fast-lane retry, so that jobs re-run while still in Redis.
4. As a dashboard, I want scheduler list with pattern, next run, and last result plus trigger now, so that Cron works.
5. As a dashboard, I want inbox listing with status filter plus single and bulk-failed requeue, so that recovery is clickable.
6. As a dashboard, I want customer search plus pagination at 50 per page responsive at 300k, so that browsing works.
7. As a dashboard, I want job-run history with queue and status filters for Logs, so that history is visible.
8. As a reviewer, I want unauthorized admin calls to return generic 401 without leaking token validity.

## Implementation Decisions

- Bearer admin token checked server-to-server only and never sent to the browser.
- JobRun written on completed plus failed for both processors with duration, attempts, error, and result; history write failure is caught and never fails the job.
- Retention job deletes history older than 30 days.
- Retry reuses queue retry; requeue adds a new fast-lane job with fresh identifier; trigger adds the same cron job immediately.
- Pagination server-side everywhere with no unbounded lists.

## Testing Decisions

- Good test hits endpoints against real DB and Redis with seeded data.
- Verify each endpoint works; retry, requeue, and trigger demonstrably re-run work and create history; missing or bad token yields 401.
- Prior art: admin e2e reusing ingest fixtures.

## Out of Scope

Dashboard UI itself and traffic load.

## Further Notes

- Sketch only has three admin routes; most of this phase is new.
