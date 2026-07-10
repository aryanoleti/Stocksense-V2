import { forwardRef } from "react";
import { cn } from "@/lib/cn";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-xl border border-(--color-border-strong) bg-(--color-surface) px-3.5 text-[15px] text-(--color-fg) placeholder:text-(--color-fg-subtle) focus:border-(--color-brand-500) focus:ring-4 focus:ring-(--color-brand-100) focus:outline-none",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "text-[11px] uppercase tracking-[0.12em] font-semibold text-(--color-fg-subtle)",
        className,
      )}
      {...props}
    />
  );
}
