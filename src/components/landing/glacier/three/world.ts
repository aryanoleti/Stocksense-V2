import * as THREE from "three";
import { resetRand } from "./crystals";
import { makeModuleObject, type ModuleObject } from "./modules";
import { makeIceberg } from "./iceberg";
import { makeIglooScene } from "./igloo";
import { makeRingScene } from "./ring";
import { makeMist, makeForegroundRidges } from "./mist";
import { fogUniforms } from "./fog";
import { ParticleField } from "./particles";
import { PostPass } from "./post";
import { MODULES, type ParticleShape } from "../data";

/* Screen-space anchor for one DOM callout label, recomputed each frame. */
export type ProjectedCallout = { x: number; y: number; visible: boolean };

export type Quality = "high" | "low";

/* Fractions of total scroll progress where each zone starts/ends.
   Measured from the DOM by the component so the scene always lines up. */
export type Layout = {
  hero: [number, number];
  stages: [number, number][]; // one per module
  about: [number, number];
  contact: [number, number];
};

type Waypoint = { p: number; y: number; x: number; fog: THREE.Color; density: number };

const FOG_SURFACE = new THREE.Color("#dcedf6");
const FOG_MID = new THREE.Color("#5c93b0");
const FOG_DEEP = new THREE.Color("#0d3049");
const FOG_ABYSS = new THREE.Color("#040f1a");

/* World Y anchors: the journey descends. */
const STAGE_Y = (i: number) => -11 - i * 9;
const ABOUT_Y = -50;
const CONTACT_Y = -60;

export class GlacierWorld {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private post: PostPass | null = null;
  private clock = new THREE.Clock();
  private raf = 0;
  private running = false;
  private disposed = false;

  private berg!: ReturnType<typeof makeIceberg>;
  private igloo!: ReturnType<typeof makeIglooScene>;
  private mist!: ReturnType<typeof makeMist>;
  private modules: ModuleObject[] = [];
  private ring!: ReturnType<typeof makeRingScene>;
  private particles!: ParticleField;

  /* click-to-inspect state per module shard */
  private opens: number[] = [];
  private openTargets: number[] = [];
  /* screen-space callout anchors, read by the DOM overlay each frame */
  calloutScreen: ProjectedCallout[][] = [];
  /* true while the pointer is over the igloo (drives the cursor label) */
  iglooHovered = false;
  private tmpVec = new THREE.Vector3();

  private waypoints: Waypoint[] = [];
  private layout: Layout | null = null;

  private targetP = 0;
  private smoothP = 0;
  private velocity = 0;
  private pointer = new THREE.Vector2();
  private smoothPointer = new THREE.Vector2();
  private assembly = 0;
  private assemblyTarget = 0;
  private reducedMotion: boolean;
  private time = 0;
  /* narrow-viewport factor: pulls side chambers toward centre on phones */
  private squeeze = 1;
  private failures = 0;
  /* successful renders — the component's watchdog checks this stays > 0 */
  framesRendered = 0;
  /* set by the component: called when rendering is beyond recovery */
  onFatal: (() => void) | null = null;

  quality: Quality;

