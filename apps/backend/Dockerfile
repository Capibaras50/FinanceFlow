FROM node:22-alpine AS deps
RUN corepack enable && corepack prepare pnpm@10.25.0 --activate
WORKDIR /app
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json .npmrc ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared-types/package.json ./packages/shared-types/
RUN pnpm install

FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@10.25.0 --activate
WORKDIR /app
COPY pnpm-workspace.yaml package.json .npmrc ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=deps /app/apps/backend/package.json ./apps/backend/
COPY apps/backend/ ./apps/backend/
RUN pnpm --filter @finance-flow/backend exec nest build

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/assets ./assets
COPY --from=builder /app/apps/backend/package.json ./
COPY --from=deps /app/node_modules ./node_modules
EXPOSE 3001
CMD ["node", "dist/main"]
