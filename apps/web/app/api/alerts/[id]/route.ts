import { NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { auth } from "@clerk/nextjs/server";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  // Verify the alert belongs to this user via its endpoint
  const alert = await prisma.alert.findUnique({ where: { id }, include: { api: true } });
  if (!alert || alert.api.userId !== userId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.alert.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  // Verify the alert belongs to this user via its endpoint
  const existing = await prisma.alert.findUnique({ where: { id }, include: { api: true } });
  if (!existing || existing.api.userId !== userId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const alert = await prisma.alert.update({
    where: { id },
    data: { enabled: body.enabled },
    include: { api: { select: { id: true, name: true, url: true } } },
  });

  return NextResponse.json(alert);
}
