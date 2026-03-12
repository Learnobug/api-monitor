# API Monitor

A full-stack, real-time **API monitoring application** built as a Turborepo monorepo. It lets you register HTTP endpoints, monitor their health on a configurable schedule, view response-time analytics, and receive email alerts when things go wrong. 

--- 

## Architecture

![Architecture Diagram](./architecture.png)

The system follows an **event-driven, queue-based architecture** with clear separation of concerns:

| Component | Role |
|---|---|
| **Client** (Next.js) | Dashboard UI — register endpoints, view stats, trigger manual checks |
| **Service** (Next.js API routes) | REST API — CRUD for endpoints/alerts, enqueues jobs to RabbitMQ |
| **Queue** (RabbitMQ) | Two durable queues: `api-monitor` (check jobs) and `api-monitor-alerts` (alert jobs) |
| **Workers / Consumers** | Process check jobs — hit the endpoint, measure response time, store results in DB |
| **Database** (PostgreSQL) | Stores endpoints, check history, alerts, and alert logs via Prisma ORM |
| **Scheduler** | Cron-like ticker — every 30 s polls the DB, enqueues checks for endpoints whose frequency has elapsed |
| **Alert Service** | Consumes alert jobs, sends failure notification emails via Mailjet, logs delivery |

### Data Flow

```
┌─────────┐        ┌──────────────┐       ┌───────────────┐
│  Client  │──────▶ │   Service    │─────▶ │  RabbitMQ     │
│ (Next.js)│◀────── │ (API Routes) │       │ check queue   │
└─────────┘        └──────┬───────┘       └───────┬───────┘
                          │                       │
                          ▼                       ▼
                   ┌──────────────┐       ┌───────────────┐
                   │   Database   │◀───── │   Consumer    │
                   │ (PostgreSQL) │       │  (Worker)     │
                   └──────┬───────┘       └───────┬───────┘
                          ▲                       │
                          │                       ▼
                   ┌──────────────┐       ┌───────────────┐
                   │  Scheduler   │       │  RabbitMQ     │
                   │  (Cron tick) │       │ alert queue   │
                   └──────────────┘       └───────┬───────┘
                                                  │
                                                  ▼
                                          ┌───────────────┐
                                          │ Alert Service │
                                          │  (Mailjet)    │
                                          └───────────────┘
```

