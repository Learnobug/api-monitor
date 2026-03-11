import { NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { enqueueApiCheckJob } from "../../../services/radditmq";

export async function POST() {
  const apis = await prisma.apiEndpoint.findMany({
    where: { monitorId: { not: null } },
  });

  if (apis.length === 0) {
    return NextResponse.json(
      { error: "No endpoints with a monitorId found" },
      { status: 404 }
    );
  }

  let enqueued = 0;
  for (const api of apis) {
    await enqueueApiCheckJob(api.url, api.monitorId!, "manual");
    enqueued++;
  }

  return NextResponse.json({ success: true, enqueued, total: apis.length });
}
