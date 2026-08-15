"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial, Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { makeShard, makeEtchPlane, makeScanNetwork } from "./geometry";
import { EtchMaterial } from "./materials";
import type { PortfolioEntry } from "../data";

/* Stage 2 — the portfolio carousel. One floating shard, frosted and
   refractive, wrapped in a thin scan-network overlay. Cards cross-fade by
   scaling the outgoing shard down as the incoming one grows, so the swap
   reads as a morph rather than a cut. */

/* Thin node/line overlay suggesting a 3D scan of the object. */
function ScanNetwork({
  radius,
  intensity,
  seed,
}: {
  radius: number;
  intensity: number;
  seed: number;
}) {
  const group = useRef<THREE.Group>(null);
  const { points, segments } = useMemo(
    () => makeScanNetwork(26, radius, radius * 0.72, seed),
    [radius, seed]
  );

  useFrame((_, dt) => {
    if (group.current) group.current.rotation.y -= dt * 0.06;
  });

  return (
    <group ref={group}>
      <lineSegments frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[segments, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.16 * intensity}
          depthWrite={false}
        />
      </lineSegments>
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[points, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.045}
          sizeAttenuation
          color="#ffffff"
          transparent
          opacity={0.5 * intensity}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

function Shard({
  entry,
  weight,
  fracture,
  quality,
  onClick,
}: {
  entry: PortfolioEntry;
  /** 0 = fully swapped out, 1 = the active card */
  weight: number;
  fracture: number;
  quality: "high" | "low";
  onClick: () => void;
}) {
  const group = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const geo = useMemo(() => makeShard(entry.shape), [entry.shape]);
  const etchGeo = useMemo(() => makeEtchPlane(), []);

  useFrame((state, dt) => {
    if (!group.current || !inner.current) return;
    // slow idle rotation, specified for every card
    inner.current.rotation.y += dt * 0.22;
    // fracture shakes the piece before the page turns dark
    if (fracture > 0) {
      const t = state.clock.elapsedTime;
      inner.current.position.x = Math.sin(t * 55) * fracture * 0.05;
      inner.current.position.y = Math.cos(t * 47) * fracture * 0.04;
      inner.current.scale.setScalar(1 + fracture * 0.12);
    } else {
      inner.current.position.set(0, 0, 0);
      inner.current.scale.setScalar(1);
    }
    // cross-fade: inactive cards shrink away behind the active one
    const target = 0.35 + weight * 0.65;
    group.current.scale.setScalar(THREE.MathUtils.lerp(group.current.scale.x, target, 0.15));
    group.current.position.z = THREE.MathUtils.lerp(group.current.position.z, (1 - weight) * -6, 0.15);
  });

  if (weight < 0.02) return null;

  return (
    <group ref={group}>
      <group ref={inner} rotation={[0.12, 0.4, 0.38]}>
        <mesh
          geometry={geo}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          onPointerOver={() => (document.body.style.cursor = "pointer")}
          onPointerOut={() => (document.body.style.cursor = "")}
        >
          {/* real refraction through the shard; iridescence gives the facets
              their faint rainbow catch without tinting the palette */}
          <MeshTransmissionMaterial
            samples={quality === "high" ? 6 : 2}
            resolution={quality === "high" ? 256 : 128}
            transmission={1}
            thickness={1.1}
            roughness={0.28}
            chromaticAberration={0.22}
            anisotropy={0.3}
            distortion={0.35}
            distortionScale={0.4}
            temporalDistortion={0.08}
            iridescence={0.85}
            iridescenceIOR={1.4}
            iridescenceThicknessRange={[100, 900]}
            ior={1.42}
            color="#e8eef4"
            attenuationColor="#cfe0ec"
            attenuationDistance={2.4}
            transparent
            opacity={weight}
          />
        </mesh>

        {/* etched glyph on the front face — only some cards carry one */}
        {entry.etch && (
          <mesh geometry={etchGeo} position={[0, 0.1, 0.58]}>
            <EtchMaterial glyph={entry.etch} />
          </mesh>
        )}
      </group>

      <ScanNetwork radius={2.1} intensity={weight * (1 + fracture * 3)} seed={entry.index.charCodeAt(1) * 7} />
    </group>
  );
}

export function ShardStage({
  entries,
  activeIndex,
  progressWithin,
  fracture,
  quality,
  onOpen,
}: {
  entries: PortfolioEntry[];
  activeIndex: number;
  /** 0..1 position between this card and the next, drives the cross-fade */
  progressWithin: number;
  fracture: number;
  quality: "high" | "low";
  onOpen: (entry: PortfolioEntry) => void;
}) {
  const rig = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!rig.current) return;
    // the model sits slightly right of centre, leaving the left for text
    const p = state.pointer;
    rig.current.position.x = THREE.MathUtils.lerp(rig.current.position.x, 1.15 + p.x * 0.18, 0.05);
    rig.current.position.y = THREE.MathUtils.lerp(rig.current.position.y, p.y * 0.12, 0.05);
  });

  return (
    <group>
      <ambientLight intensity={1.4} />
      <directionalLight position={[2, 6, 5]} intensity={1.1} color="#ffffff" />
      <directionalLight position={[-4, -1, 2]} intensity={0.35} color="#dce8f2" />

      <group ref={rig} position={[1.15, 0, 0]}>
        {entries.map((entry, i) => {
          // the active card holds full weight; its neighbour fades in as the
          // scroll crosses toward it
          let weight = 0;
          if (i === activeIndex) weight = 1 - progressWithin;
          else if (i === activeIndex + 1) weight = progressWithin;
          return (
            <Shard
              key={entry.slug}
              entry={entry}
              weight={weight}
              fracture={i === activeIndex ? fracture : 0}
              quality={quality}
              onClick={() => onOpen(entry)}
            />
          );
        })}
      </group>

      <Environment resolution={quality === "high" ? 256 : 128}>
        <Lightformer intensity={2.2} position={[0, 5, 3]} scale={[10, 5, 1]} color="#ffffff" />
        <Lightformer intensity={0.9} position={[-5, 0, 2]} scale={[6, 6, 1]} color="#dbe7f2" />
        <Lightformer intensity={0.7} position={[5, -2, 1]} scale={[6, 6, 1]} color="#eaf0f6" />
      </Environment>
    </group>
  );
}
