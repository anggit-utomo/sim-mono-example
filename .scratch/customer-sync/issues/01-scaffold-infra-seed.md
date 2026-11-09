# 01: Scaffold, infra, and seed base

**What to build:** A running workspace where Postgres plus Redis start via Podman and the deterministic customer seed proves idempotency, giving every later slice a stable base.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] Workspace install and dev boot all three processes with typecheck and lint green
- [ ] Compose starts Postgres 17 and Redis 7 with volumes, healthchecks, and no-evict config
- [ ] Env example covers all required keys with no secrets committed
- [ ] Seed creates exactly 300000 sequential external IDs and a rerun inserts zero
- [ ] README lists run commands
