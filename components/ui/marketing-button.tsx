import { forwardRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Ported from SOURCE stocksense's src/components/ui/Button.tsx. Renamed to
// MarketingButton (file: marketing-button.tsx) to avoid clashing with any
// existing DESTINATION button primitive, and scoped for use only within the
// `.stocksense-marketing` landing page tree (relies on --color-* tokens
// defined there — see app/globals.css).

type Variant = "primary" | "secondary" | "ghost" | "outline" | "subtle" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-medium tracking-tight rounded-xl whitespace-nowrap select-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--color-brand-700)] text-white hover:bg-[var(--color-brand-800)] shadow-[0_8px_24px_-12px_rgba(11,90,60,0.45)]",
  secondary:
    "bg-[var(--color-fg)] text-white hover:bg-[var(--color-brand-900)]",
  outline:
    "bg-[var(--color-surface)] text-[var(--color-fg)] border border-[var(--color-border-strong)] hover:bg-[var(--color-surface-2)]",
  ghost:
    "bg-transparent text-[var(--color-fg)] hover:bg-[var(--color-surface-2)]",
  subtle:
    "bg-[var(--color-brand-50)] text-[var(--color-brand-700)] hover:bg-[var(--color-brand-100)]",
  danger:
    "bg-[var(--color-down)] text-white hover:opacity-90",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-[15px]",
  lg: "h-12 px-6 text-base",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

type ButtonProps = CommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type LinkProps = CommonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { href: string };

export const MarketingButton = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps | LinkProps>(
  ({ variant = "primary", size = "md", className, children, ...props }, ref) => {
    const classes = cn(base, variants[variant], sizes[size], className);
    if ("href" in props && props.href) {
      const { href, ...rest } = props as LinkProps;
      return (
        <Link
          href={href}
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={classes}
          {...rest}
        >
          {children}
        </Link>
      );
    }
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={classes}
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {children}
      </button>
    );
  },
);
MarketingButton.displayName = "MarketingButton";
