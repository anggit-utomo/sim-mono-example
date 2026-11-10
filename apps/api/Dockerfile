# @sim/api production image. Built from repo root:
#   podman build -f apps/api/Dockerfile .
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
RUN pnpm --filter @sim/db exec prisma generate && pnpm --filter @sim/api build

FROM docker.io/library/node:20-slim AS runtime
RUN corepack enable && corepack prepare pnpm@12.15.0 --activate && apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
WORKDIR /repo
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/apps/api/node_modules ./apps/api/node_modules
COPY --from=build /repo/apps/api/dist ./apps/api/dist
COPY --from=build /repo/apps/api/package.json ./apps/api/
COPY --from=build /repo/packages/db ./packages/db
COPY --from=build /repo/packages/shared ./packages/shared
ENV NODE_ENV=production PORT=3001
WORKDIR /repo
CMD ["node", "apps/api/dist/main.js"]
