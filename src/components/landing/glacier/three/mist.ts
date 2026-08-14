import * as THREE from "three";
import { rand } from "./crystals";
import { fogUniforms, FOG_VERT_DECL, FOG_VERT_BODY, FOG_FRAG_DECL, FOG_FRAG_APPLY } from "./fog";

/* Atmosphere for the surface scene: drifting mist banks plus dark foreground
   ridges. Depth fog alone reads flat — the layered banks are what make the
   hero feel like weather rather than a gradient. */

/* A soft, slowly-scrolling cloud band. The shape comes from summed sine
   ridges masked by a radial falloff, so it costs one quad and no texture. */
function makeBank(width: number, height: number, seed: number, tint: string): THREE.Mesh {
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: { value: 0 },
      uSeed: { value: seed },
      uTint: { value: new THREE.Color(tint) },
      uOpacity: { value: 1 },
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
      uniform float uSeed;
      uniform vec3 uTint;
      uniform float uOpacity;
      varying vec2 vUv;
      void main() {
        vec2 p = vUv;
        // three drifting sine ridges stacked into a soft cloud profile
        float d = uTime * 0.012 + uSeed;
        float body =
          sin(p.x * 4.7 + d * 2.1 + uSeed) * 0.25 +
          sin(p.x * 9.3 - d * 1.4) * 0.14 +
          sin(p.x * 17.0 + d * 3.2 + uSeed * 2.0) * 0.07;
        // the band lives around the middle of the quad
        float profile = 1.0 - smoothstep(0.0, 0.42, abs(p.y - 0.5 - body));
        // fade the ends so the quad edges never show
        float ends = smoothstep(0.0, 0.22, p.x) * (1.0 - smoothstep(0.78, 1.0, p.x));
        float a = profile * profile * ends * uOpacity;
        gl_FragColor = vec4(uTint, a * 0.5);
      }
    `,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
  mesh.userData.material = material;
  return mesh;
}

export function makeMist(quality: "high" | "low"): {
  group: THREE.Group;
  tick: (t: number, assembly: number) => void;
} {
  const group = new THREE.Group();
  const banks: { mesh: THREE.Mesh; baseX: number; speed: number; mat: THREE.ShaderMaterial }[] = [];
  const count = quality === "high" ? 5 : 3;
  for (let i = 0; i < count; i++) {
    const z = -13 + i * 3.4; // stacked from the horizon toward the camera
    const y = -1.6 + i * 0.42 + rand() * 0.3;
    const mesh = makeBank(26 - i * 2.2, 7, i * 2.7, i < 2 ? "#eaf4fb" : "#f6fbff");
    mesh.position.set(0, y, z);
    // nearest banks are the brightest and thickest
    (mesh.userData.material as THREE.ShaderMaterial).uniforms.uOpacity.value = 0.45 + i * 0.16;
    group.add(mesh);
    banks.push({
      mesh,
      baseX: (rand() - 0.5) * 3,
      speed: 0.05 + i * 0.035,
      mat: mesh.userData.material as THREE.ShaderMaterial,
    });
  }

  return {
    group,
    tick(t, assembly) {
      banks.forEach((b, i) => {
        b.mat.uniforms.uTime.value = t;
        // slow lateral drift, wrapped so banks never run out of the frame
        const span = 9;
        const x = ((b.baseX + t * b.speed + span) % (span * 2)) - span;
        b.mesh.position.x = x;
        b.mesh.position.y += Math.sin(t * 0.25 + i) * 0.0006;
        // mist thins as the intro resolves, revealing the berg
        b.mat.uniforms.uOpacity.value = (0.45 + i * 0.16) * (1 - assembly * 0.35);
      });
    },
  };
}

/* Dark ridges at the very front of the frame. They sit close to the camera,
   below the horizon, and give the hero its foreground layer. */
export function makeForegroundRidges(): THREE.Group {
  const group = new THREE.Group();
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uNear: { value: new THREE.Color("#3d5f78") },
      uFar: { value: new THREE.Color("#8fb0c6") },
      ...fogUniforms,
    },
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      ${FOG_VERT_DECL}
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        ${FOG_VERT_BODY}
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uNear;
      uniform vec3 uFar;
      varying vec3 vNormal;
      ${FOG_FRAG_DECL}
      void main() {
        float sun = max(dot(normalize(vNormal), normalize(vec3(0.4, 0.85, 0.4))), 0.0);
        vec3 col = mix(uNear, uFar, sun);
        ${FOG_FRAG_APPLY}
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });

  // a handful of angular peaks scattered across the bottom of the frame
  const spots: [number, number, number][] = [
    [-6.2, -3.4, 3.6],
    [-2.6, -3.9, 5.0],
    [3.4, -3.6, 4.2],
    [6.8, -3.2, 3.0],
  ];
  spots.forEach(([x, y, z], i) => {
    const geo = new THREE.ConeGeometry(1.5 + rand() * 1.4, 2.4 + rand() * 1.6, 5).toNonIndexed();
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, material);
    mesh.position.set(x, y, z);
    mesh.rotation.y = rand() * Math.PI;
    mesh.rotation.z = (rand() - 0.5) * 0.25;
    mesh.scale.setScalar(1 + i * 0.1);
    group.add(mesh);
  });
  return group;
}
