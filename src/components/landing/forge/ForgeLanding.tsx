"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { AdaptiveDpr, Preload } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, Noise } from "@react-three/postprocessing";
import { HeroStage } from "./three/HeroStage";
import { ShardStage } from "./three/ShardStage";
import { PortalStage } from "./three/PortalStage";
import { DetailView } from "./DetailView";
import { AmbientAudio } from "./audio";
import {
  Annotation,
  LegalBlock,
  Manifesto,
  PreloadTicker,
  SoundToggle,
  StatReadout,
  Wordmark,
} from "./Hud";
import { ENTRIES, SCULPTURES, SOCIAL, type PortfolioEntry } from "./data";

/* Scroll choreography. The page is one tall scroller; these fractions map
   scroll position onto the three scenes, with overlap so each hand-off is a
   cross-fade rather than a cut.

     0.00 – 0.18   hero holds
     0.18 – 0.26   hero dissolves into the carousel
     0.26 – 0.70   four portfolio cards, one per step
     0.70 – 0.78   carousel dissolves into the portal
     0.78 – 1.00   portal → particles → pedestal
*/
const HERO_END = 0.18;
const CARD_START = 0.26;
const CARD_END = 0.7;
const PORTAL_START = 0.78;

/* The canvas is fixed to the viewport, so its size is simply the window's.
   Driving setSize from resize events rather than leaning on the observer
   keeps it correct even when the page starts hidden, where a ResizeObserver
   may never deliver its first callback and the canvas would stay 300x150. */
function ViewportSync() {
  const setSize = useThree((s) => s.setSize);
  useEffect(() => {
    const apply = () => setSize(window.innerWidth, window.innerHeight);
    // timer rather than rAF: rAF does not run in a hidden tab
    const t = window.setTimeout(apply, 0);
    window.addEventListener("resize", apply);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", apply);
    };
  }, [setSize]);
  return null;
}

/* Dev-only handle on the R3F store, used to drive and inspect frames from
   tests. Stripped from production builds by the NODE_ENV check. */
function DevProbe() {
  const store = useThree((s) => s);
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    (window as unknown as { __forge?: unknown }).__forge = store;
  }, [store]);
  return null;
}

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}
function span(p: number, a: number, b: number) {
  return clamp01((p - a) / (b - a));
}

