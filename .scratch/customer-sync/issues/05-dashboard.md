# 05: Dashboard over admin seam

**What to build:** A plain functional UI that browses 300k customers and operates queues, crons, ingests, and logs entirely through the admin API.

**Blocked by:** 04 (History and admin ops).

**Status:** ready-for-agent

- [ ] Overview shows queue state counts, inbox per-status, and latest stats
- [ ] Customers search plus server pagination stays responsive at 300k rows
- [ ] Queues view filters by lane and state, shows failure reason, retries failed fast-lane jobs
- [ ] Cron view shows pattern, next run, last result with confirmed Trigger now
- [ ] Ingests view filters by status with error text plus Requeue and Requeue-all-failed; Logs filters by queue and status; every action shows feedback with token kept server-side only
