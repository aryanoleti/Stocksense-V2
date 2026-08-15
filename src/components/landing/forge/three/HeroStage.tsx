"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { makeMonolith, makeTerrain, makeRng } from "./geometry";
import { MonolithMaterial, TerrainMaterial } from "./materials";

/* Stage 1 — the hero. A photoreal-leaning, fog-lit valley with a single
   monolith at frame centre, lit from inside. Everything is procedural. */

/* Ambient falling motes. One instanced Points cloud, recycled at the top when
   a particle falls out of the bottom, so the count stays constant. */
function Snowfall({ count, opacity }: { count: number; opacity: number }) {
  const ref = useRef<THREE.Points>(null);
  const { positions, speeds } = useMemo(() => {
    const rng = makeRng(31);
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (rng() - 0.5) * 26;
      positions[i * 3 + 1] = rng() * 14 - 2;
      positions[i * 3 + 2] = (rng() - 0.5) * 20 - 2;
      speeds[i] = 0.25 + rng() * 0.5;
    }
    return { positions, speeds };
  }, [count]);

  useFrame((_, dt) => {
    const pts = ref.current;
    if (!pts) return;
    const attr = pts.geometry.getAttribute("position") as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    const step = Math.min(dt, 0.05); // clamp so a stalled tab cannot teleport them
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] -= speeds[i] * step;
      arr[i * 3] += Math.sin(arr[i * 3 + 1] * 0.5 + i) * 0.0015;
      if (arr[i * 3 + 1] < -2) arr[i * 3 + 1] = 12;
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        sizeAttenuation
        color="#ffffff"
        transparent
        opacity={opacity * 0.75}
        depthWrite={false}
      />
    </points>
  );
}

export function HeroStage({
  visible,
  opacity,
  quality,
}: {
  visible: boolean;
  opacity: number;
  quality: "high" | "low";
}) {
  const group = useRef<THREE.Group>(null);
  const monolith = useMemo(() => makeMonolith(quality === "high" ? 3 : 2), [quality]);
  const terrain = useMemo(
    () => makeTerrain(30, quality === "high" ? 110 : 56),
    [quality]
  );
  // the inner core sits just within the shell; its light escapes the seams
  const core = useMemo(() => makeMonolith(1), []);

  useFrame((state, dt) => {
    if (!group.current || !visible) return;
    group.current.rotation.y += dt * 0.045;
    // a breath of parallax so the frame is never completely static
    const p = state.pointer;
    group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, p.x * 0.12, 0.04);
  });

  if (!visible) return null;

  return (
    <group>
      {/* Overcast key: a broad soft source overhead, no hard shadows */}
      <ambientLight intensity={1.15} />
      <directionalLight position={[3, 8, 4]} intensity={0.75} color="#eef3f7" />
      <directionalLight position={[-5, 2, -3]} intensity={0.28} color="#c4d2de" />

      <group ref={group}>
        <mesh geometry={monolith} position={[0, 0.55, 0]}>
          <MonolithMaterial glow={opacity} />
        </mesh>
        {/* emissive interior, slightly smaller so it only shows through gaps */}
        <mesh geometry={core} position={[0, 0.55, 0]} scale={0.88}>
          <meshBasicMaterial color="#bfe6ff" toneMapped={false} />
        </mesh>
      </group>

      <mesh geometry={terrain} position={[0, -1.4, 0]}>
        <TerrainMaterial />
      </mesh>

      <Snowfall count={quality === "high" ? 900 : 350} opacity={opacity} />

      {/* Procedural environment: no HDRI fetch, so nothing blocks first paint */}
      <Environment resolution={quality === "high" ? 256 : 128}>
        <Lightformer intensity={1.6} position={[0, 6, 2]} scale={[12, 6, 1]} color="#ffffff" />
        <Lightformer intensity={0.6} position={[-6, 2, -4]} scale={[8, 8, 1]} color="#c9d8e6" />
        <Lightformer intensity={0.5} position={[6, 1, -6]} scale={[8, 8, 1]} color="#dfe7ee" />
      </Environment>
    </group>
  );
}
