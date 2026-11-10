Status: ready-for-agent

## Problem Statement

As an Indonesian-speaking operator, I need the operator docs in Indonesian, so that I can learn each dashboard screen and run the testing drills without translating English explanations in my head.

## Solution

Serve every docs page in both languages from a single URL per page, with an ID | EN toggle button in the nav. All human prose lives in two JSON locale files with English fallback; one shared content component per page reads the active locale from a client provider, so no route or UI logic is duplicated per language.

## User Stories

1. As an Indonesian operator, I want an Indonesian Overview page explaining the post-office flow and guarantees, so that I build the right mental model in my own language.
2. As an Indonesian operator, I want Indonesian Customers, Queues, Cron, Ingests, and Logs pages, so that I learn each screen without translating.
3. As an Indonesian operator, I want an Indonesian walkthrough with the copy-paste curl drill, so that I can run the happy-path drill while reading Indonesian guidance.
4. As an Indonesian operator, I want an Indonesian Troubleshooting page mapping symptoms to causes and actions, so that I can act without paging a developer.
5. As an Indonesian operator, I want Indonesian Flows pages explaining the scenario graphs, so that I can follow the happy-path, delayed, failure, and cron scenarios in my language.
6. As an Indonesian operator, I want an Indonesian Architecture page explaining the service map, decision flowcharts, controller map, and inventory, so that I understand how the system fits together.
7. As an operator, I want an ID | EN toggle button in the nav on every page, so that I can switch languages in place without leaving the page.
8. As an operator, I want curl commands and scripts byte-identical across languages, so that a command copied in either language works the same.
9. As an operator, I want technical terms (ingest, queue, job, sweeper, fast-lane, cron, BullMQ, Prisma, PENDING/DONE/FAILED, endpoint paths, env vars) unchanged in English, so that the docs match the dashboard labels and logs exactly.
10. As an operator, I want the same static example mocks and not-live labels in both languages, so that I never mistake docs for the live system in either language.
11. As an operator, I want any section missing an Indonesian translation to fall back to English rather than render blank, so that I never hit an empty page.
12. As a developer adding a new docs page, I want the pattern to require one shared content component reading the locale provider, so that both languages stay in sync without forking any UI.
13. As a developer adding new prose, I want one JSON entry per locale file with English fallback, so that a missing translation degrades gracefully instead of breaking the page.
14. As a developer fixing shared presentation, I want styles, diagrams, mocks, and copy buttons implemented once, so that a single fix applies to both languages at once.
15. As a developer, I want the canonical operator guide markdown to stay English-only, so that translation scope stays inside the docs app.
16. As a reviewer, I want language parity provable through one external seam, so that I can verify translations without reading implementation details.

## Implementation Decisions

- One URL per docs page: overview root plus customers, queues, cron, ingests, logs, walkthrough, troubleshooting, flows, and architecture. There is no `/id` route tree.
- Each docs page has exactly one shared content component reading the active locale from a client locale provider; no component takes a locale prop and no route wrapper exists.
- All human prose lives in two JSON locale files holding English and Indonesian; technical terms, code, commands, mock data, diagrams, and scripts stay with the shared content components and are never duplicated per language.
- Fallback rule: any Indonesian section without a translation resolves to its English counterpart; no page renders blank or half-empty.
- The nav carries an ID | EN toggle button switching the provider locale in place; the footer carries no language links and content holds no locale-aware internal links.
- Copy-paste scripts and curl blocks are byte-identical across languages, including token placeholders, sample IDs, and expected JSON shapes.
- Language rule: Indonesian body prose; English technical vocabulary, statuses, endpoint paths, env var names, and code.
- Every route is fully static with no server data fetching and no admin, queue, or database calls; the docs app runs on its own port with no backend dependencies. The static shell prerenders English; Indonesian swaps in at runtime from the client bundle.
- Nav labels and footer prose are dictionary entries like any other, so the toggle switches every prose string.
- Sync rule is manual mirror: when the dashboard or ingest API changes, docs are hand-updated in a follow-up change; no shared UI package is extracted.
- Vocabulary follows the project glossary: content component, prose dictionary (JSON locale files), locale provider, toggle. No contradictions with existing ADRs (none exist in the repo).

## Testing Decisions

- A good test checks external behavior only: each docs route responds successfully, the toggle switches prose language in place, and scripts match across languages exactly. No test asserts provider structure, dictionary shape, or component internals.
- Seam (single, highest possible): HTTP GET per docs route against the built docs app plus a client toggle check, asserting status, language markers after toggle, and script equality across languages. No new backend seams; the docs app makes zero admin, queue, or database calls.
- Cases: all ten docs routes return success with headings and the not-live label; the toggle switches every prose string to Indonesian and back without navigation; every script block is identical before and after the toggle.
- Prior art: phase-8 docs verification (build, start on assigned port, fetch routes, assert markers), extended here with a toggle language-equality check.
- Verification servers are killed afterwards and ports confirmed free, per the repo port-hygiene rule.

## Out of Scope

- Translating the markdown operator guide or any other repo docs.
- Deep-linkable per-language URLs; one URL serves both languages by design.
- Persisting the locale choice across visits (no cookie or storage); the default is English on every load.
- Machine-translation pipelines, translation memory tooling, or additional languages.
- Right-to-left layouts or locale-aware formatting.
- Any change to the ingest API, workers, dashboard, seed data, or ports.

## Further Notes

- This spec supersedes the prior phase-9 tree spec: the `/id` route tree, dictionary module, switcher, and counterpart links are removed and replaced by the single-URL toggle design at the requester's direction (deep-linkable Indonesian URLs deliberately dropped).
- The four prior build tickets (shell/switcher, core pages, drill pages, parity verify) are superseded along with it; do not implement them as written.
