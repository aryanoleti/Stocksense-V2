import * as THREE from "three";
import { rand } from "./crystals";

/* Hero scene: a block-built igloo on a snowy valley floor. Hovering (or
   tapping) makes the courses of blocks drift apart around a warm inner
   glow; leaving lets them settle back. Everything is procedural. */

/* Snow/ice block shader: white tops, blue-shadowed sides, fresnel rim so
   gaps read as lit seams when the igloo opens. */
function makeSnowMaterial(glowTint: string): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTop: { value: new THREE.Color("#f4fbff") },
      uSide: { value: new THREE.Color("#a9c6d8") },
      uShadow: { value: new THREE.Color("#5f87a3") },
      uGlow: { value: new THREE.Color(glowTint) },
      uOpen: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vView = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uTop;
      uniform vec3 uSide;
      uniform vec3 uShadow;
      uniform vec3 uGlow;
      uniform float uOpen;
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vec3 n = normalize(vNormal);
        float up = clamp(n.y, 0.0, 1.0);
        float sun = max(dot(n, normalize(vec3(0.4, 0.8, 0.45))), 0.0);
        vec3 col = mix(uShadow, uSide, sun);
        col = mix(col, uTop, up * (0.55 + sun * 0.45));
        float fres = pow(1.0 - abs(dot(n, normalize(vView))), 2.5);
        // seams catch the inner glow as the igloo opens
        col += uGlow * fres * (0.12 + uOpen * 0.55);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
}

/* Rolling snowfield with a flattened pad for the igloo. Position-keyed trig
   noise (same trick as the berg) keeps the displaced mesh watertight. */
