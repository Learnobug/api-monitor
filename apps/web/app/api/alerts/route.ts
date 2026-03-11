import { NextResponse } from "next/server";
import { prisma } from "@repo/database";

export async function GET() {
  const alerts = await prisma.alert.findMany({
    include: { api: { select: { id: true, name: true, url: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(alerts);
}

export async function POST(request: Request) {
  const body = await request.json();

  const alert = await prisma.alert.create({
    data: {
      apiId: body.apiId,
      email: body.email,
    },
    include: { api: { select: { id: true, name: true, url: true } } },
  });

  return NextResponse.json(alert, { status: 201 });
}
