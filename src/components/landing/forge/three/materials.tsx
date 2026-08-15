"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* Materials shared across the sequence.

   The shards use drei's MeshTransmissionMaterial for real refraction; these
   are the hand-written ones where a stock material could not do the job:
   light bleeding out of seams, and the fracture distortion on click. */

/* ---------------------------------------------------------------------- */
/* Hero monolith. Stone-grey outside, with light escaping along the seams:
   the shader finds the creases (where the surface normal turns away from the
   viewer) and lets an inner glow bleed through them. */
export function MonolithMaterial({
  fracture = 0,
  glow = 1,
}: {
  fracture?: number;
  glow?: number;
}) {
  const ref = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uFracture: { value: 0 },
      uGlow: { value: 1 },
      uStone: { value: new THREE.Color("#b9bfc6") },
      uStoneDark: { value: new THREE.Color("#5d666f") },
      uSeam: { value: new THREE.Color("#dff1ff") },
      uCore: { value: new THREE.Color("#9fd8ff") },
      uFog: { value: new THREE.Color("#d8dde2") },
      uFogDensity: { value: 0.055 },
    }),
    []
  );

  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.uniforms.uTime.value += dt;
    ref.current.uniforms.uFracture.value = fracture;
    ref.current.uniforms.uGlow.value = glow;
  });

  return (
    <shaderMaterial
      ref={ref}
      uniforms={uniforms}
      vertexShader={/* glsl */ `
        uniform float uTime;
        uniform float uFracture;
        varying vec3 vNormal;
        varying vec3 vView;
        varying vec3 vLocal;
        varying float vDepth;

        // cheap value noise, enough to push vertices apart convincingly
        float hash(vec3 p) {
          return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453);
        }

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vLocal = position;
          vec3 p = position;
          // click-to-fracture: shove faces out along their normals in clumps
          if (uFracture > 0.0) {
            float chunk = hash(floor(position * 3.0));
            p += normal * chunk * uFracture * 0.5;
            p.x += sin(uTime * 40.0 + chunk * 30.0) * uFracture * 0.05;
          }
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          vView = normalize(-mv.xyz);
          vDepth = -mv.z;
          gl_Position = projectionMatrix * mv;
        }
      `}
      fragmentShader={/* glsl */ `
        uniform float uTime;
        uniform float uGlow;
        uniform float uFracture;
        uniform vec3 uStone;
        uniform vec3 uStoneDark;
        uniform vec3 uSeam;
        uniform vec3 uCore;
        uniform vec3 uFog;
        uniform float uFogDensity;
        varying vec3 vNormal;
        varying vec3 vView;
        varying vec3 vLocal;
        varying float vDepth;

        void main() {
          vec3 n = normalize(vNormal);
          vec3 v = normalize(vView);
          float facing = abs(dot(n, v));
          float sky = max(dot(n, normalize(vec3(0.25, 0.95, 0.3))), 0.0);

          // overcast key: soft, no harsh terminator
          vec3 col = mix(uStoneDark, uStone, 0.35 + sky * 0.65);

          // Seams: creases in the geometry run along the faceted edges, which
          // are exactly where the facing term collapses. Light escapes there.
          float crease = pow(1.0 - facing, 3.0);
          float veins = sin(vLocal.y * 9.0 + vLocal.x * 5.0) * sin(vLocal.z * 7.0);
          float seam = crease * (0.55 + 0.45 * smoothstep(0.1, 0.9, veins));
          float pulse = 0.85 + 0.15 * sin(uTime * 0.9);
          col += uSeam * seam * uGlow * pulse * 1.35;
          col += uCore * pow(crease, 1.6) * uGlow * pulse * 0.8;
          // fracturing floods the seams with light
          col += uCore * uFracture * crease * 2.2;

          float f = 1.0 - exp(-uFogDensity * uFogDensity * vDepth * vDepth);
          col = mix(col, uFog, clamp(f, 0.0, 1.0));
          gl_FragColor = vec4(col, 1.0);
        }
      `}
    />
  );
}

/* ---------------------------------------------------------------------- */
/* Terrain: matte, desaturated, dissolving into the haze with distance so the
   horizon has no hard edge. */
export function TerrainMaterial() {
  const uniforms = useMemo(
    () => ({
      uHigh: { value: new THREE.Color("#e8ebee") },
      uLow: { value: new THREE.Color("#9aa4ad") },
      uFog: { value: new THREE.Color("#d8dde2") },
      uFogDensity: { value: 0.055 },
    }),
    []
  );
  return (
    <shaderMaterial
      uniforms={uniforms}
      vertexShader={/* glsl */ `
        varying vec3 vNormal;
        varying float vDepth;
        varying vec3 vLocal;
        void main() {
          vNormal = normal;
          vLocal = position;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vDepth = -mv.z;
          gl_Position = projectionMatrix * mv;
        }
      `}
      fragmentShader={/* glsl */ `
        uniform vec3 uHigh;
        uniform vec3 uLow;
        uniform vec3 uFog;
        uniform float uFogDensity;
        varying vec3 vNormal;
        varying float vDepth;
        varying vec3 vLocal;
        void main() {
          float slope = clamp(normalize(vNormal).y, 0.0, 1.0);
          vec3 col = mix(uLow, uHigh, pow(slope, 0.8));
          // faint drift of tone so the ground is not a flat wash
          col *= 0.96 + 0.04 * sin(vLocal.x * 0.7 + vLocal.z * 0.5);
          float f = 1.0 - exp(-uFogDensity * uFogDensity * vDepth * vDepth);
          col = mix(col, uFog, clamp(f, 0.0, 1.0));
          gl_FragColor = vec4(col, 1.0);
        }
      `}
    />
  );
}

/* ---------------------------------------------------------------------- */
/* Etched glyph: a frosted engraving that reads as cut into the shard face
   rather than printed on it — bright where the cut catches light, dark in
   the groove, and only visible at glancing angles. */
export function EtchMaterial({ glyph }: { glyph: string }) {
  const texture = useMemo(() => {
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, size, size);
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `800 ${Math.floor(size * 0.42)}px ui-monospace, monospace`;
      ctx.fillText(glyph, size / 2, size / 2);
      // a ring around the mark, like a machined bezel
      ctx.strokeStyle = "rgba(255,255,255,0.55)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size * 0.34, 0, Math.PI * 2);
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [glyph]);

  return (
    <meshStandardMaterial
      map={texture}
      transparent
      opacity={0.55}
      roughness={0.25}
      metalness={0}
      emissive={new THREE.Color("#cfe8ff")}
      emissiveMap={texture}
      emissiveIntensity={0.45}
      depthWrite={false}
      polygonOffset
      polygonOffsetFactor={-2}
    />
  );
}
