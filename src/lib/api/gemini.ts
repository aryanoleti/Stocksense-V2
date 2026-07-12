// Google Gemini client. Calls v1beta generateContent from the browser using
// an API key (NEXT_PUBLIC_*). For chat we ask the model to return JSON so
// the UI can render rich response cards.

const KEY = process.env.NEXT_PUBLIC_GEMINI_KEY;

// Free-tier quotas differ a lot per model (2.5-flash: ~250 req/day; the
// lite/2.0 models allow far more), so try cheap-and-plentiful first and walk
// down the chain on rate limits. Thinking is disabled — these are short
// summaries and thinking tokens burn the free quota ~10x faster.
const MODELS = ["gemini-2.5-flash-lite", "gemini-2.0-flash", "gemini-2.5-flash"];

const endpointFor = (model: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

// Last failure reason, surfaced in UI fallbacks so "AI is down" is actionable.
let lastError: string | null = null;
export function getGeminiError(): string | null {
  return lastError;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type GeminiPart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } };
export type GeminiContent = { role: "user" | "model"; parts: GeminiPart[] };

type GenerateOptions = {
  system?: string;
  responseJson?: boolean;
  temperature?: number;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
    finishReason?: string;
  }>;
  promptFeedback?: { blockReason?: string };
};

export function hasGeminiKey() {
  return !!KEY;
}

async function callModel(model: string, contents: GeminiContent[], opts: GenerateOptions): Promise<{ text: string | null; status: number }> {
  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      temperature: opts.temperature ?? 0.6,
      ...(opts.responseJson ? { responseMimeType: "application/json" } : {}),
      // 2.5-series models think by default; skip it for short summaries.
      ...(model.startsWith("gemini-2.5") ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
    },
  };
  if (opts.system) {
    body.systemInstruction = { role: "system", parts: [{ text: opts.system }] };
  }
  const r = await fetch(`${endpointFor(model)}?key=${encodeURIComponent(KEY!)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!r.ok) return { text: null, status: r.status };
  const json: GeminiResponse = await r.json();
  const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? null;
  return { text: text || null, status: r.status };
}

export async function generate(
  contents: GeminiContent[],
  opts: GenerateOptions = {},
): Promise<string | null> {
  if (!KEY) {
    lastError = "no Gemini key configured in this deploy";
    return null;
  }
  let sawRateLimit = false;
  for (const model of MODELS) {
    try {
      let res = await callModel(model, contents, opts);
      if (res.status === 429) {
        // brief pause, one retry on the same model before moving down the chain
        await sleep(1600);
        res = await callModel(model, contents, opts);
      }
      if (res.text) {
        lastError = null;
        return res.text;
      }
      if (res.status === 429) {
        sawRateLimit = true;
        continue; // next model has its own quota bucket
      }
      if (res.status === 400 || res.status === 403) {
        lastError = `Gemini rejected the request (HTTP ${res.status}) — check the API key in the repo secrets`;
        return null;
      }
      // 404 (model unavailable) or empty response: try the next model
    } catch {
      lastError = "network error reaching Gemini";
    }
  }
  if (sawRateLimit) {
    lastError = "Gemini free-tier rate limit reached — it resets within a minute (daily caps reset at midnight PT)";
  } else if (!lastError) {
    lastError = "Gemini returned no usable response";
  }
  return null;
}

export async function generateJson<T>(
  contents: GeminiContent[],
  opts: Omit<GenerateOptions, "responseJson"> = {},
): Promise<T | null> {
  const text = await generate(contents, { ...opts, responseJson: true });
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    // Models occasionally wrap JSON in ```json fences; strip and retry.
    const stripped = text
      .replace(/^\s*```(?:json)?/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    try {
      return JSON.parse(stripped) as T;
    } catch {
      return null;
    }
  }
}
