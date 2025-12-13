import * as THREE from "three";
import { useMemo } from "react";
import { MeshTransmissionMaterial, Outlines } from "@react-three/drei";

export type CrystalQuality = "low" | "medium" | "high";

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

  // Outline opacity: near-invisible baseline, only rises slightly during lock
  const outlineOpacity = (0.01 + 0.025 * lock + 0.02 * lockPulse) * ignite;

  // Rim glint intensity: restrained fresnel accent
  const rimIntensity = (0.012 + 0.025 * lock + 0.02 * lockPulse + 0.01 * split) * ignite;

  const samples = quality === "high" ? 10 : quality === "medium" ? 7 : 0;
  const chromaticAberration = Math.min(0.055, 0.006 + split * 0.024 + lockPulse * 0.018);
  const thickness = 0.42 + 0.16 * lock;
  const roughness = 0.18 - 0.04 * lock;

  return (
    <group>
      {/* Outer crystal */}
      <mesh geometry={geom}>
        {quality === "low" ? (
          <meshPhysicalMaterial
            color={"#0a0a10"}
            roughness={0.26}
            metalness={0.05}
            clearcoat={0.55}
            clearcoatRoughness={0.24}
            sheen={0.1}
            specularIntensity={0.55}
            emissive={"#07070d"}
            emissiveIntensity={0.06 + 0.05 * ignite}
            flatShading
          />
        ) : (
          <MeshTransmissionMaterial
            samples={samples}
            resolution={quality === "high" ? 512 : 320}
            transmission={0.9}
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
            envMapIntensity={0.28}
            transparent
            opacity={0.94 * ignite}
          />
        )}
        {/* Subtle outline - inverted hull style, ornamental only */}
        {quality !== "low" && (
          <Outlines
            thickness={0.005}
            color="#6366F1"
            transparent
            opacity={outlineOpacity}
            screenspace={false}
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
