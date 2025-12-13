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

      {/* Minimal key + rim + ambient lighting - conservative intensities */}
      <ambientLight intensity={0.06} color="#ffffff" />
      
      {/* Key light - slightly warm, positioned high front */}
      <directionalLight position={[3, 4, 5]} intensity={0.14} color="#f8f8ff" />
      
      {/* Rim light - cool indigo for facet readability */}
      <directionalLight position={[0, 1.5, -5]} intensity={0.1} color="#6366F1" />

      {/* Single controlled environment highlight */}
      <Environment resolution={64}>
        <Lightformer
          intensity={0.12}
          position={[0, 2, 4]}
          scale={[5, 1.5, 1]}
          color="#ffffff"
        />
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
