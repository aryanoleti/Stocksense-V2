import { forwardRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "subtle" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-medium tracking-tight rounded-xl whitespace-nowrap select-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

const variants: Record<Variant, string> = {
  primary:
    "bg-(--color-brand-700) text-white hover:bg-(--color-brand-800) shadow-[0_8px_24px_-12px_rgba(11,90,60,0.45)]",
  secondary:
    "bg-(--color-fg) text-white hover:bg-(--color-brand-900)",
  outline:
    "bg-(--color-surface) text-(--color-fg) border border-(--color-border-strong) hover:bg-(--color-surface-2)",
  ghost:
    "bg-transparent text-(--color-fg) hover:bg-(--color-surface-2)",
  subtle:
    "bg-(--color-brand-50) text-(--color-brand-700) hover:bg-(--color-brand-100)",
  danger:
    "bg-(--color-down) text-white hover:opacity-90",
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

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps | LinkProps>(
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
Button.displayName = "Button";
