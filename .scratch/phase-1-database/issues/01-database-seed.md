# 02: Phase 1 database and seed

**What to build:** Durable truth, inbox, and history tables with a deterministic 300k seed that reruns cleanly.

**Blocked by:** 01 (Phase 0 scaffold and infra).

**Status:** done

- [x] Migration applies cleanly with Customer, CustomerIngest, and JobRun plus required indexes
- [x] Seed inserts exactly 300000 sequential external IDs; rerun inserts zero
- [x] Unique externalId enforced; shared client service shared by API and worker

## Comments

Verified: migrate dev + status clean; seed 300000 in ~18s, rerun 0; duplicate externalId rejected; all 9 indexes present; build/typecheck/lint green; committed b622162.