  constructor(canvas: HTMLCanvasElement, opts: { quality: Quality; reducedMotion: boolean }) {
    this.quality = opts.quality;
    this.reducedMotion = opts.reducedMotion;
    // failIfMajorPerformanceCaveat avoids a 2fps software-GL experience —
    // those clients get the CSS fallback instead.
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: opts.quality === "high",
      alpha: false,
      powerPreference: "high-performance",
      failIfMajorPerformanceCaveat: opts.quality === "high",
    });
    const dpr = Math.min(window.devicePixelRatio || 1, opts.quality === "high" ? 2 : 1.5);
    this.renderer.setPixelRatio(dpr);
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(FOG_SURFACE.clone(), 0.055);
    this.scene.background = FOG_SURFACE.clone();
    this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 120);
    this.camera.position.set(0, 0, 7.5);
    document.addEventListener("visibilitychange", this.onVisibility);
    // survive GPU context loss: preventDefault permits restoration, and
    // three re-uploads its resources when the context comes back
    canvas.addEventListener("webglcontextlost", this.onContextLost);
    canvas.addEventListener("webglcontextrestored", this.onContextRestored);
  }

  private onContextLost = (e: Event) => {
    e.preventDefault();
    this.stop();
  };

  private onContextRestored = () => {
    if (this.disposed) return;
    this.start();
    this.renderOnce();
  };

  /* Build the world in steps, yielding between them so the loader can paint
     honest progress. All geometry is procedural — no network assets. */
  async init(onProgress: (frac: number) => void): Promise<void> {
    // setTimeout, not rAF: rAF never fires in a hidden/background tab, which
    // would strand the loader at 0% until the tab is focused.
    const step = async (frac: number) => {
      onProgress(frac);
      await new Promise((r) => setTimeout(r, 0));
    };
    resetRand(7);
    /* Hero composition, back to front: the iceberg towers centre-stage out of
       a sea of mist, the igloo sits on the shelf in front of it, and dark
       ridges frame the bottom of the frame. */
    this.berg = makeIceberg(this.quality);
    this.berg.group.position.set(-0.6, -1.5, -6.8);
    this.berg.group.scale.setScalar(2.6);
    this.scene.add(this.berg.group);

    this.igloo = makeIglooScene(this.quality);
    this.igloo.group.position.set(2.4, -0.2, 2.2);
    this.igloo.group.scale.setScalar(0.78);
    this.scene.add(this.igloo.group);

    this.mist = makeMist(this.quality);
    this.scene.add(this.mist.group);
    this.scene.add(makeForegroundRidges());
    await step(0.2);

    MODULES.forEach((mod, i) => {
      const obj = makeModuleObject(mod, this.quality, i * 3.7 + 1.3);
      obj.group.position.set((i % 2 ? 2.6 : -2.6) * this.squeeze, STAGE_Y(i), 0);
      this.scene.add(obj.group);
      this.modules.push(obj);
      this.opens.push(0);
      this.openTargets.push(0);
      this.calloutScreen.push(mod.callouts.map(() => ({ x: 0, y: 0, visible: false })));
    });
    await step(0.5);

    this.ring = makeRingScene(this.quality);
    this.ring.group.position.set(0, ABOUT_Y, 0);
    this.scene.add(this.ring.group);

    this.particles = new ParticleField(this.quality === "high" ? 5200 : 2200);
    this.particles.points.position.set(0, CONTACT_Y, 0);
    this.scene.add(this.particles.points);
    await step(0.72);

    if (this.quality === "high") {
      const { width, height } = this.renderer.domElement.getBoundingClientRect();
      this.post = new PostPass(
        Math.max(2, Math.floor(width * this.renderer.getPixelRatio())),
        Math.max(2, Math.floor(height * this.renderer.getPixelRatio()))
      );
    }
    await step(0.85);

    // warm the shaders so the first real frame doesn't hitch
    this.renderer.compile(this.scene, this.camera);
    await step(1);
  }

  setLayout(layout: Layout): void {
    this.layout = layout;
    const wp: Waypoint[] = [
      // thick weather at the surface; the descent clears as it darkens
      { p: 0, y: 0, x: 0, fog: FOG_SURFACE, density: 0.062 },
      {
        p: layout.hero[1],
        y: -5,
        x: 0,
        fog: FOG_SURFACE.clone().lerp(FOG_MID, 0.5),
        // a surge of fog right at the hand-off, so the visitor descends
        // *through* weather instead of cutting between two scenes
        density: 0.125,
      },
    ];
    layout.stages.forEach(([s, e], i) => {
      const mid = (s + e) / 2;
      const depth = i / Math.max(1, layout.stages.length - 1);
      wp.push({
        p: mid,
        y: STAGE_Y(i),
        // camera swings toward the module's side, but not fully — the text
        // column keeps the other half of the frame
        x: (i % 2 ? 1.1 : -1.1),
        fog: FOG_MID.clone().lerp(FOG_DEEP, depth),
        density: 0.05,
      });
    });
    const aboutMid = (layout.about[0] + layout.about[1]) / 2;
    wp.push({ p: aboutMid, y: ABOUT_Y, x: 0, fog: FOG_DEEP.clone(), density: 0.045 });
    wp.push({ p: 1, y: CONTACT_Y + 1.5, x: 0, fog: FOG_ABYSS.clone(), density: 0.05 });
    this.waypoints = wp.sort((a, b) => a.p - b.p);
  }

  setProgress(p: number): void {
    this.targetP = THREE.MathUtils.clamp(p, 0, 1);
    if (this.reducedMotion) this.renderOnce();
  }

  setPointer(x: number, y: number): void {
    this.pointer.set(x, y);
    // Hover test for the igloo without a raycast: project its centre and
    // compare against a screen-space radius derived from its bounding sphere.
    if (this.smoothP < 0.12) {
      // hit sphere is local to the igloo group, so lift it into world space
      const world = this.igloo.hitSphere.center
        .clone()
        .multiplyScalar(this.igloo.group.scale.x)
        .add(this.igloo.group.position);
      const radius = this.igloo.hitSphere.radius * this.igloo.group.scale.x;
      const c = world.clone().project(this.camera);
      const edge = world.clone().add(new THREE.Vector3(radius, 0, 0)).project(this.camera);
      const r = Math.max(0.08, Math.abs(edge.x - c.x));
      const hit = Math.hypot(x - c.x, (y - c.y) * 0.75) < r;
      this.iglooHovered = hit;
      this.igloo.setOpen(hit ? 1 : 0);
    } else if (this.iglooHovered) {
      this.iglooHovered = false;
      this.igloo.setOpen(0);
    }
  }

  /* Toggle a module shard open (click to inspect); -1 closes all. */
  setOpenModule(index: number): void {
    this.openTargets = this.openTargets.map((_, i) => (i === index ? 1 : 0));
    if (this.reducedMotion) {
      this.opens = this.openTargets.slice();
      this.renderOnce();
    }
  }

  setParticleShape(shape: ParticleShape): void {
    this.particles?.setShape(shape);
  }

  /* Intro assembly: 0 scattered -> 1 assembled. Skippable via snap. */
  playIntro(): void {
    this.assemblyTarget = 1;
    if (this.reducedMotion) {
      this.assembly = 1;
      this.renderOnce();
    }
  }
  snapIntro(): void {
    this.assemblyTarget = 1;
    this.assembly = 1;
  }

  /* Always restarts from scratch — a stale "running" flag with a dead rAF
     chain (discarded while the tab was hidden) must not block a restart. */
  start(): void {
    if (this.disposed || this.reducedMotion) return;
    this.stop();
    this.running = true;
    this.clock.start();
    const loop = () => {
      if (!this.running) return;
      this.raf = requestAnimationFrame(loop);
      try {
        this.tick(this.clock.getDelta());
        this.failures = 0;
      } catch {
        // a persistently crashing frame is unrecoverable: hand over to the
        // CSS fallback instead of spinning on a black canvas
        if (++this.failures > 8) {
          this.stop();
          this.onFatal?.();
        }
      }
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  renderOnce(): void {
    if (this.disposed) return;
    // deterministic single frame for reduced motion: time tracks progress so
    // each section still gets a distinct composition
    try {
      this.smoothP = this.targetP;
      this.time = 2 + this.targetP * 10;
      this.applyFrame(0.016);
      this.renderer.render(this.scene, this.camera);
      this.framesRendered++;
    } catch {
      this.onFatal?.();
    }
  }

  private onVisibility = () => {
    if (document.hidden) {
      this.stop();
    } else if (!this.reducedMotion) {
      // paint immediately, then restart the loop fresh — heals rAF chains
      // that some browsers discard while a tab is hidden
      this.renderOnce();
      this.start();
    }
  };

  private tick(dt: number): void {
    this.time += dt;
    // eased follow keeps the camera drifting like a submersible
    const prev = this.smoothP;
    this.smoothP += (this.targetP - this.smoothP) * Math.min(1, dt * 4.5);
    this.velocity = THREE.MathUtils.lerp(this.velocity, Math.abs(this.smoothP - prev) * 60, 0.1);
    this.assembly += (this.assemblyTarget - this.assembly) * Math.min(1, dt * 1.6);
    this.smoothPointer.lerp(this.pointer, Math.min(1, dt * 5));
    this.applyFrame(dt);
    if (this.post) {
      this.post.render(this.renderer, this.scene, this.camera, this.time, Math.min(1, this.velocity * 2.5));
    } else {
      this.renderer.render(this.scene, this.camera);
    }
    this.framesRendered++;
  }

  private applyFrame(dt: number): void {
    const p = this.smoothP;
    // interpolate camera + fog along waypoints
    const wp = this.waypoints;
    if (wp.length >= 2) {
      let i = 0;
      while (i < wp.length - 2 && p > wp[i + 1].p) i++;
      const a = wp[i];
      const b = wp[i + 1];
      const span = Math.max(1e-5, b.p - a.p);
      const t = THREE.MathUtils.smoothstep((p - a.p) / span, 0, 1);
      const y = THREE.MathUtils.lerp(a.y, b.y, t);
      const x = THREE.MathUtils.lerp(a.x, b.x, t) * this.squeeze;
      this.camera.position.set(
        x + this.smoothPointer.x * 0.55,
        y + this.smoothPointer.y * 0.35,
        7.5
      );
      this.camera.lookAt(x * 0.4, y - 0.6, 0);
      const fog = this.scene.fog as THREE.FogExp2;
      fog.color.copy(a.fog).lerp(b.fog, t);
      fog.density = THREE.MathUtils.lerp(a.density, b.density, t);
      (this.scene.background as THREE.Color).copy(fog.color);
      // custom shaders read the shared atmosphere, keeping every hand-written
      // material in the same weather as three's own fogged materials
      fogUniforms.uFogColor.value.copy(fog.color);
      fogUniforms.uFogDensity.value = fog.density;
    }

    const camY = this.camera.position.y;
    if (camY > -14) {
      this.igloo.tick(this.time, this.assembly, dt);
      this.berg.tick(this.time, this.assembly);
      this.mist.tick(this.time, this.assembly);
    }

    const layout = this.layout;
    this.modules.forEach((m, i) => {
      let active = 0.3;
      if (layout && layout.stages[i]) {
        const [s, e] = layout.stages[i];
        const mid = (s + e) / 2;
        const half = Math.max(1e-5, (e - s) / 2);
        active = THREE.MathUtils.clamp(1 - Math.abs(p - mid) / half, 0, 1);
      }
      this.opens[i] += (this.openTargets[i] - this.opens[i]) * Math.min(1, dt * 5);
      const near = Math.abs(m.group.position.y - camY) < 16;
      // skip offscreen chambers entirely — no point animating them
      if (near) m.tick(this.time, active, this.opens[i]);
      this.projectCallouts(i, near && this.opens[i] > 0.05);
    });

    if (Math.abs(ABOUT_Y - camY) < 18) {
      // the ring assembles by PROXIMITY: whole when the camera arrives
      const dist = Math.abs(ABOUT_Y - camY);
      const near = THREE.MathUtils.clamp(1 - (dist - 1.5) / 9, 0, 1);
      this.ring.tick(this.time, near, this.smoothPointer.x, this.smoothPointer.y);
    }
    if (Math.abs(CONTACT_Y - camY) < 18) this.particles.tick(this.time, dt);
  }

  /* Project each callout anchor to viewport pixels for the DOM overlay.
     Writing into pre-allocated objects avoids per-frame garbage. */
  private projectCallouts(moduleIndex: number, show: boolean): void {
    const slots = this.calloutScreen[moduleIndex];
    if (!slots) return;
    const mod = MODULES[moduleIndex];
    const base = this.modules[moduleIndex].group.position;
    const w = this.renderer.domElement.clientWidth;
    const h = this.renderer.domElement.clientHeight;
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      if (!show) {
        slot.visible = false;
        continue;
      }
      const at = mod.callouts[i].at;
      // narrow viewports pull the anchors in toward the shard so the labels
      // stay on screen; the clamp below is the final guarantee
      this.tmpVec
        .set(base.x + at[0] * this.squeeze, base.y + at[1], base.z + at[2])
        .project(this.camera);
      const x = (this.tmpVec.x * 0.5 + 0.5) * w;
      const y = (-this.tmpVec.y * 0.5 + 0.5) * h;
      slot.x = Math.max(14, Math.min(x, w - 186));
      slot.y = Math.max(70, Math.min(y, h - 90));
      slot.visible = this.tmpVec.z < 1;
    }
  }

  resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.squeeze = Math.min(1, this.camera.aspect / 1.4);
    this.modules.forEach((m, i) => {
      m.group.position.x = (i % 2 ? 2.6 : -2.6) * this.squeeze;
    });
    this.renderer.setSize(width, height, false);
    const pr = this.renderer.getPixelRatio();
    this.post?.setSize(Math.max(2, Math.floor(width * pr)), Math.max(2, Math.floor(height * pr)));
    if (this.reducedMotion) this.renderOnce();
  }

  dispose(): void {
    this.disposed = true;
    this.stop();
    document.removeEventListener("visibilitychange", this.onVisibility);
    this.renderer.domElement.removeEventListener("webglcontextlost", this.onContextLost);
    this.renderer.domElement.removeEventListener("webglcontextrestored", this.onContextRestored);
    this.particles?.dispose();
    this.post?.dispose();
    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh || obj instanceof THREE.Points || obj instanceof THREE.LineSegments) {
        obj.geometry?.dispose();
        const mat = obj.material as THREE.Material | THREE.Material[];
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat?.dispose();
      }
    });
    this.renderer.dispose();
  }
}
