Status: ready-for-agent

## Problem Statement

As an operator, I need a plain functional UI to browse 300k customers and operate queues, jobs, crons, ingests, and logs, so that I never need Redis CLI.

## Solution

Build Next.js with UI kit pages calling admin API server-side with admin token; all actions show success or error feedback.

## User Stories

1. As an operator, I want Overview with per-queue state counts, inbox per-status, and latest stats, so that health is one screen.
2. As an operator, I want Customers table with server pagination plus search, so that 300k stays responsive.
3. As an operator, I want Queues lane plus state selector, job list, failure reason, and retry for failed fast-lane, so that I can fix failures.
4. As an operator, I want Cron list with pattern, next run, and last result plus Trigger now with confirmation, so that manual runs are safe.
5. As an operator, I want Ingests table with status filter, error text, Requeue plus Requeue-all-failed, so that recovery is clickable.
6. As an operator, I want Logs history with queue and status filters, so that audits are possible.

## Implementation Decisions

- Server components or route handlers hold the token from env and never expose it to the browser.
- Page size 50 for customers, jobs, ingests, and logs; search uses exact externalId or email prefix backed by indexes.
- UI kit components with plain functional styling suffice.
- All mutations show feedback; cron trigger requires confirmation. No login for simulation.

## Testing Decisions

- Good test loads pages against seeded 300k plus actions succeeding.
- Verify each page loads quickly, search plus pagination responsive, trigger plus retry plus requeue work from UI and reflect in API state.
- Prior art: smoke test plus admin e2e already built.

## Out of Scope

Real auth, notifications, multi-tenancy, bulk import, rate limiting.

## Further Notes

- Sketch has no dashboard; this phase is greenfield. Keep the admin surface unchanged.
