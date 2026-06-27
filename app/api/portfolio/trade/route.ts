import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { tradeSchema } from "@/lib/validations/auth";
import { getQuote } from "@/services/stock.service";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = tradeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid trade data" }, { status: 400 });
  }

  const { ticker, quantity, type } = parsed.data;

  // Get live price to verify
  let price: number;
  try {
    const quote = await getQuote(ticker);
    price = quote.price;
    if (!price || price <= 0) throw new Error("Invalid price");
  } catch {
    price = body.price; // fallback to client price
  }

  const total = price * quantity;

  const portfolio = await prisma.portfolio.findUnique({
    where: { userId: session.user.id },
    include: { holdings: { where: { ticker } } },
  });

  if (!portfolio) {
    return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
  }

  if (type === "BUY") {
    if (portfolio.cashBalance < total) {
      return NextResponse.json({ error: "Insufficient funds" }, { status: 400 });
    }

    const existing = portfolio.holdings[0];

    if (existing) {
      // Update average price
      const newQty = existing.quantity + quantity;
      const newAvg = (existing.avgPrice * existing.quantity + total) / newQty;
      await prisma.holding.update({
        where: { id: existing.id },
        data: { quantity: newQty, avgPrice: newAvg, updatedAt: new Date() },
      });
    } else {
      const quote = await getQuote(ticker).catch(() => ({ name: ticker }));
      await prisma.holding.create({
        data: {
          portfolioId: portfolio.id,
          ticker,
          companyName: (quote as any).name || ticker,
          quantity,
          avgPrice: price,
        },
      });
    }

    await prisma.portfolio.update({
      where: { id: portfolio.id },
      data: {
        cashBalance: { decrement: total },
        totalInvested: { increment: total },
      },
    });

  } else {
    // SELL
    const holding = portfolio.holdings[0];
    if (!holding || holding.quantity < quantity) {
      return NextResponse.json({ error: "Insufficient shares" }, { status: 400 });
    }

    const newQty = holding.quantity - quantity;
    if (newQty === 0) {
      await prisma.holding.delete({ where: { id: holding.id } });
    } else {
      await prisma.holding.update({
        where: { id: holding.id },
        data: { quantity: newQty, updatedAt: new Date() },
      });
    }

    await prisma.portfolio.update({
      where: { id: portfolio.id },
      data: {
        cashBalance: { increment: total },
        totalInvested: { decrement: holding.avgPrice * quantity },
      },
    });
  }

  // Record transaction
  await prisma.transaction.create({
    data: {
      userId: session.user.id,
      ticker,
      companyName: body.companyName || ticker,
      type,
      quantity,
      price,
      total,
    },
  });

  return NextResponse.json({ success: true, message: `${type} order executed at ₹${price}` });
}
