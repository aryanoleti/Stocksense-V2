import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

const CARDS = [
  {
    kicker: "Glossary",
    title: "Every market term, AI-explained",
    body: "From circuit limits to contango — tap any term and get an explanation grounded in today's Indian market.",
    cta: "Browse the glossary",
    href: "/glossary",
  },
  {
    kicker: "Ask AI",
    title: "Your research questions, answered",
    body: "Chat with an AI that sees live prices. Paste a chart screenshot and ask what's going on — it reads images too.",
    cta: "Try Ask AI",
    href: "/ask-ai",
  },
  {
    kicker: "Show the working",
    title: "See the math behind every signal",
    body: "No black boxes. The quant engine shows its arithmetic step by step, with the actual source code of each indicator.",
    cta: "Open the quant engine",
    href: "/quant",
  },
];

export function LearnTeaser() {
  return (
    <section id="learn" className="mx-auto max-w-7xl px-5 py-20">
      <Reveal className="max-w-xl">
        <p className="text-[12.5px] font-bold uppercase tracking-[0.1em] text-(--color-brand-300)">
          Learn as you go
        </p>
        <h2 className="mt-2.5 text-3xl font-semibold tracking-tight text-white sm:text-[36px] sm:leading-[1.12]">
          Understanding compounds faster than money
        </h2>
      </Reveal>
      <div className="mt-11 grid gap-4 md:grid-cols-3">
        {CARDS.map((c, ci) => (
          <Reveal key={c.kicker} delay={ci * 120}>
          <Link
            href={c.href}
            className="group flex h-full flex-col gap-2.5 rounded-[22px] border border-white/10 bg-white/[0.04] p-6 transition-all duration-200 hover:-translate-y-1 hover:border-(--color-brand-400)/50"
          >
            <p className="text-[11.5px] font-bold uppercase tracking-[0.09em] text-(--color-brand-300)">
              {c.kicker}
            </p>
            <h3 className="text-[17px] font-semibold tracking-tight text-white">{c.title}</h3>
            <p className="flex-1 text-[13.5px] leading-relaxed text-white/55">{c.body}</p>
            <span className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-(--color-brand-300)">
              {c.cta}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
