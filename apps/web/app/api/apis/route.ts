import { NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { enqueueApiCheckJob } from "../../services/radditmq";

export async function GET() {
  const apis = await prisma.apiEndpoint.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { checks: true } } },
  });
  return NextResponse.json(apis);
}

export async function POST(request: Request) {
  const body = await request.json();
  const api = await prisma.apiEndpoint.create({
    data: {
      monitorId: body.monitorId ?? undefined,
      name: body.name,
      url: body.url,
      method: body.method ?? "GET",
      headers: body.headers ?? undefined,
      body: body.body ?? undefined,
      expectedStatus: body.expectedStatus ?? 200,
      timeout: body.timeout ?? 5000,
      frequency: body.frequency ?? 86400000,
    },
  });

  if (api.monitorId) {
    await enqueueApiCheckJob(api.url, api.monitorId);
  }

  return NextResponse.json(api, { status: 201 });
}
