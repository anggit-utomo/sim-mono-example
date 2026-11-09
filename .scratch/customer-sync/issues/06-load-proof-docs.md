# 06: Load proof and docs

**What to build:** Realistic load plus automated proof that no accepted request gets stuck, with handoff-ready docs.

**Blocked by:** 05 (Dashboard over admin seam).

**Status:** ready-for-agent

- [ ] Simulator CLI supports total, rate, percent updates targeting seeded IDs, and percent invalid, printing status codes plus latency percentiles
- [ ] Unit tests pin processor stale logic and sweeper selection; e2e covers all eight spec scenarios including double-send newer-wins, Redis-down recovery, kill-mid-processing, throw-then-requeue, manual trigger history, and scheduler singularity
- [ ] 10000-request run ends with every accepted request DONE or FAILED and none stuck; ingest p95 and fast-lane start latency measured
- [ ] README finalized with setup, commands, architecture, and known limitations including the residual same-customer race
