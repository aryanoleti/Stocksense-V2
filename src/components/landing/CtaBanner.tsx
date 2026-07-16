import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function CtaBanner() {
  return (
    <section id="support" className="mx-auto max-w-7xl px-5 py-24">
      <div className="relative overflow-hidden rounded-[28px] gradient-brand p-10 text-center sm:p-16">
        <div className="particle-dust pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-(--color-brand-400)/20 blur-3xl" />
        <div className="absolute -left-20 -bottom-24 h-72 w-72 rounded-full bg-(--color-brand-300)/10 blur-3xl" />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-[40px] sm:leading-[1.08]">
            Ready to invest smarter?
          </h2>
          <p className="mt-5 text-[16px] leading-relaxed text-white/75">
            Create your free account in under two minutes. No fees, no hidden charges,
            no spam — just clearer decisions backed by live data and honest AI.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href="/dashboard" size="lg" className="bg-white text-(--color-brand-900) hover:bg-white/90 shadow-none">
              Create free account <ArrowRight className="h-4 w-4" />
            </Button>
            <Button href="/ask-ai" variant="ghost" size="lg" className="text-white hover:bg-white/10">
              <Sparkles className="h-4 w-4" /> Ask StockSense AI
            </Button>
          </div>
          <p className="mt-6 text-[12.5px] text-white/50">
            StockSense is a research and education platform — not a broker. We never hold
            funds or execute trades.
          </p>
        </div>
      </div>
    </section>
  );
}
