# @sim/dashboard production image. Built from repo root:
#   podman build -f apps/dashboard/Dockerfile .
# ADMIN_TOKEN is runtime-only (server components); never pass it as a build ARG.
FROM docker.io/library/node:20-slim AS build
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
ARG API_URL=http://api:3001
ENV API_URL=$API_URL
RUN pnpm --filter @sim/dashboard build

FROM docker.io/library/node:20-slim AS runtime
RUN apt-get update && apt-get install -y --no-install-recommends wget && rm -rf /var/lib/apt/lists/*
WORKDIR /repo/apps/dashboard
COPY --from=build /repo/node_modules /repo/node_modules
COPY --from=build /repo/apps/dashboard/node_modules /repo/apps/dashboard/node_modules
COPY --from=build /repo/apps/dashboard/.next ./.next
COPY --from=build /repo/apps/dashboard/package.json ./
COPY --from=build /repo/apps/dashboard/next.config.js ./
COPY --from=build /repo/apps/dashboard/app ./app
COPY --from=build /repo/apps/dashboard/lib ./lib

ENV NODE_ENV=production PORT=3000
CMD ["node", "node_modules/next/dist/bin/next", "start", "-p", "3000"]
