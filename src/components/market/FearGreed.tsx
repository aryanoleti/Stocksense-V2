export function FearGreed({ value = 62 }: { value?: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  const angle = (clamped / 100) * 180 - 90;
  const label =
    clamped < 25 ? "Extreme Fear" : clamped < 45 ? "Fear" : clamped < 55 ? "Neutral" : clamped < 75 ? "Greed" : "Extreme Greed";
  const tone =
    clamped < 25
      ? "var(--color-down)"
      : clamped < 45
        ? "#dc6c1c"
        : clamped < 55
          ? "#b27a00"
          : clamped < 75
            ? "#1f7a4f"
            : "var(--color-up)";

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 120" className="h-32 w-full max-w-[260px]">
        <defs>
          <linearGradient id="fg" x1="0" x2="1">
            <stop offset="0%" stopColor="#c4361c" />
            <stop offset="35%" stopColor="#dc6c1c" />
            <stop offset="55%" stopColor="#b27a00" />
            <stop offset="80%" stopColor="#1f7a4f" />
            <stop offset="100%" stopColor="#088a52" />
          </linearGradient>
        </defs>
        <path d="M 14 100 A 86 86 0 0 1 186 100" stroke="url(#fg)" strokeWidth="14" strokeLinecap="round" fill="none" />
        <g transform={`translate(100 100) rotate(${angle})`}>
          <line x1="0" y1="0" x2="0" y2="-72" stroke={tone} strokeWidth="3" strokeLinecap="round" />
          <circle r="6" fill={tone} />
          <circle r="2.5" fill="white" />
        </g>
      </svg>
      <p className="-mt-2 text-[36px] font-semibold tabular tracking-tight" style={{ color: tone }}>
        {clamped}
      </p>
      <p className="mt-1 text-[12.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: tone }}>
        {label}
      </p>
      <p className="mt-3 max-w-[260px] text-center text-[12px] leading-relaxed text-(--color-fg-muted)">
        A composite indicator of market sentiment based on volatility, momentum and breadth.
      </p>
    </div>
  );
}
