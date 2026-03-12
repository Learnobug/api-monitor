import { NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const checks = await prisma.apiCheck.findMany({
    where: { api: { userId } },
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
