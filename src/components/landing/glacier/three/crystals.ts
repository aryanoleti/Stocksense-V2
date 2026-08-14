import * as THREE from "three";

/* Shared fresnel "ice" shader. Facet shading comes from non-indexed geometry
   (per-face normals); the fresnel term fakes the translucent rim of ice. */
export function makeIceMaterial(opts: {
  deep: string;
  rim: string;
  opacity?: number;
  additive?: boolean;
}): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: !opts.additive,
    blending: opts.additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    side: THREE.FrontSide,
    uniforms: {
      uDeep: { value: new THREE.Color(opts.deep) },
      uRim: { value: new THREE.Color(opts.rim) },
      uOpacity: { value: opts.opacity ?? 0.9 },
      uTime: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      varying vec3 vView;
      varying vec3 vPos;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vView = normalize(-mv.xyz);
        vPos = position;
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uDeep;
      uniform vec3 uRim;
      uniform float uOpacity;
      uniform float uTime;
      varying vec3 vNormal;
      varying vec3 vView;
      varying vec3 vPos;
      void main() {
        float fres = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 2.2);
        // faint internal banding so large faces don't read flat
        float band = 0.06 * sin(vPos.y * 7.0 + vPos.x * 3.0 + uTime * 0.4);
        vec3 col = mix(uDeep, uRim, clamp(fres + band, 0.0, 1.0));
        // facet highlight: faces angled toward a fixed "sky" light get a lift
        float sky = max(dot(normalize(vNormal), normalize(vec3(0.3, 0.9, 0.4))), 0.0);
        col += uRim * sky * 0.18;
        gl_FragColor = vec4(col, uOpacity * (0.55 + fres * 0.45));
      }
    `,
  });
}

let seed = 7;
/* Deterministic PRNG so the world looks the same on every visit. */
export function rand(): number {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
}
export function resetRand(s = 7): void {
  seed = s;
}

function shardGeometry(scaleY: number): THREE.BufferGeometry {
  // Stretched octahedron = classic ice spike; non-indexed for flat facets
  const g = new THREE.OctahedronGeometry(1, 0).toNonIndexed();
  g.scale(0.32 + rand() * 0.3, scaleY, 0.32 + rand() * 0.3);
  g.computeVertexNormals();
  return g;
}

/* Grow a crystal cluster: shards radiate from a seed point, shrinking as they
   move outward — a cheap take on crystal growth that still reads organic. */
export function makeCrystalCluster(opts: {
  shardCount: number;
  radius: number;
  material: THREE.ShaderMaterial;
}): { group: THREE.Group; shards: THREE.Mesh[] } {
  const group = new THREE.Group();
  const shards: THREE.Mesh[] = [];
  for (let i = 0; i < opts.shardCount; i++) {
    const t = i / opts.shardCount;
    const size = THREE.MathUtils.lerp(1.35, 0.35, t) * (0.75 + rand() * 0.5);
    const mesh = new THREE.Mesh(shardGeometry(size * 1.9), opts.material);
    const dir = new THREE.Vector3(rand() - 0.5, rand() * 0.9 - 0.25, rand() - 0.5).normalize();
    const dist = t * opts.radius * (0.6 + rand() * 0.7);
    mesh.position.copy(dir.clone().multiplyScalar(dist));
    // orient the spike along its growth direction with a little jitter
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    mesh.rotateOnAxis(new THREE.Vector3(1, 0, 0), (rand() - 0.5) * 0.7);
    mesh.scale.setScalar(size);
    group.add(mesh);
    shards.push(mesh);
  }
  return { group, shards };
}

/* Translucent enclosure: a low-poly icosa shell with an additive fresnel skin
   and a faint wireframe, so each module reads as "sealed in ice". */
export function makeEnclosure(radius: number, rim: string, withWire: boolean): THREE.Group {
  const group = new THREE.Group();
  const geo = new THREE.IcosahedronGeometry(radius, 1).toNonIndexed();
  geo.computeVertexNormals();
  const skin = new THREE.Mesh(
    geo,
    makeIceMaterial({ deep: "#0a2334", rim, opacity: 0.16, additive: true })
  );
  group.add(skin);
  if (withWire) {
    const wire = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(radius, 1), 12),
      new THREE.LineBasicMaterial({ color: new THREE.Color(rim), transparent: true, opacity: 0.14 })
    );
    group.add(wire);
  }
  return group;
}
