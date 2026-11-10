Status: ready-for-agent

## Problem Statement

As an Indonesian-speaking operator, I need the operator docs in Indonesian, so that I can learn each dashboard screen and run the testing drills without translating English explanations in my head.

## Solution

Add a parallel Indonesian route tree under `/id/*` inside the existing docs app, mirroring every English page one-to-one with an ID | EN switcher in the nav, sharing all components, styles, diagrams, mocks, and copy-paste scripts.

## User Stories

1. As an Indonesian operator, I want an Indonesian Overview page explaining the post-office flow and guarantees, so that I build the right mental model in my own language.
2. As an Indonesian operator, I want Indonesian Customers, Queues, Cron, Ingests, and Logs pages, so that I learn each screen without translating.
3. As an Indonesian operator, I want an Indonesian walkthrough with the copy-paste curl, so that I can run the happy-path drill while reading Indonesian guidance.
4. As an Indonesian operator, I want Indonesian Flows and Architecture pages, so that the scenario graphs and decision flowcharts are explained in my language.
5. As an operator, I want an ID | EN switcher in the nav on every page, so that I can jump to the same page in the other language at any time.
6. As an operator, I want each Indonesian page to link its English counterpart, so that I can cross-check wording when unsure.
7. As an operator, I want curl commands and scripts byte-identical between ID and EN, so that a command copied from either language works the same.
8. As an operator, I want technical terms (ingest, queue, job, sweeper, fast-lane, cron, BullMQ, Prisma, PENDING/DONE/FAILED, endpoint paths, env vars) unchanged in English, so that the docs match the dashboard labels and logs exactly.
9. As an operator, I want the same static example mocks and not-live labels on Indonesian pages, so that I never mistake docs for the live system in either language.
10. As a developer, I want Indonesian pages to reuse the existing shared components and styles, so that a style or component fix applies to both languages at once.
11. As a developer, I want English to remain the fallback, so that any section missing in Indonesian links to its English counterpart instead of rendering blank.
12. As a developer, I want the canonical operator guide markdown to stay English-only, so that translation scope stays inside the docs app.

## Implementation Decisions

- New Indonesian route group inside the docs app, one route per English page: overview root plus customers, queues, cron, ingests, logs, walkthrough, troubleshooting, flows, and architecture.
- The nav gains an ID | EN switcher that always points at the same page in the other language, plus footer and per-page cross-links between counterparts.
- All shared presentation is reused, not duplicated: global styles, copy button, pipeline and decision-flowchart diagrams, mock labels, and example tables keep a single implementation.
- Copy-paste scripts and curl blocks are carried over byte-identical, including token placeholders, sample IDs, and expected JSON shapes.
- Language rule: Indonesian body prose; English technical vocabulary, statuses, endpoint paths, env var names, and code.
- Fallback rule: any Indonesian section without a translation links to its English counterpart; no route renders blank or half-empty.
- Markdown operator guide stays English-only and canonical; translation lives only in the docs app routes.

## Testing Decisions

- A good test checks external behavior only: each Indonesian route responds successfully with Indonesian headings, the switcher resolves both ways, and scripts match the English originals exactly.
- Seam (single, highest possible): HTTP GET per `/id/*` route against the built docs app, asserting status, language markers, counterpart links, and script equality with EN. No new backend seams; the docs app makes zero admin, queue, or database calls in either language.
- Prior art: phase-8 docs verification (build, start on assigned port, fetch routes, assert markers), extended here with an EN/ID script-equality check.

## Out of Scope

- Translating the markdown operator guide or any other repo docs.
- Changes to English pages beyond adding the switcher and cross-links.
- Machine-translation pipelines, translation memory tooling, or additional languages.
- Right-to-left layouts, locale-aware formatting, or localized URLs beyond the `/id` prefix.
- Any change to the ingest API, workers, dashboard, seed data, or ports.

## Further Notes

- Grilled in three questions (scope = docs app only; `/id/*` mirror with switcher; Indonesian prose with English technical terms plus EN fallback); all confirmed by the requester.
- Follows the phase-8 docs app pattern: static Next.js, no data fetching, manual mirror when the dashboard changes.
