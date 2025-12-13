import * as THREE from "three";
import { useMemo } from "react";
import { MeshTransmissionMaterial, Edges } from "@react-three/drei";

export type CrystalQuality = "low" | "medium" | "high";

type Props = {
  quality: CrystalQuality;
  ignite: number; // 0..1
  lock: number;   // 0..1
  split: number;  // 0..1 (for chromatic aberration during lock)
};

export function Crystal({ quality, ignite, lock, split }: Props) {
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

  const coreGeom = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(0.45, 0); // Smaller core
    g.scale(0.7, 1.0, 0.7);
    const nonIndexed = g.toNonIndexed();
    nonIndexed.computeVertexNormals();
    nonIndexed.normalizeNormals();
    return nonIndexed;
  }, []);

  // Clamp emissive intensity to prevent white blowout
  const emissiveIntensity = Math.min(0.85, (0.08 + 0.45 * lock) * ignite);

  // Transmission material samples based on quality
  const samples = quality === "high" ? 12 : quality === "medium" ? 8 : 6;

  // Chromatic aberration only during lock pulse (split)
  const chromaticAberration = split * 0.15;

  return (
    <group>
      {/* Outer crystal */}
      <mesh geometry={geom} castShadow receiveShadow>
        {quality === "low" ? (
          <meshPhysicalMaterial
            color={"#07070b"}
            roughness={0.18}
            metalness={0.02}
            clearcoat={1}
            clearcoatRoughness={0.12}
            sheen={0.15}
            specularIntensity={0.9}
            emissive={"#0b0b14"}
            emissiveIntensity={0.12 * ignite}
            transparent
            opacity={0.92 * ignite}
            flatShading
          />
        ) : (
          <MeshTransmissionMaterial
            samples={samples}
            resolution={quality === "high" ? 1024 : quality === "medium" ? 512 : 256}
            transmission={0.95}
            thickness={0.65}
            roughness={0.12}
            chromaticAberration={chromaticAberration}
            anisotropicBlur={quality === "high" ? 0.12 : 0.0}
            distortion={0}
            distortionScale={0}
            temporalDistortion={0}
            ior={1.35}
            color={"#050508"}
            attenuationColor={"#6366F1"}
            attenuationDistance={1.8}
            clearcoat={1}
            clearcoatRoughness={0.10}
            envMapIntensity={0.55}
            transparent
            opacity={0.96 * ignite}
          />
        )}
        {/* Subtle edge lines for facet readability */}
        {quality !== "low" && (
          <Edges
            color="#6366F1"
            threshold={12}
            geometry={geom}
          >
            <meshBasicMaterial
              color="#6366F1"
              transparent
              opacity={0.15 * ignite}
              depthWrite={false}
            />
          </Edges>
        )}
      </mesh>

      {/* Inner core glow (smaller, more restrained) */}
      <mesh geometry={coreGeom}>
        <meshStandardMaterial
          color={"#050508"}
          emissive={new THREE.Color("#22D3EE").lerp(new THREE.Color("#6366F1"), 0.55)}
          emissiveIntensity={emissiveIntensity}
          transparent
          opacity={0.35 * ignite}
        />
      </mesh>
    </group>
  );
}

export default Crystal;
