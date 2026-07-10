import { cn } from "@/lib/cn";

type Tone = "neutral" | "brand" | "up" | "down" | "warn" | "info" | "outline";

const toneMap: Record<Tone, string> = {
  neutral: "bg-(--color-surface-2) text-(--color-fg-muted) border border-(--color-border)",
  brand: "bg-(--color-brand-50) text-(--color-brand-700) border border-(--color-brand-100)",
  up: "bg-(--color-up-soft) text-(--color-up) border border-[color-mix(in_srgb,var(--color-up)_22%,white)]",
  down: "bg-(--color-down-soft) text-(--color-down) border border-[color-mix(in_srgb,var(--color-down)_22%,white)]",
  warn: "bg-[color-mix(in_srgb,var(--color-warn)_14%,white)] text-(--color-warn) border border-[color-mix(in_srgb,var(--color-warn)_30%,white)]",
  info: "bg-[color-mix(in_srgb,var(--color-info)_10%,white)] text-(--color-info) border border-[color-mix(in_srgb,var(--color-info)_24%,white)]",
  outline: "bg-transparent text-(--color-fg-muted) border border-(--color-border-strong)",
};

export function Badge({
  tone = "neutral",
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-medium tabular tracking-tight",
        toneMap[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function LiveDot({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-(--color-up)",
        className,
      )}
    >
      <span className="relative inline-flex h-2 w-2">
        <span className="absolute inset-0 rounded-full bg-(--color-up) animate-pulse-dot" />
        <span className="absolute inset-0 rounded-full bg-(--color-up)/60" />
      </span>
      Live
    </span>
  );
}
