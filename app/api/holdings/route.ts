import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { realHoldingSchema } from "@/lib/validations/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const holdings = await prisma.realHolding.findMany({
    where: { userId: session.user.id },
    orderBy: { buyDate: "desc" },
  });

  return NextResponse.json(holdings);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = realHoldingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { ticker, companyName, quantity, avgPrice, buyDate } = parsed.data;

  try {
    const holding = await prisma.realHolding.create({
      data: {
        userId: session.user.id,
        ticker,
        companyName,
        quantity,
        avgPrice,
        buyDate,
      },
    });
    return NextResponse.json(holding, { status: 201 });
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json(
        { error: "You already have a holding for this ticker on this buy date" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Failed to create holding" }, { status: 500 });
  }
}
