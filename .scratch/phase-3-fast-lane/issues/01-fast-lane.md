# 04: Phase 3 fast-lane worker

**What to build:** Accepted requests converge to customer truth within about a second with guarded upsert and visible retry exhaustion.

**Blocked by:** 03 (Phase 2 ingest API).

**Status:** done

- [x] Valid request becomes DONE with customer upserted within about one second idle
- [x] Same externalId updates the single customer; stale ingest never overwrites newer state
- [x] Forced throw ends FAILED after 3 attempts; in-flight jobs finish on shutdown signal

## Comments

Verified live: create→DONE in 546ms; update→one customer newest data; crafted 1h-old row→stale skip, newer kept; __FAIL__ name→FAILED/3 in ~8s with lastError, no customer; SIGTERM→clean exit (needed .unref() on keep-alive interval — it blocked shutdown). Test hook INJECTED_FAULT_PREFIX is training-only, remove before real migration. Committed 8b09961.
