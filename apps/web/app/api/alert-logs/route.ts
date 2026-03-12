import { NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const logs = await prisma.alertLog.findMany({
    where: { alert: { api: { userId } } },
    include: {
      alert: {
        include: {
          api: { select: { id: true, name: true, url: true } },
        },
      },
      check: {
        select: { status: true, responseTime: true, success: true, error: true },
      },
    },
    orderBy: { sentAt: "desc" },
    take: 50,
  });
  return NextResponse.json(logs);
}
