import { Canvas, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
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

function RendererConfig() {
  const { gl } = useThree();

  useEffect(() => {
    // Configure renderer for premium transmission materials
    gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 0.88; // Conservative exposure to prevent blowout
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
        // Ensure renderer config is applied
        state.gl.outputColorSpace = THREE.SRGBColorSpace;
        state.gl.toneMapping = THREE.ACESFilmicToneMapping;
        state.gl.toneMappingExposure = 0.88;
      }}
    >
      <RendererConfig />
      <color attach="background" args={["#050508"]} />

      {/* Minimal studio lighting - reduced intensities */}
      <ambientLight intensity={0.08} />
      <directionalLight position={[4, 4, 6]} intensity={0.15} />
      <directionalLight position={[-5, -2, 4]} intensity={0.06} />
      
      {/* Rim light for facet readability (cool indigo) */}
      <directionalLight position={[0, 2, -6]} intensity={0.12} color="#6366F1" />

      {/* Controlled environment highlights - much reduced */}
      <Environment resolution={64}>
        <Lightformer intensity={0.25} position={[0, 2.2, 4.2]} scale={[6, 2, 1]} />
        <Lightformer intensity={0.15} position={[-3.2, 0.5, 3.5]} scale={[3, 2, 1]} />
        <Lightformer intensity={0.10} position={[3.5, -1.6, 3.0]} scale={[3, 2, 1]} />
      </Environment>

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
