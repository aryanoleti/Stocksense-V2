import { Globe2, Sparkles, BarChart3, Lock } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

const FEATURES = [
  {
    icon: Globe2,
    title: "Unified coverage",
    body: "Every NSE stock, ETF and major index — 2,350+ instruments with live prices, charts across 8 ranges, and real listing fundamentals.",
  },
  {
    icon: Sparkles,
    title: "AI research copilot",
    body: "Gemini-powered summaries of fundamentals, momentum and risk on every stock — plus a chat that answers follow-ups and reads your screenshots.",
  },
  {
    icon: BarChart3,
    title: "Quant engine you can read",
    body: "Momentum, volatility, support/resistance and forecasts — with a “show the working” tab that walks through every calculation step.",
  },
  {
    icon: Lock,
    title: "Private by design",
    body: "Sign in with Google, keep your data on your device. Research and practice only — we never touch your money or place trades.",
  },
];

export function ProductHighlights() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-5 py-20">
      <Reveal className="max-w-xl">
        <p className="text-[12.5px] font-bold uppercase tracking-[0.1em] text-(--color-brand-300)">
          Product highlights
        </p>
        <h2 className="mt-2.5 text-3xl font-semibold tracking-tight text-white sm:text-[36px] sm:leading-[1.12]">
          Everything you need to understand the market, in one place
        </h2>
        <p className="mt-3 text-[15.5px] leading-relaxed text-white/60">
          Research depth that usually needs four different apps — with an AI layer that
          explains it all.
        </p>
      </Reveal>
      <div className="mt-11 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f, i) => (
          <Reveal key={f.title} delay={i * 110}>
            <article className="h-full rounded-[22px] border border-white/10 bg-white/[0.04] p-6 transition-all duration-200 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.06]">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-(--color-brand-600)/30 text-(--color-brand-300)">
                <f.icon className="h-[18px] w-[18px]" />
              </span>
              <h3 className="mt-4 text-[16px] font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-white/55">{f.body}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
