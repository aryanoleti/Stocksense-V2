import * as THREE from "three";
import { rand } from "./crystals";
import {
  fogUniforms,
  FOG_VERT_DECL,
  FOG_VERT_BODY,
  FOG_FRAG_DECL,
  FOG_FRAG_APPLY,
} from "./fog";

/* Hero scene: a shelter built from translucent ice blocks on a snowfield.
   Hovering (or tapping) lifts the courses apart around a warm inner glow;
   leaving lets them settle back. Everything is procedural. */

/* Ice-block shader. The blocks are genuinely translucent: a view-dependent
   thickness term darkens the deep parts, a fresnel rim lights the edges, and
   internal banding stands in for the trapped bubbles in packed snow-ice. */
function makeIceBlockMaterial(glowTint: string): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    // depth-write off would let blocks sort wrongly against each other; keep
    // it on and lean on a high base alpha so the dome still reads as solid
    depthWrite: true,
    side: THREE.DoubleSide,
    uniforms: {
      uShallow: { value: new THREE.Color("#eaf7ff") },
      uDeepTint: { value: new THREE.Color("#7fb2cc") },
      uCore: { value: new THREE.Color("#2f6c8c") },
      uGlow: { value: new THREE.Color(glowTint) },
      uOpen: { value: 0 },
      uTime: { value: 0 },
      ...fogUniforms,
    },
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      varying vec3 vView;
      varying vec3 vLocal;
      ${FOG_VERT_DECL}
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vView = normalize(-mv.xyz);
        vLocal = position;
        ${FOG_VERT_BODY}
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uShallow;
      uniform vec3 uDeepTint;
      uniform vec3 uCore;
      uniform vec3 uGlow;
      uniform float uOpen;
      uniform float uTime;
      varying vec3 vNormal;
      varying vec3 vView;
      varying vec3 vLocal;
      ${FOG_FRAG_DECL}
      void main() {
        vec3 n = normalize(vNormal);
        vec3 v = normalize(vView);
        float facing = abs(dot(n, v));
        // grazing angles look through more ice, so they read denser
        float thickness = 1.0 - facing;
        float fres = pow(thickness, 2.0);
        float sun = max(dot(n, normalize(vec3(0.4, 0.8, 0.45))), 0.0);

        vec3 col = mix(uShallow, uDeepTint, thickness * 0.85);
        col = mix(col, uCore, thickness * thickness * 0.4);
        col += uShallow * sun * 0.35;
        // frozen bubbles / cleavage planes inside the block
        float bubbles = sin(vLocal.x * 41.0) * sin(vLocal.y * 37.0 + 1.7) * sin(vLocal.z * 33.0);
        col += vec3(0.05) * smoothstep(0.55, 1.0, bubbles);
        // edges catch the light, and the inner glow when the shelter opens
        col += uGlow * fres * (0.15 + uOpen * 0.7);
        ${FOG_FRAG_APPLY}
        // thin where we look straight through, opaque at grazing angles
        float alpha = 0.55 + thickness * 0.4 + uOpen * 0.05;
        gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
      }
    `,
  });
}

/* Rolling snowfield with a flattened pad for the shelter. Position-keyed trig
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
    h *= Math.min(1, d / 7); // flatten the pad the shelter sits on
    h += Math.max(0, d - 16) * 0.32; // valley walls rise toward the rim
    pos.setY(i, h - 1.35);
  }
  geo.computeVertexNormals();
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uHigh: { value: new THREE.Color("#f6fcff") },
      uLow: { value: new THREE.Color("#cfe3ef") },
      ...fogUniforms,
    },
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      ${FOG_VERT_DECL}
      void main() {
        vNormal = normal;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        ${FOG_VERT_BODY}
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uHigh;
      uniform vec3 uLow;
      varying vec3 vNormal;
      ${FOG_FRAG_DECL}
      void main() {
        float slope = clamp(normalize(vNormal).y, 0.0, 1.0);
        vec3 col = mix(uLow, uHigh, slope);
        ${FOG_FRAG_APPLY}
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
  closedQuat: THREE.Quaternion;
  openTilt: number;
};

const R = 1.9; // dome radius

export function makeIglooScene(quality: "high" | "low"): {
  group: THREE.Group;
  hitSphere: THREE.Sphere;
  state: { open: number };
  tick: (t: number, assembly: number, dt: number) => void;
  setOpen: (target: number) => void;
} {
  const group = new THREE.Group();
  group.add(makeTerrain(quality === "high" ? 96 : 48));

  const shelter = new THREE.Group();
  shelter.position.set(0, -1.32, 0);
  group.add(shelter);

  const mat = makeIceBlockMaterial("#7fe0c3");
  const blocks: Block[] = [];
  const up = new THREE.Vector3(0, 1, 0);

  /* Place one block tangent to the dome surface at (azimuth, elevation), so
     every course leans inward exactly like real snow-block construction. */
  const addDomeBlock = (az: number, elev: number, arcWidth: number, courseH: number) => {
    const ringR = Math.cos(elev) * R;
    const pos = new THREE.Vector3(
      Math.cos(az) * ringR,
      Math.sin(elev) * R,
      Math.sin(az) * ringR
    );
    // width along the course, height along the meridian, depth into the dome
    const w = Math.max(0.12, arcWidth * ringR - 0.06);
    const geo = new THREE.BoxGeometry(w, courseH, 0.3).toNonIndexed();
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(pos);
    // orient: block's +Z points out along the surface normal
    const normal = pos.clone().normalize();
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
    shelter.add(mesh);
    blocks.push({
      mesh,
      closedPos: pos.clone(),
      openPos: pos.clone().add(normal.clone().multiplyScalar(0.5 + rand() * 0.45)).add(up.clone().multiplyScalar(0.12 + elev * 0.4)),
      closedQuat: mesh.quaternion.clone(),
      openTilt: (rand() - 0.5) * 0.55,
    });
  };

  // courses of blocks up the dome; each course is shorter and has fewer blocks
  const courses = quality === "high" ? 6 : 4;
  const doorAz = 0; // entrance faces +X
  for (let c = 0; c < courses; c++) {
    const elev = ((c + 0.5) / (courses + 0.6)) * (Math.PI / 2);
    const courseH = (Math.PI / 2 / (courses + 0.6)) * R * 0.92;
    const ringR = Math.cos(elev) * R;
    const count = Math.max(6, Math.round((2 * Math.PI * ringR) / 0.52));
    const arcWidth = (Math.PI * 2) / count;
    for (let i = 0; i < count; i++) {
      const az = i * arcWidth + c * arcWidth * 0.5; // stagger like brickwork
      // leave a doorway in the bottom two courses
      const delta = Math.abs(Math.atan2(Math.sin(az - doorAz), Math.cos(az - doorAz)));
      if (c < 2 && delta < 0.42) continue;
      addDomeBlock(az, elev, arcWidth, courseH);
    }
  }
  // keystone
  const capGeo = new THREE.BoxGeometry(0.46, 0.2, 0.46).toNonIndexed();
  capGeo.computeVertexNormals();
  const cap = new THREE.Mesh(capGeo, mat);
  cap.position.set(0, R * 0.99, 0);
  shelter.add(cap);
  blocks.push({
    mesh: cap,
    closedPos: cap.position.clone(),
    openPos: cap.position.clone().add(new THREE.Vector3(0, 1.1, 0)),
    closedQuat: cap.quaternion.clone(),
    openTilt: 0.4,
  });

  // entrance tunnel: a short barrel of blocks stepping out from the doorway
  for (let seg = 0; seg < 2; seg++) {
    const x = R * 0.94 + 0.22 + seg * 0.42;
    [-1, 0, 1].forEach((side) => {
      const isTop = side === 0;
      const geo = new THREE.BoxGeometry(0.38, isTop ? 0.22 : 0.52, 0.3).toNonIndexed();
      geo.computeVertexNormals();
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, isTop ? 0.66 : 0.3, side * 0.42);
      mesh.rotation.z = isTop ? 0 : 0;
      shelter.add(mesh);
      blocks.push({
        mesh,
        closedPos: mesh.position.clone(),
        openPos: mesh.position
          .clone()
          .add(new THREE.Vector3(0.42, isTop ? 0.55 : 0.15, side * 0.45)),
        closedQuat: mesh.quaternion.clone(),
        openTilt: (rand() - 0.5) * 0.5,
      });
    });
  }

  // warm core that shines out through the ice while open
  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(R * 0.62, 16, 16),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color("#aef0dc"),
      transparent: true,
      opacity: 0.06,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  glow.position.y = R * 0.4;
  shelter.add(glow);

  const state = { open: 0 };
  let openTarget = 0;
  const tmpQuat = new THREE.Quaternion();
  const tiltAxis = new THREE.Vector3(0, 0, 1);

  return {
    group,
    hitSphere: new THREE.Sphere(new THREE.Vector3(0, -0.3, 0), 3.0),
    state,
    setOpen(target: number) {
      openTarget = target;
    },
    tick(t, assembly, dt) {
      // dt-based so the open speed is identical at 60Hz and 144Hz
      state.open += (openTarget - state.open) * Math.min(1, dt * 4.2);
      const open = state.open;
      const e = 1 - Math.pow(1 - assembly, 3);
      mat.uniforms.uOpen.value = open;
      mat.uniforms.uTime.value = t;
      (glow.material as THREE.MeshBasicMaterial).opacity = 0.06 + open * 0.42;
      shelter.scale.setScalar(0.25 + 0.75 * e);
      blocks.forEach((b, i) => {
        b.mesh.position.lerpVectors(b.closedPos, b.openPos, open);
        b.mesh.position.y += Math.sin(t * 1.1 + i * 1.7) * 0.03 * open;
        // rotate from the closed orientation rather than overwriting it, so
        // the tangent alignment of each dome block survives the animation
        tmpQuat.setFromAxisAngle(tiltAxis, b.openTilt * open);
        b.mesh.quaternion.copy(b.closedQuat).multiply(tmpQuat);
      });
    },
  };
}
