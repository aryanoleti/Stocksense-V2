"use client";

import { useEffect, useRef, useState } from "react";
import { LogOut, User } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";

export function UserMenu() {
  const { user, signOut, openSignIn } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  if (!user) {
    return (
      <button
        type="button"
        onClick={openSignIn}
        className="inline-flex h-10 items-center gap-2 rounded-xl bg-(--color-brand-700) px-4 text-[13px] font-semibold text-white hover:bg-(--color-brand-800)"
      >
        Sign in
      </button>
    );
  }

  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
  const handle = user.email.split("@")[0];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2.5 rounded-xl border border-(--color-border) bg-(--color-surface) px-2 py-1.5 hover:bg-(--color-surface-2)"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar src={user.picture} initials={initials} />
        <span className="hidden sm:block text-left">
          <span className="block text-[13px] font-semibold leading-tight text-(--color-fg)">{handle}</span>
          <span className="block text-[11px] text-(--color-fg-subtle)">Signed in</span>
        </span>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] w-72 overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface) shadow-[0_24px_60px_-24px_rgba(13,31,23,0.22)] animate-fade-up"
        >
          <div className="flex items-center gap-3 border-b border-(--color-border) px-4 py-4">
            <Avatar src={user.picture} initials={initials} size="lg" />
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold tracking-tight text-(--color-fg)">{user.name}</p>
              <p className="truncate text-[12px] text-(--color-fg-subtle)">{user.email}</p>
            </div>
          </div>
          <ul className="py-1.5">
            <li>
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-3 px-4 py-2 text-left text-[13.5px] text-(--color-fg) hover:bg-(--color-surface-2)"
              >
                <User className="h-3.5 w-3.5 text-(--color-fg-subtle)" />
                Profile
              </button>
            </li>
            <li>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  signOut();
                }}
                className="flex w-full items-center gap-3 px-4 py-2 text-left text-[13.5px] text-(--color-down) hover:bg-(--color-down-soft)"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

function Avatar({
  src,
  initials,
  size = "md",
}: {
  src?: string;
  initials: string;
  size?: "md" | "lg";
}) {
  const dim = size === "lg" ? "h-10 w-10 text-[14px]" : "h-7 w-7 text-[12px]";
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt=""
        referrerPolicy="no-referrer"
        className={`${dim} rounded-full border border-(--color-border) object-cover`}
      />
    );
  }
  return (
    <span className={`${dim} grid place-items-center rounded-full bg-(--color-brand-700) font-semibold text-white`}>
      {initials || "U"}
    </span>
  );
}
