# Mono-service

Operator docs, ingest API, workers, and dashboard for the sync simulator.

## Language

**Route wrapper**:
A 5-line `page.tsx` that maps one URL to a shared content component with a fixed locale.
_Avoid_: component, translation component, duplicate page

**Content component**:
The single shared UI per docs page, rendering prose via the dictionary for whichever locale it receives.
_Avoid_: route, page copy

**Prose dictionary**:
`apps/docs/app/i18n.ts`, the programmatic translation layer. Human prose keyed by locale; technical terms, code, and mocks stay with the components.
_Avoid_: translation files, locale routes, machine translation
