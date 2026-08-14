import { ABOUT } from "../data";
import { ScrambleText } from "../ScrambleText";

/* Deep water. The rotating lattice diagram sits behind in the scene. */
export function About() {
  return (
    <section
      id="about"
      aria-label="Mission"
      className="relative flex min-h-[130vh] flex-col items-center justify-center px-6 py-32 text-center"
    >
      <h2 className="max-w-4xl text-3xl font-light uppercase leading-snug tracking-[0.04em] text-[#eaf6ff] sm:text-5xl lg:text-6xl">
        <ScrambleText text={ABOUT.statement} duration={1200} />
      </h2>
      <p className="mt-10 max-w-2xl text-sm leading-relaxed text-[#b8d9e8] sm:text-base">
        {ABOUT.body}
      </p>
      <ul className="mt-14 flex flex-wrap items-center justify-center gap-x-12 gap-y-6" aria-label="What we do">
        {ABOUT.services.map((s, i) => (
          <li key={s} className="flex items-center gap-4">
            <span className="font-mono text-[10px] tabular-nums text-[#41647c]">
              0{i + 1}
            </span>
            <span className="font-mono text-sm uppercase tracking-[0.4em] text-[#8fd8ea]">
              {s}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
