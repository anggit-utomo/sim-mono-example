# 05: Walkthrough plus Troubleshooting plus final verify

**What to build:** Happy-path drill, symptom recovery table, and demo data plus full route verification proving docs are static and independent.

**Blocked by:** 02 (Overview concepts plus Customers page), 03 (Queues plus Cron pages), 04 (Ingests plus Logs pages).

**Status:** ready-for-agent

- [ ] Walkthrough page lists create, inbox flip, customer confirm, update newest-wins, and log check steps with sample payload shape
- [ ] Troubleshooting page maps PENDING growth, FAILED rows, unavailable queue cards, missing retry targets, and stale-winner races to causes and actions
- [ ] Demo data section lists API key header convention, seeded ID range, and poison name for training
- [ ] Every docs route returns success with expected headings and the not-live label, and makes zero admin, queue, or database calls
- [ ] Build, typecheck, and lint placeholder pass for the docs app
