"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GlacierWorld, Quality } from "./three/world";
import { LandingAudio } from "./audio";
import { MODULES, SECTIONS, BRAND, type ParticleShape, type SectionId } from "./data";
import { Loader } from "./Loader";
import { Cursor } from "./Cursor";
import { IndexMenu } from "./IndexMenu";
import { Hero } from "./sections/Hero";
import { Platform } from "./sections/Platform";
import { About } from "./sections/About";
import { Contact } from "./sections/Contact";

/* Root of the glacier landing: owns the WebGL world, scroll → scene mapping,
   the INDEX menu, HUD, audio and the no-WebGL fallback. All page content is
   plain DOM on top of one persistent canvas. */
export function GlacierLanding() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const worldRef = useRef<GlacierWorld | null>(null);
  const audioRef = useRef<LandingAudio | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const platformRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  const [loadFrac, setLoadFrac] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [fallback, setFallback] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [activeStage, setActiveStage] = useState(0);
  const [audioOn, setAudioOn] = useState(false);
  const reducedRef = useRef(false);
  /* cached geometry so the scroll handler never reads layout */
  const geomRef = useRef({ maxScroll: 1, vh: 1, tops: [0, 0, 0, 0] });

  /* ---- layout measurement: DOM offsets → progress fractions ---- */
  const measure = useCallback(() => {
    const platform = platformRef.current;
    const about = aboutRef.current;
    const contact = contactRef.current;
    if (!platform || !about || !contact) return;
    const vh = window.innerHeight;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - vh);
    const top = (el: HTMLElement) => el.getBoundingClientRect().top + window.scrollY;
    const f = (y: number) => Math.min(1, Math.max(0, y / maxScroll));
    const platTop = top(platform);
    geomRef.current = {
      maxScroll,
      vh,
      tops: [heroRef.current ? top(heroRef.current) : 0, platTop, top(about), top(contact)],
    };
    const world = worldRef.current;
    if (!world) return; // geometry cached; the scene map follows once booted
    world.setLayout({
      hero: [0, f(platTop)],
      stages: MODULES.map((_, i) => [f(platTop + i * vh), f(platTop + (i + 1) * vh)]),
      about: [f(top(about) - vh * 0.3), f(top(about) + about.offsetHeight - vh)],
      contact: [f(top(contact) - vh * 0.2), 1],
    });
  }, []);

  /* ---- world boot (deferred so no setState runs sync in the effect;
         setTimeout rather than rAF so a background tab still boots) ---- */
  useEffect(() => {
    let cancelled = false;
    const boot = async () => {
      const canvas = canvasRef.current;
      if (!canvas || cancelled) return;
      reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const coarse = window.matchMedia("(pointer: coarse)").matches;
      const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
      const quality: Quality =
        coarse || window.innerWidth < 768 || (mem !== undefined && mem <= 4) ? "low" : "high";

      const fail = () => {
        setFallback(true);
        setLoaded(true);
        setIntroDone(true);
      };
      // escape hatch for broken GPU drivers (and for testing the fallback)
      if (new URLSearchParams(window.location.search).has("nogl")) {
        fail();
        return;
      }
      try {
        // dynamic import keeps three.js out of the initial bundle — the DOM
        // and loader paint first, the WebGL chunk streams in behind them
        const { GlacierWorld } = await import("./three/world");
        if (cancelled) return;
        const world = new GlacierWorld(canvas, { quality, reducedMotion: reducedRef.current });
        worldRef.current = world;
        // unrecoverable at runtime (crashing frames, dead context) → swap to
        // the CSS world rather than leaving a black canvas behind the text
        world.onFatal = () => {
          if (cancelled) return;
          worldRef.current = null;
          world.dispose();
          fail();
        };
        await world.init((f) => !cancelled && setLoadFrac(f));
        if (cancelled) return;
        world.resize(window.innerWidth, window.innerHeight);
        measure();
        // section heights can drift a hair once webfonts settle — remap then
        document.fonts?.ready.then(() => !cancelled && measure()).catch(() => {});
        setLoaded(true);
        world.playIntro();
        world.start();
        if (reducedRef.current) {
          setIntroDone(true);
          world.renderOnce();
        } else {
          window.setTimeout(() => setIntroDone(true), 2200);
        }
        // watchdog: if not a single frame rendered a few seconds after boot,
        // the rAF chain or GPU is dead in a way we couldn't detect — bail out.
        // A hidden tab pauses rAF legitimately, so re-arm instead of bailing.
        const watchdog = () => {
          if (cancelled || worldRef.current !== world) return;
          if (world.framesRendered > 0) return;
          if (document.hidden) {
            window.setTimeout(watchdog, 4000);
            return;
          }
          world.onFatal?.();
        };
        window.setTimeout(watchdog, 4000);
      } catch {
        if (!cancelled) fail();
      }
    };
    // deferred so no setState runs synchronously inside the effect body
    const timerId = window.setTimeout(() => void boot(), 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timerId);
      worldRef.current?.dispose();
      worldRef.current = null;
    };
  }, [measure]);

  /* ---- scroll + resize + pointer wiring (also in fallback mode: the HUD,
         header contrast and section state still track the scroll) ---- */
  useEffect(() => {
    const onScroll = () => {
      const world = worldRef.current;
      const { maxScroll, vh, tops } = geomRef.current;
      const p = Math.min(1, window.scrollY / maxScroll);
      world?.setProgress(p);
      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleY(${p})`;
      }
      // active stage inside the pinned platform section
      const rel = window.scrollY - tops[1];
      setActiveStage(Math.min(MODULES.length - 1, Math.max(0, Math.floor(rel / vh))));
      // active section from the viewport midline
      const mid = window.scrollY + vh * 0.5;
      let idx = 0;
      for (let i = 0; i < tops.length; i++) if (mid >= tops[i]) idx = i;
      setActiveSection((prev) => {
        if (prev !== idx) audioRef.current?.chime(560 + idx * 140);
        return idx;
      });
    };
    const onResize = () => {
      worldRef.current?.resize(window.innerWidth, window.innerHeight);
      measure();
      onScroll();
    };
    const onPointer = (e: PointerEvent) => {
      worldRef.current?.setPointer(
        (e.clientX / window.innerWidth) * 2 - 1,
        -((e.clientY / window.innerHeight) * 2 - 1)
      );
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    if (window.matchMedia("(pointer: fine)").matches) {
      window.addEventListener("pointermove", onPointer, { passive: true });
    }
    onResize();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointer);
    };
    // re-runs once the world boots so the scene gets its layout + first frame
  }, [fallback, measure, loaded]);

  /* ---- navigation ---- */
  const scrollToSection = useCallback((id: SectionId) => {
    const map: Record<SectionId, React.RefObject<HTMLDivElement | null>> = {
      hero: heroRef,
      platform: platformRef,
      about: aboutRef,
      contact: contactRef,
    };
    map[id].current?.scrollIntoView({
      behavior: reducedRef.current ? "auto" : "smooth",
    });
  }, []);

  const jumpToStage = useCallback((i: number) => {
    window.scrollTo({
      top: geomRef.current.tops[1] + i * geomRef.current.vh + 2,
      behavior: reducedRef.current ? "auto" : "smooth",
    });
  }, []);

  const setShape = useCallback((shape: ParticleShape) => {
    worldRef.current?.setParticleShape(shape);
  }, []);

  const toggleAudio = useCallback(() => {
    if (!audioRef.current) audioRef.current = new LandingAudio();
    setAudioOn(audioRef.current.toggle());
  }, []);
  useEffect(() => () => audioRef.current?.dispose(), []);

  const onHeroSection = activeSection === 0;

  return (
    <div className={`gl-root relative ${fallback ? "gl-fallback" : ""}`}>
      <Loader progress={loadFrac} done={loaded} />

      {/* Persistent scene behind everything; CSS gradient world if no WebGL */}
      {!fallback && (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 -z-10 h-full w-full"
          aria-hidden="true"
        />
      )}
      {fallback && <div className="gl-fallback-bg fixed inset-0 -z-10" aria-hidden="true" />}

      {/* Skip link + chrome */}
      <a href="#platform" className="gl-skip gl-focus">
        Skip to content
      </a>
      <header className="fixed inset-x-0 top-0 z-50">
        <div
          className={`flex items-center justify-between px-6 py-5 transition-colors duration-700 sm:px-10 ${
            onHeroSection ? "text-[#0b2233]" : "text-[#eaf6ff]"
          }`}
        >
          <button
            type="button"
            data-cursor="TOP"
            onClick={() => scrollToSection("hero")}
            className="gl-focus font-mono text-[13px] font-semibold uppercase tracking-[0.35em]"
            aria-label="StockSense — back to top"
          >
            {BRAND.mark}
            <span className="text-[#3d9a6b]">◆</span>
          </button>
          <button
            type="button"
            data-cursor="MENU"
            onClick={() => setMenuOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            className="gl-focus flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.4em]"
          >
            <span aria-hidden="true" className="inline-block h-px w-6 bg-current" />
            Index
          </button>
        </div>
      </header>

      {/* Left HUD: current chapter + descent progress (desktop only) */}
      <div
        className="pointer-events-none fixed left-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-5 lg:flex"
        aria-hidden="true"
      >
        <p
          className={`font-mono text-[9px] uppercase tracking-[0.4em] transition-colors duration-700 [writing-mode:vertical-rl] ${
            onHeroSection ? "text-[#2c5872]" : "text-[#5c93b0]"
          }`}
        >
          {SECTIONS[activeSection].hud}
        </p>
        <div className="h-28 w-px overflow-hidden bg-[#5c93b0]/30">
          <div
            ref={progressBarRef}
            className="h-full w-full origin-top bg-gradient-to-b from-[#7fd8e8] to-[#6fd4a8]"
            style={{ transform: "scaleY(0)" }}
          />
        </div>
      </div>

      {/* Intro skip — only while the crystal is still assembling */}
      {loaded && !introDone && !fallback && (
        <button
          type="button"
          onClick={() => {
            worldRef.current?.snapIntro();
            setIntroDone(true);
          }}
          className="gl-focus fixed bottom-8 right-8 z-50 border border-[#0b2233]/30 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.3em] text-[#0b2233] hover:bg-[#0b2233]/10"
        >
          Skip intro
        </button>
      )}

      {/* Ambient sound toggle (procedural WebAudio, off by default) */}
      {introDone && !fallback && (
        <button
          type="button"
          onClick={toggleAudio}
          data-cursor={audioOn ? "MUTE" : "SOUND"}
          aria-pressed={audioOn}
          aria-label={audioOn ? "Turn ambient sound off" : "Turn ambient sound on"}
          className={`gl-focus fixed bottom-6 right-6 z-50 flex h-10 items-center gap-2 border px-4 font-mono text-[9px] uppercase tracking-[0.3em] transition-colors duration-700 ${
            onHeroSection
              ? "border-[#0b2233]/30 text-[#0b2233] hover:bg-[#0b2233]/5"
              : "border-[#5c93b0]/40 text-[#9fc9de] hover:bg-[#eaf6ff]/5"
          }`}
        >
          <span
            aria-hidden="true"
            className={`inline-block h-1.5 w-1.5 rounded-full ${audioOn ? "gl-pulse bg-[#6fd4a8]" : "bg-current opacity-40"}`}
          />
          {audioOn ? "Sound on" : "Sound off"}
        </button>
      )}

      <main>
        <div ref={heroRef}>
          <Hero />
        </div>
        <div ref={platformRef}>
          <Platform activeStage={activeStage} onStageJump={jumpToStage} />
        </div>
        <div ref={aboutRef}>
          <About />
        </div>
        <div ref={contactRef}>
          <Contact onShape={setShape} />
        </div>
      </main>

      <IndexMenu open={menuOpen} onClose={() => setMenuOpen(false)} onNavigate={scrollToSection} />
      <Cursor />
    </div>
  );
}
