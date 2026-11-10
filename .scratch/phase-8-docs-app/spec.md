Status: ready-for-agent

## Problem Statement

As an operator or new hire, I need documentation that looks like the dashboard I operate, so that I can learn each screen (Overview, Customers, Queues, Cron, Ingests, Logs) plus the end-to-end flow and recovery steps without guessing which guide paragraph maps to which screen.

## Solution

Build a new static docs app beside the dashboard that mirrors its nav and card/table look with basic HTML and CSS only, hard-copying the operator user guide into one route per screen plus walkthrough and troubleshooting routes, each with a clearly labeled non-live example view.

## User Stories

1. As an operator, I want an Overview docs page explaining the four health cards, so that I know where to look first when something feels wrong.
2. As an operator, I want an Overview example view with sample card numbers, so that I recognize the real health screen.
3. As an operator, I want a Customers docs page explaining exact-ID and email-prefix search plus pagination, so that I can find any customer in the seeded truth table.
4. As an operator, I want a Customers example view with a search bar and table shell, so that I recognize the real customer table.
5. As an operator, I want a Queues docs page explaining lanes and job states plus retry semantics, so that I can recover failed jobs correctly.
6. As an operator, I want a Queues example view with lane and state selectors plus a job table shell, so that I recognize the real waiting lines.
7. As an operator, I want a Cron docs page explaining the sweeper and aggregate-stats schedules plus Trigger now guidance, so that I run manual schedules safely after an outage.
8. As an operator, I want a Cron example view with a schedule table shell, so that I recognize the real schedules screen.
9. As an operator, I want an Ingests docs page explaining inbox statuses plus Requeue and Requeue-all-failed semantics, so that I can recover stuck rows.
10. As an operator, I want an Ingests example view with a status filter and inbox table shell, so that I recognize the real inbox.
11. As an operator, I want a Logs docs page explaining the read-only job-run history and its filters, so that I can audit safely.
12. As an operator, I want a Logs example view with a history table shell, so that I recognize the real history screen.
13. As a new hire, I want a concepts page explaining the post-office flow and the nothing-is-lost plus newest-wins guarantees, so that I build the right mental model before touching anything.
14. As a new hire, I want a words table defining Customer, Ingest, Queue, Job, Cron, and Job run, so that I use the same language as the team.
15. As a trainer, I want a walkthrough page with the happy-path create, inbox flip, customer confirm, update, and log check steps, so that I can run the same drill every time.
16. As an operator, I want a troubleshooting page mapping PENDING growth, FAILED rows, unavailable queue cards, missing retry targets, and stale-winner races to causes and actions, so that I act without paging a developer.
17. As an operator, I want a demo-data page listing the API key header convention, seeded ID range, and failure-drill poison name, so that I can practice safely.
18. As an operator, I want every example view labeled as not live data, so that I never mistake docs for the real system.
19. As an operator, I want a footer link back to the real dashboard and a note naming the canonical guide source, so that I always know where truth lives.
20. As a developer, I want the docs app runnable alongside the dashboard on its own port with no queue or database dependencies, so that docs never break when Redis is down.

## Implementation Decisions

- New docs app in the monorepo apps collection using the same Next.js and React generations as the dashboard, static routes only, served on its own local port distinct from the dashboard.
- Route map mirrors the dashboard nav one-to-one (overview root, customers, queues, cron, ingests, logs) plus a walkthrough route and a troubleshooting route covering symptom table plus demo data.
- Shell copies the dashboard look verbatim for v1: dark top nav with brand plus links, constrained main column, system font, cards row, plain bordered tables, error accent, pre-wrap for stats output.
- Content is a hand copy of the canonical operator guide at v1; the markdown guide remains canonical and no markdown import pipeline is added.
- Every route is fully static with no server data fetching, no admin token, and no queue or database environment required; all controls (search, pagination, selectors, trigger, requeue, retry) render as disabled or plain text inside the example views.
- Example mocks use fixed sample values (small counts, one or two table rows, sample JSON stats) and carry a visible not-live-data label.
- Wiring follows the existing dashboard pattern: package scripts for dev, build, start, typecheck, and lint placeholder; picked up automatically by the workspace glob and the existing turbo pipeline with no extra env loading.
- Sync rule is manual mirror: when the dashboard or ingest API changes, docs are hand-updated in a follow-up change; no shared UI package is extracted in v1.
- No contradictions with existing ADRs (none exist in the repo); vocabulary follows the operator guide: Customer, Ingest inbox row with PENDING PROCESSING DONE FAILED, Queue lanes fast-lane and cron, Job, Cron schedules sweep-pending and aggregate-stats, Job run log with COMPLETED FAILED.

## Testing Decisions

- A good test checks external behavior only: each docs route responds successfully and shows its guide headings plus its not-live example view, and makes zero calls to admin, queue, or database systems.
- Seam (single, highest possible): HTTP GET against the built docs app per route. Preferred over component or unit seams because the feature is static presentation plus workspace wiring. No new backend seams are introduced.
- Cases: all eight routes return success; nav links point at the eight docs routes; footer points at the real dashboard origin and names the canonical guide; example views contain the not-live label and no enabled mutation controls; dashboard routes are unaffected.
- Prior art: dashboard phase smoke coverage and admin end-to-end checks that load pages against seeded state; reuse that pattern (build, start on assigned port, fetch routes, assert markers) without requiring seeded data or Redis.

## Out of Scope

- Live data, search logic, pagination logic, trigger, retry, or requeue behavior.
- Markdown loader, content management system, versioned docs, or full-text search.
- Shared UI package extraction between dashboard and docs.
- Authentication, authorization, internationalization, analytics, or notifications.
- Changes to the ingest API, workers, sweeper, aggregate-stats job, admin surface, or seeded data.

## Further Notes

- Grilling sessions Q1 through Q8 (plan mode) settled the eight decisions above; the requester confirmed each round.
- If dashboard styling drifts often after v1, revisit the verbatim-copy decision and extract a shared style package; until then manual mirror keeps the seam count at one.
