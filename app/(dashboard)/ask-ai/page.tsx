import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ChatInterface } from "@/components/ai/chat-interface";

export const metadata = { title: "Ask AI" };

export default async function AskAIPage() {
  const session = await auth();

  const userId = session?.user?.id ?? "";

  const sessions = await prisma.chatSession.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: 20,
    include: {
      messages: { take: 1, orderBy: { createdAt: "desc" } },
    },
  });

  const serialized = sessions.map((s) => ({
    ...s,
    updatedAt: s.updatedAt.toISOString(),
    createdAt: s.createdAt.toISOString(),
    messages: s.messages.map((m) => ({ ...m, createdAt: m.createdAt.toISOString(), role: m.role as "user" | "assistant" })),
  }));

  return <ChatInterface initialSessions={serialized} userId={userId} />;
}
