"use client";

import Link from "next/link";
import { MODULES } from "../data";
import { ScrambleText } from "../ScrambleText";

/* The descent. The outer section is (modules + 1) viewports tall; the inner
   frame is sticky so DOM stage panels crossfade while the camera dives past
   each ice chamber in the scene behind. */
export function Platform({
  activeStage,
  onStageJump,
}: {
  activeStage: number;
  onStageJump: (index: number) => void;
}) {
  return (
    <section
      id="platform"
      aria-label="The platform"
      style={{ height: `${(MODULES.length + 1) * 100}vh` }}
      className="relative"
    >
      <div className="sticky top-0 flex h-dvh flex-col justify-center overflow-hidden">
        {/* HUD: counter + jump dots */}
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-6 pt-24 sm:px-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.45em] text-[#9fc9de]">
            Selected modules
          </p>
          <p className="font-mono text-sm tabular-nums text-[#d9f2ff]" aria-live="polite">
            {String(Math.min(activeStage + 1, MODULES.length)).padStart(2, "0")}
            <span className="text-[#5c93b0]"> / {String(MODULES.length).padStart(2, "0")}</span>
          </p>
        </div>

        <div
          className="pointer-events-auto absolute bottom-10 left-1/2 flex -translate-x-1/2 gap-3"
          role="tablist"
          aria-label="Modules"
        >
          {MODULES.map((m, i) => (
            <button
              key={m.title}
              type="button"
              role="tab"
              aria-selected={activeStage === i}
              aria-label={`Go to ${m.title}`}
              data-cursor="JUMP"
              onClick={() => onStageJump(i)}
              className={`gl-focus h-2.5 w-2.5 rounded-full border transition-all duration-300 ${
                activeStage === i
                  ? "scale-125 border-[#6fd4a8] bg-[#6fd4a8]"
                  : "border-[#5c93b0]/70 bg-transparent hover:border-[#9fc9de]"
              }`}
            />
          ))}
        </div>

        {/* Stage panels: text sits opposite the module's side in the scene */}
        {MODULES.map((m, i) => {
          const active = activeStage === i;
          const textLeft = i % 2 === 1; // odd modules float right in the scene
          return (
            <div
              key={m.title}
              inert={!active}
              aria-hidden={!active}
              className={`absolute inset-0 flex items-center px-6 transition-all duration-700 sm:px-14 lg:px-24 ${
                active ? "opacity-100 blur-0" : "pointer-events-none opacity-0 blur-sm"
              } ${textLeft ? "justify-start" : "justify-end"}`}
            >
              <div className={`max-w-md ${textLeft ? "text-left" : "text-right"}`}>
                <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#8fd8ea]">
                  {m.category} · {m.year}
                </p>
                {active ? (
                  <ScrambleText
                    key={`t-${i}-${active}`}
                    text={m.title}
                    as="h3"
                    duration={700}
                    className="mt-4 text-4xl font-light uppercase tracking-[0.04em] text-[#eaf6ff] sm:text-5xl lg:text-6xl"
                  />
                ) : (
                  <h3 className="mt-4 text-4xl font-light uppercase tracking-[0.04em] text-[#eaf6ff] sm:text-5xl lg:text-6xl">
                    {m.title}
                  </h3>
                )}
                <p className="mt-5 text-sm leading-relaxed text-[#b8d9e8] sm:text-[15px]">
                  {m.description}
                </p>
                <Link
                  href={m.href}
                  data-cursor="VIEW"
                  tabIndex={active ? 0 : -1}
                  className={`gl-focus mt-7 inline-flex items-center gap-3 border-b pb-1 font-mono text-[11px] uppercase tracking-[0.3em] transition-colors ${
                    textLeft ? "" : "flex-row-reverse"
                  }`}
                  style={{ color: m.accent, borderColor: `${m.accent}66` }}
                >
                  Open module
                  <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
