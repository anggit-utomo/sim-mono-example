# 06: Phase 5 history and admin API

**What to build:** Full observability and operability through admin endpoints without touching Redis.

**Blocked by:** 05 (Phase 4 cron lane).

**Status:** ready-for-agent

- [ ] Both lanes write JobRun without ever failing jobs; history older than 30 days deleted
- [ ] All admin reads work with pagination; retry, requeue, and trigger demonstrably re-run work
- [ ] Bad admin token returns generic 401