1. User registers an endpoint via the **dashboard** → API route creates a DB record and enqueues an initial check.
2. **Scheduler** ticks every 30 s → finds endpoints past their `lastChecked + frequency` → publishes check jobs with `trigger: "cron"`.
3. **Consumer** picks up a check job → fetches the URL → records an `ApiCheck` → recomputes endpoint stats (avg response time, uptime, status) → if the check fails, publishes an alert job.
4. **Alert consumer** picks up the alert job → sends an email via Mailjet → writes an `AlertLog`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | [Turborepo](https://turborepo.dev/) with npm workspaces |
| Frontend | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) |
| Charts | [Recharts](https://recharts.org/) |
| Auth | [Clerk](https://clerk.com/) |
| Data fetching | [TanStack React Query](https://tanstack.com/query) |
| Database | PostgreSQL ([Neon](https://neon.tech/)) via [Prisma 7](https://www.prisma.io/) |
| Message queue | [RabbitMQ](https://www.rabbitmq.com/) ([CloudAMQP](https://www.cloudamqp.com/)) |
| Email | [Mailjet](https://www.mailjet.com/) (node-mailjet SDK) |
| Runtime | Node.js ≥ 18, TypeScript 5.9 |

---

## Project Structure

```
api-monitor/
├── apps/
│   ├── web/                  # Next.js dashboard & API routes
│   │   ├── app/
│   │   │   ├── api/          # REST endpoints
│   │   │   │   ├── apis/     # CRUD for API endpoints + hit / hit-all / verify
│   │   │   │   ├── alerts/   # CRUD for email alerts
│   │   │   │   ├── checks/   # All recent checks across endpoints
│   │   │   │   ├── alert-logs/
│   │   │   │   └── stats/    # Aggregated dashboard stats
│   │   │   ├── dashboard/    # UI pages
│   │   │   │   ├── page.tsx          # Overview stats + charts
│   │   │   │   ├── apis/            # List, detail, create endpoints
│   │   │   │   ├── checks/          # Recent Hits (all endpoints)
│   │   │   │   ├── alerts/          # Alert rules + alert history
│   │   │   │   └── settings/
│   │   │   ├── components/   # Sidebar, Topbar, StatusBadge, Providers
│   │   │   ├── hooks/        # React Query hooks (useApis, useAlerts, …)
│   │   │   ├── services/     # Client-side fetch functions
│   │   │   └── types/        # TypeScript interfaces
│   │   └── prisma/
│   │
│   ├── consumer/             # RabbitMQ workers
│   │   ├── consumer.ts       # API check processor
│   │   ├── alert-consumer.ts # Alert email sender
│   │   └── run-all.ts        # Runs both consumers
│   │
│   └── Scheduler/            # Cron-like job scheduler
│       └── scheduler.ts
│
├── packages/
│   ├── database/             # Prisma schema, client, migrations
│   ├── rabbit-mq/            # RabbitMQ connection + publish / consume helpers
│   ├── ui/                   # Shared React components
│   ├── eslint-config/        # Shared ESLint presets
│   └── typescript-config/    # Shared tsconfig bases
│
├── turbo.json
└── package.json
```

---

## Database Schema

Four models with cascading deletes:

```
┌─────────────────┐       ┌──────────────┐
│  ApiEndpoint     │──1:N──│   ApiCheck   │
│  (api_endpoints) │       │ (api_checks) │
└───────┬─────────┘       └──────┬───────┘
        │                        │
       1:N                      1:N
        │                        │
┌───────▼─────────┐       ┌──────▼───────┐
│     Alert        │──1:N──│  AlertLog    │
│   (alerts)       │       │ (alert_logs) │
└─────────────────┘       └──────────────┘
```

| Model | Key Fields |
|---|---|
| **ApiEndpoint** | `name`, `url`, `method`, `expectedStatus`, `timeout`, `frequency`, `status` (healthy/degraded/down), `avgResponseTime`, `uptime`, `monitorId` |
| **ApiCheck** | `status` (HTTP code), `responseTime`, `success`, `trigger` (cron / manual), `error` |
| **Alert** | `apiId`, `email`, `enabled` — unique on `(apiId, email)` |
| **AlertLog** | `alertId`, `checkId`, `sentAt`, `error` |

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- A **PostgreSQL** database (e.g. Neon free tier)
- A **RabbitMQ** instance (e.g. CloudAMQP free tier)
- A **Clerk** project for authentication
- A **Mailjet** account for alert emails

### 1. Clone & install

```bash
git clone https://github.com/<your-username>/api-monitor.git
cd api-monitor
npm install
```

### 2. Generate Prisma client

```bash
cd packages/database
npx prisma generate
npx prisma db push        # push schema to your database
cd ../..
```

### 3. Configure environment variables

Create `.env` files in the apps that need them:

**`apps/web/.env`**
```env
DATABASE_URL=postgresql://...
RABBITMQ_URL=amqps://...
QUEUE_NAME=api-monitoring-queue
ALERT_QUEUE_NAME=api-monitor-alerts

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
```

**`apps/consumer/.env`**
```env
DATABASE_URL=postgresql://...
RABBITMQ_URL=amqps://...
QUEUE_NAME=api-monitoring-queue
ALERT_QUEUE_NAME=api-monitor-alerts
MJ_APIKEY_PUBLIC=your_mailjet_public_key
MJ_APIKEY_PRIVATE=your_mailjet_private_key
```

**`apps/Scheduler/.env`**
```env
DATABASE_URL=postgresql://...
RABBITMQ_URL=amqps://...
QUEUE_NAME=api-monitoring-queue
SCHEDULER_TICK_MS=30000
```

### 4. Run everything

```bash
npm run dev
```

Turborepo starts all apps in parallel:
- **Web** → http://localhost:3000
- **Consumer** → listens on RabbitMQ queues
- **Scheduler** → ticks every 30 s

---

## Features

### Dashboard
- Real-time stats: total APIs, healthy / degraded / down counts
- Average response time chart across all endpoints
- Uptime percentages per endpoint

### API Endpoints
- **Create** endpoint with name, URL, method, expected status, timeout, and check frequency
- **Verify** endpoint reachability before saving
- **Search / filter** endpoints by name, URL, or method
- **Hit Endpoint** — trigger a single manual check
- **Check All** — trigger checks for every endpoint at once
- **Delete** endpoint (cascades checks, alerts, and logs)

### Recent Hits
- Unified view of all checks across every endpoint
- Filter by trigger type: **All** / **Scheduled (Cron)** / **Manual**
- Links to the originating endpoint detail page

### API Detail Page
- Health status badge, stats grid, and response time history chart
- **Scheduled checks** and **manual checks** displayed in separate tables
- Hit Endpoint and Delete buttons

### Alerts
- Subscribe an email address to any endpoint
- Toggle alerts on/off
- Alert history table with delivery status and error details
- Emails sent via Mailjet with HTML-formatted failure reports

---

## API Routes

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/apis` | List all endpoints |
| `POST` | `/api/apis` | Create endpoint + enqueue initial check |
| `GET` | `/api/apis/:id` | Get endpoint by ID |
| `DELETE` | `/api/apis/:id` | Delete endpoint |
| `POST` | `/api/apis/:id/hit` | Trigger manual check for one endpoint |
| `GET` | `/api/apis/:id/checks` | Get checks for one endpoint |
| `POST` | `/api/apis/hit-all` | Trigger checks for all endpoints |
| `POST` | `/api/apis/verify` | Verify URL reachability |
| `GET` | `/api/checks` | All recent checks (across all endpoints) |
| `GET` | `/api/stats` | Dashboard aggregate stats |
| `GET` | `/api/alerts` | List alerts |
| `POST` | `/api/alerts` | Create alert |
| `PATCH` | `/api/alerts/:id` | Toggle alert enabled/disabled |
| `DELETE` | `/api/alerts/:id` | Delete alert |
| `GET` | `/api/alert-logs` | Alert delivery history |

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start all apps in parallel (Turborepo) |
| `npm run build` | Build all apps |
| `npm run lint` | Lint all apps |
| `cd packages/database && npx prisma studio` | Open Prisma Studio |
| `cd packages/database && npx prisma db push` | Push schema changes |

---

## License

MIT
