# 04: History and admin ops

**What to build:** Operators can observe and re-run all work through admin endpoints without touching Redis, backed by durable job history.

**Blocked by:** 03 (Failure and sweeper recovery).

**Status:** ready-for-agent

- [ ] Both lanes write JobRun on completed and failed without ever failing the job; history older than 30 days is deleted
- [ ] Queue counts, paged job listing with failure reason, scheduler list with pattern plus next run plus last result, inbox listing with filter, customer search with pagination, and job-run history all work against real data
- [ ] Failed fast-lane retry, inbox single plus bulk-failed requeue, and cron trigger demonstrably re-run work and create history entries
- [ ] Missing or bad admin token returns generic 401
