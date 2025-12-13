import * as THREE from "three";
import { useMemo } from "react";
import { MeshTransmissionMaterial } from "@react-three/drei";

export type CrystalQuality = "low" | "medium" | "high";

// Temporary stabilization pass: force a safe, always-visible faceted crystal.
// Do NOT re-enable transmission until the baseline read is perfect at progress=0.
const SAFE_MODE = false;

type Props = {
  quality: CrystalQuality;
  ignite: number;    // 0..1
  lock: number;      // 0..1
  split: number;     // 0..1 (for chromatic aberration during lock)
  lockPulse: number; // 0..1 (narrow peak during lock window)
};

export function Crystal({ quality, ignite, lock, split, lockPulse }: Props) {
  const prepareGeometry = (radius: number, scale: [number, number, number]) => {
    const g = new THREE.IcosahedronGeometry(radius, 0);
    g.scale(scale[0], scale[1], scale[2]);
    const ready = g.index ? g.toNonIndexed() : g.clone();
    ready.computeVertexNormals();
    ready.normalizeNormals();
    return ready;
  };

  const geom = useMemo(() => prepareGeometry(1, [0.95, 1.55, 0.95]), []);

  // Rim mesh geometry - slightly larger than crystal
  const rimGeom = useMemo(() => prepareGeometry(1.02, [0.95, 1.55, 0.95]), []);

  // Smaller inner core for restrained glow
  const coreGeom = useMemo(() => prepareGeometry(0.32, [0.6, 0.85, 0.6]), []);

  // Hard clamp emissive intensity to prevent white blowout (max 0.42)
  const emissiveIntensity = Math.min(0.42, (0.05 + 0.26 * lock + 0.08 * lockPulse) * ignite);

  // Rim glint intensity: restrained fresnel accent
  const rimIntensity = (0.012 + 0.025 * lock + 0.02 * lockPulse + 0.01 * split) * ignite;

  const samples = quality === "high" ? 10 : quality === "medium" ? 7 : 0;
  // Keep aberration extremely restrained; only a tiny lift during lock pulse.
  const chromaticAberration = Math.min(0.014, 0.002 + lockPulse * (0.006 + 0.006 * split));
  const thickness = 0.45 + 0.14 * lock; // <= 0.59
  const roughness = 0.2 - 0.05 * lock; // 0.15..0.2

  return (
    <group>
      {/* Outer crystal */}
      <mesh geometry={geom}>
        {/* Low quality stays SAFE crystal forever (no transmission). */}
        {SAFE_MODE || quality === "low" ? (
          <meshPhysicalMaterial
            flatShading
            color={"#07070b"}
            roughness={0.3}
            metalness={0.05}
            clearcoat={1}
            clearcoatRoughness={0.15}
            envMapIntensity={0.25}
          />
        ) : (
          <MeshTransmissionMaterial
            samples={samples}
            resolution={quality === "high" ? 512 : 320}
            transmission={0.84}
            thickness={thickness}
            roughness={roughness}
            chromaticAberration={chromaticAberration}
            anisotropicBlur={quality === "high" ? 0.08 : 0.02}
            distortion={0}
            distortionScale={0}
            temporalDistortion={0}
            ior={1.33}
            color={"#08080c"}
            attenuationColor={"#4338ca"}
            attenuationDistance={1.05}
            clearcoat={0.7}
            clearcoatRoughness={0.16}
            envMapIntensity={0.25}
            transparent
            // Never gate visibility by driving opacity to 0.
            opacity={0.96}
          />
        )}
      </mesh>

      {/* Glint rim mesh - subtle fresnel-like additive accent */}
      <mesh geometry={rimGeom}>
        <meshBasicMaterial
          color={"#22D3EE"}
          transparent
          opacity={rimIntensity}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Inner core glow (smaller, more restrained, cool indigo/cyan) */}
      <mesh geometry={coreGeom}>
        <meshStandardMaterial
          color={"#050508"}
          emissive={new THREE.Color("#22D3EE").lerp(new THREE.Color("#4f46e5"), 0.6)}
          emissiveIntensity={emissiveIntensity}
          transparent
          opacity={0.28 * ignite}
        />
      </mesh>
    </group>
  );
}

export default Crystal;
