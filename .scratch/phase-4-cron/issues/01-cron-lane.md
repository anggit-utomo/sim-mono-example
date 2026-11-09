# 05: Phase 4 cron lane

**What to build:** Scheduled sweep recovery and nightly stats run singly and idempotently.

**Blocked by:** 04 (Phase 3 fast-lane worker).

**Status:** ready-for-agent

- [ ] Stuck rows re-enqueue oldest-first within bound and recover within about 2 minutes cron-only
- [ ] Stats returns customer total plus per-status inbox counts
- [ ] Restarts never duplicate schedulers; cron concurrency is one
