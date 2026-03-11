FROM node:20-alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy the entire monorepo
COPY . .

# Install all deps (resolves workspace packages via symlinks)
RUN npm ci

# Build the database package (needed at runtime for Prisma client)
RUN npx turbo run build --filter=@repo/database

WORKDIR /app/apps/Scheduler

CMD ["node", "--import", "tsx", "scheduler.ts"]
