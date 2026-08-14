"use client";

import Link from "next/link";
import { CONTACT, FOOTER_LINKS, type ParticleShape } from "../data";
import { ScrambleText } from "../ScrambleText";

/* The abyss floor. Hovering (or focusing) a link pulls the particle field
   behind into that link's formation; leaving lets it drift again. */
export function Contact({ onShape }: { onShape: (shape: ParticleShape) => void }) {
  return (
    <section
      id="contact"
      aria-label="Contact"
      className="relative flex min-h-[170vh] flex-col justify-end px-6 pb-10 pt-64 sm:px-10"
    >
      <div className="mx-auto w-full max-w-6xl">
        <p className="font-mono text-[10px] uppercase tracking-[0.45em] text-[#5c93b0]">
          Next
        </p>
        <h2 className="mt-4 text-4xl font-light uppercase tracking-[0.03em] text-[#eaf6ff] sm:text-6xl lg:text-7xl">
          <ScrambleText text={CONTACT.heading} duration={1000} />
        </h2>

        <a
          href={`mailto:${CONTACT.email}`}
          data-cursor="MAIL"
          onMouseEnter={() => onShape("ring")}
          onMouseLeave={() => onShape("idle")}
          onFocus={() => onShape("ring")}
          onBlur={() => onShape("idle")}
          className="gl-focus mt-8 inline-block border-b border-[#6fd4a8]/50 pb-1 font-mono text-sm uppercase tracking-[0.2em] text-[#6fd4a8] transition-colors hover:border-[#a8ffe0] hover:text-[#a8ffe0] sm:text-lg"
        >
          {CONTACT.email}
        </a>

        <nav aria-label="Social links" className="mt-12">
          <ul className="flex flex-wrap gap-x-10 gap-y-4">
            {CONTACT.links
              .filter((l) => l.label !== "EMAIL")
              .map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    data-cursor="LINK"
                    {...(l.href.startsWith("http")
                      ? { target: "_blank", rel: "noreferrer noopener" }
                      : {})}
                    onMouseEnter={() => onShape(l.shape)}
                    onMouseLeave={() => onShape("idle")}
                    onFocus={() => onShape(l.shape)}
                    onBlur={() => onShape("idle")}
                    className="gl-focus font-mono text-[11px] uppercase tracking-[0.35em] text-[#9fc9de] transition-colors hover:text-[#eaf6ff]"
                  >
                    {l.label}
                    <span aria-hidden="true"> ↗</span>
                  </a>
                </li>
              ))}
          </ul>
        </nav>

        <div className="mt-16 flex flex-col gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-[#41647c]">
          <p>{CONTACT.availability}</p>
          <p>{CONTACT.location}</p>
        </div>

        {/* Compact in-app destinations — every link is a real route */}
        <nav aria-label="Product" className="mt-14 border-t border-[#123249] pt-8">
          <ul className="flex flex-wrap gap-x-7 gap-y-3">
            {FOOTER_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  data-cursor="OPEN"
                  className="gl-focus text-[12px] text-[#7fb2cc] transition-colors hover:text-[#eaf6ff]"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-10 flex flex-col justify-between gap-3 border-t border-[#123249] pt-6 text-[11px] leading-relaxed text-[#41647c] sm:flex-row">
          <p>© {new Date().getFullYear()} StockSense. Not a SEBI-registered advisor — always do your own research.</p>
          <p className="sm:text-right">
            Investments in the securities market are subject to market risks.
          </p>
        </div>
      </div>
    </section>
  );
}
