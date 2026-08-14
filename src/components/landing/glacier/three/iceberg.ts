import * as THREE from "three";
import { rand } from "./crystals";
import {
  fogUniforms,
  FOG_VERT_DECL,
  FOG_VERT_BODY,
  FOG_FRAG_DECL,
  FOG_FRAG_APPLY,
} from "./fog";

/* The hero iceberg: a towering slab of ice rising out of a sea of mist.
   A displaced icosphere sculpted so a jagged peak sits above the waterline
   and a deep keel hangs below. All noise is a function of vertex POSITION,
   so duplicated vertices (the geometry is non-indexed) displace identically
   and the mesh stays watertight. */

const WATER_Y = -0.55;

function posNoise(x: number, y: number, z: number): number {
  return (
    Math.sin(x * 2.1 + y * 1.4) * Math.cos(z * 1.8 + x * 0.9) * 0.55 +
    Math.sin(y * 3.6 + z * 2.3) * 0.3 +
    Math.cos(x * 5.2 + z * 4.1) * 0.15
  );
}

function makeBergGeometry(detail: number): THREE.BufferGeometry {
  const geo = new THREE.IcosahedronGeometry(1.7, detail);
  const pos = geo.getAttribute("position") as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const n = posNoise(v.x, v.y, v.z);
    v.multiplyScalar(1 + n * 0.32);
    if (v.y > 0) {
      // a peaked crown rather than a dome — the silhouette does the work
      const rise = 1 + Math.pow(v.y / 1.7, 2) * 1.5;
      v.y *= 1.35 * rise;
      v.x *= 0.92;
      v.z *= 0.92;
    } else {
      // the keel: most of the mass, tapering as it deepens
      const depth = -v.y / 1.7;
      v.y *= 2.6;
      const taper = 1 - depth * 0.45;
      v.x *= taper;
      v.z *= taper;
    }
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals(); // non-indexed → per-face normals → flat facets
  return geo;
}

/* Ice shader with a waterline: bright and snow-lit above, dense teal below,
   with a thin glowing band right at the line. */
function makeBergMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uWaterY: { value: WATER_Y },
      uAbove: { value: new THREE.Color("#f2fbff") },
      uAboveDeep: { value: new THREE.Color("#8fb6cd") },
      uBelow: { value: new THREE.Color("#12506d") },
      uBelowRim: { value: new THREE.Color("#67d8d0") },
      ...fogUniforms,
    },
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      varying vec3 vView;
      varying float vWorldY;
      ${FOG_VERT_DECL}
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vView = normalize(-mv.xyz);
        vWorldY = (modelMatrix * vec4(position, 1.0)).y;
        ${FOG_VERT_BODY}
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uWaterY;
      uniform vec3 uAbove;
      uniform vec3 uAboveDeep;
      uniform vec3 uBelow;
      uniform vec3 uBelowRim;
      varying vec3 vNormal;
      varying vec3 vView;
      varying float vWorldY;
      ${FOG_FRAG_DECL}
      void main() {
        vec3 n = normalize(vNormal);
        float fres = pow(1.0 - abs(dot(n, normalize(vView))), 2.0);
        float sky = max(dot(n, normalize(vec3(0.3, 0.9, 0.4))), 0.0);
        vec3 col;
        if (vWorldY > uWaterY) {
          // sunlit crown: facet shading does most of the talking
          col = mix(uAboveDeep, uAbove, 0.3 + sky * 0.7);
          col += vec3(1.0) * fres * 0.12;
        } else {
          // submerged mass: fresnel rim reads as light wrapping through ice
          float depth = clamp((uWaterY - vWorldY) / 5.0, 0.0, 1.0);
          col = mix(uBelow, uBelow * 0.35, depth);
          col += uBelowRim * (fres * 0.5 + sky * 0.1);
        }
        // thin caustic shimmer hugging the waterline
        float band = 1.0 - smoothstep(0.0, 0.28, abs(vWorldY - uWaterY));
        col += uBelowRim * band * (0.22 + 0.13 * sin(uTime * 1.3));
        ${FOG_FRAG_APPLY}
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
}

/* The water surface: a translucent disc that fades out radially, with a few
   slow expanding ripple rings around the berg. */
function makeWater(): { mesh: THREE.Mesh; material: THREE.ShaderMaterial } {
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color("#cfe9f4") },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uColor;
      varying vec2 vUv;
      void main() {
        float d = length(vUv - 0.5) * 2.0;      // 0 centre → 1 edge
        float fade = 1.0 - smoothstep(0.25, 1.0, d);
        // two ripple trains drifting outward from the berg
        float r1 = sin(d * 34.0 - uTime * 0.9);
        float r2 = sin(d * 21.0 - uTime * 0.55 + 2.1);
        float ripple = smoothstep(0.85, 1.0, r1) * 0.5 + smoothstep(0.9, 1.0, r2) * 0.4;
        float a = fade * (0.10 + ripple * 0.12 * (1.0 - d));
        gl_FragColor = vec4(uColor, a);
      }
    `,
  });
  const mesh = new THREE.Mesh(new THREE.CircleGeometry(12, 48), material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = WATER_Y;
  return { mesh, material };
}

export function makeIceberg(quality: "high" | "low"): {
  group: THREE.Group;
  tick: (t: number, assembly: number) => void;
} {
  const group = new THREE.Group();

  const bergMat = makeBergMaterial();
  const berg = new THREE.Mesh(makeBergGeometry(quality === "high" ? 2 : 1), bergMat);
  group.add(berg);

  const water = makeWater();
  group.add(water.mesh);

  // small calved fragments adrift around the berg
  const fragCount = quality === "high" ? 9 : 5;
  const frags: { mesh: THREE.Mesh; angle: number; radius: number; phase: number }[] = [];
  const fragMat = makeBergMaterial();
  for (let i = 0; i < fragCount; i++) {
    const g = new THREE.OctahedronGeometry(0.14 + rand() * 0.22, 0);
    g.scale(1, 0.55 + rand() * 0.4, 1);
    const mesh = new THREE.Mesh(g, fragMat);
    const angle = (i / fragCount) * Math.PI * 2 + rand() * 0.8;
    const radius = 2.9 + rand() * 2.6;
    mesh.position.set(Math.cos(angle) * radius, WATER_Y + 0.05, Math.sin(angle) * radius);
    mesh.rotation.y = rand() * Math.PI;
    group.add(mesh);
    frags.push({ mesh, angle, radius, phase: rand() * Math.PI * 2 });
  }

  return {
    group,
    tick(t, assembly) {
      bergMat.uniforms.uTime.value = t;
      fragMat.uniforms.uTime.value = t;
      water.material.uniforms.uTime.value = t;
      // intro: the berg rises out of the mist, then settles into a slow bob
      const e = 1 - Math.pow(1 - assembly, 3);
      berg.position.y = THREE.MathUtils.lerp(-5.5, 0, e) + Math.sin(t * 0.5) * 0.06 * e;
      berg.rotation.y = t * 0.035;
      berg.rotation.z = Math.sin(t * 0.33) * 0.02 * e;
      water.mesh.scale.setScalar(0.2 + e * 0.8);
      frags.forEach((f, i) => {
        const drift = f.angle + t * 0.03 * (i % 2 ? 1 : -1);
        f.mesh.position.x = Math.cos(drift) * f.radius;
        f.mesh.position.z = Math.sin(drift) * f.radius;
        f.mesh.position.y = WATER_Y + 0.05 + Math.sin(t * 0.7 + f.phase) * 0.05 * e;
        f.mesh.rotation.y += 0.0009;
      });
    },
  };
}