export function ForgeLanding() {
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [detail, setDetail] = useState<PortfolioEntry | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [fracture, setFracture] = useState(0);
  const [sculptIndex, setSculptIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const audioRef = useRef<AmbientAudio | null>(null);
  const reduced = useRef(false);
  const lastCard = useRef(-1);

  const quality: "high" | "low" = useMemo(() => {
    if (typeof window === "undefined") return "high";
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    return coarse || window.innerWidth < 900 || (mem !== undefined && mem <= 4) ? "low" : "high";
  }, []);

  /* WebGL availability decides between the scene and the readable fallback.
     Deferred a frame so no setState runs synchronously in the effect body. */
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      reduced.current = still;
      setReducedMotion(still);
      try {
        const probe = document.createElement("canvas");
        const gl = probe.getContext("webgl2") ?? probe.getContext("webgl");
        if (!gl) setFailed(true);
        else (gl.getExtension("WEBGL_lose_context") as { loseContext(): void } | null)?.loseContext();
      } catch {
        setFailed(true);
      }
    });
    return () => cancelAnimationFrame(id);
  }, []);

  /* ---- scroll → progress ----
     The scrollable height is cached and only re-measured on resize, so the
     scroll handler itself reads one property and never forces layout. */
  useEffect(() => {
    let max = 1;
    const measure = () => {
      max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    };
    const onScroll = () => setProgress(clamp01(window.scrollY / max));
    const onResize = () => {
      measure();
      onScroll();
    };
    measure();
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  /* ---- derived stage state ---- */
  const heroWeight = 1 - span(progress, HERO_END, CARD_START);
  const cardsWeight =
    span(progress, HERO_END, CARD_START) * (1 - span(progress, CARD_END, PORTAL_START));
  const portalWeight = span(progress, CARD_END, PORTAL_START);
  const portalProgress = span(progress, PORTAL_START - 0.06, 1);

  const cardFloat = clamp01((progress - CARD_START) / (CARD_END - CARD_START)) * ENTRIES.length;
  const activeIndex = Math.min(ENTRIES.length - 1, Math.floor(cardFloat));
  const withinCard = clamp01(cardFloat - activeIndex);
  const entry = ENTRIES[activeIndex];

  /* audio cue when the visitor crosses into a new card */
  useEffect(() => {
    if (cardsWeight < 0.4) return;
    if (lastCard.current !== activeIndex) {
      lastCard.current = activeIndex;
      audioRef.current?.cue(320 + activeIndex * 90);
    }
  }, [activeIndex, cardsWeight]);

  /* R3F only mounts the scene once it has measured a non-zero size, and that
     measurement comes from a ResizeObserver which may never deliver its first
     callback if the page starts out hidden — leaving a 300x150 canvas and no
     scene at all. The measure hook also listens for window resize, so nudging
     one on mount breaks that deadlock. Unconditional, because anything gated
     on the canvas being ready is itself unreachable in that state. */
  useEffect(() => {
    const kick = () => window.dispatchEvent(new Event("resize"));
    const a = window.setTimeout(kick, 0);
    const b = window.setTimeout(kick, 250);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, []);

  const toggleSound = useCallback(() => {
    if (!audioRef.current) audioRef.current = new AmbientAudio();
    setSoundOn(audioRef.current.toggle());
  }, []);
  useEffect(() => () => audioRef.current?.dispose(), []);

  /* ---- shard click: fracture, then dissolve to the dark page ---- */
  const openDetail = useCallback(
    (e: PortfolioEntry) => {
      audioRef.current?.cue(180, 0.9);
      if (reduced.current) {
        setDetail(e);
        setDetailOpen(true);
        return;
      }
      let t = 0;
      const shatter = () => {
        t += 1 / 60;
        setFracture(Math.min(1, t / 0.42));
        if (t < 0.42) requestAnimationFrame(shatter);
        else {
          setDetail(e);
          setDetailOpen(true);
          setFracture(0);
        }
      };
      requestAnimationFrame(shatter);
    },
    []
  );

  const closeDetail = useCallback(() => setDetailOpen(false), []);

  const cycleSculpture = useCallback((dir: number) => {
    setSculptIndex((i) => (i + dir + SCULPTURES.length) % SCULPTURES.length);
  }, []);

  /* HUD tone flips to light text once the world goes dark at the portal */
  const darkChrome = portalWeight > 0.5;
  const chromeTone = darkChrome ? "light" : "dark";

  return (
    <div className={`fg-root ${failed ? "fg-fallback" : ""}`}>
      {/* One persistent canvas behind everything, at z-0: a negative index
          would escape this wrapper and hide behind the opaque body colour. */}
      {!failed && (
        <div className="fixed inset-0 z-0">
          <Canvas
            dpr={quality === "high" ? [1, 1.75] : [1, 1.35]}
            gl={{ antialias: quality === "high", powerPreference: "high-performance" }}
            camera={{ position: [0, 0.6, 7.2], fov: 45 }}
            onCreated={() => setReady(true)}
            fallback={null}
            frameloop={reducedMotion ? "demand" : "always"}
            /* measure immediately: the debounced observer can miss its first
               callback when the page starts out hidden, which leaves the
               canvas at its 300x150 default */
            resize={{ debounce: 0, scroll: false }}
          >
            <color attach="background" args={[darkChrome ? "#0d0f12" : "#d8dde2"]} />
            <fog attach="fog" args={[darkChrome ? "#0d0f12" : "#d8dde2", 8, 34]} />

            {heroWeight > 0.01 && (
              <HeroStage visible quality={quality} opacity={heroWeight} />
            )}
            {cardsWeight > 0.01 && (
              <ShardStage
                entries={ENTRIES}
                activeIndex={activeIndex}
                progressWithin={withinCard}
                fracture={fracture}
                quality={quality}
                onOpen={openDetail}
              />
            )}
            {portalWeight > 0.01 && (
              <PortalStage
                progress={portalProgress}
                glyph={SCULPTURES[sculptIndex]}
                quality={quality}
              />
            )}

            <EffectComposer enableNormalPass={false}>
              <Bloom intensity={0.55} luminanceThreshold={0.75} luminanceSmoothing={0.3} mipmapBlur />
              <Vignette eskil={false} offset={0.22} darkness={0.55} />
              <Noise opacity={0.028} />
            </EffectComposer>

            <ViewportSync />
            <DevProbe />
            <AdaptiveDpr pixelated={false} />
            <Preload all />
          </Canvas>
        </div>
      )}
      {failed && <div className="fg-fallback-bg fixed inset-0 z-0" aria-hidden="true" />}

      {/* Scroll track. Height defines how long the sequence lasts. */}
      <div style={{ height: "560vh" }} aria-hidden="true" />

      {/* ------------------------------------------------------------- */}
      {/* Fixed HUD overlay */}
      <div
        className={`pointer-events-none fixed inset-0 z-10 transition-colors duration-700 ${
          darkChrome ? "text-[#e8ecef]" : "text-[#1b1f24]"
        }`}
      >
        <a href="#content" className="fg-skip pointer-events-auto">
          Skip to content
        </a>

        {/* top-left: wordmark + copyright */}
        <div className="pointer-events-auto absolute left-6 top-6 sm:left-10 sm:top-8">
          <Wordmark glow={darkChrome} />
          <LegalBlock />
        </div>

        {/* top-right: manifesto — hero only, per the spec */}
        <div
          className="absolute right-6 top-6 transition-opacity duration-500 sm:right-10 sm:top-8"
          style={{ opacity: heroWeight }}
        >
          <Manifesto />
        </div>

        {/* bottom-left: sound toggle, persistent on every stage */}
        <div className="pointer-events-auto absolute bottom-6 left-6 sm:bottom-8 sm:left-10">
          <SoundToggle on={soundOn} onToggle={toggleSound} tone={chromeTone} />
        </div>

        {/* ---- carousel annotations ---- */}
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{ opacity: cardsWeight, visibility: cardsWeight > 0.02 ? "visible" : "hidden" }}
        >
          <PreloadTicker
            text={`PRE-LOAD ${entry.index}/${String(ENTRIES.length).padStart(2, "0")}`}
            className="absolute left-6 top-1/2 -translate-y-1/2 [writing-mode:vertical-rl] sm:left-10"
          />

          <Annotation
            lines={[`PORTFOLIO_${entry.index}`, entry.name]}
            side="left"
            className="absolute left-[8%] top-[24%] sm:left-[14%] lg:left-[18%]"
          />

          <StatReadout
            label={entry.stat.label}
            value={entry.stat.value}
            delta={entry.stat.delta}
            className="absolute right-6 top-1/2 -translate-y-1/2 sm:right-10"
          />

          <div className="pointer-events-auto absolute bottom-[22%] right-[8%] sm:right-[12%] lg:right-[16%]">
            <Annotation
              lines={[`D ${entry.date}`, "CLICK TO EXPLORE"]}
              side="right"
              as="button"
              onClick={() => openDetail(entry)}
            />
          </div>

          {/* card position indicator */}
          <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-2" aria-hidden="true">
            {ENTRIES.map((e, i) => (
              <span
                key={e.slug}
                className={`h-1 w-6 transition-opacity ${i === activeIndex ? "opacity-90" : "opacity-25"} bg-current`}
              />
            ))}
          </div>
        </div>

        {/* ---- portal / sculpture stage ---- */}
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{ opacity: portalWeight, visibility: portalWeight > 0.02 ? "visible" : "hidden" }}
        >
          {/* arrows cycle the sculpture, appearing once it has formed */}
          <div
            className="pointer-events-auto absolute inset-y-0 left-0 flex items-center pl-4 sm:pl-8"
            style={{
              opacity: portalProgress > 0.55 ? 1 : 0,
              visibility: portalProgress > 0.55 ? "visible" : "hidden",
            }}
          >
            <button
              type="button"
              onClick={() => cycleSculpture(-1)}
              aria-label="Previous sculpture"
              className="fg-focus font-mono text-2xl opacity-60 transition-opacity hover:opacity-100"
            >
              ‹
            </button>
          </div>
          <div
            className="pointer-events-auto absolute inset-y-0 right-0 flex items-center pr-4 sm:pr-8"
            style={{
              opacity: portalProgress > 0.55 ? 1 : 0,
              visibility: portalProgress > 0.55 ? "visible" : "hidden",
            }}
          >
            <button
              type="button"
              onClick={() => cycleSculpture(1)}
              aria-label="Next sculpture"
              className="fg-focus font-mono text-2xl opacity-60 transition-opacity hover:opacity-100"
            >
              ›
            </button>
          </div>

          {/* footer links, revealed with the pedestal */}
          <nav
            aria-label="Elsewhere"
            className="pointer-events-auto absolute bottom-16 left-1/2 flex -translate-x-1/2 items-center gap-8 transition-opacity duration-700 sm:gap-14"
            style={{
              opacity: portalProgress > 0.82 ? 1 : 0,
              // hide from the tab order until it is actually on screen
              visibility: portalProgress > 0.82 ? "visible" : "hidden",
            }}
          >
            {SOCIAL.map((s, i) => (
              <a
                key={s.href}
                href={s.href}
                target={s.href.startsWith("http") ? "_blank" : undefined}
                rel={s.href.startsWith("http") ? "noreferrer" : undefined}
                className="fg-focus font-mono text-[11px] uppercase tracking-[0.24em] opacity-70 transition-opacity hover:opacity-100 sm:text-[12px]"
              >
                {i === 1 && <span aria-hidden="true" className="mr-2 opacity-50">[</span>}
                {s.label}
                {i === 1 && <span aria-hidden="true" className="ml-2 opacity-50">]</span>}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Readable content for assistive tech and no-WebGL clients. The scene
          carries the experience; this carries the information. */}
      <main id="content" className="fg-readable">
        <h1>StockSense — an Indian market terminal</h1>
        <p>{ENTRIES.length} modules, live NSE data, and a transparent quant model.</p>
        <ul>
          {ENTRIES.map((e) => (
            <li key={e.slug}>
              <a href={e.href}>{e.name}</a> — {e.summary[0]}
            </li>
          ))}
        </ul>
      </main>

      {!ready && !failed && (
        <div className="fg-boot fixed inset-0 z-50 flex items-center justify-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-[#1b1f24] opacity-60">
            Preparing scene
          </p>
        </div>
      )}

      <DetailView
        entry={detail}
        open={detailOpen}
        soundOn={soundOn}
        onToggleSound={toggleSound}
        onClose={closeDetail}
      />
    </div>
  );
}
