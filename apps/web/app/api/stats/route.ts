import { NextResponse } from "next/server";
import { prisma } from "@repo/database";

export async function GET() {
  const apis = await prisma.apiEndpoint.findMany();
  const total = apis.length;
  const healthy = apis.filter((a) => a.status === "healthy").length;
  const degraded = apis.filter((a) => a.status === "degraded").length;
  const down = apis.filter((a) => a.status === "down").length;

  // Compute avg response time from actual checks (last 24h) for accuracy
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentAgg = await prisma.apiCheck.aggregate({
    where: { checkedAt: { gte: since } },
    _avg: { responseTime: true },
  });
  const avgResponseTime = recentAgg._avg.responseTime
    ? parseFloat(recentAgg._avg.responseTime.toFixed(2))
    : 0;

  // Compute overall uptime from all checks
  const totalChecks = await prisma.apiCheck.count();
  const successChecks = await prisma.apiCheck.count({ where: { success: true } });
  const overallUptime = totalChecks > 0
    ? parseFloat(((successChecks / totalChecks) * 100).toFixed(2))
    : 100;

  return NextResponse.json({
    totalApis: total,
    healthyApis: healthy,
    degradedApis: degraded,
    downApis: down,
    avgResponseTime,
    overallUptime,
  });
}
