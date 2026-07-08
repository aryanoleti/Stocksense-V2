export function formatINR(value: number, options: { compact?: boolean; decimals?: number } = {}) {
  const { compact = false, decimals = 2 } = options;
  if (compact) {
    return new Intl.NumberFormat("en-IN", {
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(value);
  }
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPct(value: number, withSign = true) {
  const sign = withSign && value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatDelta(value: number, withSign = true) {
  const sign = withSign && value > 0 ? "+" : value < 0 ? "" : "";
  return `${sign}${value.toFixed(2)}`;
}

export function rupee(value: number, opts?: { compact?: boolean; decimals?: number }) {
  return `₹${formatINR(value, opts)}`;
}

export function deltaTone(value: number) {
  if (value > 0) return "up" as const;
  if (value < 0) return "down" as const;
  return "flat" as const;
}
