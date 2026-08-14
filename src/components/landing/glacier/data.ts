/* Content for the glacier landing. Everything user-visible lives here so
   copy and modules can be swapped without touching the components.

   Every claim below is checked against the app itself. The instrument count
   is not written here at all — it is counted from the real universe at build
   time and passed in, so it can never drift out of date. */

/* A labelled point on a shard, revealed when the visitor opens it. `at` is
   an offset from the shard's centre in world units; the renderer projects
   it to screen space every frame and draws a leader line to the label. */
export type Callout = {
  code: string;
  label: string;
  at: [number, number, number];
};

export type Project = {
  title: string;
  category: string;
  description: string;
  accent: string;
  visualType: "orbital" | "twin" | "neural" | "strata";
  href: string;
  callouts: Callout[];
};

/* The four platform modules shown in the scroll journey. All of them are
   real routes in the app; the auth gate takes over from there. */
export const MODULES: Project[] = [
  {
    title: "QUANT ENGINE",
    category: "ANALYTICS",
    description:
      "Six tabs of technical analysis — momentum, volatility, levels and a forecast — computed from NSE candles, with a tab that shows the arithmetic behind every number.",
    accent: "#6fd4a8",
    visualType: "orbital",
    href: "/quant/",
    callouts: [
      { code: "TABS", label: "SIX ANALYSIS VIEWS", at: [-2.1, 1.5, 0.6] },
      { code: "SIGNALS", label: "RSI · MACD · VOLATILITY · LEVELS", at: [2.3, 0.1, 0.4] },
      { code: "METHOD", label: "SHOWS ITS WORKING", at: [1.4, -1.9, 0.5] },
    ],
  },
  {
    title: "COMPARE DESK",
    category: "RESEARCH",
    description:
      "Two Nifty 50 stocks side by side: both rebased to 100 so returns are comparable, plus a rules-based scorecard across six fundamental factors.",
    accent: "#8fd8ea",
    visualType: "twin",
    href: "/compare/",
    callouts: [
      { code: "PAIR", label: "TWO NIFTY 50 STOCKS", at: [-2.2, 1.4, 0.5] },
      { code: "NORMALISED", label: "BOTH REBASED TO 100", at: [2.2, 0.3, 0.5] },
      { code: "SCORECARD", label: "SIX FUNDAMENTAL FACTORS", at: [1.2, -1.9, 0.4] },
    ],
  },
  {
    title: "ASK AI",
    category: "ASSISTANT",
    description:
      "A chat desk built on Gemini that answers market questions in plain language, reads chart screenshots you paste in, and keeps your past conversations.",
    accent: "#b9a8f2",
    visualType: "neural",
    href: "/ask-ai/",
    callouts: [
      { code: "MODEL", label: "RUNS ON GEMINI", at: [-2.2, 1.3, 0.5] },
      { code: "VISION", label: "READS PASTED CHARTS", at: [2.2, 0.0, 0.5] },
      { code: "HISTORY", label: "CHATS SAVED PER ACCOUNT", at: [1.3, -1.9, 0.4] },
    ],
  },
  {
    title: "PORTFOLIO DESK",
    category: "TRACKING",
    description:
      "Track holdings you already own, or trade a ₹5,00,000 virtual book. Either way positions are marked against live prices.",
    accent: "#7fe0c3",
    visualType: "strata",
    href: "/portfolio/",
    callouts: [
      { code: "MODES", label: "HOLDINGS OR SIMULATOR", at: [-2.2, 1.4, 0.5] },
      { code: "BOOK", label: "₹5,00,000 VIRTUAL CAPITAL", at: [2.2, 0.2, 0.5] },
      { code: "MARKED", label: "VALUED AT LIVE PRICES", at: [1.2, -1.9, 0.4] },
    ],
  },
];

export const BRAND = {
  mark: "STOCKSENSE",
  tagline: "AN INDIAN MARKET TERMINAL",
  headline: ["NSE EQUITIES AND ETFS,", "ALIVE ON ONE SCREEN"],
  /* count is measured from the real instrument universe at build time */
  sub: (count: string) =>
    `${count} NSE equities and ETFs, searchable and chartable — with a quant workbench, a comparison desk, an AI assistant and a portfolio tracker built around them.`,
  scrollHint: "SCROLL TO EXPLORE",
  enterCta: "ENTER TERMINAL",
  signIn: "SIGN IN",
};

export const ABOUT = {
  statement: "WE TURN RAW MARKET DATA INTO SOMETHING YOU CAN READ.",
  body:
    "StockSense pulls live NSE quotes and candles, runs them through a technical model that shows its own arithmetic, and puts an AI assistant beside the chart. It is a research and learning tool — it does not tell you what to buy.",
  services: ["DATA", "ANALYSIS", "INTERFACE"],
};

export const CONTACT = {
  heading: "MAKE THE NEXT MOVE.",
  email: "aryan.oleti@gmail.com",
  availability: "PRICE REFRESH FROM 0.5S",
  location: "BUILT FOR INDIAN MARKETS",
  /* only destinations that actually exist — no placeholder social accounts */
  links: [
    { label: "EMAIL", href: "mailto:aryan.oleti@gmail.com", shape: "ring" },
    { label: "GITHUB", href: "https://github.com/aryanoleti/Stocksense-V2", shape: "hex" },
  ] as { label: string; href: string; shape: ParticleShape }[],
};

export type ParticleShape = "idle" | "ring" | "cross" | "diamond" | "grid" | "hex";

/* In-app destinations for the compact footer row (all real routes). */
export const FOOTER_LINKS = [
  { label: "Dashboard", href: "/dashboard/" },
  { label: "Market", href: "/market/" },
  { label: "Stocks", href: "/stocks/" },
  { label: "Compare", href: "/compare/" },
  { label: "Quant", href: "/quant/" },
  { label: "Portfolio", href: "/portfolio/" },
  { label: "Ask AI", href: "/ask-ai/" },
  { label: "News", href: "/news/" },
  { label: "Glossary", href: "/glossary/" },
];

export const SECTIONS = [
  { id: "hero", hud: "00 — SURFACE" },
  { id: "platform", hud: "01 — THE PLATFORM" },
  { id: "about", hud: "02 — MISSION" },
  { id: "contact", hud: "03 — CONTACT" },
] as const;

export type SectionId = (typeof SECTIONS)[number]["id"];
