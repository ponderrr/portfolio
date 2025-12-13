import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef, useState } from "react";
import type { MutableRefObject } from "react";
import Crystal, { type CrystalQuality } from "./Crystal";
import { prismParamsFromProgress } from "./timeline";

type Props = {
  progressRef: MutableRefObject<number>;
  quality: "low" | "medium" | "high";
  interactive: boolean;
  reducedMotion: boolean;
};

export function PrismRig({ progressRef, quality, interactive, reducedMotion }: Props) {
  const groupRef = useRef<THREE.Group>(null);

  const { camera } = useThree();

  const safe = (v: number, fallback: number) => (Number.isFinite(v) ? v : fallback);

  const lastP = useRef<number>(-1);
  const [p, setP] = useState(() => prismParamsFromProgress(safe(progressRef.current, 0)));

  useFrame((state, delta) => {
    const g = groupRef.current;
    if (!g) return;

    const prog = safe(progressRef.current, 0);
    const params = prismParamsFromProgress(prog);

    // camera micro-dolly (subtle)
    if (!reducedMotion) {
      const targetZ = safe(params.camZ, 5.6);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 2.6, delta);
      camera.lookAt(0, 0, 0);
    } else {
      camera.lookAt(0, 0, 0);
    }

    // deliberate rotation driven by timeline (with small offsets to keep facets readable)
    const baseRX = 0.08 + safe(params.rotX, 0);
    const baseRY = 0.25 + safe(params.rotY, 0);
    const baseRZ = safe(params.rotZ, 0);

    // pointer parallax (very subtle)
    const px = interactive ? state.pointer.x : 0;
    const py = interactive ? state.pointer.y : 0;

    const targetX = baseRX + (-py * 0.08);
    const targetY = baseRY + (px * 0.10);
    const targetZ = baseRZ + (px * 0.03);

    const rotDamp = 4.0;
    const rotYDamp = params.lock > 0.8 ? 5.5 : rotDamp;

    g.rotation.x = THREE.MathUtils.damp(safe(g.rotation.x, 0), targetX, rotDamp, delta);
    g.rotation.y = THREE.MathUtils.damp(safe(g.rotation.y, 0), targetY, rotYDamp, delta);
    g.rotation.z = THREE.MathUtils.damp(safe(g.rotation.z, 0), targetZ, rotDamp, delta);

    // Hard guards: never allow NaNs to propagate into the renderer.
    if (!Number.isFinite(camera.position.z)) camera.position.z = 5.6;
    if (!Number.isFinite(g.rotation.x)) g.rotation.x = 0;
    if (!Number.isFinite(g.rotation.y)) g.rotation.y = 0;
    if (!Number.isFinite(g.rotation.z)) g.rotation.z = 0;

    // Update child-driven params only when scroll progress changes meaningfully
    if (Math.abs(prog - lastP.current) > 0.0005) {
      lastP.current = prog;
      setP(params);
    }
  });

  const crystalQuality: CrystalQuality = quality;

  return (
    <group ref={groupRef}>
      <Crystal quality={crystalQuality} ignite={p.ignite} lock={p.lock} split={p.split} lockPulse={p.lockPulse} />
    </group>
  );
}

export default PrismRig;
