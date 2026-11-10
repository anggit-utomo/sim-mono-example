# Mono-service

Operator docs, ingest API, workers, and dashboard for the sync simulator.

## Language

**Content component**:
The single shared UI per docs page, reading the active locale from the provider.
_Avoid_: route, page copy

**Prose dictionary**:
JSON locale files (`apps/docs/app/en.json`, `apps/docs/app/id.json`). Human prose keyed by locale; technical terms, code, and mocks stay with the components.
_Avoid_: translation module, locale routes, machine translation

**Locale provider**:
The client context holding the active locale with English default and fallback.
_Avoid_: switcher, route prefix, language route

**Toggle**:
The ID | EN button in the nav switching the provider locale in place on the same URL.
_Avoid_: switcher links, counterpart links, language redirect

**Edge**:
The Caddy container holding the VPS's public ports for sim (`sim-edge` on 8080/8443).
_Avoid_: shared proxy, budget Caddy_

**Snippet**:
The sim-owned Caddyfile (`infra/caddy/Caddyfile`) mounted into the edge; sim never edits budget's Caddyfile.
_Avoid_: forked Caddyfile, second budget proxy_

**Prod starts empty**:
Migrations run on every deploy, `db:seed` never runs on the VPS; demo rows stay local.
_Avoid_: seeded prod, demo data_
