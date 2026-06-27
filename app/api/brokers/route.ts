import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const brokers = await prisma.broker.findMany({
    where: { isActive: true },
    orderBy: [{ rating: "desc" }, { name: "asc" }],
  });

  return NextResponse.json(brokers);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const data = await req.json();
  const broker = await prisma.broker.create({ data });
  return NextResponse.json(broker, { status: 201 });
}
