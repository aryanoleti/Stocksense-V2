"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, TrendingUp, AlertTriangle, ArrowRight, Bot, ImagePlus, X, Plus, MessageSquare, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import Link from "next/link";
import { Card, CardEyebrow } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { generateJson, hasGeminiKey, getGeminiError, type GeminiContent } from "@/lib/api/gemini";
import { getQuote } from "@/lib/api/yahoo";
import { NIFTY_50 } from "@/lib/mock-data";

type Rich = {
  confidence?: number;
  stock?: { symbol: string; name: string; price: number; changePct: number };
  metrics?: { label: string; value: string }[];
  bullets?: string[];
  risks?: string[];
  opportunities?: string[];
  related?: string[];
};

type Message = {
  id: string;
  role: "user" | "ai";
  text: string;
  rich?: Rich;
  /** Data URLs of screenshots the user attached (display only). */
  images?: string[];
};

type Attachment = { mime: string; data: string };

// Saved conversations — per account, images stripped to respect the
// localStorage quota. Most recent first, capped at 30.
type ChatSession = { id: string; title: string; messages: Message[]; updatedAt: number };

function chatsKey(email?: string) {
  return `stocksense.chats.v1.${email ?? "anon"}`;
}

function loadChats(key: string): ChatSession[] {
  try {
    const raw = window.localStorage.getItem(key);
    const list = raw ? (JSON.parse(raw) as ChatSession[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

type GeminiAnswer = {
  text: string;
  confidence?: number;
  symbol?: string;
  bullets?: string[];
  opportunities?: string[];
  risks?: string[];
  related?: string[];
};

const SUGGESTED = [
  "Should I invest in Apple?",
  "Explain TCS Q3 earnings",
  "Compare HDFC Bank and ICICI Bank",
  "Why is Reliance falling today?",
  "Is Adani Enterprises overvalued?",
  "What is a P/E ratio?",
];

const INITIAL: Message[] = [
  {
    id: "seed-1",
    role: "ai",
    text:
      "Hi, I'm Sense — your AI markets companion. I can help you research stocks, compare peers, and understand earnings. What would you like to look at?",
  },
];

const SYSTEM_PROMPT = `You are Sense, an AI markets assistant for Indian retail investors using a stock-research app called StockSense.
Reply briefly and clearly in plain English. Educational tone, never give explicit buy/sell advice.

You MUST respond with a single JSON object matching this TypeScript type — no markdown, no prose outside the JSON:
{
  "text": string,                              // 2-3 sentence natural-language answer
  "confidence": number,                        // 0-100, how confident you are
  "symbol"?: string,                           // NSE ticker (e.g. "RELIANCE", "INFY") if the answer focuses on one stock. Use the ticker only, no ".NS" suffix.
  "bullets"?: string[],                        // 3-5 short summary bullets
  "opportunities"?: string[],                  // up to 3 short upside points (only if relevant)
  "risks"?: string[],                          // up to 3 short downside points (only if relevant)
  "related"?: string[]                         // up to 4 related NSE tickers
}

Always use Indian-context examples and INR. If the user asks about a US stock, return its US ticker in "symbol" only if asked specifically.`;

function findKnownSymbol(text: string): string | undefined {
  const upper = text.toUpperCase();
  return NIFTY_50.find((s) => upper.includes(s.symbol))?.symbol;
}

// Gemini's response is rendered straight into `/stocks/[symbol]` links, so
// only accept strings that actually look like a ticker before trusting them.
const SAFE_TICKER = /^[A-Z0-9]{1,15}$/;

function isSafeTicker(s: string): boolean {
  return SAFE_TICKER.test(s);
}

async function hydrateStockCard(answer: GeminiAnswer): Promise<Rich["stock"] | undefined> {
  const sym = answer.symbol?.toUpperCase();
  if (!sym || !isSafeTicker(sym)) return undefined;
  const known = NIFTY_50.find((s) => s.symbol === sym);
  const name = known?.name ?? sym;
  const quote = await getQuote(sym);
  if (quote) {
    return { symbol: sym, name, price: quote.price, changePct: quote.changePct };
  }
  if (known) {
    return { symbol: sym, name: known.name, price: known.basePrice, changePct: 0 };
  }
  return undefined;
}

function fallbackResponse(prompt: string): Message {
  return {
    id: `a-${Date.now()}`,
    role: "ai",
    text: hasGeminiKey()
      ? `I couldn't reach Gemini just now${getGeminiError() ? ` (${getGeminiError()})` : ""} — please try again in a moment.`
      : "Add a NEXT_PUBLIC_GEMINI_KEY to enable real AI responses. In the meantime, " +
        "for a question like \"" + prompt + "\" I'd start with last earnings, peer multiples, and recent news.",
    rich: {
      confidence: 30,
      bullets: [
        "Check the latest quarterly results and management commentary",
        "Compare valuation multiples (P/E, P/B) to sector peers",
        "Look at recent news, analyst revisions and insider activity",
      ],
    },
  };
}

export function AskAi() {
  const { user } = useAuth();
  const storageKey = chatsKey(user?.email);
  const [messages, setMessages] = useState<Message[]>(INITIAL);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoSent = useRef(false);

  useEffect(() => {
    setChats(loadChats(storageKey));
  }, [storageKey]);

  // Persist the active conversation whenever it grows.
  useEffect(() => {
    const userMsgs = messages.filter((m) => m.role === "user");
    if (userMsgs.length === 0) return;
    const id = activeChatId ?? `c-${Date.now()}`;
    if (!activeChatId) setActiveChatId(id);
    const title = (userMsgs[0].text || "Screenshot chat").slice(0, 42);
    const persistable = messages.map((m) => {
      if (!m.images?.length) return m;
      const { images: _drop, ...rest } = m;
      return { ...rest, text: `📷 ${rest.text}` };
    });
    setChats((prev) => {
      const next = [{ id, title, messages: persistable, updatedAt: Date.now() }, ...prev.filter((c) => c.id !== id)].slice(0, 30);
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        /* quota — keep the session in memory only */
      }
      return next;
    });
  }, [messages, activeChatId, storageKey]);

  function newChat() {
    setMessages(INITIAL);
    setActiveChatId(null);
    setAttachments([]);
    setInput("");
  }

  function openChat(c: ChatSession) {
    setMessages(c.messages);
    setActiveChatId(c.id);
    setAttachments([]);
  }

  function deleteChat(id: string) {
    setChats((prev) => {
      const next = prev.filter((c) => c.id !== id);
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        /* noop */
      }
      return next;
    });
    if (id === activeChatId) newChat();
  }

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, thinking]);

  // Deep link: /ask-ai/?q=… auto-sends the prompt (used by stock-page chips).
  useEffect(() => {
    if (autoSent.current) return;
    autoSent.current = true;
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) send(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onPaste(e: React.ClipboardEvent) {
    const items = Array.from(e.clipboardData?.items ?? []);
    const imgs = items.filter((i) => i.type.startsWith("image/"));
    if (imgs.length === 0) return;
    e.preventDefault();
    for (const item of imgs) {
      const file = item.getAsFile();
      if (!file) continue;
      const reader = new FileReader();
      reader.onload = () => {
        const url = String(reader.result);
        const base64 = url.split(",")[1];
        if (base64) setAttachments((a) => [...a.slice(-3), { mime: file.type, data: base64 }]);
      };
      reader.readAsDataURL(file);
    }
  }

  async function send(prompt: string) {
    const trimmed = prompt.trim();
    if (!trimmed && attachments.length === 0) return;
    const atts = attachments;
    const text = trimmed || "What do you see in this screenshot?";
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      text,
      images: atts.map((a) => `data:${a.mime};base64,${a.data}`),
    };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setAttachments([]);
    setThinking(true);

    // Past turns as text; the new turn carries any pasted screenshots inline.
    const history: GeminiContent[] = [
      ...messages
        .filter((m) => m.id !== "seed-1")
        .map((m) => ({
          role: (m.role === "user" ? "user" : "model") as "user" | "model",
          parts: [{ text: m.text }],
        })),
      {
        role: "user" as const,
        parts: [{ text }, ...atts.map((a) => ({ inlineData: { mimeType: a.mime, data: a.data } }))],
      },
    ];

    let aiMsg: Message;
    const answer = await generateJson<GeminiAnswer>(history, { system: SYSTEM_PROMPT, temperature: 0.55 });
    if (!answer) {
      aiMsg = fallbackResponse(text);
    } else {
      const stock = await hydrateStockCard({
        ...answer,
        symbol: answer.symbol ?? findKnownSymbol(text),
      });
      aiMsg = {
        id: `a-${Date.now()}`,
        role: "ai",
        text: answer.text,
        rich: {
          confidence: answer.confidence,
          stock,
          bullets: answer.bullets,
          opportunities: answer.opportunities,
          risks: answer.risks,
          related: answer.related?.map((s) => s.toUpperCase()).filter(isSafeTicker),
        },
      };
    }
    setMessages((m) => [...m, aiMsg]);
    setThinking(false);
  }

  return (
    <div className="grid h-[calc(100vh-9rem)] gap-5 lg:grid-cols-[280px_1fr]">
      <aside className="hidden lg:flex flex-col rounded-2xl border border-(--color-border) bg-(--color-surface) p-4">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-(--color-brand-700) text-white">
            <Bot className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[14px] font-semibold tracking-tight">Sense</p>
            <p className="text-[11.5px] text-(--color-fg-subtle)">AI markets assistant</p>
          </div>
        </div>
        <button
          type="button"
          onClick={newChat}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-(--color-brand-700) px-3 py-2.5 text-[13px] font-semibold text-white hover:bg-(--color-brand-800)"
        >
          <Plus className="h-4 w-4" /> New chat
        </button>

        {chats.length > 0 && (
          <>
            <p className="mt-4 text-[11px] uppercase tracking-[0.14em] font-semibold text-(--color-fg-subtle)">
              Recent chats
            </p>
            <ul className="mt-2 max-h-[26vh] space-y-1 overflow-y-auto pr-0.5">
              {chats.map((c) => (
                <li key={c.id} className="group flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openChat(c)}
                    className={`flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[12.5px] ${
                      c.id === activeChatId
                        ? "bg-(--color-brand-50) text-(--color-brand-700) font-semibold"
                        : "text-(--color-fg-muted) hover:bg-(--color-surface-2)"
                    }`}
                  >
                    <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{c.title}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteChat(c.id)}
                    className="shrink-0 rounded-md p-1.5 text-(--color-fg-subtle) opacity-0 transition-opacity hover:text-(--color-down) group-hover:opacity-100"
                    aria-label={`Delete chat: ${c.title}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        <p className="mt-4 text-[11px] uppercase tracking-[0.14em] font-semibold text-(--color-fg-subtle)">
          Try asking
        </p>
        <ul className="mt-3 space-y-1.5 overflow-y-auto">
          {SUGGESTED.map((q) => (
            <li key={q}>
              <button
                type="button"
                onClick={() => send(q)}
                className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-left text-[13px] text-(--color-fg) hover:border-(--color-brand-300) hover:bg-(--color-brand-50)"
              >
                {q}
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-auto rounded-xl border border-(--color-border) bg-(--color-surface-2) p-3 text-[11.5px] leading-relaxed text-(--color-fg-muted)">
          Sense is for educational use only. Not financial advice. Always cross-check critical info.
        </div>
      </aside>

      <Card padding="none" className="flex flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-(--color-border) px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-(--color-brand-50) text-(--color-brand-700)">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[14px] font-semibold tracking-tight">Ask the AI</p>
              <p className="text-[11.5px] text-(--color-fg-subtle)">Powered by Gemini · live prices via Yahoo Finance</p>
            </div>
          </div>
          <Badge tone="brand">Beta</Badge>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-6 space-y-5">
          {messages.map((m) => (m.role === "user" ? <UserBubble key={m.id} text={m.text} images={m.images} /> : <AiBubble key={m.id} msg={m} />))}
          {thinking && <Thinking />}
        </div>

        <div className="border-t border-(--color-border) bg-(--color-bg) p-4">
          {attachments.length > 0 && (
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {attachments.map((a, i) => (
                <span key={i} className="relative inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`data:${a.mime};base64,${a.data}`}
                    alt={`Pasted screenshot ${i + 1}`}
                    className="h-14 w-20 rounded-lg border border-(--color-border) object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setAttachments((arr) => arr.filter((_, j) => j !== i))}
                    className="absolute -right-1.5 -top-1.5 grid h-4.5 w-4.5 place-items-center rounded-full bg-(--color-fg) text-white"
                    aria-label="Remove screenshot"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <span className="inline-flex items-center gap-1 text-[11px] text-(--color-fg-subtle)">
                <ImagePlus className="h-3 w-3" /> attached to your next message
              </span>
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-end gap-2 rounded-2xl border border-(--color-border) bg-(--color-surface) p-2 focus-within:border-(--color-brand-300) focus-within:shadow-[0_18px_38px_-22px_rgba(13,31,23,0.18)]"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              onPaste={onPaste}
              placeholder="Ask anything — or paste a chart screenshot (Ctrl+V)…"
              rows={1}
              className="flex-1 resize-none bg-transparent px-2 py-2 text-[14.5px] text-(--color-fg) placeholder:text-(--color-fg-subtle) focus:outline-none"
            />
            <button
              type="submit"
              className="grid h-10 w-10 place-items-center rounded-xl bg-(--color-brand-700) text-white hover:bg-(--color-brand-800) disabled:opacity-50"
              disabled={(!input.trim() && attachments.length === 0) || thinking}
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
          <p className="mt-2 text-center text-[11px] text-(--color-fg-subtle)">
            Sense can make mistakes. Verify important information before acting.
          </p>
        </div>
      </Card>
    </div>
  );
}

function UserBubble({ text, images }: { text: string; images?: string[] }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[78%] space-y-2">
        {images && images.length > 0 && (
          <div className="flex flex-wrap justify-end gap-1.5">
            {images.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={src} alt={`Screenshot ${i + 1}`} className="max-h-40 rounded-xl border border-(--color-border) object-contain" />
            ))}
          </div>
        )}
        <div className="rounded-2xl rounded-tr-md bg-(--color-brand-700) px-4 py-3 text-[14.5px] text-white shadow-[0_8px_24px_-16px_rgba(11,90,60,0.45)]">
          {text}
        </div>
      </div>
    </div>
  );
}

function AiBubble({ msg }: { msg: Message }) {
  const r = msg.rich;
  return (
    <div className="flex gap-3">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-(--color-brand-50) text-(--color-brand-700)">
        <Sparkles className="h-4 w-4" />
      </span>
      <div className="max-w-[78%] space-y-3">
        <div className="rounded-2xl rounded-tl-md border border-(--color-border) bg-(--color-surface) px-4 py-3 text-[14.5px] leading-relaxed text-(--color-fg)">
          {msg.text}
        </div>
        {r?.stock && (
          <div className="overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface)">
            <div className="flex items-center justify-between border-b border-(--color-border) px-4 py-3">
              <div>
                <p className="text-[13.5px] font-semibold tracking-tight">{r.stock.symbol}</p>
                <p className="text-[11.5px] text-(--color-fg-subtle)">{r.stock.name}</p>
              </div>
              <div className="text-right">
                <p className="text-[16px] font-semibold tabular">₹{r.stock.price.toFixed(2)}</p>
                <p className={`text-[11.5px] font-semibold tabular ${r.stock.changePct >= 0 ? "text-(--color-up)" : "text-(--color-down)"}`}>
                  {r.stock.changePct >= 0 ? "+" : ""}
                  {r.stock.changePct.toFixed(2)}%
                </p>
              </div>
            </div>
            {r.metrics && (
              <div className="grid grid-cols-4 gap-2 px-4 py-3">
                {r.metrics.map((m) => (
                  <div key={m.label}>
                    <p className="text-[10px] uppercase tracking-[0.12em] text-(--color-fg-subtle)">{m.label}</p>
                    <p className="mt-0.5 text-[12.5px] font-semibold tabular">{m.value}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="border-t border-(--color-border) bg-(--color-surface-2) px-4 py-2">
              <Link
                href={`/stocks/${r.stock.symbol}`}
                className="inline-flex items-center gap-1 text-[12px] font-semibold text-(--color-brand-700) hover:underline"
              >
                Open full report <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        )}
        {r?.bullets && r.bullets.length > 0 && (
          <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4">
            <CardEyebrow>Summary</CardEyebrow>
            <ul className="mt-2 space-y-1.5 text-[13.5px] text-(--color-fg)">
              {r.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-(--color-brand-600)" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {((r?.opportunities && r.opportunities.length > 0) || (r?.risks && r.risks.length > 0)) && (
          <div className="grid gap-3 sm:grid-cols-2">
            {r?.opportunities && r.opportunities.length > 0 && (
              <div className="rounded-2xl border border-(--color-up)/20 bg-(--color-up-soft)/40 p-4">
                <CardEyebrow className="text-(--color-up)">Opportunities</CardEyebrow>
                <ul className="mt-2 space-y-1.5 text-[13px] text-(--color-fg)">
                  {r.opportunities.map((o, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-(--color-up)" />
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {r?.risks && r.risks.length > 0 && (
              <div className="rounded-2xl border border-(--color-down)/20 bg-(--color-down-soft)/40 p-4">
                <CardEyebrow className="text-(--color-down)">Risks</CardEyebrow>
                <ul className="mt-2 space-y-1.5 text-[13px] text-(--color-fg)">
                  {r.risks.map((o, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-(--color-down)" />
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        {typeof r?.confidence === "number" && (
          <div className="flex items-center gap-3 rounded-xl border border-(--color-border) bg-(--color-surface) px-3 py-2">
            <p className="text-[11px] uppercase tracking-[0.12em] font-semibold text-(--color-fg-subtle)">
              AI confidence
            </p>
            <div className="flex-1 overflow-hidden rounded-full bg-(--color-surface-2)">
              <div
                className="h-1.5 rounded-full"
                style={{ width: `${r.confidence}%`, background: "linear-gradient(90deg, #6fb98e, #115e3c)" }}
              />
            </div>
            <p className="text-[12px] font-semibold tabular">{r.confidence}%</p>
          </div>
        )}
        {r?.related && r.related.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <span className="text-[11.5px] text-(--color-fg-subtle)">Related:</span>
            {r.related.map((sym) => (
              <Link
                key={sym}
                href={`/stocks/${sym}`}
                className="rounded-full border border-(--color-border) bg-(--color-surface) px-2.5 py-0.5 text-[11.5px] font-medium text-(--color-fg-muted) hover:border-(--color-brand-300) hover:text-(--color-brand-700)"
              >
                {sym}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Thinking() {
  return (
    <div className="flex gap-3">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-(--color-brand-50) text-(--color-brand-700)">
        <Sparkles className="h-4 w-4" />
      </span>
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-md border border-(--color-border) bg-(--color-surface) px-4 py-3">
        <Dot />
        <Dot delay={120} />
        <Dot delay={240} />
      </div>
    </div>
  );
}

function Dot({ delay = 0 }: { delay?: number }) {
  return (
    <span
      className="block h-1.5 w-1.5 rounded-full bg-(--color-fg-subtle) animate-pulse-dot"
      style={{ animationDelay: `${delay}ms` }}
    />
  );
}
