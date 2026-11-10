Status: ready-for-agent

## Problem Statement

As an Indonesian-speaking operator, I need the operator docs in Indonesian, so that I can learn each dashboard screen and run the testing drills without translating English explanations in my head.

## Solution

Keep a parallel Indonesian route tree inside the existing docs app, mirroring every English page one-to-one with an ID | EN switcher in the nav. Each page keeps a single shared content component parameterized by locale; all human prose lives in a central prose dictionary with English fallback. Thin route wrappers map each Indonesian URL to its shared content with the Indonesian locale, so no UI logic is duplicated per language.

## User Stories

1. As an Indonesian operator, I want an Indonesian Overview page explaining the post-office flow and guarantees, so that I build the right mental model in my own language.
2. As an Indonesian operator, I want Indonesian Customers, Queues, Cron, Ingests, and Logs pages, so that I learn each screen without translating.
3. As an Indonesian operator, I want an Indonesian walkthrough with the copy-paste curl drill, so that I can run the happy-path drill while reading Indonesian guidance.
4. As an Indonesian operator, I want an Indonesian Troubleshooting page mapping symptoms to causes and actions, so that I can act without paging a developer.
5. As an Indonesian operator, I want Indonesian Flows pages explaining the scenario graphs, so that I can follow the happy-path, delayed, failure, and cron scenarios in my language.
6. As an Indonesian operator, I want an Indonesian Architecture page explaining the service map, decision flowcharts, controller map, and inventory, so that I understand how the system fits together.
7. As an operator, I want an ID | EN switcher in the nav on every page, so that I can jump to the same page in the other language at any time.
8. As an operator, I want each Indonesian page to link its English counterpart, so that I can cross-check wording when unsure.
9. As an operator, I want curl commands and scripts byte-identical between ID and EN, so that a command copied from either language works the same.
10. As an operator, I want technical terms (ingest, queue, job, sweeper, fast-lane, cron, BullMQ, Prisma, PENDING/DONE/FAILED, endpoint paths, env vars) unchanged in English, so that the docs match the dashboard labels and logs exactly.
11. As an operator, I want the same static example mocks and not-live labels on Indonesian pages, so that I never mistake docs for the live system in either language.
12. As an operator, I want deep-linkable Indonesian URLs preserved for every page, so that I can share and bookmark guidance in my language.
13. As an operator, I want any section missing an Indonesian translation to fall back to English rather than render blank, so that I never hit an empty page.
14. As a developer adding a new docs page, I want the pattern to require one shared content component plus two thin route wrappers, so that both languages stay in sync without forking any UI.
15. As a developer adding new prose, I want one dictionary entry per language with English fallback, so that a missing translation degrades gracefully instead of breaking the page.
16. As a developer fixing shared presentation, I want styles, diagrams, mocks, and copy buttons implemented once, so that a single fix applies to both languages at once.
17. As a developer, I want the canonical operator guide markdown to stay English-only, so that translation scope stays inside the docs app.
18. As a reviewer, I want parity between the two trees provable through one external seam, so that I can verify translations without reading implementation details.

## Implementation Decisions

- Indonesian is served as a parallel route tree under the `/id` prefix inside the docs app, one route per English page: overview root plus customers, queues, cron, ingests, logs, walkthrough, troubleshooting, flows, and architecture.
- Each docs page has exactly one shared content component parameterized by locale; English and Indonesian route wrappers each fix one locale and render that same content component.
- Route wrappers are intentionally thin (a handful of lines each, roughly fifty lines total against roughly eight hundred shared lines): they exist because the router needs one entry per URL, not because translation logic is duplicated.
- All human prose lives in a central prose dictionary holding both languages; technical terms, code, commands, mock data, diagrams, and scripts stay with the shared content components and are never duplicated per language.
- Fallback rule: any Indonesian section without a translation resolves to its English counterpart; no route renders blank or half-empty.
- The nav gains an ID | EN switcher that always points at the same page in the other language (prefix-based, not hardcoded per page), plus footer and per-page cross-links between counterparts; internal cross-links inside content stay locale-aware.
- Copy-paste scripts and curl blocks are byte-identical across languages, including token placeholders, sample IDs, and expected JSON shapes.
- Language rule: Indonesian body prose; English technical vocabulary, statuses, endpoint paths, env var names, and code.
- Every route is fully static with no server data fetching and no admin, queue, or database calls in either language; the docs app runs on its own port with no backend dependencies.
- Sync rule is manual mirror: when the dashboard or ingest API changes, docs are hand-updated in a follow-up change; no shared UI package is extracted.
- Vocabulary follows the project glossary: route wrapper, content component, prose dictionary. No contradictions with existing ADRs (none exist in the repo).

## Testing Decisions

- A good test checks external behavior only: each Indonesian route responds successfully with Indonesian headings, the switcher resolves both ways, and scripts match the English originals exactly. No test asserts wrapper structure, dictionary shape, or component internals.
- Seam (single, highest possible): HTTP GET per `/id/*` route against the built docs app, asserting status, language markers, counterpart links, and script equality with EN. No new backend seams; the docs app makes zero admin, queue, or database calls in either language.
- Cases: all ten Indonesian routes return success with Indonesian headings and the not-live label; every switcher and counterpart link resolves to a live route in both directions; every script block on Indonesian pages is byte-identical to its English counterpart.
- Prior art: phase-8 docs verification (build, start on assigned port, fetch routes, assert markers), extended here with an EN/ID script-equality check.
- Verification servers are killed afterwards and ports confirmed free, per the repo port-hygiene rule.

## Out of Scope

- Translating the markdown operator guide or any other repo docs.
- Changes to English pages beyond adding the switcher and cross-links.
- Machine-translation pipelines, translation memory tooling, or additional languages.
- Right-to-left layouts, locale-aware formatting, or localized URLs beyond the `/id` prefix.
- Any change to the ingest API, workers, dashboard, seed data, or ports.

## Further Notes

- This spec replaces the prior phase-9 build spec: the four build tickets (shell/switcher, core pages, drill pages, parity verify) are implemented and verified, and the dictionary refactor landed afterwards, so this document records the resulting canonical pattern rather than re-requesting the build.
- Resolved in a grill-with-docs session: the "redundant components" concern was refuted by measurement (ten thin route wrappers versus shared content plus dictionary); the agreed pain is wrapper file count only, and the wrapper pattern stands. Resolved terms were captured in the root glossary.
