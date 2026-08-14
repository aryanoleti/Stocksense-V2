import * as THREE from "three";
import { makeIceMaterial, makeEnclosure, makeCrystalCluster, rand } from "./crystals";
import type { Project } from "../data";

export type ModuleObject = {
  group: THREE.Group;
  /* per-frame animation; t = seconds, active = 0..1 focus weight */
  tick: (t: number, active: number) => void;
};

function facet(geo: THREE.BufferGeometry): THREE.BufferGeometry {
  const g = geo.toNonIndexed();
  g.computeVertexNormals();
  return g;
}

/* ORBITAL — a core crystal with three tilted rings and orbiting motes.
   Stands in for the quant engine: indicators circling price. */
function makeOrbital(accent: string): ModuleObject {
  const group = new THREE.Group();
  const core = new THREE.Mesh(
    facet(new THREE.DodecahedronGeometry(0.85, 0)),
    makeIceMaterial({ deep: "#0d2b40", rim: accent, opacity: 0.95 })
  );
  group.add(core);
  const rings: THREE.Mesh[] = [];
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.5 + i * 0.42, 0.018, 8, 96),
      makeIceMaterial({ deep: accent, rim: "#eaf6ff", opacity: 0.5, additive: true })
    );
    ring.rotation.set(rand() * Math.PI, rand() * Math.PI, 0);
    group.add(ring);
    rings.push(ring);
  }
  const moteGeo = new THREE.SphereGeometry(0.05, 8, 8);
  const moteMat = makeIceMaterial({ deep: accent, rim: "#ffffff", opacity: 0.9, additive: true });
  const motes = new THREE.InstancedMesh(moteGeo, moteMat, 24);
  group.add(motes);
  const dummy = new THREE.Object3D();
  return {
    group,
    tick(t, active) {
      core.rotation.y = t * 0.25;
      core.rotation.x = Math.sin(t * 0.2) * 0.2;
      rings.forEach((r, i) => {
        r.rotation.z = t * (0.12 + i * 0.05);
        r.rotation.x += 0.0006 * (i + 1);
      });
      for (let i = 0; i < 24; i++) {
        const a = t * (0.3 + (i % 3) * 0.12) + (i / 24) * Math.PI * 2;
        const rad = 1.5 + (i % 3) * 0.42;
        dummy.position.set(Math.cos(a) * rad, Math.sin(a * 1.7) * 0.35, Math.sin(a) * rad);
        dummy.scale.setScalar(0.6 + active * 0.8);
        dummy.updateMatrix();
        motes.setMatrixAt(i, dummy.matrix);
      }
      motes.instanceMatrix.needsUpdate = true;
    },
  };
}

/* TWIN — two counter-rotating spires joined by a beam (the compare desk). */
function makeTwin(accent: string): ModuleObject {
  const group = new THREE.Group();
  const mat = makeIceMaterial({ deep: "#0d2b40", rim: accent, opacity: 0.95 });
  const spireGeo = facet(new THREE.ConeGeometry(0.55, 2.4, 5));
  const a = new THREE.Mesh(spireGeo, mat);
  const b = new THREE.Mesh(spireGeo.clone(), mat);
  a.position.x = -1.05;
  b.position.x = 1.05;
  b.rotation.z = Math.PI; // inverted twin
  group.add(a, b);
  const beam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.015, 2.1, 6),
    makeIceMaterial({ deep: accent, rim: "#ffffff", opacity: 0.7, additive: true })
  );
  beam.rotation.z = Math.PI / 2;
  group.add(beam);
  return {
    group,
    tick(t) {
      a.rotation.y = t * 0.35;
      b.rotation.y = -t * 0.35;
      a.position.y = Math.sin(t * 0.8) * 0.12;
      b.position.y = -Math.sin(t * 0.8) * 0.12;
      const s = 1 + Math.sin(t * 2.2) * 0.04;
      beam.scale.set(1, s, 1);
    },
  };
}

/* NEURAL — a breathing fibonacci point-sphere with a bright core (ask AI). */
function makeNeural(accent: string): ModuleObject {
  const group = new THREE.Group();
  const N = 1400;
  const base = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = i * 2.39996; // golden angle
    base[i * 3] = Math.cos(th) * r * 1.45;
    base[i * 3 + 1] = y * 1.45;
    base[i * 3 + 2] = Math.sin(th) * r * 1.45;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(base.slice(), 3));
  const mat = new THREE.PointsMaterial({
    color: new THREE.Color(accent),
    size: 0.028,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });
  const cloud = new THREE.Points(geo, mat);
  group.add(cloud);
  const core = new THREE.Mesh(
    facet(new THREE.IcosahedronGeometry(0.5, 1)),
    makeIceMaterial({ deep: accent, rim: "#ffffff", opacity: 0.55, additive: true })
  );
  group.add(core);
  const pos = geo.getAttribute("position") as THREE.BufferAttribute;
  return {
    group,
    tick(t, active) {
      // breathing: each point slides along its radius with a phase from index
      const arr = pos.array as Float32Array;
      for (let i = 0; i < N; i++) {
        const k = 1 + Math.sin(t * 1.1 + i * 0.37) * (0.04 + active * 0.05);
        arr[i * 3] = base[i * 3] * k;
        arr[i * 3 + 1] = base[i * 3 + 1] * k;
        arr[i * 3 + 2] = base[i * 3 + 2] * k;
      }
      pos.needsUpdate = true;
      cloud.rotation.y = t * 0.12;
      core.rotation.y = -t * 0.3;
      core.scale.setScalar(1 + Math.sin(t * 1.1) * 0.06);
    },
  };
}

