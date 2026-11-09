# 02: Phase 1 database and seed

**What to build:** Durable truth, inbox, and history tables with a deterministic 300k seed that reruns cleanly.

**Blocked by:** 01 (Phase 0 scaffold and infra).

**Status:** ready-for-agent

- [ ] Migration applies cleanly with Customer, CustomerIngest, and JobRun plus required indexes
- [ ] Seed inserts exactly 300000 sequential external IDs; rerun inserts zero
- [ ] Unique externalId enforced; shared client service shared by API and worker
