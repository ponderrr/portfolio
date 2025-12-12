import * as THREE from "three";
import { Billboard, Text } from "@react-three/drei";

type Props = {
  outputPositions: Float32Array; // length = 10 * 3
  probs: Float32Array; // length = 10
  ignite: number;
};

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

export function ProbabilityHUD3D({ outputPositions, probs, ignite }: Props) {
  const indigo = new THREE.Color("#6366F1");
  const cyan = new THREE.Color("#22D3EE");

  return (
    <group>
      {/* Output node glows */}
      {Array.from({ length: 10 }).map((_, k) => {
        const x = outputPositions[k * 3 + 0];
        const y = outputPositions[k * 3 + 1];
        const z = outputPositions[k * 3 + 2];
        const p = clamp01(probs[k] || 0);

        const glow = (0.1 + 0.9 * p) * ignite;
        const scale = 0.075 + p * 0.11;

        const c = indigo.clone().lerp(cyan, k / 9);

        return (
          <group key={k} position={[x, y, z]}>
            <mesh scale={[scale, scale, scale]}>
              <sphereGeometry args={[1, 16, 16]} />
              <meshStandardMaterial
                color={"#0b0b14"}
                emissive={c}
                emissiveIntensity={2.2 * glow}
                transparent
                opacity={0.8 * ignite}
              />
            </mesh>

            <Billboard position={[0.22, 0, 0]} follow>
              <group>
                <Text fontSize={0.12} color={"#ffffff"} fillOpacity={0.85 * ignite} anchorX="left" anchorY="middle">
                  {String(k)}
                </Text>

                {/* bar background */}
                <mesh position={[0.34, -0.09, 0]}>
                  <planeGeometry args={[0.62, 0.06]} />
                  <meshBasicMaterial transparent opacity={0.18 * ignite} color={"#ffffff"} />
                </mesh>

                {/* bar fill */}
                <mesh position={[0.34 - (0.62 * (1 - p)) / 2, -0.09, 0.001]}>
                  <planeGeometry args={[0.62 * p, 0.06]} />
                  <meshBasicMaterial transparent opacity={0.55 * ignite} color={c} />
                </mesh>
              </group>
            </Billboard>
          </group>
        );
      })}
    </group>
  );
}

export default ProbabilityHUD3D;
