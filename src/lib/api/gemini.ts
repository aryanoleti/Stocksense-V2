// Google Gemini client. Calls v1beta generateContent from the browser using
// an API key (NEXT_PUBLIC_*). For chat we ask the model to return JSON so
// the UI can render rich response cards.

const KEY = process.env.NEXT_PUBLIC_GEMINI_KEY;
const MODEL = "gemini-2.5-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

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

export async function generate(
  contents: GeminiContent[],
  opts: GenerateOptions = {},
): Promise<string | null> {
  if (!KEY) return null;
  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      temperature: opts.temperature ?? 0.6,
      ...(opts.responseJson ? { responseMimeType: "application/json" } : {}),
    },
  };
  if (opts.system) {
    body.systemInstruction = { role: "system", parts: [{ text: opts.system }] };
  }
  try {
    const r = await fetch(`${ENDPOINT}?key=${encodeURIComponent(KEY)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!r.ok) return null;
    const json: GeminiResponse = await r.json();
    return json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? null;
  } catch {
    return null;
  }
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
