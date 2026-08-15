import * as THREE from "three";

/* Procedural geometry for the whole sequence. Nothing is loaded from the
   network: every shape here is generated, so the page has no model payload
   and the first frame is not gated on a download.

   All displacement is keyed to vertex POSITION rather than vertex index, so
   the duplicated vertices of non-indexed geometry move identically and the
   surfaces stay watertight while keeping hard, faceted normals. */

/** Deterministic PRNG — the scene must look identical on every visit. */
export function makeRng(seed = 11) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function ridged(x: number, y: number, z: number, f: number): number {
  return (
    Math.sin(x * 1.7 * f + y * 0.9) * Math.cos(z * 1.3 * f - x * 0.6) * 0.6 +
    Math.sin(y * 2.6 * f + z * 1.7) * 0.28 +
    Math.cos(x * 4.1 * f + z * 3.4) * 0.12
  );
}

/* ---------------------------------------------------------------------- */
/* Hero centrepiece: a monolith split by deep seams. The seams are where the
   inner light escapes, so they are carved as real geometry (an inset core is
   rendered behind it with an emissive material). */
export function makeMonolith(detail: number): THREE.BufferGeometry {
  const geo = new THREE.IcosahedronGeometry(1, detail);
  const pos = geo.getAttribute("position") as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const n = ridged(v.x, v.y, v.z, 1);
    // taper toward the top so it reads as a standing stone, not a ball
    const lift = (v.y + 1) * 0.5;
    v.multiplyScalar(1 + n * 0.26);
    v.x *= 1 - lift * 0.3;
    v.z *= 1 - lift * 0.3;
    v.y *= 1.85;
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  return geo;
}

/* Rugged terrain the monolith stands on. A disc, displaced into hills that
   rise toward the horizon so the silhouette reads against the fog. */
export function makeTerrain(radius: number, segments: number): THREE.BufferGeometry {
  const geo = new THREE.CircleGeometry(radius, segments);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.getAttribute("position") as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const d = Math.hypot(v.x, v.z);
    let h =
      Math.sin(v.x * 0.28 + v.z * 0.19) * 0.9 +
      Math.cos(v.z * 0.37 - v.x * 0.14) * 0.7 +
      Math.sin(v.x * 0.83 + v.z * 0.71) * 0.26 +
      Math.sin(v.x * 2.1 - v.z * 1.7) * 0.08;
    h *= Math.min(1, d / 5.5); // flatten the plinth under the centrepiece
    h += Math.max(0, d - 13) * 0.42; // distant hills climb into the haze
    pos.setY(i, h - 1.15);
  }
  geo.computeVertexNormals();
  return geo;
}

/* ---------------------------------------------------------------------- */
/* Carousel shards. Each silhouette is distinct so cards are recognisable at
   a glance, and all three share a jagged, eroded lower edge. */

function fractureTop(geo: THREE.BufferGeometry, amount: number, freq: number): void {
  const pos = geo.getAttribute("position") as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    // erosion is strongest at the bottom, clean facets survive up top
    const lower = Math.max(0, -v.y);
    const n = ridged(v.x, v.y, v.z, freq);
    const k = 1 + n * amount * (0.35 + lower * 0.9);
    pos.setXYZ(i, v.x * k, v.y * (1 + n * amount * 0.35), v.z * k);
  }
  geo.computeVertexNormals();
}

export function makeShard(shape: "geode" | "slab" | "abstract"): THREE.BufferGeometry {
  if (shape === "slab") {
    // a thick faceted slab: clean flat sides, broken organic top and bottom
    const geo = new THREE.CylinderGeometry(0.92, 0.78, 2.5, 7, 3);
    geo.scale(1, 1, 0.42);
    const g = geo.toNonIndexed();
    fractureTop(g, 0.2, 1.3);
    return g;
  }
  if (shape === "abstract") {
    // no logo face — a raw, deeply fractured mass
    const geo = new THREE.DodecahedronGeometry(1.15, 1).toNonIndexed();
    geo.scale(0.85, 1.5, 0.85);
    fractureTop(geo, 0.3, 1.9);
    return geo;
  }
  // geode: crystalline, many facets, slightly squat
  const geo = new THREE.IcosahedronGeometry(1.2, 1).toNonIndexed();
  geo.scale(0.9, 1.35, 0.9);
  fractureTop(geo, 0.26, 1.55);
  return geo;
}

