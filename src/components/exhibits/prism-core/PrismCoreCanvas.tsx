import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useEffect } from "react";
import type { MutableRefObject } from "react";
import PrismRig from "./PrismRig";

type Props = {
  progressRef: MutableRefObject<number>;
  quality: "low" | "medium" | "high";
  interactive: boolean;
  reducedMotion: boolean;
};

// Safe exposure value - prevents transmission blowout
const EXPOSURE = 0.68;

function RendererConfig() {
  const { gl } = useThree();

  useEffect(() => {
    // Configure renderer for premium transmission materials
    gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = EXPOSURE;
    gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }, [gl]);

  return null;
}

export function PrismCoreCanvas({ progressRef, quality, interactive, reducedMotion }: Props) {
  const dpr: [number, number] =
    quality === "high" ? [1, 2] :
    quality === "medium" ? [1, 1.75] :
    [1, 1.35];

  return (
    <Canvas
      dpr={dpr}
      camera={{ position: [0, 0, 7.4], fov: 50, near: 0.1, far: 60 }}
      gl={{ alpha: true, antialias: quality !== "low", powerPreference: "high-performance" }}
      shadows={false}
      frameloop={reducedMotion ? "demand" : "always"}
      onCreated={(state) => {
        // Ensure renderer config is applied - locked exposure
        state.gl.outputColorSpace = THREE.SRGBColorSpace;
        state.gl.toneMapping = THREE.ACESFilmicToneMapping;
        state.gl.toneMappingExposure = EXPOSURE;
      }}
    >
      <RendererConfig />
      <color attach="background" args={["#050508"]} />

      {/* Controlled 3-light studio: dim ambient + soft key + cool rim */}
      <ambientLight intensity={0.05} color="#ffffff" />

      {/* Key (soft) */}
      <spotLight
        position={[4.5, 4.8, 6.5]}
        intensity={0.55}
        angle={0.55}
        penumbra={0.85}
        decay={2}
        distance={40}
        color="#fff6ee"
      />

      {/* Rim (cool indigo) for silhouette */}
      <directionalLight position={[-2.0, 1.6, -6.5]} intensity={0.18} color="#4f46e5" />

      <PrismRig
        progressRef={progressRef}
        quality={quality}
        interactive={interactive}
        reducedMotion={reducedMotion}
      />
    </Canvas>
  );
}

export default PrismCoreCanvas;
