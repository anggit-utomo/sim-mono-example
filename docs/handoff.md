# Handoff — docs app + demo knobs (Nov 2026)

Fresh agent: this is the state of the `apps/docs` operator-docs workstream and the
small API demo knob that supports it. Details live in the referenced artifacts —
this file is only the map.

## What was built (all on master, newest last)

- Operator docs app (`apps/docs`, Next.js static, port 3002): user guide, dashboard
  mocks, walkthrough with copyable curl, Flows page (4 SVG scenario graphs + run
  scripts + dashboard checkpoints), Architecture page (service map, 4 decision
  flowcharts, controller map, inventory). Commits: phase-8 scaffold through
  `aeaf675` (detailed flowcharts).
- API demo knob: `FAST_LANE_DELAY_MS` env (default 0) holds accepted rows in
  PENDING via BullMQ delayed jobs; ACCEPTED response + server log show the delay.
  Commits: delay knob, `delayMs` in response, walkthrough/cron drill docs.
- Indonesian tree: `/id/*` mirrors all 10 EN routes with ID|EN switcher +
  footer counterpart links. Refactored to dictionary i18n (`apps/docs/app/i18n.ts`,
  one shared component per page, EN fallback). Commit `00a3993`.
- Tracker: `.scratch/phase-8-docs-app/` (spec + 5 issues), `.scratch/phase-9-docs-id/`
  (spec + 4 issues). All tickets implemented and verified.
- Process rule added to `AGENTS.md`: fixed ports (3000 dashboard, 3001 api,
  3002 docs), user runs `pnpm dev` manually, agents kill test servers they start
  (by port, never broad `pkill`), never mix `next dev`/`next start` without
  clearing `.next`.

## Current state / gotchas

- User runs their own `pnpm dev`; do not start or kill their servers. Verify via
  `next build` (+ prerendered HTML greps) rather than live servers.
- Known pre-existing issue: user's dev server 500s on docs `/` and `/id` (stale
  `.next` chunks, same class as the earlier 431.js/432.js errors). Production
  build is green (23/23 static pages); a clean dev restart clears it.
- Local `.env` (gitignored) carries `FAST_LANE_DELAY_MS=20000`. Reference env
  var names only — never print token values.
- Answered (not implemented): BullMQ/Redis monitoring pointers, race-condition
  handling (newest-wins + idempotency, residual same-ms race documented in the
  user guide), cron A/B verification walkthrough (written into Flows + guide §3.4).

## Suggested skills (call via the Skill tool)

- `implement` — for any follow-up build task in this area; it chains `tdd` at
  the HTTP-GET-per-route seam, typecheck/build verification, `code-review`, commit.
- `to-spec` — if a new docs/app behavior is requested; publish under
  `.scratch/<slug>/spec.md` with `ready-for-agent`.
- `to-tickets` — to slice an approved spec into tracer-bullet tickets under
  `.scratch/<slug>/issues/`.
- `grill-with-docs` — if the next request is vague; it loads `grilling` +
  `domain-modeling` for the design-tree interview before planning.
- `code-review` — two-axis (standards + spec) review of any diff before commit.
- `handoff` — refresh this file when the workstream changes hands again.
