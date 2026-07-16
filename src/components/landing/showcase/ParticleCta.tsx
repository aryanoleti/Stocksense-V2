"use client";

import { useEffect, useRef } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { usePrefersReducedMotion } from "@/lib/use-reveal";

type P = { x: number; y: number; vx: number; vy: number; r: number; a: number };

// Finale: CTA over a particle field that leans gently away from the cursor.
export function ParticleCta() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap || reduced) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let running = false;
    let w = 0;
    let h = 0;
    const mouse = { x: -9999, y: -9999 };
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    const particles: P[] = Array.from({ length: 70 }).map(() => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0004,
      vy: (Math.random() - 0.5) * 0.0004,
      r: 0.8 + Math.random() * 1.6,
      a: 0.15 + Math.random() * 0.4,
    }));

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const frame = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        // Gentle drift + soft repulsion from the cursor.
        const px = p.x * w;
        const py = p.y * h;
        const dx = px - mouse.x;
        const dy = py - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 16000 && d2 > 0.01) {
          const f = 12 / d2;
          p.vx += dx * f * 0.00001;
          p.vy += dy * f * 0.00001;
        }
        p.vx *= 0.995;
        p.vy *= 0.995;
        p.x = (p.x + p.vx + 1) % 1;
        p.y = (p.y + p.vy + 1) % 1;

        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(126, 240, 187, ${p.a})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (!running) {
        running = true;
        resize();
        raf = requestAnimationFrame(frame);
      }
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), {
      threshold: 0.05,
    });
    io.observe(wrap);

    const onMove = (e: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", resize);

    return () => {
      stop();
      io.disconnect();
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", resize);
    };
  }, [reduced]);

  return (
    <section id="cta" className="mx-auto max-w-7xl px-5 py-24">
      <div
        ref={wrapRef}
        className="relative overflow-hidden rounded-[28px] gradient-brand p-10 text-center sm:p-16"
      >
        <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" aria-hidden="true" />
        {reduced && (
          <div className="particle-dust pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
        )}
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-(--color-brand-400)/20 blur-3xl" />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-[40px] sm:leading-[1.08]">
            Ready to see the market clearly?
          </h2>
          <p className="mt-5 text-[16px] leading-relaxed text-white/75">
            Free account in under two minutes. Live NSE data, honest AI, and a ₹5,00,000
            practice portfolio — no card, no hidden charges, no spam.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href="/dashboard" size="lg" className="bg-white text-(--color-brand-900) hover:bg-white/90 shadow-none">
              Create free account <ArrowRight className="h-4 w-4" />
            </Button>
            <Button href="/ask-ai" variant="ghost" size="lg" className="text-white hover:bg-white/10">
              <Sparkles className="h-4 w-4" /> Ask StockSense AI
            </Button>
          </div>
          <p className="mt-6 text-[12.5px] text-white/50">
            StockSense is a research and education platform — not a broker. We never hold
            funds or execute trades.
          </p>
        </div>
      </div>
    </section>
  );
}
