# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
# Start all apps in parallel (web, consumer, scheduler)
npm run dev

# Start specific apps
cd apps/web && npm run dev          # Next.js on port 3000
cd apps/consumer && npm run dev     # API check consumer only
cd apps/consumer && npm run dev:alerts  # Alert consumer only
cd apps/consumer && npm run dev:all     # Both consumers
cd apps/Scheduler && npm run dev    # Scheduler

# Type checking
npm run check-types

# Linting and formatting
npm run lint
npm run format
```

### Database (from `packages/database/`)
```bash
npm run db:migrate    # Run migrations
npm run db:push       # Push schema changes without migration
npm run db:generate   # Generate Prisma client
npm run db:studio     # Open Prisma Studio
```

### Build
```bash
npm run build         # Build all apps via Turborepo
```

## Architecture

This is a **Turborepo monorepo** for a real-time API monitoring application.

### Apps
- **`apps/web`** — Next.js 16 frontend + API routes (port 3000). Authentication via Clerk.
- **`apps/consumer`** — Two RabbitMQ consumers: `consumer.ts` processes API check jobs, `alert-consumer.ts` sends emails via Mailjet.
- **`apps/Scheduler`** — Ticks every 30s (`SCHEDULER_TICK_MS`), finds endpoints past their check frequency, and publishes jobs to RabbitMQ.

### Packages
- **`packages/database`** — Prisma client with PostgreSQL. Uses lazy-loaded proxy for connections. Schema has 4 models: `ApiEndpoint`, `ApiCheck`, `Alert`, `AlertLog`.
- **`packages/rabbit-mq`** — `publishJob()` and `publishAlertJob()` helpers. Two durable queues: `api-monitor` and `api-monitor-alerts`.
- **`packages/ui`** — Shared React components.

### Data Flow
```
User action / Scheduler tick
  → Next.js API route (Clerk auth)
  → DB write + publishJob() → RabbitMQ "api-monitor" queue
  → consumer.ts: fetch(url), record ApiCheck, compute stats
  → If failed: publishAlertJob() → RabbitMQ "api-monitor-alerts" queue
  → alert-consumer.ts: send email via Mailjet, log to AlertLog
```

### Frontend Patterns
- **React Query** (TanStack v5) with 30s stale time — custom hooks in `apps/web/app/hooks/`
- **Services layer** — all API calls go through `apps/web/app/services/api.ts`
- **Types** — shared frontend types in `apps/web/app/types/api.ts`
- Auth-gated pages redirect to `/sign-in` via `apps/web/app/page.tsx`

### Health Status Logic
Computed from last 5 checks: all failures = `"down"`, some failures = `"degraded"`, no failures = `"healthy"`. Uptime = (successful / total) × 100.

## Environment Variables

The web app requires (see README for full list):
- `DATABASE_URL` — PostgreSQL connection string
- `RABBITMQ_URL` — RabbitMQ connection string
- `CLERK_SECRET_KEY` / `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — Clerk auth
- `MAILJET_API_KEY` / `MAILJET_SECRET_KEY` — Email via Mailjet (consumer)
