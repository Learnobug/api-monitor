-- CreateTable
CREATE TABLE "api_endpoints" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "monitorId" TEXT,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'GET',
    "headers" JSONB,
    "body" TEXT,
    "expectedStatus" INTEGER NOT NULL DEFAULT 200,
    "timeout" INTEGER NOT NULL DEFAULT 5000,
    "frequency" INTEGER NOT NULL DEFAULT 86400000,
    "status" TEXT NOT NULL DEFAULT 'healthy',
    "lastChecked" TIMESTAMP(3),
    "avgResponseTime" DOUBLE PRECISION,
    "uptime" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_endpoints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_checks" (
    "id" TEXT NOT NULL,
    "apiId" TEXT NOT NULL,
    "status" INTEGER NOT NULL,
    "responseTime" DOUBLE PRECISION NOT NULL,
    "success" BOOLEAN NOT NULL,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "error" TEXT,
    "trigger" TEXT NOT NULL DEFAULT 'manual',

    CONSTRAINT "api_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "apiId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alert_logs" (
    "id" TEXT NOT NULL,
    "alertId" TEXT NOT NULL,
    "checkId" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "error" TEXT,

    CONSTRAINT "alert_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "api_endpoints_userId_idx" ON "api_endpoints"("userId");

-- CreateIndex
CREATE INDEX "api_checks_apiId_checkedAt_idx" ON "api_checks"("apiId", "checkedAt");

-- CreateIndex
CREATE UNIQUE INDEX "alerts_apiId_email_key" ON "alerts"("apiId", "email");

-- CreateIndex
CREATE INDEX "alert_logs_alertId_idx" ON "alert_logs"("alertId");

-- AddForeignKey
ALTER TABLE "api_checks" ADD CONSTRAINT "api_checks_apiId_fkey" FOREIGN KEY ("apiId") REFERENCES "api_endpoints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_apiId_fkey" FOREIGN KEY ("apiId") REFERENCES "api_endpoints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_logs" ADD CONSTRAINT "alert_logs_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "alerts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_logs" ADD CONSTRAINT "alert_logs_checkId_fkey" FOREIGN KEY ("checkId") REFERENCES "api_checks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
