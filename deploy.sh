#!/usr/bin/env bash
# Sim production deploy. Usage: ssh <vps>, cd /home/deploy/sim, ./deploy.sh
# Mirrors the budget muscle memory; never touches /home/deploy/budget.
set -euo pipefail
cd "$(dirname "$0")"

COMPOSE="podman-compose -f infra/compose.prod.yaml"

git pull --ff-only
$COMPOSE build

# stateful deps first, then one-shot static docs + migrations
# (migrate reuses the api image, so build must come first)
$COMPOSE up -d redis-sim
until podman exec sim-redis redis-cli ping >/dev/null 2>&1; do sleep 1; done
$COMPOSE run --rm docs-build
$COMPOSE run --rm migrate

# podman-compose does not recreate containers when the image changes, so force it
$COMPOSE up -d --force-recreate edge api worker dashboard
until podman exec sim-api curl -fs http://localhost:3001/health >/dev/null 2>&1; do sleep 2; done

podman image prune -f
