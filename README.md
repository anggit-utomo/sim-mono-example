# Customer Sync Simulation

Training simulation before the real OutSystems migration. See `plan.md` for the full PRD.

## Run

```sh
cp .env.example .env
pnpm install
podman compose -f infra/compose.yaml up -d
pnpm dev
```

Services: dashboard `http://localhost:3000`, API `http://localhost:3001`.

## Commands

- `pnpm dev` — start dashboard, API, worker (Turborepo)
- `pnpm build` — build all
- `pnpm typecheck` — strict typecheck all
- `pnpm lint` — lint all
- `pnpm db:seed` — seed customers (Phase 1+)

## Operator guide

`docs/user-guide.md` explains the flow, every dashboard page, and how to test
each one — written for non-developers.

## Architecture

Third parties POST to the API, which stores a `CustomerIngest` inbox row then enqueues a fast-lane job. The worker upserts `Customer` immediately; the cron sweeper recovers anything missed. The dashboard calls admin endpoints only.

Phases 1+ fill in DB schema, endpoints, workers, dashboard pages, and simulator.
