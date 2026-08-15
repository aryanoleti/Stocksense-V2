"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { makePortalArcs, sampleGlyphTargets, scatterShell, makeScanNetwork, makeRng } from "./geometry";

/* Stages 3–5 — portal dissolve, particle coalescence, pedestal.

   Driven entirely by one 0..1 progress value:
     0.00–0.35  camera pushes into the portal; ring scales up and fades past
     0.30–0.80  particles stream in and settle into the letterform
     0.75–1.00  camera eases back, the pedestal rises beneath the sculpture */

function seg(p: number, a: number, b: number): number {
  return THREE.MathUtils.clamp((p - a) / (b - a), 0, 1);
}

/* The portal: segmented stone arcs, a broken inner gear ring, a glowing band
   and a filament network that flares as the visitor passes through. */
function Portal({ progress }: { progress: number }) {
  const group = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const stone = useMemo(() => makePortalArcs(9, 3.1, 0.28, 0.1), []);
  const gear = useMemo(() => makePortalArcs(5, 2.35, 0.12, 0.55), []);
  const filaments = useMemo(() => makeScanNetwork(30, 2.9, 1.5, 61), []);
  const stoneMat = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((_, dt) => {
    if (!group.current) return;
    const t = seg(progress, 0, 0.35);
    // flying through: the ring rushes past the camera and dissolves
    const scale = 1 + t * t * 7;
    group.current.scale.setScalar(scale);
    group.current.position.z = t * 9;
    group.current.rotation.z += dt * 0.05;
    const fade = 1 - seg(progress, 0.16, 0.34);
    group.current.visible = fade > 0.01;
    if (stoneMat.current) stoneMat.current.opacity = fade;
    if (glowRef.current) {
      const m = glowRef.current.material as THREE.MeshBasicMaterial;
      // filaments flare just before they dissipate
      m.opacity = fade * (0.5 + 0.5 * Math.sin(progress * 30));
    }
  });

  return (
    <group ref={group}>
      {stone.map((g, i) => (
        <mesh key={`s${i}`} geometry={g}>
          <meshStandardMaterial
            ref={i === 0 ? stoneMat : undefined}
            color="#aeb6bd"
            roughness={0.85}
            metalness={0.05}
            transparent
          />
        </mesh>
      ))}
      {gear.map((g, i) => (
        <mesh key={`g${i}`} geometry={g} rotation={[0, 0, i * 0.3]}>
          <meshStandardMaterial color="#8c959d" roughness={0.7} metalness={0.15} transparent />
        </mesh>
      ))}
      {/* emissive band */}
      <mesh>
        <torusGeometry args={[2.7, 0.06, 8, 96]} />
        <meshBasicMaterial color="#cfeaff" toneMapped={false} transparent />
      </mesh>
      {/* frost-crack filaments */}
      <lineSegments ref={glowRef as never} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[filaments.segments, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#dff2ff" transparent opacity={0.5} depthWrite={false} />
      </lineSegments>
    </group>
  );
}

/* The sculpture: one instanced point cloud flying from a scattered shell into
   the volume of a letterform. Targets are resampled when the glyph changes,
   which replays the coalescence. */
function ParticleSculpture({
  progress,
  glyph,
  count,
}: {
  progress: number;
  glyph: string;
  count: number;
}) {
  const ref = useRef<THREE.Points>(null);
  const group = useRef<THREE.Group>(null);
  const start = useMemo(() => scatterShell(count, 9), [count]);
  const targets = useRef<Float32Array>(new Float32Array(count * 3));
  const live = useMemo(() => new Float32Array(start), [start]);
  /* per-particle arrival offset so the shape builds up in layers, leaving a
     grainy fringe of stragglers at the edges while the core is already solid */
  const stagger = useMemo(() => {
    const rng = makeRng(73);
    return Float32Array.from({ length: count }, () => rng() * 0.45);
  }, [count]);

  useEffect(() => {
    targets.current = sampleGlyphTargets(glyph, count);
  }, [glyph, count]);

  useFrame(() => {
    const pts = ref.current;
    if (!pts) return;
    const attr = pts.geometry.getAttribute("position") as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    const t = seg(progress, 0.3, 0.82);
    const tg = targets.current;
    for (let i = 0; i < count; i++) {
      // each particle starts moving at its own moment, then eases in
      const k = THREE.MathUtils.clamp((t - stagger[i]) / (1 - stagger[i] || 1), 0, 1);
      const e = 1 - Math.pow(1 - k, 3);
      const i3 = i * 3;
      arr[i3] = THREE.MathUtils.lerp(live[i3], tg[i3] || 0, e);
      arr[i3 + 1] = THREE.MathUtils.lerp(live[i3 + 1], tg[i3 + 1] || 0, e);
      arr[i3 + 2] = THREE.MathUtils.lerp(live[i3 + 2], tg[i3 + 2] || 0, e);
    }
    attr.needsUpdate = true;
    if (group.current) group.current.rotation.y += 0.0025;
  });

  const opacity = seg(progress, 0.28, 0.42);
  return (
    <group ref={group} position={[0, 0.35, 0]}>
      <points ref={ref} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[new Float32Array(start), 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.055}
          sizeAttenuation
          color="#eef2f5"
          transparent
          opacity={opacity}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

/* Concentric glowing rings the sculpture comes to rest above. */
function Pedestal({ progress }: { progress: number }) {
  const group = useRef<THREE.Group>(null);
  const network = useMemo(() => makeScanNetwork(22, 2.6, 1.4, 89), []);

  useFrame(() => {
    if (!group.current) return;
    const t = seg(progress, 0.72, 0.95);
    // rises into frame as the sculpture finishes forming
    group.current.position.y = THREE.MathUtils.lerp(-6, -2.6, t);
    group.current.visible = t > 0.01;
  });

  return (
    <group ref={group} position={[0, -6, 0]}>
      {[2.9, 2.35, 1.8].map((r, i) => (
        <mesh key={r} rotation={[-Math.PI / 2, 0, 0]} position={[0, i * 0.03, 0]}>
          <torusGeometry args={[r, 0.035, 8, 96]} />
          <meshBasicMaterial color="#cfeaff" toneMapped={false} transparent opacity={0.75 - i * 0.15} />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3.1, 64]} />
        <meshStandardMaterial color="#aab4bd" roughness={0.6} metalness={0.1} />
      </mesh>
      {/* the same scan pattern etched across the platform surface */}
      <lineSegments rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[network.segments, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#e8f4ff" transparent opacity={0.22} depthWrite={false} />
      </lineSegments>
    </group>
  );
}

export function PortalStage({
  progress,
  glyph,
  quality,
}: {
  progress: number;
  glyph: string;
  quality: "high" | "low";
}) {
  const rig = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!rig.current) return;
    // camera pulls back as the pedestal arrives so both fit the frame
    const back = seg(progress, 0.75, 1);
    rig.current.position.z = THREE.MathUtils.lerp(rig.current.position.z, back * -1.6, 0.08);
    rig.current.position.y = THREE.MathUtils.lerp(rig.current.position.y, back * 0.5, 0.08);
  });

  return (
    <group ref={rig}>
      <ambientLight intensity={1.1} />
      <directionalLight position={[2, 6, 4]} intensity={0.8} color="#ffffff" />
      <Portal progress={progress} />
      <ParticleSculpture
        progress={progress}
        glyph={glyph}
        count={quality === "high" ? 9000 : 3200}
      />
      <Pedestal progress={progress} />
    </group>
  );
}
