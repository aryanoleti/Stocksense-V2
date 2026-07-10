import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatPct } from "@/lib/format";

type Props = {
  value: number;
  className?: string;
  showIcon?: boolean;
  size?: "xs" | "sm" | "md";
};

const sizeMap = {
  xs: "text-[11px]",
  sm: "text-xs",
  md: "text-sm",
};

export function Delta({ value, className, showIcon = true, size = "sm" }: Props) {
  const tone =
    value > 0
      ? "text-(--color-up)"
      : value < 0
        ? "text-(--color-down)"
        : "text-(--color-fg-subtle)";
  const Icon = value > 0 ? ArrowUpRight : value < 0 ? ArrowDownRight : Minus;
  return (
    <span className={cn("inline-flex items-center gap-0.5 font-medium tabular", sizeMap[size], tone, className)}>
      {showIcon && <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />}
      {formatPct(value)}
    </span>
  );
}

export function DeltaValue({
  value,
  pct,
  className,
}: {
  value: number;
  pct: number;
  className?: string;
}) {
  const tone =
    pct > 0 ? "text-(--color-up)" : pct < 0 ? "text-(--color-down)" : "text-(--color-fg-subtle)";
  const sign = value > 0 ? "+" : "";
  return (
    <span className={cn("font-medium tabular text-xs", tone, className)}>
      {sign}
      {value.toFixed(2)} ({formatPct(pct)})
    </span>
  );
}
