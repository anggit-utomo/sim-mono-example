# 04: Phase 3 fast-lane worker

**What to build:** Accepted requests converge to customer truth within about a second with guarded upsert and visible retry exhaustion.

**Blocked by:** 03 (Phase 2 ingest API).

**Status:** ready-for-agent

- [ ] Valid request becomes DONE with customer upserted within about one second idle
- [ ] Same externalId updates the single customer; stale ingest never overwrites newer state
- [ ] Forced throw ends FAILED after 3 attempts; in-flight jobs finish on shutdown signal
