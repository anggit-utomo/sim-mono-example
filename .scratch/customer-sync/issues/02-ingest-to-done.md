# 02: Ingest to DONE happy path

**What to build:** A third party can push create and update requests and see them accepted immediately then converged to customer truth within about a second.

**Blocked by:** 01 (Scaffold, infra, and seed base).

**Status:** ready-for-agent

- [ ] Valid create and update return 202 with ingestId ACCEPTED and create PENDING inbox rows plus fast-lane jobs
- [ ] Invalid body and unknown fields return 400; missing or bad key returns generic 401
- [ ] With worker running, requests become DONE with customer upserted within about one second
- [ ] Second request for same externalId updates the single customer
- [ ] API never registers processors, only produces jobs
