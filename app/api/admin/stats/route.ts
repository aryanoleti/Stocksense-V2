import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [totalUsers, totalTransactions, totalMessages, totalSessions] = await Promise.all([
    prisma.user.count(),
    prisma.transaction.count(),
    prisma.chatMessage.count(),
    prisma.chatSession.count(),
  ]);

  const recentUsers = await prisma.user.findMany({
    select: { id: true, name: true, email: true, createdAt: true, role: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return NextResponse.json({ totalUsers, totalTransactions, totalMessages, totalSessions, recentUsers });
}
