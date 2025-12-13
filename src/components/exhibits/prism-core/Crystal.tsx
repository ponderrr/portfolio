import * as THREE from "three";
import { useMemo } from "react";

export type CrystalQuality = "low" | "medium" | "high";

type Props = {
  quality: CrystalQuality;
};

export function Crystal({ quality }: Props) {
  const prepareGeometry = (radius: number, scale: [number, number, number]) => {
    const g = new THREE.IcosahedronGeometry(radius, 0);
    g.scale(scale[0], scale[1], scale[2]);
    const ready = g.index ? g.toNonIndexed() : g.clone();
    ready.computeVertexNormals();
    ready.normalizeNormals();
    return ready;
  };

  const geom = useMemo(() => prepareGeometry(1.08, [1.08, 1.72, 1.08]), []);

  return (
    <group>
      {/* Baseline faceted crystal - deterministic, no transmission/env dependency */}
      <mesh geometry={geom}>
        <meshStandardMaterial
          flatShading
          color={quality === "high" ? "#1b2140" : "#161b36"}
          emissive={"#0a0d3a"}
          metalness={0.28}
          roughness={0.22}
        />
      </mesh>

      {/* Silhouette assist: ultra-subtle backface tint so it's never "gone" */}
      <mesh geometry={geom} scale={1.015}>
        <meshBasicMaterial
          color={"#3b46a3"}
          transparent
          opacity={0.48}
          depthWrite={false}
          depthTest={false}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

export default Crystal;
