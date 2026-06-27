import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ChatInterface } from "@/components/ai/chat-interface";

export const metadata = { title: "Ask AI" };

export default async function AskAIPage() {
  const session = await auth();

  const sessions = await prisma.chatSession.findMany({
    where: { userId: session!.user.id },
    orderBy: { updatedAt: "desc" },
    take: 20,
    include: {
      messages: { take: 1, orderBy: { createdAt: "desc" } },
    },
  });

  return <ChatInterface initialSessions={sessions} userId={session!.user.id} />;
}
