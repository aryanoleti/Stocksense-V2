"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, Plus, Trash2, MessageSquare, Loader2, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const SUGGESTED_PROMPTS = [
  "What is P/E ratio and how to use it?",
  "Explain SIP vs lump sum investment",
  "How to read candlestick charts?",
  "What are the best sectors to invest in 2025?",
  "Difference between LTCG and STCG in India",
  "How does the repo rate affect stock markets?",
];

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

interface ChatSession {
  id: string;
  title: string;
  updatedAt: string;
  messages: Message[];
}

interface Props {
  initialSessions: ChatSession[];
  userId: string;
}

export function ChatInterface({ initialSessions, userId }: Props) {
  const [sessions, setSessions] = useState(initialSessions);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadSession(sessionId: string) {
    setActiveSessionId(sessionId);
    const res = await fetch(`/api/ai/sessions/${sessionId}`);
    const data = await res.json();
    setMessages(data.messages || []);
  }

  async function newChat() {
    setActiveSessionId(null);
    setMessages([]);
    setInput("");
  }

  async function sendMessage(content: string) {
    if (!content.trim() || loading || streaming) return;
    setInput("");

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setLoading(true);

    // Add empty assistant message for streaming
    const assistantId = crypto.randomUUID();
    setMessages((prev) => [...prev, {
      id: assistantId,
      role: "assistant",
      content: "",
      createdAt: new Date().toISOString(),
    }]);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          sessionId: activeSessionId,
        }),
      });

      if (!res.ok) throw new Error("Failed");

      setLoading(false);
      setStreaming(true);

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        // Parse SSE
        const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));
        for (const line of lines) {
          const data = line.slice(6);
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            const token = parsed.choices?.[0]?.delta?.content || "";
            full += token;
            setMessages((prev) =>
              prev.map((m) => m.id === assistantId ? { ...m, content: full } : m)
            );
          } catch { /* ignore */ }
        }
      }

      // Save to DB and update session list
      const saveRes = await fetch("/api/ai/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: activeSessionId,
          userMessage: content,
          assistantMessage: full,
        }),
      });
      const { sessionId: newSessionId, title } = await saveRes.json();
      setActiveSessionId(newSessionId);

      setSessions((prev) => {
        const existing = prev.find((s) => s.id === newSessionId);
        if (existing) {
          return prev.map((s) => s.id === newSessionId ? { ...s, updatedAt: new Date().toISOString() } : s);
        }
        return [{
          id: newSessionId,
          title,
          updatedAt: new Date().toISOString(),
          messages: [],
        }, ...prev];
      });
    } catch (e) {
      setMessages((prev) => prev.map((m) =>
        m.id === assistantId
          ? { ...m, content: "Sorry, I encountered an error. Please try again." }
          : m
      ));
    } finally {
      setLoading(false);
      setStreaming(false);
    }
  }

  async function deleteSession(sessionId: string) {
    await fetch(`/api/ai/sessions/${sessionId}`, { method: "DELETE" });
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (activeSessionId === sessionId) newChat();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Session sidebar */}
      <div className="w-56 flex-shrink-0 flex flex-col gap-2 hidden lg:flex">
        <button
          onClick={newChat}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/15 text-primary text-sm font-medium hover:bg-primary/25 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          New Chat
        </button>
        <div className="flex-1 overflow-y-auto space-y-1">
          {sessions.map((s) => (
            <div
              key={s.id}
              className={cn(
                "group flex items-center gap-2 px-3 py-2 rounded-lg text-xs cursor-pointer transition-colors",
                activeSessionId === s.id
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
              onClick={() => loadSession(s.id)}
            >
              <MessageSquare className="w-3 h-3 flex-shrink-0" />
              <span className="truncate flex-1">{s.title}</span>
              <button
                onClick={(e) => { e.stopPropagation(); deleteSession(s.id); }}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition-all"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main chat */}
      <div className="flex-1 card-glass flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border">
          <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
            <Bot className="w-3.5 h-3.5 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">StockSense AI</h2>
            <p className="text-xs text-muted-foreground">Powered by Groq • Llama 3.1 70B</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-xs text-green-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Online
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <div className="text-center">
                <h3 className="text-base font-semibold text-foreground">Ask me anything about stocks</h3>
                <p className="text-sm text-muted-foreground mt-1">I can help with analysis, strategies, and market insights</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full">
                {SUGGESTED_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => sendMessage(p)}
                    className="text-left text-xs px-3 py-2.5 rounded-lg bg-muted hover:bg-muted/70 text-muted-foreground hover:text-foreground border border-border transition-all"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")}
                >
                  <div className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                    msg.role === "user" ? "bg-primary/20" : "bg-muted"
                  )}>
                    {msg.role === "user"
                      ? <User className="w-3.5 h-3.5 text-primary" />
                      : <Bot className="w-3.5 h-3.5 text-foreground" />
                    }
                  </div>
                  <div className={cn(
                    "max-w-[75%] rounded-xl px-4 py-3 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-primary/15 text-foreground"
                      : "bg-muted text-foreground"
                  )}>
                    {msg.role === "assistant" ? (
                      msg.content ? (
                        <ReactMarkdown
                          className="prose prose-sm prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5"
                        >
                          {msg.content}
                        </ReactMarkdown>
                      ) : (
                        <div className="flex gap-1">
                          {[0, 1, 2].map((i) => (
                            <motion.span
                              key={i}
                              className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
                              animate={{ y: [0, -4, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                            />
                          ))}
                        </div>
                      )
                    ) : (
                      <p>{msg.content}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-5 pb-4 pt-2 border-t border-border">
          <div className="flex gap-2 items-end bg-muted rounded-xl border border-border px-3 py-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about stocks, markets, strategies..."
              rows={1}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none max-h-32"
              style={{ minHeight: "24px" }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading || streaming}
              className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors flex-shrink-0"
            >
              {loading || streaming
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Send className="w-3.5 h-3.5" />
              }
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5 text-center">
            Not financial advice. Always do your own research.
          </p>
        </div>
      </div>
    </div>
  );
}
