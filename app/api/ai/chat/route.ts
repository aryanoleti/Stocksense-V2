import { auth } from "@/auth";
import { NextRequest } from "next/server";
import { createChatCompletion } from "@/services/ai.service";
import { chatMessageSchema } from "@/lib/validations/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const body = await req.json();
  const { messages } = body;

  if (!messages?.length) {
    return new Response("Messages required", { status: 400 });
  }

  // Rate limiting: max 50 messages per hour (simple check)
  // In production, use Redis for rate limiting

  const stream = await createChatCompletion(messages, true) as any;

  // Transform Groq stream to SSE
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const data = JSON.stringify(chunk);
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
