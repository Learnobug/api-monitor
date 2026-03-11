import { consumeJobs, publishAlertJob } from "@repo/rabbit-mq";
import { prisma } from "@repo/database";


consumeJobs(async (job: any) => {
  const start = Date.now();

  let status = 500;
  let success = false;
  let error: string | undefined;

  try {
    const res = await fetch(job.url);
    console.log(`Checked ${job.url} - Status: ${res.status}`, res.ok ? "Healthy" : "Unhealthy");
    status = res.status;
    success = res.ok;
  } catch (err: any) {
    console.log("API failed");
    error = err?.message ?? "Unknown error";
  }

  const responseTime = Date.now() - start;

  // Look up the endpoint by monitorId
  const endpoint = await prisma.apiEndpoint.findFirst({
    where: { monitorId: job.monitorID },
  });

  if (!endpoint) {
    console.error(`No endpoint found for monitorId: ${job.monitorID}`);
    return;
  }

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