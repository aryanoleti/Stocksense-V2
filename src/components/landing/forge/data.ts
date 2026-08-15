/* Content for the landing sequence. Every screen is data-driven from here so
   entries, copy and links can be swapped without touching a component.

   The design system comes from a spec written around a generic "[BRAND]"
   template; the content is StockSense's own, and every product claim below is
   one the app actually delivers. */

export type StatReadout = { label: string; value: string; delta: string };

export type PortfolioEntry = {
  /** zero-padded index shown in the annotation, e.g. "01" */
  index: string;
  slug: string;
  name: string;
  /** shard silhouette used for this card */
  shape: "geode" | "slab" | "abstract";
  /** short glyph etched into the shard face; null renders a bare shard */
  etch: string | null;
  date: string;
  stat: StatReadout;
  href: string;
  summary: string[];
  discover: { label: string; href: string }[];
  visit: { label: string; href: string };
};

export const BRAND = {
  wordmark: "STOCKSENSE",
  legal: ["// Copyright © 2026", "StockSense, Inc.", "All Rights Reserved."],
  manifestoLabel: "////// Manifesto",
  manifesto:
    "Our mission is to make the Indian market legible — building research tools at the intersection of live exchange data, transparent quantitative models, and AI assistance.",
};

/* The four cards of the carousel. These are the app's real modules; the
   readouts are labelled SIM so no one mistakes them for live market data. */
export const ENTRIES: PortfolioEntry[] = [
  {
    index: "01",
    slug: "quant-engine",
    name: "QUANT ENGINE",
    shape: "geode",
    etch: "QE",
    date: "01.03.2026",
    stat: { label: "SIM", value: "35.53", delta: "+01.96" },
    href: "/quant/",
    summary: [
      "A six-tab technical workbench built on NSE candles. Momentum, volatility, support and resistance levels, and a forecast view each render from the same price series, so every panel agrees with the chart in front of you.",
      "A dedicated tab shows the working: the inputs, the intermediate terms and the final arithmetic behind each indicator are printed step by step, rather than presented as a number to be trusted.",
      "It is a study tool. It reports what the maths says about past and present prices — it does not tell you what to buy.",
    ],
    discover: [{ label: "Quant", href: "/quant/" }],
    visit: { label: "Open module", href: "/quant/" },
  },
  {
    index: "02",
    slug: "compare-desk",
    name: "COMPARE DESK",
    shape: "slab",
    etch: "CD",
    date: "01.03.2026",
    stat: { label: "SIM", value: "20.98", delta: "-06.12" },
    href: "/compare/",
    summary: [
      "Two Nifty 50 stocks placed side by side. Both price series are rebased to 100 at the start of the window, so returns can be read against each other regardless of share price.",
      "Beneath the chart, a rules-based scorecard grades the pair across six fundamental factors — valuation, earnings yield, dividend yield, 52-week position, stability and size — drawn from curated fundamentals and the live quote.",
      "The scorecard is a heuristic, not a recommendation. It shows which side each factor favours and leaves the judgement to you.",
    ],
    discover: [{ label: "Compare", href: "/compare/" }],
    visit: { label: "Open module", href: "/compare/" },
  },
  {
    index: "03",
    slug: "ask-ai",
    name: "ASK AI",
    shape: "abstract",
    etch: null,
    date: "01.03.2026",
    stat: { label: "SIM", value: "12.40", delta: "+03.08" },
    href: "/ask-ai/",
    summary: [
      "A chat desk backed by Gemini that answers market questions in plain language, with the current quote context available to it as it responds.",
      "Paste a chart screenshot straight into the composer and it reads the image — useful when the question is about a pattern you are looking at rather than a number you can type.",
      "Conversations are kept per account so a line of research can be picked up later.",
    ],
    discover: [{ label: "Ask AI", href: "/ask-ai/" }],
    visit: { label: "Open module", href: "/ask-ai/" },
  },
  {
    index: "04",
    slug: "portfolio-desk",
    name: "PORTFOLIO DESK",
    shape: "slab",
    etch: "PD",
    date: "01.03.2026",
    stat: { label: "SIM", value: "48.17", delta: "+00.74" },
    href: "/portfolio/",
    summary: [
      "Two books in one desk: a tracker for holdings you already own, and a simulator that starts with ₹5,00,000 of virtual capital for testing an idea without risking anything.",
      "Both are marked against live prices, so positions, profit and loss, and the value trend move with the market during the session.",
      "History is retained per account, which makes it possible to look back at what a decision actually cost.",
    ],
    discover: [{ label: "Portfolio", href: "/portfolio/" }],
    visit: { label: "Open module", href: "/portfolio/" },
  },
];

/* Footer links for the pedestal stage. Only destinations that exist. */
export const SOCIAL = [
  { label: "GitHub", href: "https://github.com/aryanoleti/Stocksense-V2" },
  { label: "Email", href: "mailto:aryan.oleti@gmail.com" },
  { label: "Terminal", href: "/dashboard/" },
];

/* Letterforms the particle sculpture can materialise into. */
export const SCULPTURES = ["S", "$", "₹"];

export const SOUND_LABEL = { on: "Sound: On", off: "Sound: Off" };
