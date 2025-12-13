import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import Crystal, { type CrystalQuality } from "./Crystal";
import EnergyBeam from "./EnergyBeam";
import BeamPackets from "./BeamPackets";
import CausticsPlane from "./CausticsPlane";
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

  const entry = useMemo(() => new THREE.Vector3(-4.2, 0.35, 0.55), []);
  const hit = useMemo(() => new THREE.Vector3(-0.35, 0.10, 0.05), []);
  const exitBase = useMemo(() => new THREE.Vector3(4.2, 0.15, -0.25), []);

  const exit = useMemo(() => new THREE.Vector3(), []);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  const lastP = useRef<number>(-1);
  const [p, setP] = useState(() => prismParamsFromProgress(progressRef.current));

  useFrame((state, delta) => {
    const g = groupRef.current;
    if (!g) return;

    const prog = progressRef.current;
    const params = prismParamsFromProgress(prog);

    // camera micro-dolly (subtle)
    if (!reducedMotion) {
      camera.position.z = THREE.MathUtils.damp(camera.position.z, params.camZ, 2.6, delta);
      camera.lookAt(0, 0, 0);
    }

    // deliberate rotation driven by timeline
    const baseRX = params.rotX;
    const baseRY = params.rotY;
    const baseRZ = params.rotZ;

    // pointer parallax (very subtle)
    const px = interactive ? state.pointer.x : 0;
    const py = interactive ? state.pointer.y : 0;

    const targetX = baseRX + (-py * 0.08);
    const targetY = baseRY + (px * 0.10);
    const targetZ = baseRZ + (px * 0.03);

    const rotDamp = 4.0;
    const rotYDamp = params.lock > 0.8 ? 5.5 : rotDamp;

    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, targetX, rotDamp, delta);
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, targetY, rotYDamp, delta);
    g.rotation.z = THREE.MathUtils.damp(g.rotation.z, targetZ, rotDamp, delta);

    // Exit point evolves during alignment: start a bit “wrong”, then lock.
    // This makes the “lock-in” readable.
    const wrong = tmp.set(4.2, -0.45, 0.85);
    exit.copy(wrong).lerp(exitBase, params.align);

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

      {/* Lock-only glint assist (tiny, restrained) */}
      <pointLight
        position={[exit.x, exit.y, exit.z]}
        intensity={0.45 * p.lockPulse}
        distance={6}
        decay={2}
        color={"#a5b4fc"}
      />

      <EnergyBeam
        ignite={p.ignite}
        strength={p.beamStrength}
        split={p.split}
        lockPulse={p.lockPulse}
        a={[entry.x, entry.y, entry.z]}
        b={[hit.x, hit.y, hit.z]}
        c={[exit.x, exit.y, exit.z]}
      />

      <BeamPackets
        ignite={p.ignite}
        strength={p.beamStrength}
        a={[entry.x, entry.y, entry.z]}
        b={[hit.x, hit.y, hit.z]}
        c={[exit.x, exit.y, exit.z]}
        quality={quality}
        reducedMotion={reducedMotion}
      />

      <CausticsPlane ignite={p.ignite} amount={p.caustic} lockPulse={p.lockPulse} />
    </group>
  );
}

export default PrismRig;
