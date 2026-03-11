import { NextResponse } from "next/server";
import { prisma } from "@repo/database";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const checks = await prisma.apiCheck.findMany({
    where: { apiId: id },
    orderBy: { checkedAt: "desc" },
    take: 50,
  });
  return NextResponse.json(checks);
}
