FROM node:20-alpine AS base

# ── Build ─────────────────────────────────────────────────────
FROM base AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy the entire monorepo
COPY . .

# Install all deps (resolves workspace packages via symlinks)
RUN npm ci

# Build the database package (compiles TS)
RUN npx turbo run build --filter=@repo/database

# Build the web app (produces .next/standalone)
# Provide dummy DATABASE_URL so Prisma client doesn't throw during static page collection
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN npx turbo run build --filter=web

# ── Production runner ─────────────────────────────────────────
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/apps/web/public ./apps/web/public

# Copy standalone output
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "apps/web/server.js"]
