"use client";

import { BRAND, SOUND_LABEL } from "./data";

/* Fixed HUD chrome. Positions are identical across every stage so the
   overlay feels like an instrument panel the scenes move behind. */

export function Wordmark({ glow = false }: { glow?: boolean }) {
  return (
    <div className="relative">
      {glow && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-x-6 -inset-y-4 rounded-full bg-white/25 blur-2xl"
        />
      )}
      <p className="relative font-mono text-[15px] font-extrabold uppercase leading-none tracking-[0.32em] sm:text-[17px]">
        {BRAND.wordmark}
      </p>
    </div>
  );
}

export function LegalBlock() {
  return (
    <div className="mt-3 space-y-0.5 font-mono text-[9px] uppercase leading-relaxed tracking-[0.18em] opacity-45 sm:text-[10px]">
      {BRAND.legal.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  );
}

export function Manifesto() {
  return (
    <div className="max-w-[15rem] text-right sm:max-w-[19rem]">
      <p className="font-mono text-[9px] uppercase tracking-[0.28em] opacity-70 sm:text-[10px]">
        {BRAND.manifestoLabel}
      </p>
      <p className="mt-3 font-mono text-[10px] font-light leading-relaxed tracking-[0.06em] opacity-65 sm:text-[11px]">
        {BRAND.manifesto}
      </p>
    </div>
  );
}

export function SoundToggle({
  on,
  onToggle,
  tone = "dark",
}: {
  on: boolean;
  onToggle: () => void;
  tone?: "dark" | "light";
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      aria-label={on ? "Turn ambient sound off" : "Turn ambient sound on"}
      className={`fg-focus flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] transition-opacity hover:opacity-100 sm:text-[11px] ${
        tone === "dark" ? "text-[#1b1f24]" : "text-[#e8ecef]"
      } opacity-75`}
    >
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M3 6h2.5L9 3v10L5.5 10H3V6Z" fill="currentColor" />
        {on ? (
          <>
            <path d="M11 5.5c1 .8 1 4.2 0 5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
            <path d="M12.8 3.8c1.9 1.6 1.9 6.8 0 8.4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
          </>
        ) : (
          <path d="M11 6l3.5 4M14.5 6L11 10" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
        )}
      </svg>
      {on ? SOUND_LABEL.on : SOUND_LABEL.off}
    </button>
  );
}

/* An annotation tethered to a point on the model by a thin diagonal rule.
   `side` decides which way the leader runs, so labels sit clear of the shard. */
export function Annotation({
  lines,
  side,
  className = "",
  as = "div",
  onClick,
  underline = true,
}: {
  lines: [string, string];
  side: "left" | "right";
  className?: string;
  as?: "div" | "button";
  onClick?: () => void;
  underline?: boolean;
}) {
  const leader = (
    <svg
      className={`absolute top-full ${side === "left" ? "left-full" : "right-full"} h-14 w-24 overflow-visible`}
      viewBox="0 0 96 56"
      fill="none"
      aria-hidden="true"
      style={side === "right" ? { transform: "scaleX(-1)" } : undefined}
    >
      {/* 1px diagonal running from the label's edge to the anchor point */}
      <path d="M0 0 L60 40" stroke="currentColor" strokeWidth="1" opacity="0.55" vectorEffect="non-scaling-stroke" />
      <circle cx="60" cy="40" r="1.8" fill="currentColor" opacity="0.8" />
    </svg>
  );

  const body = (
    <>
      <span className="block font-mono text-[10px] uppercase leading-relaxed tracking-[0.24em] opacity-60 sm:text-[11px]">
        {lines[0]}
      </span>
      <span className="block font-mono text-[11px] font-bold uppercase leading-relaxed tracking-[0.24em] sm:text-[13px]">
        {lines[1]}
      </span>
      {underline && <span className="mt-1.5 block h-px w-full bg-current opacity-45" />}
      {leader}
    </>
  );

  const shared = `relative inline-block ${side === "left" ? "text-left" : "text-right"} ${className}`;

  if (as === "button") {
    return (
      <button type="button" onClick={onClick} className={`fg-focus group ${shared} transition-opacity hover:opacity-70`}>
        {body}
      </button>
    );
  }
  return <div className={shared}>{body}</div>;
}

/* Right-hand telemetry readout. Values are simulated and labelled SIM so they
   are never mistaken for live market data. */
export function StatReadout({
  label,
  value,
  delta,
  className = "",
}: {
  label: string;
  value: string;
  delta: string;
  className?: string;
}) {
  return (
    <div className={`text-right font-mono uppercase tabular-nums ${className}`}>
      <p className="text-[10px] tracking-[0.24em] opacity-60 sm:text-[11px]">
        {label}
        <span className="ml-3 opacity-100">{value}</span>
      </p>
      <p className="text-[10px] tracking-[0.24em] opacity-60 sm:text-[11px]">{delta}</p>
    </div>
  );
}

/* Decorative loading chatter — deliberately low-contrast background texture. */
export function PreloadTicker({ text, className = "" }: { text: string; className?: string }) {
  return (
    <p
      aria-hidden="true"
      className={`font-mono text-[9px] uppercase tracking-[0.3em] opacity-[0.18] sm:text-[10px] ${className}`}
    >
      {text}
    </p>
  );
}
