import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = await prisma.watchlistItem.findMany({
    where: { userId: session.user.id },
    orderBy: { addedAt: "desc" },
  });

  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ticker } = await req.json();
  if (!ticker) return NextResponse.json({ error: "Ticker required" }, { status: 400 });

  const item = await prisma.watchlistItem.upsert({
    where: { userId_ticker: { userId: session.user.id, ticker } },
    update: {},
    create: { userId: session.user.id, ticker },
  });

  return NextResponse.json(item);
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const ticker = searchParams.get("ticker");
  if (!ticker) return NextResponse.json({ error: "Ticker required" }, { status: 400 });

  await prisma.watchlistItem.deleteMany({
    where: { userId: session.user.id, ticker },
  });

  return NextResponse.json({ success: true });
}