function makeTerrain(segments: number): THREE.Mesh {
  const geo = new THREE.CircleGeometry(34, segments, 0, Math.PI * 2);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.getAttribute("position") as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const d = Math.hypot(v.x, v.z);
    let h =
      Math.sin(v.x * 0.32 + v.z * 0.18) * 0.7 +
      Math.cos(v.z * 0.41 - v.x * 0.12) * 0.55 +
      Math.sin(v.x * 0.9 + v.z * 0.8) * 0.18;
    h *= Math.min(1, d / 7); // flatten the pad the igloo sits on
    h += Math.max(0, d - 16) * 0.32; // valley walls rise toward the rim
    pos.setY(i, h - 1.35);
    v.setY(0);
  }
  geo.computeVertexNormals();
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uHigh: { value: new THREE.Color("#eef6fb") },
      uLow: { value: new THREE.Color("#b9d2e2") },
      uFog: { value: new THREE.Color("#dcedf6") },
    },
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      varying vec3 vPos;
      void main() {
        vNormal = normal;
        vPos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uHigh;
      uniform vec3 uLow;
      uniform vec3 uFog;
      varying vec3 vNormal;
      varying vec3 vPos;
      void main() {
        float slope = clamp(normalize(vNormal).y, 0.0, 1.0);
        vec3 col = mix(uLow, uHigh, slope);
        // hand-rolled distance fade into the scene fog colour
        float d = length(vPos.xz);
        col = mix(col, uFog, smoothstep(14.0, 32.0, d));
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
  return new THREE.Mesh(geo, mat);
}

type Block = {
  mesh: THREE.Mesh;
  closedPos: THREE.Vector3;
  openPos: THREE.Vector3;
  closedRot: THREE.Euler;
  openTilt: number;
};

export function makeIglooScene(quality: "high" | "low"): {
  group: THREE.Group;
  /* bounding sphere for pointer raycasts, in world space once added */
  hitSphere: THREE.Sphere;
  state: { open: number };
  tick: (t: number, assembly: number, dt: number) => void;
  setOpen: (target: number) => void;
} {
  const group = new THREE.Group();
  group.add(makeTerrain(quality === "high" ? 96 : 48));

  const igloo = new THREE.Group();
  igloo.position.set(0, -1.32, 0);
  group.add(igloo);

  const mat = makeSnowMaterial("#7fe0c3");
  const blocks: Block[] = [];
  const R = 1.75;

  const addBlock = (
    pos: THREE.Vector3,
    size: [number, number, number],
    rotY: number,
    liftDir: THREE.Vector3
  ) => {
    const geo = new THREE.BoxGeometry(...size).toNonIndexed();
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(pos);
    mesh.rotation.y = rotY;
    igloo.add(mesh);
    blocks.push({
      mesh,
      closedPos: pos.clone(),
      openPos: pos.clone().add(liftDir),
      closedRot: mesh.rotation.clone(),
      openTilt: (rand() - 0.5) * 0.5,
    });
  };

  // dome: stacked courses of blocks, fewer and smaller as they rise
  const courses = quality === "high" ? 5 : 4;
  for (let c = 0; c < courses; c++) {
    const phi = (c / courses) * (Math.PI / 2) * 0.92;
    const r = R * Math.cos(phi);
    const y = R * Math.sin(phi) * 0.92 + 0.18;
    const count = Math.max(5, Math.round(12 * Math.cos(phi)));
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + c * 0.35; // stagger like brickwork
      const pos = new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r);
      // skip blocks where the entrance tunnel meets the dome
      if (c < 2 && Math.abs(a % (Math.PI * 2)) < 0.55) continue;
      const out = new THREE.Vector3(Math.cos(a), 0.55 + c * 0.28, Math.sin(a))
        .normalize()
        .multiplyScalar(0.55 + rand() * 0.5);
      addBlock(pos, [(2 * Math.PI * r) / count - 0.07, 0.34, 0.42], -a, out);
    }
  }
  // cap
  addBlock(
    new THREE.Vector3(0, R * 0.92 + 0.28, 0),
    [0.5, 0.22, 0.5],
    0,
    new THREE.Vector3(0, 1.4, 0)
  );
  // entrance tunnel: two arches marching outward along +X
  for (let seg = 0; seg < 2; seg++) {
    const x = R * 0.8 + 0.35 + seg * 0.5;
    const arc = [-0.5, 0, 0.5];
    arc.forEach((az, k) => {
      const y = k === 1 ? 0.62 : 0.3;
      const pos = new THREE.Vector3(x, y, az * (k === 1 ? 0.0 : 1.0) * 0.62);
      const out = new THREE.Vector3(0.7, k === 1 ? 1 : 0.35, az).normalize().multiplyScalar(0.5);
      addBlock(pos, [0.44, k === 1 ? 0.24 : 0.5, 0.34], 0, out);
    });
  }

  // warm core that shines through the seams while open
  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(R * 0.7, 16, 16),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color("#aef0dc"),
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  glow.position.y = 0.75;
  igloo.add(glow);

  const state = { open: 0 };
  let openTarget = 0;

  return {
    group,
    hitSphere: new THREE.Sphere(new THREE.Vector3(0, -0.4, 0), 2.9),
    /* live open factor, readable for tests and debugging */
    state,
    setOpen(target: number) {
      openTarget = target;
    },
    tick(t, assembly, dt) {
      // ease the open factor; assembly gates everything during the intro
      // dt-based so the open speed is identical at 60Hz and 144Hz
      state.open += (openTarget - state.open) * Math.min(1, dt * 4.2);
      const e = (1 - Math.pow(1 - assembly, 3)) * 1;
      const open = state.open;
      mat.uniforms.uOpen.value = open;
      (glow.material as THREE.MeshBasicMaterial).opacity = open * 0.5;
      igloo.scale.setScalar(0.2 + 0.8 * e);
      blocks.forEach((b, i) => {
        const wob = Math.sin(t * 1.1 + i * 1.7) * 0.03; // hover = gentle float
        b.mesh.position.lerpVectors(b.closedPos, b.openPos, open);
        b.mesh.position.y += wob * open;
        b.mesh.rotation.z = b.closedRot.z + b.openTilt * open;
      });
    },
  };
}
