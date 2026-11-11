#!/usr/bin/env bash
# Sim production deploy. Usage: ssh <vps>, cd /home/deploy/sim, ./deploy.sh [service...]
#   ./deploy.sh              # everything (api worker dashboard docs)
#   ./deploy.sh api          # api only (no migrate: schema unchanged)
#   ./deploy.sh docs         # docs static export only (no restarts)
#   ./deploy.sh worker       # worker only
#   ./deploy.sh dashboard    # dashboard only
#   ./deploy.sh api docs     # any combination
# Mirrors the budget muscle memory; never touches /home/deploy/budget.
set -euo pipefail
cd "$(dirname "$0")"

COMPOSE="podman-compose -f infra/compose.prod.yaml"

WANT_ALL=1
WANT_API=0
WANT_WORKER=0
WANT_DASHBOARD=0
WANT_DOCS=0
WANT_MIGRATE=0
if [ "$#" -gt 0 ]; then
  WANT_ALL=0
  for arg in "$@"; do
    case "$arg" in
      all) WANT_ALL=1 ;;
      api) WANT_API=1 ;;
      worker) WANT_WORKER=1 ;;
      dashboard) WANT_DASHBOARD=1 ;;
      docs) WANT_DOCS=1 ;;
      migrate) WANT_API=1; WANT_MIGRATE=1 ;;
      *) echo "unknown service: $arg (want: all|api|worker|dashboard|docs|migrate)" >&2; exit 1 ;;
    esac
  done
fi
if [ "$WANT_ALL" -eq 1 ]; then
  WANT_API=1; WANT_WORKER=1; WANT_DASHBOARD=1; WANT_DOCS=1; WANT_MIGRATE=1
fi
# migrate reuses the api image: any migrate run needs a fresh api build
NEED_API_IMAGE=$(( WANT_API == 1 || WANT_MIGRATE == 1 ? 1 : 0 ))

git pull --ff-only

# free buildah temp + stale layers first: 2 GB box OOMs/disks-out on
# parallel multi-arch pnpm installs otherwise (builds are sequential below)
podman image prune -af --filter "dangling=true" >/dev/null 2>&1 || true
podman system prune -f >/dev/null 2>&1 || true
[ "$NEED_API_IMAGE" -eq 1 ] && $COMPOSE build api
[ "$WANT_WORKER" -eq 1 ] && $COMPOSE build worker
[ "$WANT_DASHBOARD" -eq 1 ] && $COMPOSE build dashboard
[ "$WANT_DOCS" -eq 1 ] && $COMPOSE build docs-build

# stateful deps first, then one-shot static docs + migrations
# (migrate/docs-build reuse built images, so builds must come first)
$COMPOSE up -d redis-sim
until podman exec sim-redis redis-cli ping >/dev/null 2>&1; do sleep 1; done
[ "$WANT_DOCS" -eq 1 ] && $COMPOSE run --rm docs-build
# explicit `migrate` arg, or full deploys: schema may have changed
if [ "$WANT_MIGRATE" -eq 1 ]; then $COMPOSE run --rm migrate; fi

# podman-compose does not recreate containers when the image changes, so force it
RECREATE=""
[ "$WANT_API" -eq 1 ] && RECREATE="$RECREATE api"
[ "$WANT_WORKER" -eq 1 ] && RECREATE="$RECREATE worker"
[ "$WANT_DASHBOARD" -eq 1 ] && RECREATE="$RECREATE dashboard"
# edge serves the docs-static volume: no restart needed for docs content
if [ -n "$RECREATE" ]; then
  # shellcheck disable=SC2086
  $COMPOSE up -d --force-recreate edge $RECREATE
fi
if [ "$WANT_API" -eq 1 ]; then
  until podman exec sim-api curl -fs http://localhost:3001/health >/dev/null 2>&1; do sleep 2; done
fi
if [ "$WANT_DASHBOARD" -eq 1 ]; then
  until podman exec sim-dashboard wget -qO- http://localhost:3000/ >/dev/null 2>&1; do sleep 2; done
fi

podman image prune -f
