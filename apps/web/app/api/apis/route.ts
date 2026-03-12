import { NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { auth } from "@clerk/nextjs/server";
import { enqueueApiCheckJob } from "../../services/radditmq";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const apis = await prisma.apiEndpoint.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { checks: true } } },
  });
  return NextResponse.json(apis);
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const api = await prisma.apiEndpoint.create({
    data: {
      userId,
      monitorId: body.monitorId ?? undefined,
      name: body.name,
      url: body.url,
      method: body.method ?? "GET",
      headers: body.headers ?? undefined,
      body: body.body ?? undefined,
      bodyType: body.bodyType ?? "none",
      expectedStatus: body.expectedStatus ?? 200,
      timeout: body.timeout ?? 5000,
      frequency: body.frequency ?? 86400000,
    },
  });

  if (api.monitorId) {
    await enqueueApiCheckJob(api.url, api.monitorId, "manual", {
      method: api.method,
      body: api.body,
      bodyType: api.bodyType,
      headers: api.headers,
    });
  }

  return NextResponse.json(api, { status: 201 });
}
