import { NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { enqueueApiCheckJob } from "../../../../services/radditmq";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const api = await prisma.apiEndpoint.findUnique({ where: { id } });
  if (!api) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!api.monitorId) {
    return NextResponse.json({ error: "No monitorId configured" }, { status: 400 });
  }
  await enqueueApiCheckJob(api.url, api.monitorId, "manual");
  return NextResponse.json({ success: true });
}
