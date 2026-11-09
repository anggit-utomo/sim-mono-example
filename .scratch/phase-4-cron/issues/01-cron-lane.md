# 05: Phase 4 cron lane

**What to build:** Scheduled sweep recovery and nightly stats run singly and idempotently.

**Blocked by:** 04 (Phase 3 fast-lane worker).

**Status:** done

- [x] Stuck rows re-enqueue oldest-first within bound and recover within about 2 minutes cron-only
- [x] Stats returns customer total plus per-status inbox counts
- [x] Restarts never duplicate schedulers; cron concurrency is one

## Comments

Verified live: cron-only boot registers 2 schedulers; 2 restarts keep exactly 2; manual sweep re-enqueued 3 (PENDING>60s, FAILED/3<10, PROCESSING stale 30m); scheduled tick fired on its own ~2min cadence; aggregate-stats matched DB exactly (300004 customers, 8/1/1/1 inbox); fast lane then drained all to DONE (+Crash Victim created, fault row FAILED/6 climbing to cap 10 by design). Committed 9920269.
