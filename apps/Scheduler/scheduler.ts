import { prisma } from "@repo/database";
import { publishJob } from "@repo/rabbit-mq";

const TICK_MS = Number(process.env.SCHEDULER_TICK_MS) || 30_000; // default 30s

async function tick() {
  const now = new Date();

  // Fetch all monitored endpoints
  const endpoints = await prisma.apiEndpoint.findMany({
    where: { monitorId: { not: null } },
  });

  for (const endpoint of endpoints) {
    const lastChecked = endpoint.lastChecked
      ? new Date(endpoint.lastChecked).getTime()
      : 0;

    const nextCheckAt = lastChecked + endpoint.frequency;

    if (now.getTime() >= nextCheckAt) {
      console.log(
        `[Scheduler] Enqueuing check for "${endpoint.name}" (${endpoint.url})`
      );

      await publishJob({
        url: endpoint.url,
        monitorID: endpoint.monitorId,
        trigger: "cron",
        method: endpoint.method,
        body: endpoint.body,
        bodyType: endpoint.bodyType,
        headers: endpoint.headers,
      });

      // Update lastChecked so we don't re-enqueue on the next tick
      await prisma.apiEndpoint.update({
        where: { id: endpoint.id },
        data: { lastChecked: now },
      });
    }
  }
}

async function main() {
  console.log(`[Scheduler] Starting — tick interval: ${TICK_MS}ms`);

  // Run immediately on startup
  await tick();

  // Then repeat on the tick interval
  setInterval(async () => {
    try {
      await tick();
    } catch (err) {
      console.error("[Scheduler] Tick error:", err);
    }
  }, TICK_MS);
}

main().catch((err) => {
  console.error("[Scheduler] Fatal error:", err);
  process.exit(1);
});
