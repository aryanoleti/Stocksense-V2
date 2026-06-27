import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = await prisma.recentlyViewed.findMany({
    where: { userId: session.user.id },
    orderBy: { viewedAt: "desc" },
    take: 20,
  });

  return NextResponse.json(items);
}

export async function DELETE() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.recentlyViewed.deleteMany({ where: { userId: session.user.id } });

  return NextResponse.json({ success: true });
}
