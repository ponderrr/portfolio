import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { VisualQuality } from "@/hooks/useVisualQuality";
import LatticeField from "./LatticeField";

type Props = {
  quality: VisualQuality;
  interactive: boolean;
  reducedMotion: boolean;
  ignite: number;
};

export function LatticeRig({ quality, interactive, reducedMotion, ignite }: Props) {
  const groupRef = useRef<THREE.Group>(null);

  // pointer intersection on INPUT plane: normal +X, at x=-3.2
  const pointerOnInputPlaneRef = useRef(new THREE.Vector3(0, 0, 0));

  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(1, 0, 0), 3.2), []);
  const tmpWorld = useMemo(() => new THREE.Vector3(), []);
  const { camera, raycaster } = useThree();

  useFrame((state, delta) => {
    const g = groupRef.current;
    if (!g) return;

    if (interactive) {
      raycaster.setFromCamera(state.pointer, camera);
      raycaster.ray.intersectPlane(plane, tmpWorld);
      pointerOnInputPlaneRef.current.copy(tmpWorld);
      g.worldToLocal(pointerOnInputPlaneRef.current);
    } else {
      pointerOnInputPlaneRef.current.set(999, 999, 999);
    }

      // Subtle parallax (rotate around Y/Z slightly)
      const ty = interactive ? state.pointer.x * 0.12 : 0;

    g.rotation.z = THREE.MathUtils.damp(g.rotation.z, -ty, 4.0, delta);
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, ty, 4.0, delta);

    // Cinematic drift (tiny)
    if (!reducedMotion) {
      const t = state.clock.elapsedTime;
      const drift = Math.sin(t * 0.12) * 0.02;
      g.rotation.x = THREE.MathUtils.damp(g.rotation.x, drift, 1.5, delta);
    }
  });

  return (
    <group ref={groupRef}>
      <LatticeField
        quality={quality}
        pointerOnInputPlaneRef={pointerOnInputPlaneRef}
        interactive={interactive}
        reducedMotion={reducedMotion}
        ignite={ignite}
      />
    </group>
  );
}

export default LatticeRig;
