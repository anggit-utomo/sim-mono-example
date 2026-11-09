# 03: Phase 2 ingest API

**What to build:** External callers get immediate 202 acceptance with inbox-first durability, even when Redis is down.

**Blocked by:** 02 (Phase 1 database and seed).

**Status:** ready-for-agent

- [ ] Valid create and update return 202 with ingestId ACCEPTED plus PENDING row and fast-lane job
- [ ] Invalid body and unknown fields return 400; bad key returns generic 401
- [ ] Redis stopped still returns 202 with PENDING for later sweeper recovery; API only produces jobs