/* STRATA — ascending translucent slabs, a staircase of holdings. */
function makeStrata(accent: string): ModuleObject {
  const group = new THREE.Group();
  const slabs: THREE.Mesh[] = [];
  const mat = makeIceMaterial({ deep: "#0d2b40", rim: accent, opacity: 0.85 });
  for (let i = 0; i < 6; i++) {
    const w = 2.0 - i * 0.22;
    const slab = new THREE.Mesh(facet(new THREE.BoxGeometry(w, 0.16, 1.0 - i * 0.08)), mat);
    slab.position.set((i - 2.5) * 0.16, -1.1 + i * 0.42, 0);
    slab.rotation.y = (i % 2 ? 1 : -1) * 0.12;
    group.add(slab);
    slabs.push(slab);
  }
  return {
    group,
    tick(t) {
      slabs.forEach((s, i) => {
        s.position.y = -1.1 + i * 0.42 + Math.sin(t * 0.9 + i * 0.9) * 0.05;
        s.rotation.y += Math.sin(t * 0.4 + i) * 0.0004;
      });
    },
  };
}

const BUILDERS: Record<Project["visualType"], (accent: string) => ModuleObject> = {
  orbital: makeOrbital,
  twin: makeTwin,
  neural: makeNeural,
  strata: makeStrata,
};

export function makeModuleObject(mod: Project, quality: "high" | "low"): ModuleObject {
  const inner = BUILDERS[mod.visualType](mod.accent);
  const enclosure = makeEnclosure(2.9, mod.accent, quality === "high");
  const group = new THREE.Group();
  group.add(inner.group, enclosure);
  return {
    group,
    tick(t, active) {
      inner.tick(t, active);
      enclosure.rotation.y = t * 0.05;
      enclosure.rotation.z = Math.sin(t * 0.11) * 0.08;
    },
  };
}

/* Hero centrepiece: a large crystal cluster that assembles during the intro. */
export function makeHeroCrystal(quality: "high" | "low"): {
  group: THREE.Group;
  tick: (t: number, assembly: number) => void;
} {
  const mat = makeIceMaterial({ deep: "#123a52", rim: "#d9f2ff", opacity: 0.92 });
  const { group, shards } = makeCrystalCluster({
    shardCount: quality === "high" ? 26 : 14,
    radius: 2.1,
    material: mat,
  });
  // remember resting pose; intro lerps from a scattered pose into it
  const rest = shards.map((s) => ({
    pos: s.position.clone(),
    scale: s.scale.x,
    scatter: s.position
      .clone()
      .normalize()
      .multiplyScalar(6 + rand() * 7)
      .add(new THREE.Vector3(0, rand() * 4 - 2, 0)),
  }));
  return {
    group,
    tick(t, assembly) {
      mat.uniforms.uTime.value = t;
      group.rotation.y = t * 0.08;
      shards.forEach((s, i) => {
        const r = rest[i];
        const e = 1 - Math.pow(1 - assembly, 3); // ease-out cubic
        s.position.lerpVectors(r.scatter, r.pos, e);
        s.scale.setScalar(r.scale * (0.25 + 0.75 * e));
        s.position.y += Math.sin(t * 0.7 + i) * 0.02; // idle bob once assembled
      });
    },
  };
}

/* About diagram: three concentric wireframe rings with node points. */
export function makeLattice(accent: string): ModuleObject {
  const group = new THREE.Group();
  const rings: THREE.Group[] = [];
  for (let i = 0; i < 3; i++) {
    const holder = new THREE.Group();
    const r = 1.1 + i * 0.55;
    const ring = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(
        Array.from({ length: 64 }, (_, k) => {
          const a = (k / 64) * Math.PI * 2;
          return new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r);
        })
      ),
      new THREE.LineBasicMaterial({ color: new THREE.Color(accent), transparent: true, opacity: 0.5 })
    );
    holder.add(ring);
    const nodeMat = makeIceMaterial({ deep: accent, rim: "#ffffff", opacity: 0.9, additive: true });
    for (let n = 0; n < 3 + i * 2; n++) {
      const a = (n / (3 + i * 2)) * Math.PI * 2;
      const node = new THREE.Mesh(new THREE.OctahedronGeometry(0.07, 0), nodeMat);
      node.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
      holder.add(node);
    }
    holder.rotation.x = (i - 1) * 0.5;
    group.add(holder);
    rings.push(holder);
  }
  return {
    group,
    tick(t) {
      rings.forEach((r, i) => {
        r.rotation.y = t * (0.1 + i * 0.06) * (i % 2 ? -1 : 1);
      });
    },
  };
}
