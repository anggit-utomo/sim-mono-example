# 06: Phase 5 history and admin API

**What to build:** Full observability and operability through admin endpoints without touching Redis.

**Blocked by:** 05 (Phase 4 cron lane).

**Status:** done

- [x] Both lanes write JobRun without ever failing jobs; history older than 30 days deleted
- [x] All admin reads work with pagination; retry, requeue, and trigger demonstrably re-run work
- [x] Bad admin token returns generic 401

## Comments

Verified live: 401 missing+bad; queues counts; jobs paging + 400s; customers exact/prefix/paging at 300k; ingests filter; cron list with live lastResult; trigger→JobRun; requeue DONE→skipped+JobRun; retry→re-ran; requeue-failed boundary (0 at cap 10) and crafted FAILED/2→DONE+customer. Retention prunes in nightly stats. Committed f19b3ca.
