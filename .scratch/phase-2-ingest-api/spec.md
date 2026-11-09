Status: ready-for-agent

## Problem Statement

As an external caller, I need to push create and update customer requests and get immediate acceptance, so that my system never blocks on processing.

## Solution

Build two public endpoints with validation plus API-key guard, inbox-first persistence, then fast-lane enqueue with idempotent job identifier. Return 202 even if Redis is down; sweeper recovers later.

## User Stories

1. As a third party, I want create-customer with externalId, name, and email to return 202 plus ingestId ACCEPTED, so that I know it was stored.
2. As a third party, I want update-customer to upsert by externalId, so that I use one key for both.
3. As a third party, I want 400 on invalid body or unknown fields, so that contract violations are visible.
4. As a third party, I want 401 generic Unauthorized on missing or invalid key, so that callers debug auth versus validation.
5. As an operator, I want the API to still return 202 with PENDING row when Redis is down, so that no request is lost.
6. As a reviewer, I want the API to never register processors and only produce jobs.

## Implementation Decisions

- Shared module defines both queue names, all three job names, payload types, fast-lane job options of 3 attempts with exponential backoff from 2 seconds plus bounded completed and week-long failed retention, idempotent job identifier without colons, and total attempt cap.
- DTO requires non-empty externalId and name plus valid email; unknown fields rejected.
- Guard checks header against env list with generic 401 body and no enumeration.
- Producer creates PENDING inbox first, then adds fast-lane job at attempt zero; on enqueue error logs and still returns ACCEPTED.
- Async ingestion only; no sync processing in API.

## Testing Decisions

- Good test asserts HTTP status plus DB row plus queue job presence.
- Verify valid yields 202 plus PENDING plus job; invalid yields 400; bad key yields 401; Redis stopped yields 202 plus PENDING with no job and later sweeper recovery.
- Prior art: e2e with real DB and Redis; no mocked client for acceptance.

## Out of Scope

Worker processing, cron, admin endpoints, dashboard, JobRun writes.

## Further Notes

- Sketch service already matches inbox-first; keep it and add guards plus strict validation. Fields locked to three for training with easy extension later.
