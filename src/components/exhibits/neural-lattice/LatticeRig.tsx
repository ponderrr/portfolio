import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { VisualQuality } from "@/hooks/useVisualQuality";
import { LatticeField } from "./LatticeField";

type Props = {
  quality: VisualQuality;
  interactive: boolean;
  reducedMotion: boolean;
};

export function LatticeRig({ quality, interactive, reducedMotion }: Props) {
  const groupRef = useRef<THREE.Group>(null);

  // pointer intersection in LOCAL space
  const pointerLocalRef = useRef(new THREE.Vector3(0, 0, 0));

  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
  const tmpWorld = useMemo(() => new THREE.Vector3(), []);

  const { camera, raycaster } = useThree();

  useFrame((state, delta) => {
    const g = groupRef.current;
    if (!g) return;

    if (interactive) {
      raycaster.setFromCamera(state.pointer, camera);
      raycaster.ray.intersectPlane(plane, tmpWorld);
      pointerLocalRef.current.copy(tmpWorld);
      g.worldToLocal(pointerLocalRef.current);
    } else {
      pointerLocalRef.current.set(999, 999, 999);
    }

    // subtle parallax
    const tx = interactive ? state.pointer.y * 0.18 : 0;
    const ty = interactive ? state.pointer.x * 0.24 : 0;

    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, tx, 4.5, delta);
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, ty, 4.5, delta);

    if (!reducedMotion) {
      g.rotation.z = THREE.MathUtils.damp(
        g.rotation.z,
        Math.sin(state.clock.elapsedTime * 0.08) * 0.02,
        1.5,
        delta
      );
    }
  });

  return (
    <group ref={groupRef}>
      <LatticeField
        quality={quality}
        pointerLocalRef={pointerLocalRef}
        interactive={interactive}
        reducedMotion={reducedMotion}
      />
    </group>
  );
}
