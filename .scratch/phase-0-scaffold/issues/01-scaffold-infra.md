# 01: Phase 0 scaffold and infra

**What to build:** A running workspace where install, compose, and dev boot all succeed with typecheck and lint green.

**Blocked by:** None (can start immediately).

**Status:** done

- [x] Install succeeds and dev boots dashboard, API, and worker
- [x] Compose starts Postgres 17 and Redis 7 healthy with volumes and no-evict Redis
- [x] Env example covers all required keys; README lists run commands

## Comments

Verified: pnpm install/build/typecheck/lint green; compose both healthy with host networking (netavark bridge broken in this WSL box, documented workaround in compose file); API /health 200, worker lanes log, dashboard 200; cold `pnpm dev` fixed to build before run; committed 95b4d1a.
