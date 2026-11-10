# ADR-0001: Reuse budget Postgres cluster for sim prod

Date: 2026-11-10
Status: accepted

## Context

The VPS runs one Postgres 17 container (`budget-db`) with 2 GB RAM shared
with the budget app. Sim needs a production database for `@sim/api` and
`@sim/worker` via `DATABASE_URL` (`packages/db/prisma/schema.prisma`).

## Decision

One logical database (`sim_prod`, owner `sim_prod`) inside the existing
cluster, reached as `budget-db:5432` over the shared bridge network.
No second Postgres container.

## Alternatives considered

- Separate `postgres:17` service: full blast-radius isolation, but ~250 MB
  RAM on a 2 GB box already running budget + four Node processes.
- Managed Postgres: no such service on this VPS; adds cost and cert plumbing.

## Consequences

- Backups stay in one place (the budget cluster's volume).
- Sim and budget share buffer/cache pressure; if sustained contention is
  observed, revisit with metrics, not pre-emptively.
- Maps 1:1 to the Kubernetes pattern (one operator, one Database per app).
