import * as THREE from "three";
import type { ParticleShape } from "../data";

/* Footer particle field. CPU-simulated: cheap pseudo-curl drift plus an
   attraction force toward a target formation when a link is hovered.
   Colour follows velocity (calm cyan -> excited emerald/white), a nod to
   velocity-shaded particle sims without copying anyone's implementation. */

const CALM = new THREE.Color("#5f9fc4");
const FAST = new THREE.Color("#6fd4a8");
const HOT = new THREE.Color("#eafff6");

function shapeTargets(shape: ParticleShape, n: number): Float32Array {
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const a = t * Math.PI * 2;
    let x = 0;
    let y = 0;
    let z = 0;
    switch (shape) {
      case "ring": {
        const r = 2.2 + (i % 3) * 0.12;
        x = Math.cos(a * 3) * r;
        y = Math.sin(a * 3) * r;
        break;
      }
      case "cross": {
        // two crossed bars (an abstract X)
        const s = t * 8 - 4;
        if (i % 2) {
          x = s * 0.7;
          y = s * 0.7;
        } else {
          x = s * 0.7;
          y = -s * 0.7;
        }
        break;
      }
      case "diamond": {
        // rotated square outline
        const side = i % 4;
        const u = (t * 4) % 1;
        const p = 2.4;
        if (side === 0) { x = -p + u * p; y = u * p; }
        else if (side === 1) { x = u * p; y = p - u * p; }
        else if (side === 2) { x = p - u * p; y = -u * p; }
        else { x = -u * p; y = -p + u * p; }
        break;
      }
      case "grid": {
        const cols = 8;
        const rows = Math.ceil(n / cols);
        x = ((i % cols) / (cols - 1) - 0.5) * 4.2;
        y = (Math.floor(i / cols) / (rows - 1) - 0.5) * 3;
        break;
      }
      case "hex": {
        const seg = Math.floor(t * 6);
        const u = (t * 6) % 1;
        const r = 2.3;
        const a0 = (seg / 6) * Math.PI * 2;
        const a1 = ((seg + 1) / 6) * Math.PI * 2;
        x = THREE.MathUtils.lerp(Math.cos(a0), Math.cos(a1), u) * r;
        y = THREE.MathUtils.lerp(Math.sin(a0), Math.sin(a1), u) * r;
        break;
      }
      default: {
        // idle: loose disc the drift force keeps stirring
        const r = 2.6 * Math.sqrt(t);
        x = Math.cos(a * 13.7) * r;
        y = Math.sin(a * 13.7) * r * 0.7;
        z = 0;
      }
    }
    out[i * 3] = x;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = z + Math.sin(i * 1.7) * 0.4;
  }
  return out;
}

export class ParticleField {
  points: THREE.Points;
  private n: number;
  private pos: Float32Array;
  private vel: Float32Array;
  private col: Float32Array;
  private posAttr: THREE.BufferAttribute;
  private colAttr: THREE.BufferAttribute;
  private targets: Record<ParticleShape, Float32Array>;
  private shape: ParticleShape = "idle";
  private tmp = new THREE.Color();

  constructor(count: number) {
    this.n = count;
    this.pos = new Float32Array(count * 3);
    this.vel = new Float32Array(count * 3);
    this.col = new Float32Array(count * 3);
    this.targets = {
      idle: shapeTargets("idle", count),
      ring: shapeTargets("ring", count),
      cross: shapeTargets("cross", count),
      diamond: shapeTargets("diamond", count),
      grid: shapeTargets("grid", count),
      hex: shapeTargets("hex", count),
    };
    this.pos.set(this.targets.idle);
    const geo = new THREE.BufferGeometry();
    this.posAttr = new THREE.BufferAttribute(this.pos, 3);
    this.colAttr = new THREE.BufferAttribute(this.col, 3);
    geo.setAttribute("position", this.posAttr);
    geo.setAttribute("color", this.colAttr);
    const mat = new THREE.PointsMaterial({
      size: 0.035,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    this.points = new THREE.Points(geo, mat);
  }

  setShape(shape: ParticleShape): void {
    this.shape = shape;
  }

  tick(t: number, dt: number): void {
    const target = this.targets[this.shape];
    const idle = this.shape === "idle";
    const pull = idle ? 0.35 : 2.4;
    const damp = idle ? 0.96 : 0.9;
    const d = Math.min(dt, 0.05);
    for (let i = 0; i < this.n; i++) {
      const ix = i * 3;
      const px = this.pos[ix];
      const py = this.pos[ix + 1];
      const pz = this.pos[ix + 2];
      // pseudo-curl drift: cheap trig field, no noise texture needed
      const dx = Math.sin(py * 0.9 + t * 0.5 + i * 0.01) * 0.5;
      const dy = Math.cos(px * 0.8 - t * 0.4) * 0.45;
      const dz = Math.sin((px + py) * 0.5 + t * 0.3) * 0.3;
      this.vel[ix] += (dx * 0.6 + (target[ix] - px) * pull) * d;
      this.vel[ix + 1] += (dy * 0.6 + (target[ix + 1] - py) * pull) * d;
      this.vel[ix + 2] += (dz * 0.6 + (target[ix + 2] - pz) * pull) * d;
      this.vel[ix] *= damp;
      this.vel[ix + 1] *= damp;
      this.vel[ix + 2] *= damp;
      this.pos[ix] += this.vel[ix] * d * 2;
      this.pos[ix + 1] += this.vel[ix + 1] * d * 2;
      this.pos[ix + 2] += this.vel[ix + 2] * d * 2;
      // velocity -> colour
      const sp = Math.min(
        1,
        (Math.abs(this.vel[ix]) + Math.abs(this.vel[ix + 1]) + Math.abs(this.vel[ix + 2])) * 0.9
      );
      if (sp < 0.5) this.tmp.copy(CALM).lerp(FAST, sp * 2);
      else this.tmp.copy(FAST).lerp(HOT, (sp - 0.5) * 2);
      this.col[ix] = this.tmp.r;
      this.col[ix + 1] = this.tmp.g;
      this.col[ix + 2] = this.tmp.b;
    }
    this.posAttr.needsUpdate = true;
    this.colAttr.needsUpdate = true;
  }

  dispose(): void {
    this.points.geometry.dispose();
    (this.points.material as THREE.Material).dispose();
  }
}
