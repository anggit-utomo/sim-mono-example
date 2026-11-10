# ADR-0002: Sim owns its Caddy edge on 8080/8443

Date: 2026-11-10
Status: accepted

## Context

Budget's TLS is bound inside the `budget-app` container (FrankenPHP + Caddy,
`{$SERVER_NAME}` only, ports 80/443). There is no standalone shared proxy to
import a snippet into (`sim-example/budgets/Caddyfile`, `compose.prod.yaml`).

## Decision

Sim runs its own `edge` service (`caddy:2-alpine`, `sim-edge`) binding host
8080/8443 with automatic TLS for the three `sim-*` domains. Budget's
80/443 bindings and Caddyfile are byte-identical and never touched;
outer routing of `sim-*` traffic to 8080/8443 stays with the host setup.

## Alternatives considered

- Snippet + import into a shared Caddy: impossible, no shared edge exists;
  forking budget's Caddyfile would couple deploys.
- Second process on 80/443: impossible, only one process can hold a port.

## Consequences

- Sim edge config lives in `infra/caddy/Caddyfile` and deploys with sim.
- Outer 80/443→8080/8443 routing for `sim-*` domains must exist outside
  compose (firewall/security group); single-subdomain failure there is a
  routing/DNS fault, never a compose fault.
