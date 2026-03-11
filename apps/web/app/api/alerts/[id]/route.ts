import { NextResponse } from "next/server";
import { prisma } from "@repo/database";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.alert.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const alert = await prisma.alert.update({
    where: { id },
    data: { enabled: body.enabled },
    include: { api: { select: { id: true, name: true, url: true } } },
  });

  return NextResponse.json(alert);
}
