# @sim/docs static-export builder. Built from repo root:
#   podman build -f apps/docs/Dockerfile .
# Emits Next static export to /out; the compose docs-build service copies it
# onto the docs-static volume served by Caddy. No long-lived process.
FROM docker.io/library/node:24-slim AS build
RUN corepack enable && corepack prepare pnpm@12.15.0 --activate
WORKDIR /repo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/
COPY apps/worker/package.json apps/worker/
COPY apps/dashboard/package.json apps/dashboard/
COPY apps/docs/package.json apps/docs/
COPY packages/db/package.json packages/db/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm --filter @sim/docs build

FROM docker.io/library/node:24-slim AS runtime
COPY --from=build /repo/apps/docs/out /srv/docs
CMD ["cp", "-r", "/srv/docs/.", "/out/"]
