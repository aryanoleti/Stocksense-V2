"use client";

/* Boot screen. The percentage is real — it tracks the world's init steps —
   so it never lies about progress; it only eases the displayed number. */
export function Loader({ progress, done }: { progress: number; done: boolean }) {
  const pct = Math.round(progress * 100);
  return (
    <div
      className={`gl-loader fixed inset-0 z-[80] flex flex-col items-center justify-center bg-[#04101c] transition-opacity duration-700 ${
        done ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      aria-hidden={done}
      role="status"
      aria-label={`Loading ${pct}%`}
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.5em] text-[#7fb2cc]">
        StockSense
      </p>
      <p className="mt-6 font-mono text-6xl font-light tabular-nums text-[#eaf6ff] sm:text-7xl">
        {pct.toString().padStart(3, "0")}
        <span className="text-[#4d7a94]">%</span>
      </p>
      <div className="mt-8 h-px w-56 overflow-hidden bg-[#123249]">
        <div
          className="h-full bg-gradient-to-r from-[#7fd8e8] to-[#6fd4a8] transition-[width] duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.35em] text-[#41647c]">
        {pct < 100 ? "Preparing scene" : "Ready"}
      </p>
    </div>
  );
}