/* A flat quad sitting just proud of the shard's front face, used to hold the
   etched glyph so the engraving reads as part of the surface. */
export function makeEtchPlane(): THREE.BufferGeometry {
  return new THREE.PlaneGeometry(0.92, 0.92);
}

/* ---------------------------------------------------------------------- */
/* Wireframe "scan" overlay: nodes scattered on a sphere around the model,
   with segments drawn between pairs that fall within a threshold. Returned
   as a flat position array ready for LineSegments. */
export function makeScanNetwork(
  count: number,
  radius: number,
  linkDist: number,
  seed = 23
): { points: Float32Array; segments: Float32Array } {
  const rng = makeRng(seed);
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i < count; i++) {
    // fibonacci-ish distribution, jittered so it never looks like a lattice
    const y = 1 - (i / Math.max(1, count - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const th = i * 2.39996 + rng() * 0.5;
    pts.push(
      new THREE.Vector3(
        Math.cos(th) * r * radius * (0.85 + rng() * 0.35),
        y * radius * (0.85 + rng() * 0.35),
        Math.sin(th) * r * radius * (0.85 + rng() * 0.35)
      )
    );
  }
  const segs: number[] = [];
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      if (pts[i].distanceTo(pts[j]) < linkDist) {
        segs.push(pts[i].x, pts[i].y, pts[i].z, pts[j].x, pts[j].y, pts[j].z);
      }
    }
  }
  const points = new Float32Array(pts.length * 3);
  pts.forEach((p, i) => {
    points[i * 3] = p.x;
    points[i * 3 + 1] = p.y;
    points[i * 3 + 2] = p.z;
  });
  return { points, segments: new Float32Array(segs) };
}

/* ---------------------------------------------------------------------- */
/* Portal ring: segmented stone arcs, an inner broken gear ring and a glowing
   band. Returned as parts so each can take its own material. */
export function makePortalArcs(
  segments: number,
  radius: number,
  tube: number,
  gap: number
): THREE.BufferGeometry[] {
  const arc = (Math.PI * 2) / segments - gap;
  return Array.from({ length: segments }, (_, i) => {
    const g = new THREE.TorusGeometry(radius, tube, 6, 14, arc).toNonIndexed();
    g.rotateZ((i / segments) * Math.PI * 2);
    g.computeVertexNormals();
    return g;
  });
}

/* ---------------------------------------------------------------------- */
/* Particle target sampling. The sculpture is a letterform: glyph pixels are
   rasterised on a 2D canvas, then every opaque pixel becomes a target the
   particles fly into. Sampling the real glyph means any character works. */
export function sampleGlyphTargets(
  glyph: string,
  count: number,
  size = 128,
  depth = 0.22
): Float32Array {
  const targets = new Float32Array(count * 3);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return targets;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `900 ${Math.floor(size * 0.82)}px ui-monospace, monospace`;
  ctx.fillText(glyph, size / 2, size / 2 + size * 0.02);

  const data = ctx.getImageData(0, 0, size, size).data;
  const hits: [number, number][] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (data[(y * size + x) * 4] > 128) hits.push([x, y]);
    }
  }
  const rng = makeRng(97);
  for (let i = 0; i < count; i++) {
    if (hits.length === 0) break;
    const [hx, hy] = hits[(rng() * hits.length) | 0];
    // map pixel space to a centred, Y-up volume with a little thickness
    targets[i * 3] = ((hx / size) * 2 - 1) * 1.7 + (rng() - 0.5) * 0.03;
    targets[i * 3 + 1] = -((hy / size) * 2 - 1) * 1.7 + (rng() - 0.5) * 0.03;
    targets[i * 3 + 2] = (rng() - 0.5) * depth;
  }
  return targets;
}

/* Starting positions: a wide shell the particles stream inward from. */
export function scatterShell(count: number, radius: number, seed = 53): Float32Array {
  const rng = makeRng(seed);
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const th = rng() * Math.PI * 2;
    const ph = Math.acos(rng() * 2 - 1);
    const r = radius * (0.6 + rng() * 0.8);
    out[i * 3] = Math.sin(ph) * Math.cos(th) * r;
    out[i * 3 + 1] = Math.cos(ph) * r;
    out[i * 3 + 2] = Math.sin(ph) * Math.sin(th) * r;
  }
  return out;
}
