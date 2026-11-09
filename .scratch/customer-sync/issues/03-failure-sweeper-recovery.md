# 03: Failure and sweeper recovery

**What to build:** Failures never lose requests: retries exhaust visibly, stale writes are guarded, and the sweeper plus schedulers recover everything the fast lane missed.

**Blocked by:** 02 (Ingest to DONE happy path).

**Status:** ready-for-agent

- [ ] Forced processor throw ends FAILED after 3 attempts with truncated error visible
- [ ] Older ingest never overwrites newer customer state
- [ ] Redis down during ingest still returns 202 with PENDING, then sweeper re-enqueues after Redis returns
- [ ] Stale PROCESSING rows requeue after worker kill; PENDING older than 60s and FAILED below cap requeue oldest-first within bound
- [ ] Sweep and stats run on cadence with concurrency one; repeated restarts leave exactly one scheduler per cron job with correct counts
