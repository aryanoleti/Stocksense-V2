import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { HeroPreview } from "./HeroPreview";

export function Hero() {
  return (
    <section className="relative isolate">
      <div className="absolute -top-40 left-1/2 -z-10 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-(--color-brand-400)/12 blur-3xl" />
      <div className="mx-auto max-w-7xl px-5 pt-10 pb-20 sm:pt-16 md:pt-20">
        <div className="grid items-center gap-12 md:grid-cols-[1.05fr_1fr] md:gap-16">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[12px] font-medium text-white/85 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-(--color-brand-300)" />
              Built for Indian retail investors
            </div>
            <h1 className="mt-6 text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl md:text-[64px] md:leading-[1.04]">
              Smarter stock decisions,
              <span className="block text-(--color-brand-200)">powered by AI.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-[17px]">
              StockSense is your intelligent companion for the Indian market. Track live prices,
              analyse companies, simulate trades with virtual money, and ask an AI assistant for a
              second opinion — all in one calm, beautiful product.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button href="/dashboard" size="lg" className="bg-white text-(--color-brand-900) hover:bg-white/90 shadow-none">
                Get started — it&apos;s free
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button href="/dashboard" variant="ghost" size="lg" className="text-white hover:bg-white/10">
                Explore demo
              </Button>
            </div>
            <p className="mt-5 text-[12.5px] text-white/55">
              No credit card. Virtual portfolio. Real market data.
            </p>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-white/10 pt-6">
              <Stat value="50+" label="Nifty stocks" />
              <Stat value="₹5L" label="Virtual cash" />
              <Stat value="1s" label="Price refresh" />
            </dl>
          </div>
          <div className="relative animate-fade-up" style={{ animationDelay: "120ms" }}>
            <HeroPreview />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-[0.14em] text-white/45">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold tracking-tight text-white tabular">{value}</dd>
    </div>
  );
}
