import * as THREE from "three";
import { rand } from "./crystals";
import {
  fogUniforms,
  FOG_VERT_DECL,
  FOG_VERT_BODY,
  FOG_FRAG_DECL,
  FOG_FRAG_APPLY,
} from "./fog";

/* Mission section: three ring gates stacked down the descent. Each one is
   scattered ice arcs while it is far below; as the camera drops toward it the
   pieces swing into a complete circle, and the visitor falls straight through
   the middle. Assembly is driven by camera proximity, never by time. */

function makeArcMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uBase: { value: new THREE.Color("#dceaf3") },
      uDeep: { value: new THREE.Color("#7fa3ba") },
      uGlow: { value: new THREE.Color("#8fe6d2") },
      uCharge: { value: 0 },
      ...fogUniforms,
    },
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      varying vec3 vView;
      ${FOG_VERT_DECL}
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vView = normalize(-mv.xyz);
        ${FOG_VERT_BODY}
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uBase;
      uniform vec3 uDeep;
      uniform vec3 uGlow;
      uniform float uCharge;
      varying vec3 vNormal;
      varying vec3 vView;
      ${FOG_FRAG_DECL}
      void main() {
        vec3 n = normalize(vNormal);
        float sun = max(dot(n, normalize(vec3(0.35, 0.75, 0.55))), 0.0);
        float fres = pow(1.0 - abs(dot(n, normalize(vView))), 2.2);
        vec3 col = mix(uDeep, uBase, sun);
        // the rim charges up as the circle completes
        col += uGlow * (fres * (0.15 + uCharge * 0.85) + uCharge * 0.12);
        ${FOG_FRAG_APPLY}
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
}

type Fragment = {
  mesh: THREE.Mesh;
  homePos: THREE.Vector3;
  homeRotZ: number;
  scatterPos: THREE.Vector3;
  scatterRot: THREE.Vector3;
};

type Gate = {
  group: THREE.Group;
  localY: number;
  fragments: Fragment[];
  halo: THREE.Mesh;
  mat: THREE.ShaderMaterial;
};

/* Vertical spacing of the gates below the section anchor. */
export const GATE_YS = [2, -4, -10];

function buildGate(index: number, quality: "high" | "low"): Gate {
  const group = new THREE.Group();
  // lay the ring flat so its axis is vertical — the camera descends through it
  group.rotation.x = -Math.PI / 2;
  const mat = makeArcMaterial();
  const fragments: Fragment[] = [];
  const scale = 1 - index * 0.12; // inner gates are slightly tighter

  const addArc = (radius: number, tube: number, startA: number, lengthA: number, depth: number) => {
    const geo = new THREE.TorusGeometry(radius * scale, tube, 8, 22, lengthA).toNonIndexed();
    geo.scale(1, 1, depth / tube);
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, mat);
    const dir = startA + lengthA / 2;
    fragments.push({
      mesh,
      homePos: new THREE.Vector3(0, 0, 0),
      homeRotZ: startA,
      // scattered: flung outward along its own angle and twisted out of plane
      scatterPos: new THREE.Vector3(
        Math.cos(dir) * (1.6 + rand() * 3.0),
        Math.sin(dir) * (1.6 + rand() * 3.0),
        (rand() - 0.5) * 6
      ),
      scatterRot: new THREE.Vector3((rand() - 0.5) * 1.8, (rand() - 0.5) * 1.8, (rand() - 0.5) * 2.6),
    });
    group.add(mesh);
  };

  // outer band — the ring the visitor actually passes through
  for (let i = 0; i < 7; i++) {
    addArc(3.4, 0.32, (i / 7) * Math.PI * 2, (Math.PI * 2) / 7 - 0.1, 0.4);
  }
  // inner band, offset so the two never line up
  for (let i = 0; i < 5; i++) {
    addArc(2.5, 0.18, (i / 5) * Math.PI * 2 + 0.4, (Math.PI * 2) / 5 - 0.3, 0.24);
  }
  const keys = quality === "high" ? 5 : 3;
  for (let i = 0; i < keys; i++) {
    const geo = new THREE.BoxGeometry(0.2, 0.2, 0.2).toNonIndexed();
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, mat);
    const a = (i / keys) * Math.PI * 2 + 0.6;
    const r = 2.0 * scale;
    fragments.push({
      mesh,
      homePos: new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0),
      homeRotZ: a,
      scatterPos: new THREE.Vector3(Math.cos(a) * 4.4, Math.sin(a) * 4.4, (rand() - 0.5) * 5),
      scatterRot: new THREE.Vector3(rand() * 2, rand() * 2, rand() * 2),
    });
    group.add(mesh);
  }

  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(3.0 * scale, 0.5, 8, 64),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color("#bdeee2"),
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  group.add(halo);

  group.position.y = GATE_YS[index];
  return { group, localY: GATE_YS[index], fragments, halo, mat };
}

export function makeRingScene(quality: "high" | "low"): {
  group: THREE.Group;
  /* camLocalY = camera height relative to the section anchor */
  tick: (t: number, camLocalY: number, pointerX: number, pointerY: number) => void;
} {
  const group = new THREE.Group();
  const gates = GATE_YS.map((_, i) => {
    const gate = buildGate(i, quality);
    group.add(gate.group);
    return gate;
  });

  return {
    group,
    tick(t, camLocalY, pointerX, pointerY) {
      gates.forEach((gate, gi) => {
        // distance from the camera down to this gate drives its assembly:
        // whole by the time the visitor arrives, so they fall through a
        // complete circle rather than a cloud of pieces
        const dist = camLocalY - gate.localY;
        const a = THREE.MathUtils.clamp(1 - (dist - 1.0) / 11, 0, 1);
        const eased = a * a * (3 - 2 * a);
        gate.mat.uniforms.uCharge.value = eased;
        (gate.halo.material as THREE.MeshBasicMaterial).opacity =
          eased * 0.45 + Math.sin(t * 1.7 + gi) * 0.03 * eased;
        // slow counter-rotation gives each gate its own character
        gate.group.rotation.z = t * (0.05 + gi * 0.03) * (gi % 2 ? -1 : 1);
        gate.group.rotation.x = -Math.PI / 2 + pointerY * 0.05;
        gate.group.rotation.y = pointerX * 0.06;
        gate.fragments.forEach((f, i) => {
          f.mesh.position.lerpVectors(f.scatterPos, f.homePos, eased);
          f.mesh.rotation.set(
            f.scatterRot.x * (1 - eased),
            f.scatterRot.y * (1 - eased),
            f.homeRotZ + f.scatterRot.z * (1 - eased)
          );
          f.mesh.scale.setScalar(1 + eased * Math.sin(t * 0.9 + i * 0.3) * 0.008);
        });
      });
    },
  };
}
