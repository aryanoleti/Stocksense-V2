import Link from "next/link";
import { BRAND } from "../data";
import { ScrambleText } from "../ScrambleText";

/* Surface level. Bright ice fog behind (scene), deep-navy type on top. */
export function Hero({ instrumentCount }: { instrumentCount: number }) {
  const count = instrumentCount.toLocaleString("en-IN");
  return (
    <section
      id="hero"
      aria-label="Introduction"
      className="relative flex min-h-dvh flex-col items-center justify-center px-6 text-center"
    >
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.5em] text-[#1d4460] sm:text-[11px]">
        {BRAND.tagline}
      </p>
      <h1 className="mt-6 text-[10vw] font-extrabold uppercase leading-[0.98] tracking-[-0.01em] text-[#08202f] sm:text-6xl lg:text-7xl xl:text-8xl">
        <ScrambleText text={BRAND.headline[0]} as="span" className="block" delay={150} duration={1000} />
        <ScrambleText text={BRAND.headline[1]} as="span" className="block" delay={450} duration={1100} />
      </h1>
      <p className="mt-8 max-w-xl text-sm font-medium leading-relaxed text-[#1d4460] sm:text-base">
        {BRAND.sub(count)}
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/dashboard/"
          data-cursor="OPEN"
          className="gl-focus gl-btn inline-flex h-12 items-center gap-3 border border-[#08202f] bg-[#08202f] px-7 font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-[#eaf6ff] transition-colors hover:bg-[#0f3f5c]"
        >
          {BRAND.enterCta}
          <span aria-hidden="true">→</span>
        </Link>
        <Link
          href="/dashboard/"
          data-cursor="OPEN"
          className="gl-focus inline-flex h-12 items-center border-2 border-[#08202f]/50 px-7 font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-[#08202f] transition-colors hover:border-[#08202f] hover:bg-[#08202f]/5"
        >
          {BRAND.signIn}
        </Link>
      </div>

      <p className="mt-10 font-mono text-[9px] font-bold uppercase tracking-[0.4em] text-[#1d4460]/70">
        Hover the shelter to open it
      </p>

      <div
        className="pointer-events-none absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3"
        aria-hidden="true"
      >
        <span className="font-mono text-[9px] font-bold uppercase tracking-[0.45em] text-[#1d4460]">
          {BRAND.scrollHint}
        </span>
        <span className="gl-scroll-line block h-10 w-px bg-[#1d4460]/60" />
      </div>
    </section>
  );
}
