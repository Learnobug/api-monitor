import { NextResponse } from "next/server";
import { prisma } from "@repo/database";

export async function GET() {
  const checks = await prisma.apiCheck.findMany({
    orderBy: { checkedAt: "desc" },
    take: 100,
    include: {
      api: {
        select: { id: true, name: true, url: true, method: true },
      },
    },
  });
  return NextResponse.json(checks);
}
