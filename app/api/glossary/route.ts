import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const letter = searchParams.get("letter") || "";

  const terms = await prisma.glossaryTerm.findMany({
    where: {
      ...(search && {
        OR: [
          { term: { contains: search, mode: "insensitive" } },
          { definition: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(category && { category: { equals: category, mode: "insensitive" } }),
      ...(letter && { term: { startsWith: letter, mode: "insensitive" } }),
    },
    orderBy: { term: "asc" },
  });

  return NextResponse.json(terms);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const termSchema = z.object({
    term: z.string().min(1),
    definition: z.string().min(1),
    category: z.string().min(1),
    example: z.string().optional(),
  });

  const body = await req.json();
  const parsed = termSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const term = await prisma.glossaryTerm.create({ data: parsed.data });
  return NextResponse.json(term, { status: 201 });
}
