import * as THREE from "three";
import { rand } from "./crystals";

/* Mission-section centrepiece: three concentric bands of carved ice arcs,
   scattered while far away, fusing into one perfect circle as the camera
   closes in. Assembly is driven by scroll proximity, not time. */

function makeArcMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uBase: { value: new THREE.Color("#c9dde9") },
      uDeep: { value: new THREE.Color("#6f93ab") },
      uGlow: { value: new THREE.Color("#8fe6d2") },
      uCharge: { value: 0 },
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
      uniform vec3 uBase;
      uniform vec3 uDeep;
      uniform vec3 uGlow;
      uniform float uCharge;
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vec3 n = normalize(vNormal);
        float sun = max(dot(n, normalize(vec3(0.35, 0.75, 0.55))), 0.0);
        float fres = pow(1.0 - abs(dot(n, normalize(vView))), 2.2);
        vec3 col = mix(uDeep, uBase, sun);
        // the halo charges up as the circle completes
        col += uGlow * (fres * (0.15 + uCharge * 0.85) + uCharge * 0.12);
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

export function makeRingScene(quality: "high" | "low"): {
  group: THREE.Group;
  tick: (t: number, assembly: number, pointerX: number, pointerY: number) => void;
} {
  const group = new THREE.Group();
  const mat = makeArcMaterial();
  const fragments: Fragment[] = [];

  const addArc = (
    radius: number,
    tube: number,
    startA: number,
    lengthA: number,
    depth: number
  ) => {
    // an arc "brick": torus slice, squared off by scaling in z
    const geo = new THREE.TorusGeometry(radius, tube, 8, 20, lengthA).toNonIndexed();
    geo.scale(1, 1, depth / tube);
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, mat);
    const homeRotZ = startA;
    const dir = startA + lengthA / 2;
    fragments.push({
      mesh,
      homePos: new THREE.Vector3(0, 0, 0),
      homeRotZ,
      // scattered: pushed out along its own angle, kicked in z, twisted
      scatterPos: new THREE.Vector3(
        Math.cos(dir) * (1.2 + rand() * 2.2),
        Math.sin(dir) * (1.2 + rand() * 2.2),
        (rand() - 0.5) * 5
      ),
      scatterRot: new THREE.Vector3((rand() - 0.5) * 1.6, (rand() - 0.5) * 1.6, (rand() - 0.5) * 2.4),
    });
    group.add(mesh);
  };

  // outer band: 7 big segments with mortar gaps
  for (let i = 0; i < 7; i++) {
    addArc(2.6, 0.34, (i / 7) * Math.PI * 2, (Math.PI * 2) / 7 - 0.09, 0.42);
  }
  // middle band: 5 slimmer arcs
  for (let i = 0; i < 5; i++) {
    addArc(1.65, 0.2, (i / 5) * Math.PI * 2 + 0.4, (Math.PI * 2) / 5 - 0.35, 0.26);
  }
  // inner band: 3 arcs + drifting keystones
  for (let i = 0; i < 3; i++) {
    addArc(0.95, 0.16, (i / 3) * Math.PI * 2 + 1.1, (Math.PI * 2) / 3 - 0.75, 0.2);
  }
  const keys = quality === "high" ? 4 : 2;
  for (let i = 0; i < keys; i++) {
    const geo = new THREE.BoxGeometry(0.22, 0.22, 0.22).toNonIndexed();
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, mat);
    const a = (i / keys) * Math.PI * 2 + 0.6;
    fragments.push({
      mesh,
      homePos: new THREE.Vector3(Math.cos(a) * 1.3, Math.sin(a) * 1.3, 0),
      homeRotZ: a,
      scatterPos: new THREE.Vector3(Math.cos(a) * 3.4, Math.sin(a) * 3.4, (rand() - 0.5) * 4),
      scatterRot: new THREE.Vector3(rand() * 2, rand() * 2, rand() * 2),
    });
    group.add(mesh);
  }

  // halo: an additive ring of light behind the stonework
  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(2.15, 0.5, 8, 64),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color("#bdeee2"),
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  halo.position.z = -0.35;
  group.add(halo);

  return {
    group,
    tick(t, assembly, pointerX, pointerY) {
      // smoothstep so the final click into place feels decisive
      const a = assembly * assembly * (3 - 2 * assembly);
      mat.uniforms.uCharge.value = a;
      (halo.material as THREE.MeshBasicMaterial).opacity = a * 0.5 + Math.sin(t * 1.7) * 0.04 * a;
      group.rotation.z = t * 0.04;
      // the whole assembly leans toward the pointer
      group.rotation.x = pointerY * -0.18;
      group.rotation.y = pointerX * 0.22;
      fragments.forEach((f, i) => {
        f.mesh.position.lerpVectors(f.scatterPos, f.homePos, a);
        f.mesh.rotation.set(
          f.scatterRot.x * (1 - a),
          f.scatterRot.y * (1 - a),
          f.homeRotZ + f.scatterRot.z * (1 - a)
        );
        // once whole, the circle breathes as one body
        const s = 1 + a * Math.sin(t * 0.9 + i * 0.3) * 0.008;
        f.mesh.scale.setScalar(s);
      });
    },
  };
}
