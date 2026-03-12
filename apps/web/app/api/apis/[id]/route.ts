import { NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const api = await prisma.apiEndpoint.findUnique({
    where: { id, userId },
    include: { _count: { select: { checks: true } } },
  });
  if (!api) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(api);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.apiEndpoint.delete({ where: { id, userId } });
  return NextResponse.json({ success: true });
}
