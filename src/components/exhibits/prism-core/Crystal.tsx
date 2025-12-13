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
  const geom = useMemo(() => {
    // Faceted: detail=0 keeps flat faces.
    const g = new THREE.IcosahedronGeometry(1, 0);
    // Elongate to feel like a crystal (scale on geometry, not mesh)
    g.scale(0.95, 1.55, 0.95);
    // Convert to non-indexed for proper facet normals
    const nonIndexed = g.toNonIndexed();
    // Recompute normals after scaling
    nonIndexed.computeVertexNormals();
    // Normalize to ensure stable lighting
    nonIndexed.normalizeNormals();
    return nonIndexed;
  }, []);

  // Rim mesh geometry - slightly larger than crystal
  const rimGeom = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(1.02, 0);
    g.scale(0.95, 1.55, 0.95);
    const nonIndexed = g.toNonIndexed();
    nonIndexed.computeVertexNormals();
    nonIndexed.normalizeNormals();
    return nonIndexed;
  }, []);

  // Smaller inner core for restrained glow
  const coreGeom = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(0.32, 0); // Shrunk from 0.45
    g.scale(0.6, 0.85, 0.6); // Shrunk proportions
    const nonIndexed = g.toNonIndexed();
    nonIndexed.computeVertexNormals();
    nonIndexed.normalizeNormals();
    return nonIndexed;
  }, []);

  // Hard clamp emissive intensity to prevent white blowout (max 0.45)
  const emissiveIntensity = Math.min(0.45, (0.06 + 0.28 * lock + 0.08 * lockPulse) * ignite);

  // Transmission material samples based on quality
  const samples = quality === "high" ? 10 : quality === "medium" ? 6 : 4;

  // Chromatic aberration: small baseline, rises briefly during lockPulse
  const chromaticAberration = split * 0.06 + lockPulse * 0.04;

  // Outline opacity: very subtle at baseline, slightly more visible at lock
  const outlineOpacity = (0.03 + 0.06 * lock + 0.04 * lockPulse) * ignite;

  // Rim glint intensity: subtle fresnel-like accent, intensifies during lockPulse
  const rimIntensity = (0.025 + 0.045 * lock + 0.03 * lockPulse) * ignite;

  return (
    <group>
      {/* Outer crystal */}
      <mesh geometry={geom}>
        {quality === "low" ? (
          <meshPhysicalMaterial
            color={"#07070b"}
            roughness={0.18}
            metalness={0.02}
            clearcoat={1}
            clearcoatRoughness={0.12}
            sheen={0.15}
            specularIntensity={0.8}
            emissive={"#0b0b14"}
            emissiveIntensity={0.08 * ignite}
            transparent
            opacity={0.92 * ignite}
            flatShading
          />
        ) : (
          <MeshTransmissionMaterial
            samples={samples}
            resolution={quality === "high" ? 512 : 256}
            transmission={0.92}
            thickness={0.52} // Moderate thickness (0.35-0.7 range)
            roughness={0.16} // Slightly higher roughness (0.12-0.20 range)
            chromaticAberration={chromaticAberration}
            anisotropicBlur={quality === "high" ? 0.08 : 0.0}
            distortion={0}
            distortionScale={0}
            temporalDistortion={0}
            ior={1.32} // Conservative IOR (1.25-1.45 range)
            color={"#08080c"} // Darker base
            attenuationColor={"#4f46e5"} // Deeper indigo
            attenuationDistance={1.4} // Not infinite
            clearcoat={0.8}
            clearcoatRoughness={0.15}
            envMapIntensity={0.35} // Reduced env map
            transparent
            opacity={0.94 * ignite}
          />
        )}
        {/* Subtle outline - inverted hull style, ornamental only */}
        {quality !== "low" && (
          <Outlines
            thickness={0.008}
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
