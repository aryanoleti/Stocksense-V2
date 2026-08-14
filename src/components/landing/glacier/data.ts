/* Content for the glacier landing. Everything user-visible lives here so
   copy and modules can be swapped without touching the components. */

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
  year: string;
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
    year: "2026",
    description:
      "A six-tab technical workbench — momentum, volatility, levels and forecasts computed from live NSE candles, with every step of the arithmetic shown.",
    accent: "#6fd4a8",
    visualType: "orbital",
    href: "/quant/",
    callouts: [
      { code: "MODULE_01", label: "SIX ANALYSIS TABS", at: [-2.1, 1.5, 0.6] },
      { code: "SIGNALS", label: "RSI · MACD · ATR · S/R", at: [2.3, 0.1, 0.4] },
      { code: "METHOD", label: "ARITHMETIC SHOWN IN FULL", at: [1.4, -1.9, 0.5] },
    ],
  },
  {
    title: "COMPARE DESK",
    category: "RESEARCH",
    year: "2026",
    description:
      "Two instruments head-to-head: performance rebased to 100, a six-factor fundamental scorecard, and an AI verdict on the pair.",
    accent: "#8fd8ea",
    visualType: "twin",
    href: "/compare/",
    callouts: [
      { code: "MODULE_02", label: "TWO INSTRUMENTS, ONE AXIS", at: [-2.2, 1.4, 0.5] },
      { code: "NORMALISED", label: "PERFORMANCE REBASED TO 100", at: [2.2, 0.3, 0.5] },
      { code: "SCORECARD", label: "SIX FUNDAMENTAL FACTORS", at: [1.2, -1.9, 0.4] },
    ],
  },
  {
    title: "ASK AI",
    category: "INTELLIGENCE",
    year: "2026",
    description:
      "A market-aware analyst that answers in plain language, reads pasted chart screenshots, and keeps every conversation on file.",
    accent: "#b9a8f2",
    visualType: "neural",
    href: "/ask-ai/",
    callouts: [
      { code: "MODULE_03", label: "MARKET-AWARE ANALYST", at: [-2.2, 1.3, 0.5] },
      { code: "VISION", label: "READS PASTED CHARTS", at: [2.2, 0.0, 0.5] },
      { code: "MEMORY", label: "CONVERSATIONS KEPT ON FILE", at: [1.3, -1.9, 0.4] },
    ],
  },
  {
    title: "PORTFOLIO DESK",
    category: "SIMULATION",
    year: "2026",
    description:
      "Track real holdings or run a ₹5,00,000 virtual book — positions, P&L and history, all marked to live prices.",
    accent: "#7fe0c3",
    visualType: "strata",
    href: "/portfolio/",
    callouts: [
      { code: "MODULE_04", label: "REAL HOLDINGS OR SIMULATOR", at: [-2.2, 1.4, 0.5] },
      { code: "BOOK", label: "₹5,00,000 VIRTUAL CAPITAL", at: [2.2, 0.2, 0.5] },
      { code: "MARKED", label: "P&L AGAINST LIVE PRICES", at: [1.2, -1.9, 0.4] },
    ],
  },
];

export const BRAND = {
  mark: "STOCKSENSE",
  tagline: "AN INDIAN MARKET TERMINAL",
  headline: ["THE ENTIRE MARKET,", "ALIVE ON ONE SCREEN"],
  sub: "StockSense renders 2,678 NSE instruments as one continuous environment — live quotes, a transparent quant engine, AI research and a portfolio desk, in a single view.",
  scrollHint: "SCROLL TO EXPLORE",
  enterCta: "ENTER TERMINAL",
  signIn: "SIGN IN",
};

export const ABOUT = {
  statement: "WE TURN RAW MARKET DATA INTO SIGNALS PEOPLE CAN FEEL.",
  body:
    "Strategy, design and engineering run in one loop here. Live exchange data feeds a quant model that shows its working, an AI desk that cites what it sees, and an interface built to make risk legible. Nothing on screen is faked — every figure is computed from the feed.",
  services: ["DATA", "INTELLIGENCE", "EXPERIENCE"],
};

export const CONTACT = {
  heading: "MAKE THE NEXT MOVE.",
  email: "aryan.oleti@gmail.com",
  availability: "DATA — NSE · LIVE · REFRESH TO 0.5S",
  location: "BUILT FOR INDIAN MARKETS",
  /* shape: which particle formation each link pulls the field into */
  links: [
    { label: "EMAIL", href: "mailto:aryan.oleti@gmail.com", shape: "ring" },
    { label: "X", href: "#", shape: "cross" },
    { label: "INSTAGRAM", href: "#", shape: "diamond" },
    { label: "LINKEDIN", href: "#", shape: "grid" },
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
