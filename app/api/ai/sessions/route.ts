import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { sessionId, userMessage, assistantMessage } = await req.json();

  let chatSession;
  if (sessionId) {
    chatSession = await prisma.chatSession.findUnique({ where: { id: sessionId } });
  }

  // Create title from first message
  const title = userMessage.length > 50
    ? userMessage.slice(0, 50) + "…"
    : userMessage;

  if (!chatSession) {
    chatSession = await prisma.chatSession.create({
      data: {
        userId: session.user.id,
        title,
      },
    });
  } else {
    await prisma.chatSession.update({
      where: { id: chatSession.id },
      data: { updatedAt: new Date() },
    });
  }

  await prisma.chatMessage.createMany({
    data: [
      { sessionId: chatSession.id, role: "user", content: userMessage },
      { sessionId: chatSession.id, role: "assistant", content: assistantMessage },
    ],
  });

  return NextResponse.json({ sessionId: chatSession.id, title: chatSession.title });
}
