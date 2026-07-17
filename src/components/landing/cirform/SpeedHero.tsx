"use client";

/*
 * Hero: navy canvas, diagonal glowing speed lines sweeping across, a
 * typewriter headline, and a bottom info bar. All claims are real
 * product facts; no fabricated numbers.
 */

const LINES: {
  top: string;
  rotate: number;
  color: string;
  height: number;
  width: string;
  dur: string;
  delay: string;
  op: number;
}[] = [
  { top: "24%", rotate: -9, color: "#06B6D4", height: 2, width: "42vw", dur: "2.6s", delay: "0s", op: 0.9 },
  { top: "38%", rotate: -7, color: "#E11D48", height: 3, width: "34vw", dur: "3.4s", delay: "0.4s", op: 0.8 },
  { top: "52%", rotate: -10, color: "#3B82F6", height: 2, width: "48vw", dur: "2.9s", delay: "0.9s", op: 0.85 },
  { top: "66%", rotate: -6, color: "#1A56DB", height: 2, width: "38vw", dur: "3.8s", delay: "1.3s", op: 0.7 },
  { top: "78%", rotate: -11, color: "#06B6D4", height: 1, width: "30vw", dur: "3.1s", delay: "1.8s", op: 0.6 },
];

export function SpeedHero() {
  return (
    <section className="relative flex min-h-[92vh] flex-col overflow-hidden bg-[#050A1A]">
      {/* Centre radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(6,182,212,0.12), transparent)",
        }}
        aria-hidden="true"
      />

      {/* Diagonal speed lines */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {LINES.map((l, i) => (
          <div
            key={i}
            className="absolute inset-x-0"
            style={{ top: l.top, transform: `rotate(${l.rotate}deg)` }}
          >
            <span
              className="cf-speed"
              style={
                {
                  height: l.height,
                  width: l.width,
                  background: `linear-gradient(90deg, transparent, ${l.color}, transparent)`,
                  boxShadow: `0 0 12px 1px ${l.color}66, 0 0 32px 4px ${l.color}33`,
                  "--cf-dur": l.dur,
                  "--cf-delay": l.delay,
                  "--cf-op": l.op,
                } as React.CSSProperties
              }
            />
          </div>
        ))}
      </div>

      {/* Headline */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-5 text-center">
        <h1 className="text-[44px] font-bold leading-[1.04] tracking-[-0.03em] text-white sm:text-6xl md:text-[72px]">
          We create{" "}
          <span
            className="cf-type text-[#60A5FA]"
            style={{ "--cf-steps": 15, "--cf-w": "7.6em" } as React.CSSProperties}
          >
            market clarity.
          </span>
        </h1>
        <p
          className="animate-fade-up mx-auto mt-6 max-w-xl text-[16px] leading-relaxed text-white/60"
          style={{ animationDelay: "2.2s" }}
        >
          Live prices for the full NSE universe, AI research in plain language, and a
          risk-free simulator — StockSense is how Indian investors turn market noise
          into decisions.
        </p>
      </div>

      {/* Bottom bar */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 pb-7">
        <a
          href="#about"
          className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/70 hover:text-white"
        >
          Scroll ↓
        </a>
        <span className="hidden h-8 w-px bg-white/25 sm:block" aria-hidden="true" />
        <div className="flex items-center gap-3">
          <span className="hidden text-[12px] text-white/60 sm:block">
            Tracking 2,678 NSE instruments, live all session
          </span>
          <span className="flex -space-x-2" aria-hidden="true">
            {["N", "S", "B"].map((c, i) => (
              <span
                key={c}
                className="grid h-7 w-7 place-items-center rounded-full border border-white/30 text-[10px] font-bold text-white"
                style={{
                  background: ["#1A56DB", "#7C3AED", "#06B6D4"][i],
                  zIndex: 3 - i,
                }}
              >
                {c}
              </span>
            ))}
          </span>
          <span className="text-[11px] font-medium text-white/70">Live market data</span>
        </div>
      </div>
    </section>
  );
}
