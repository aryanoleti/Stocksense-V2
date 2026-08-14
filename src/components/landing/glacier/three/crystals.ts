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



/* Irregular shard hull: an icosa displaced by position-keyed noise, so every
   enclosure is a unique chunk of ice rather than a regular polyhedron. Equal
   inputs give equal displacement, so duplicated vertices stay welded. */
export function makeShardGeometry(radius: number, seed: number): THREE.BufferGeometry {
  const geo = new THREE.IcosahedronGeometry(radius, 1).toNonIndexed();
  const pos = geo.getAttribute("position") as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const n =
      Math.sin(v.x * 1.9 + v.y * 1.2 + seed) * Math.cos(v.z * 1.6 + seed * 2.0) * 0.5 +
      Math.sin(v.y * 2.8 + v.z * 1.1 + seed * 3.0) * 0.26;
    v.multiplyScalar(1 + n * 0.22);
    v.y *= 1.16; // shards run tall, like calved ice
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  return geo;
}

/* Translucent enclosure: a shard-shaped shell with an additive fresnel skin
   and a faint wireframe, so each module reads as "sealed in ice". */
export function makeEnclosure(
  radius: number,
  rim: string,
  withWire: boolean,
  seed = 0
): THREE.Group {
  const group = new THREE.Group();
  const skin = new THREE.Mesh(
    makeShardGeometry(radius, seed),
    makeIceMaterial({ deep: "#0a2334", rim, opacity: 0.16, additive: true })
  );
  group.add(skin);
  if (withWire) {
    const wire = new THREE.LineSegments(
      new THREE.EdgesGeometry(makeShardGeometry(radius, seed), 18),
      new THREE.LineBasicMaterial({ color: new THREE.Color(rim), transparent: true, opacity: 0.16 })
    );
    group.add(wire);
  }
  return group;
}
