import Link from "next/link";
import { BRAND } from "../data";
import { ScrambleText } from "../ScrambleText";

/* Surface level. Light ice fog behind (scene), deep-navy text on top. */
export function Hero() {
  return (
    <section
      id="hero"
      aria-label="Introduction"
      className="relative flex min-h-dvh flex-col items-center justify-center px-6 text-center"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-[#2c5872] sm:text-[11px]">
        {BRAND.tagline}
      </p>
      <h1 className="mt-6 text-[11vw] font-light uppercase leading-[1.02] tracking-[0.02em] text-[#0b2233] sm:text-6xl lg:text-7xl xl:text-8xl">
        <ScrambleText text={BRAND.headline[0]} as="span" className="block" delay={150} duration={1000} />
        <ScrambleText text={BRAND.headline[1]} as="span" className="block" delay={450} duration={1100} />
      </h1>
      <p className="mt-8 max-w-xl text-sm leading-relaxed text-[#29506a] sm:text-base">
        {BRAND.sub}
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/dashboard/"
          data-cursor="OPEN"
          className="gl-focus gl-btn inline-flex h-12 items-center gap-3 border border-[#0b2233] bg-[#0b2233] px-7 font-mono text-[11px] uppercase tracking-[0.3em] text-[#eaf6ff] transition-colors hover:bg-[#0f3f5c]"
        >
          {BRAND.enterCta}
          <span aria-hidden="true">→</span>
        </Link>
        <Link
          href="/dashboard/"
          data-cursor="OPEN"
          className="gl-focus inline-flex h-12 items-center border border-[#0b2233]/40 px-7 font-mono text-[11px] uppercase tracking-[0.3em] text-[#0b2233] transition-colors hover:border-[#0b2233] hover:bg-[#0b2233]/5"
        >
          {BRAND.signIn}
        </Link>
      </div>

      <div
        className="pointer-events-none absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3"
        aria-hidden="true"
      >
        <span className="font-mono text-[9px] uppercase tracking-[0.45em] text-[#2c5872]">
          {BRAND.scrollHint}
        </span>
        <span className="gl-scroll-line block h-10 w-px bg-[#2c5872]/50" />
      </div>
    </section>
  );
}
