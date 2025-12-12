import { Canvas } from "@react-three/fiber";
import type { VisualQuality } from "@/hooks/useVisualQuality";
import { LatticeRig } from "./LatticeRig";

type Props = {
  quality: VisualQuality;
  interactive: boolean;
  reducedMotion: boolean;
};

export function NeuralLatticeCanvas({ quality, interactive, reducedMotion }: Props) {
  const dpr: [number, number] =
    quality === "high" ? [1, 2] :
    quality === "medium" ? [1, 1.75] :
    [1, 1.35];

  return (
    <Canvas
      dpr={dpr}
      camera={{ position: [0, 0, 7.0], fov: 52, near: 0.1, far: 50 }}
      gl={{
        alpha: true,
        antialias: quality !== "low",
        powerPreference: "high-performance",
      }}
      frameloop={reducedMotion ? "demand" : "always"}
    >
      <color attach="background" args={["#050508"]} />
      <fog attach="fog" args={["#050508", 7, 16]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 3, 6]} intensity={0.25} />
      <directionalLight position={[-4, -2, 5]} intensity={0.12} />

      <LatticeRig quality={quality} interactive={interactive} reducedMotion={reducedMotion} />
    </Canvas>
  );
}
