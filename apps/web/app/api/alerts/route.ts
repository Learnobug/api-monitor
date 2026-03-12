import { NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const alerts = await prisma.alert.findMany({
    where: { api: { userId } },
    include: { api: { select: { id: true, name: true, url: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(alerts);
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  // Verify the endpoint belongs to this user
  const api = await prisma.apiEndpoint.findUnique({ where: { id: body.apiId, userId } });
  if (!api) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const alert = await prisma.alert.create({
    data: {
      apiId: body.apiId,
      email: body.email,
    },
    include: { api: { select: { id: true, name: true, url: true } } },
  });

  return NextResponse.json(alert, { status: 201 });
}
