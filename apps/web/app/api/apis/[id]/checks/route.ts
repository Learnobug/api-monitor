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
  // Verify the endpoint belongs to this user
  const api = await prisma.apiEndpoint.findUnique({ where: { id, userId } });
  if (!api) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const checks = await prisma.apiCheck.findMany({
    where: { apiId: id },
    orderBy: { checkedAt: "desc" },
    take: 50,
  });
  return NextResponse.json(checks);
}
