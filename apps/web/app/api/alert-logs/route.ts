import { NextResponse } from "next/server";
import { prisma } from "@repo/database";

export async function GET() {
  const logs = await prisma.alertLog.findMany({
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
