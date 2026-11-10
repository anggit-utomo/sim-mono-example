# Deploying sim to the VPS

Serves `sim-api.anggit.dev` (Nest API), `sim-dashboard.anggit.dev`
(Next dashboard), `sim-docs.anggit.dev` (static docs) from one checkout
at `/home/deploy/sim`, alongside the budget project. Routine deploys use
the same muscle memory as budget: `ssh`, `cd`, `./deploy.sh`.

## Architecture (what runs where)

- `sim-edge` (Caddy, host `8080`/`8443`): TLS + routing for all three
  domains. Budget's 80/443 bindings are untouched; outer routing of
  `sim-*` traffic to 8080/8443 is host/firewall setup, not compose.
- `sim-api` (3001), `sim-worker`, `sim-dashboard` (3000),
  `sim-redis` (BullMQ queue, no published ports).
- Docs has no runtime: `docs-build` copies the static export onto the
  `docs-static` volume, Caddy serves it via `file_server`.
- Postgres is one logical DB (`sim_prod`) inside the existing
  `budget-db` container — see ADR-0001. No second Postgres.
- Decisions: `docs/adr/0001-reuse-budget-postgres.md`,
  `docs/adr/0002-sim-own-caddy-edge.md`.

## First-time setup (run once, in order)

Assumes repo cloned to `/home/deploy/sim` and DNS A records for the
three `sim-*` domains point at the VPS.

**1. Confirm the budget network name.** The compose file joins
`budget_default` so sim reaches `budget-db:5432`:

```bash
podman network ls
podman inspect budget-db --format '{{.NetworkSettings.Networks}}'
```

If the name differs, replace `budget_default` in
`infra/compose.prod.yaml` (3 services + the networks block) and
continue — nothing else changes.

**2. Confirm ports 8080/8443 are free** (the sim edge binds them):

```bash
ss -ltnp | grep -E '8080|8443'
```

**3. Create the database role and DB.** Run once as the budget
superuser (`<DB_USER>`/`<DB_NAME>` are budget's own credentials —
this only adds a new role + DB, never touches budget tables):

```bash
SIM_PW=$(openssl rand -hex 32)
podman exec -it budget-db psql -U <DB_USER> -d <DB_NAME> \
  -c "CREATE USER sim_prod WITH PASSWORD '$SIM_PW';" \
  -c "CREATE DATABASE sim_prod OWNER sim_prod;"
echo "sim_prod password: $SIM_PW"
```

**4. Write the env file** (VPS-only, never committed, mode 600).
Generate the two remaining secrets, then create the file:

```bash
openssl rand -hex 32  # INGEST_API_KEYS (run twice or comma-separate two keys)
openssl rand -hex 32  # ADMIN_TOKEN
install -m 600 /dev/null /home/deploy/sim/.env
```

`/home/deploy/sim/.env` contents (`infra/.env.prod.example`
is the committed template — keys only, empty values):

```bash
DATABASE_URL=postgresql://sim_prod:<SIM_PW>@budget-db:5432/sim_prod
REDIS_HOST=redis-sim
REDIS_PORT=6379
INGEST_API_KEYS=<key1,key2>
ADMIN_TOKEN=<admin-token>
API_URL=http://api:3001
PORT=3001
WORKER_LANES=fast,cron
FAST_LANE_CONCURRENCY=10
FAST_LANE_DELAY_MS=0
CRON_TZ=UTC
```

Prod starts empty: every deploy runs `prisma migrate deploy`;
`db:seed` never runs on the VPS (demo rows stay local).

**5. First deploy:**

```bash
cd /home/deploy/sim
./deploy.sh
```

The script pulls, builds, starts redis, renders docs, migrates,
then force-recreates edge/api/worker/dashboard and waits for
`/health`. One-shot `migrate`/`docs-build` exit when done —
`podman ps` showing only edge/api/worker/dashboard/redis-sim
afterwards is normal.

## Every deploy after that

```bash
ssh <vps>
cd /home/deploy/sim
./deploy.sh
```

That's it. Budget is never touched: no `cd /home/deploy/budget`,
no compose/exec there, no edits to its Caddyfile.

## Verify it works

```bash
curl -s https://sim-api.anggit.dev/health
# {"ok":true}

curl -s https://sim-dashboard.anggit.dev/ | grep -i overview
curl -s https://sim-docs.anggit.dev/ | grep -i flows

# Ingest round-trip (ADMIN_TOKEN/keys from /home/deploy/sim/.env):
curl -s -X POST https://sim-api.anggit.dev/customers \
  -H "Authorization: Bearer <INGEST_API_KEY>" \
  -H 'Content-Type: application/json' \
  -d '{"externalId":"deploy-probe-1","name":"Probe","email":"probe@example.com"}'
# -> ACCEPTED with "delayMs": 0

podman logs sim-worker | tail   # process-ingest completion
podman ps --format '{{.Names}}' # sim-* next to budget-*, both sets up
free -m                         # expect >=300 MB available
```

Symptom map: `unavailable (Redis down?)` on the dashboard means
`ADMIN_TOKEN` mismatch, not a proxy fault. One subdomain 404ing at
the edge while others work is a missing DNS A record, not compose.
`migrate` exiting non-zero is `DATABASE_URL`/auth — fix the env and
rerun `podman-compose -f infra/compose.prod.yaml run --rm migrate`
before starting api/worker.

## Useful commands

```bash
cd /home/deploy/sim
COMPOSE="podman-compose -f infra/compose.prod.yaml"

$COMPOSE logs -f api worker        # follow app logs
podman exec sim-api curl -fs http://localhost:3001/health
podman exec sim-redis redis-cli ping
$COMPOSE run --rm migrate          # re-run migrations only
$COMPOSE run --rm docs-build       # re-render docs only
podman exec sim-edge caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
```

## Resource envelope (2 CPU / 2 GB shared with budget)

Mem caps: api 256m, worker 384m, dashboard 256m, redis-sim 128m
(~1 GB for sim; edge/docs-build are small/short-lived). If OOM:
lower `FAST_LANE_CONCURRENCY` to 5 and cap `redis-sim` at 64 MB
before considering a bigger box. No second Postgres without
observed buffer pressure (see ADR-0001).
