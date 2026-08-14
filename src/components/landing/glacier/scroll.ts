/* Hand-driven smooth scrolling. Native `behavior: "smooth"` varies by engine
   (and is a no-op in some embedded views), so the landing animates the scroll
   itself: one easing curve for every transition — menu jumps, stage jumps and
   the return-to-surface loop — and a guaranteed cancel on user input. */

let activeCancel: (() => void) | null = null;

export function cancelSmoothScroll(): void {
  activeCancel?.();
  activeCancel = null;
}

export function smoothScrollTo(
  targetY: number,
  opts: { duration?: number; instant?: boolean; onDone?: () => void } = {}
): void {
  cancelSmoothScroll();
  const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const to = Math.max(0, Math.min(targetY, maxY));
  const from = window.scrollY;
  const delta = to - from;

  if (opts.instant || Math.abs(delta) < 2) {
    window.scrollTo(0, to);
    opts.onDone?.();
    return;
  }

  // longer trips take longer, but within sane bounds
  const duration =
    opts.duration ?? Math.min(1800, Math.max(600, Math.abs(delta) * 0.45));
  let raf = 0;
  let start = 0;
  let cancelled = false;

  const stop = () => {
    cancelled = true;
    cancelAnimationFrame(raf);
    window.removeEventListener("wheel", stop);
    window.removeEventListener("touchstart", stop);
    window.removeEventListener("keydown", onKey);
  };
  // any deliberate input takes control back immediately
  const onKey = (e: KeyboardEvent) => {
    if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(e.key)) stop();
  };
  window.addEventListener("wheel", stop, { passive: true });
  window.addEventListener("touchstart", stop, { passive: true });
  window.addEventListener("keydown", onKey);
  activeCancel = stop;

  const step = (now: number) => {
    if (cancelled) return;
    if (!start) start = now;
    const t = Math.min(1, (now - start) / duration);
    // easeInOutCubic: settles without an abrupt stop at either end
    const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    window.scrollTo(0, from + delta * e);
    if (t < 1) {
      raf = requestAnimationFrame(step);
    } else {
      stop();
      activeCancel = null;
      opts.onDone?.();
    }
  };
  raf = requestAnimationFrame(step);
}
