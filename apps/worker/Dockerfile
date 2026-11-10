# @sim/worker production image. Built from repo root:
#   podman build -f apps/worker/Dockerfile .
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
RUN pnpm --filter @sim/db exec prisma generate && pnpm --filter @sim/worker build

FROM docker.io/library/node:24-slim AS runtime
WORKDIR /repo
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/apps/worker/node_modules ./apps/worker/node_modules
COPY --from=build /repo/apps/worker/dist ./apps/worker/dist
COPY --from=build /repo/apps/worker/package.json ./apps/worker/
COPY --from=build /repo/packages/db ./packages/db
COPY --from=build /repo/packages/shared ./packages/shared
ENV NODE_ENV=production
WORKDIR /repo
CMD ["node", "apps/worker/dist/main.js"]
