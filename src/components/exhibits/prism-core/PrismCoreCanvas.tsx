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
const EXPOSURE = 1.35;

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
      camera={{ position: [0, 0, 5.6], fov: 50, near: 0.1, far: 60 }}
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
      {/* Background comes from CSS layers in the section; keep canvas clear alpha */}

      {/* Baseline lights: strong enough to read through scanlines/noise */}
      <hemisphereLight args={["#c7d2fe", "#020207", 0.28]} />
      <ambientLight intensity={0.22} color="#ffffff" />
      {/* Slightly more frontal key so facets read during rotation */}
      <directionalLight position={[2.8, 2.6, 6.2]} intensity={1.9} color="#fff6ee" />
      <directionalLight position={[-3.2, 1.9, -6.5]} intensity={1.15} color="#4f46e5" />
      <directionalLight position={[0.0, -3.4, 3.5]} intensity={0.65} color="#22d3ee" />

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
