"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { BRAND, SECTIONS, type SectionId } from "./data";

const LABELS: Record<SectionId, string> = {
  hero: "HOME",
  platform: "PLATFORM",
  about: "MISSION",
  contact: "CONTACT",
};

/* Full-screen INDEX overlay. Escape closes, focus is trapped while open and
   returned to the trigger on close; body scroll stays locked only while
   mounted-open so there is no way to strand the page unscrollable. */
export function IndexMenu({
  open,
  onClose,
  onNavigate,
}: {
  open: boolean;
  onClose: () => void;
  onNavigate: (id: SectionId) => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const panel = panelRef.current;
    const focusables = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? []
      );
    focusables()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "Tab") {
        const items = focusables();
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label="Site index"
      className="gl-menu fixed inset-0 z-[70] flex flex-col bg-[#123a52]/95 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between px-6 py-5 sm:px-10">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.5em] text-[#d7f2ff]">Index</p>
        <button
          type="button"
          onClick={onClose}
          data-cursor="CLOSE"
          className="gl-focus font-mono text-[11px] font-bold uppercase tracking-[0.35em] text-white hover:text-[#8fecc4]"
        >
          Close ✕
        </button>
      </div>

      <nav className="flex flex-1 flex-col items-start justify-center gap-2 px-6 sm:px-10" aria-label="Sections">
        {SECTIONS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            data-cursor="GO"
            onClick={() => {
              onNavigate(s.id);
              onClose();
            }}
            className="gl-focus gl-menu-item group flex items-baseline gap-5 py-2 text-left"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <span className="font-mono text-[11px] font-bold tabular-nums text-[#a8cfe4]">
              0{i}
            </span>
            <span className="text-4xl font-extrabold uppercase tracking-[-0.01em] text-white transition-colors group-hover:text-[#8fecc4] sm:text-6xl">
              {LABELS[s.id]}
            </span>
          </button>
        ))}
      </nav>

      <div className="flex flex-col gap-4 border-t border-white/15 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-10">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-[#a8cfe4]">
          {BRAND.tagline}
        </p>
        <div className="flex gap-6">
          <Link
            href="/dashboard/"
            data-cursor="OPEN"
            className="gl-focus font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-[#8fecc4] hover:text-[#a8ffe0]"
          >
            {BRAND.enterCta} →
          </Link>
          <Link
            href="/dashboard/"
            data-cursor="OPEN"
            className="gl-focus font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-[#d7f2ff] hover:text-white"
          >
            {BRAND.signIn}
          </Link>
        </div>
      </div>
    </div>
  );
}
