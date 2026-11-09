Status: ready-for-agent

## Problem Statement

As a trainee, I need a running monorepo skeleton with infra so that later phases have a stable place to build API, worker, dashboard, and DB against.

## Solution

Scaffold pnpm workspaces plus Turborepo with dashboard, API, and worker apps and shared and db packages, plus local Postgres and Redis via Podman, env template, and README. Copy the sketch logic forward where it matches the PRD; PRD wins on conflict.

## User Stories

1. As a trainee, I want dependency install to succeed, so that dependencies are reproducible.
2. As a trainee, I want compose up to start Postgres 17 and Redis 7 with volumes and healthchecks, so that data survives restarts.
3. As a trainee, I want Redis configured with no eviction, so that jobs are never silently dropped.
4. As a trainee, I want one dev command to start dashboard, API, and worker together, so that I can iterate fast.
5. As a trainee, I want typecheck and lint to pass on the empty skeleton, so that Phase 1 starts green.
6. As a reviewer, I want an env example with all required keys, so that setup needs no guesswork.

## Implementation Decisions

- Monorepo with workspace plus turbo orchestration; API produces jobs only, worker consumes with lane selection via env, dashboard is Next.js with UI kit, shared holds queue and job names plus payload types and job options, db holds schema plus seed plus client service.
- Reuse rule: copy sketch as starting point, fix gaps to PRD; do not add services, queues, or tables beyond PRD.
- Infra versions: Postgres 17, Redis 7, Podman-compatible compose, WSL 8GB assumed.
- Env keys cover database URL, Redis host and port, ingest key list, admin token, worker lanes, fast-lane concurrency, cron timezone default UTC, and public API URL. No secrets in git.
- Strict TypeScript with shared config.

## Testing Decisions

- Good test asserts external behavior: commands exit zero, ports respond, no implementation-detail asserts.
- Verify install, compose healthy, dev boots all three processes, typecheck plus lint green.
- Prior art: none yet; manual verification, no unit tests required.

## Out of Scope

Any DB schema, endpoints, processors, dashboard pages, seed data, or simulator. Only skeleton plus infra.

## Further Notes

- Node 24 and pnpm 12 assumed. Prefer Podman-compatible compose syntax.
- README must list run commands; full architecture lands in the final phase.
