import { ABOUT } from "../data";
import { ScrambleText } from "../ScrambleText";

/* The gate descent. The section is deliberately tall — the camera falls
   through three ring gates across its length — while the statement stays
   pinned, so reading it and passing through the circles happen together. */
export function About() {
  return (
    <section id="about" aria-label="Mission" className="relative h-[320vh]">
      <div className="gl-scrim-center sticky top-0 flex h-dvh flex-col items-center justify-center px-6 text-center">
        <h2 className="max-w-4xl text-3xl font-extrabold uppercase leading-tight tracking-[-0.01em] text-white sm:text-5xl lg:text-6xl">
          <ScrambleText text={ABOUT.statement} duration={1200} />
        </h2>
        <p className="mt-10 max-w-2xl text-sm font-medium leading-relaxed text-[#e8f5fc] sm:text-base">
          {ABOUT.body}
        </p>
        <ul
          className="mt-14 flex flex-wrap items-center justify-center gap-x-12 gap-y-6"
          aria-label="What we do"
        >
          {ABOUT.services.map((s, i) => (
            <li key={s} className="flex items-center gap-4">
              <span className="font-mono text-[10px] font-bold tabular-nums text-[#a8cfe4]">
                0{i + 1}
              </span>
              <span className="font-mono text-sm font-bold uppercase tracking-[0.4em] text-[#d7f2ff]">
                {s}
              </span>
            </li>
          ))}
        </ul>
        <p
          className="mt-16 font-mono text-[9px] font-bold uppercase tracking-[0.45em] text-[#a8cfe4]/80"
          aria-hidden="true"
        >
          Keep scrolling — three gates below
        </p>
      </div>
    </section>
  );
}
