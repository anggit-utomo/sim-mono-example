# 03: Phase 2 ingest API

**What to build:** External callers get immediate 202 acceptance with inbox-first durability, even when Redis is down.

**Blocked by:** 02 (Phase 1 database and seed).

**Status:** done

- [x] Valid create and update return 202 with ingestId ACCEPTED plus PENDING row and fast-lane job
- [x] Invalid body and unknown fields return 400; bad key returns generic 401
- [x] Redis stopped still returns 202 with PENDING for later sweeper recovery; API only produces jobs

## Comments

Verified live: 202+PENDING+jobId ingest-<uuid>-0 for create/update; 400 validation + unknown-field rejection; 401 generic both missing and bad keys; Redis-down returns 202 in ~3s via enqueue timeout race (BullMQ buffers instead of throwing — found by probe) with row PENDING and logged error; jobs intact after restart. Committed 4add78a.
