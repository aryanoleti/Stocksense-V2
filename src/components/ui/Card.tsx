import { cn } from "@/lib/cn";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  elevated?: boolean;
  interactive?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
};

const padMap = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export function Card({
  className,
  elevated = false,
  interactive = false,
  padding = "md",
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "bg-(--color-surface) border border-(--color-border) rounded-2xl",
        elevated && "shadow-[0_6px_24px_-12px_rgba(13,31,23,0.10)]",
        interactive &&
          "transition-all hover:border-(--color-brand-300) hover:shadow-[0_12px_32px_-16px_rgba(13,31,23,0.14)] hover:-translate-y-0.5",
        padMap[padding],
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-start justify-between gap-3 mb-4", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-xs uppercase tracking-[0.10em] font-semibold text-(--color-fg-subtle)",
        className,
      )}
      {...props}
    />
  );
}

export function CardEyebrow({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "text-[11px] uppercase tracking-[0.14em] font-semibold text-(--color-fg-subtle)",
        className,
      )}
      {...props}
    />
  );
}
