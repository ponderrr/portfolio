import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { VisualQuality } from "@/hooks/useVisualQuality";
import LatticeRig from "./LatticeRig";
import * as THREE from "three";

function IgniteController(props: {
  start: boolean;
  reducedMotion: boolean;
  onIgnite: (v: number) => void;
}) {
  const v = useRef(0);

  useFrame((_, delta) => {
    if (props.reducedMotion) {
      v.current = props.start ? 1 : 0;
      props.onIgnite(v.current);
      return;
    }

    const target = props.start ? 1 : 0;
    v.current = THREE.MathUtils.damp(v.current, target, 2.8, delta);
    props.onIgnite(v.current);
  });

  return null;
}

type Props = {
  quality: VisualQuality;
  interactive: boolean;
  reducedMotion: boolean;
  start: boolean;
};

export function NeuralLatticeCanvas({ quality, interactive, reducedMotion, start }: Props) {
  const dpr: [number, number] = quality === "high" ? [1, 2] : quality === "medium" ? [1, 1.75] : [1, 1.35];

  const igniteRef = useRef(0);

  const fogNearFar = useMemo(() => {
    return quality === "high" ? [8.5, 18] : quality === "medium" ? [8, 17] : [7.5, 16];
  }, [quality]);

  return (
    <Canvas
      dpr={dpr}
      camera={{ position: [0, 0, 7.4], fov: 50, near: 0.1, far: 60 }}
      gl={{
        alpha: true,
        antialias: quality !== "low",
        powerPreference: "high-performance",
      }}
      frameloop={reducedMotion ? "demand" : "always"}
    >
      <color attach="background" args={["#050508"]} />
      <fog attach="fog" args={["#050508", fogNearFar[0], fogNearFar[1]]} />

      <ambientLight intensity={0.32} />
      <directionalLight position={[4, 4, 6]} intensity={0.22} />
      <directionalLight position={[-4, -2, 5]} intensity={0.1} />

      <IgniteController start={start} reducedMotion={reducedMotion} onIgnite={(v) => { igniteRef.current = v; }} />

      <LatticeRig quality={quality} interactive={interactive} reducedMotion={reducedMotion} ignite={igniteRef.current} />
    </Canvas>
  );
}

export default NeuralLatticeCanvas;
