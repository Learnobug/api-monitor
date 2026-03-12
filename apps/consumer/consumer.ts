import { consumeJobs, publishAlertJob } from "@repo/rabbit-mq";
import { prisma } from "@repo/database";

console.log("[Consumer] Starting check consumer...");
console.log("[Consumer] DATABASE_URL set:", !!process.env.DATABASE_URL);
console.log("[Consumer] RABBITMQ_URL set:", !!process.env.RABBITMQ_URL);
console.log("[Consumer] QUEUE_NAME:", process.env.QUEUE_NAME || "(default: api-monitor)");

consumeJobs(async (job: any) => {
  console.log("[Consumer] Processing job:", JSON.stringify(job));
  const start = Date.now();

  let status = 500;
  let success = false;
  let error: string | undefined;

  try {
    // Build fetch options based on method and body type
    const fetchOptions: RequestInit = {
      method: job.method || "GET",
    };

    // Build headers
    const headers: Record<string, string> = {};
    if (job.headers && typeof job.headers === "object") {
      Object.assign(headers, job.headers);
    }

    // Attach body for methods that support it
    if (job.body && job.bodyType && job.bodyType !== "none" && ["POST", "PUT", "PATCH", "DELETE"].includes((job.method || "GET").toUpperCase())) {
      fetchOptions.body = job.body;
      if (job.bodyType === "json" && !headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
      } else if (job.bodyType === "text" && !headers["Content-Type"]) {
        headers["Content-Type"] = "text/plain";
      }
    }

    if (Object.keys(headers).length > 0) {
      fetchOptions.headers = headers;
    }

    console.log(`[Consumer] Fetching ${job.url} with method=${fetchOptions.method}, bodyType=${job.bodyType || "none"}`);
    const res = await fetch(job.url, fetchOptions);
    console.log(`[Consumer] Checked ${job.url} - Status: ${res.status}`, res.ok ? "Healthy" : "Unhealthy");
    status = res.status;
    success = res.ok;
  } catch (err: any) {
    console.error("[Consumer] API fetch failed:", err?.message ?? err);
    error = err?.message ?? "Unknown error";
  }

  const responseTime = Date.now() - start;
  console.log(`[Consumer] Response time: ${responseTime}ms`);

  // Look up the endpoint by monitorId
  console.log(`[Consumer] Looking up endpoint with monitorId: ${job.monitorID}`);
  const endpoint = await prisma.apiEndpoint.findFirst({
    where: { monitorId: job.monitorID },
  });

  if (!endpoint) {
    console.error(`[Consumer] No endpoint found for monitorId: ${job.monitorID}`);
    return;
  }
  console.log(`[Consumer] Found endpoint: ${endpoint.name} (id: ${endpoint.id})`);

  const check = await prisma.apiCheck.create({
    data: {
      apiId: endpoint.id,
      status,
      responseTime,
      success,
      error,
      trigger: job.trigger ?? "manual",
    },
  });

  console.log(`[Consumer] Created check record: ${check.id}`);
  console.log(`Saved check result for ${endpoint.name} (monitorId: ${job.monitorID})`);

  // Recompute aggregate stats for this endpoint
  const agg = await prisma.apiCheck.aggregate({
    where: { apiId: endpoint.id },
    _avg: { responseTime: true },
    _count: { id: true },
  });
  const successCount = await prisma.apiCheck.count({
    where: { apiId: endpoint.id, success: true },
  });
  const totalCount = agg._count.id;
  const uptime = totalCount > 0 ? parseFloat(((successCount / totalCount) * 100).toFixed(2)) : 100;
  const avgResponseTime = agg._avg.responseTime
    ? parseFloat(agg._avg.responseTime.toFixed(2))
    : null;

  // Determine status based on recent checks (last 5)
  const recentChecks = await prisma.apiCheck.findMany({
    where: { apiId: endpoint.id },
    orderBy: { checkedAt: "desc" },
    take: 5,
    select: { success: true },
  });
  const recentFailures = recentChecks.filter((c) => !c.success).length;
  let newStatus = "healthy";
  if (recentFailures === recentChecks.length) {
    newStatus = "down";
  } else if (recentFailures > 0) {
    newStatus = "degraded";
  }

  await prisma.apiEndpoint.update({
    where: { id: endpoint.id },
    data: {
      status: newStatus,
      avgResponseTime,
      uptime,
      lastChecked: new Date(),
    },
  });

  console.log(`Updated stats for ${endpoint.name}: status=${newStatus}, uptime=${uptime}%, avgRT=${avgResponseTime}ms`);

  // If check failed, look up alerts and enqueue alert jobs
  if (!success || status !== endpoint.expectedStatus) {
    const alerts = await prisma.alert.findMany({
      where: { apiId: endpoint.id, enabled: true },
    });

    for (const alert of alerts) {
      await publishAlertJob({
        alertId: alert.id,
        checkId: check.id,
        email: alert.email,
        apiName: endpoint.name,
        apiUrl: endpoint.url,
        status,
        error: error ?? `Expected ${endpoint.expectedStatus}, got ${status}`,
      });
      console.log(`Alert enqueued for ${alert.email}`);
    }
  }
});