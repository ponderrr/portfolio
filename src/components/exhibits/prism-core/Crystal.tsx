import * as THREE from "three";
import { useMemo } from "react";

export type CrystalQuality = "low" | "medium" | "high";

type Props = {
  quality: CrystalQuality;
  ignite: number; // 0..1
  lock: number;   // 0..1
};

export function Crystal({ quality, ignite, lock }: Props) {
  const geom = useMemo(() => {
    // Faceted: detail=0 keeps flat faces.
    const g = new THREE.IcosahedronGeometry(1, 0);
    // Elongate to feel like a crystal
    g.scale(0.95, 1.55, 0.95);
    return g;
  }, []);

  const coreGeom = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(0.55, 0);
    g.scale(0.8, 1.2, 0.8);
    return g;
  }, []);

  const emissiveIntensity = Math.min(1.6, (0.15 + 1.55 * lock) * ignite);

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
            emissiveIntensity={0.15 * ignite}
            transparent
            opacity={0.92 * ignite}
          />
        ) : (
          <meshPhysicalMaterial
            color={"#050508"}
            roughness={0.08}
            metalness={0.0}
            transmission={1}
            thickness={0.85}
            ior={1.38}
            attenuationColor={"#6366F1"}
            attenuationDistance={1.1}
            clearcoat={1}
            clearcoatRoughness={0.10}
            specularIntensity={1.0}
            transparent
            opacity={0.98 * ignite}
          />
        )}
      </mesh>

      {/* Inner core glow */}
      <mesh geometry={coreGeom}>
        <meshStandardMaterial
          color={"#050508"}
          emissive={new THREE.Color("#22D3EE").lerp(new THREE.Color("#6366F1"), 0.55)}
          emissiveIntensity={emissiveIntensity}
          transparent
          opacity={0.55 * ignite}
        />
      </mesh>
    </group>
  );
}

export default Crystal;
