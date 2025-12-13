import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";

type Vec3 = [number, number, number];

type Props = {
  ignite: number;
  strength: number; // 0..1
  a: Vec3;
  b: Vec3;
  c: Vec3;
  quality: "low" | "medium" | "high";
  reducedMotion: boolean;
};

export function BeamPackets({ ignite, strength, a, b, c, quality, reducedMotion }: Props) {
  const max =
    quality === "high" ? 90 :
    quality === "medium" ? 60 :
    36;

  const meshRef = useRef<THREE.InstancedMesh>(null);

  const A = useMemo(() => new THREE.Vector3(a[0], a[1], a[2]), [a]);
  const B = useMemo(() => new THREE.Vector3(b[0], b[1], b[2]), [b]);
  const C = useMemo(() => new THREE.Vector3(c[0], c[1], c[2]), [c]);

  const tArr = useMemo(() => new Float32Array(max), [max]);
  const life = useMemo(() => new Float32Array(max), [max]);
  const seg = useMemo(() => new Uint8Array(max), [max]); // 0=in, 1=out
  const speed = useMemo(() => new Float32Array(max), [max]);

  const tmp = useMemo(() => new THREE.Vector3(), []);
  const mtx = useMemo(() => new THREE.Matrix4(), []);
  const scl = useMemo(() => new THREE.Vector3(), []);

  // init
  useMemo(() => {
    for (let i = 0; i < max; i++) {
      life[i] = 0;
      tArr[i] = 0;
      seg[i] = 0;
      speed[i] = 0.4;
    }
    return null;
  }, [max, life, tArr, seg, speed]);

  function spawn(i: number) {
    life[i] = 0.7 + Math.random() * 0.6;
    tArr[i] = 0;
    seg[i] = Math.random() < 0.55 ? 0 : 1;
    speed[i] = 0.55 + Math.random() * 0.85;
  }

  useFrame((_, delta) => {
    const inst = meshRef.current;
    if (!inst) return;

    const s = Math.max(0, Math.min(1, strength));
    const i = Math.max(0, Math.min(1, ignite));
    // Visibility driven by strength; ignite only boosts slightly.
    const visible = s > 0.12 && !reducedMotion;
    const baseAlpha = Math.min(0.22, 0.06 + 0.14 * s + 0.04 * i);

    inst.visible = visible;
    (inst.material as THREE.MeshBasicMaterial).opacity = baseAlpha;

    if (!visible) return;

    // light spawn rate: a few per second
    const spawnRate = (quality === "high" ? 16 : quality === "medium" ? 11 : 7) * s;
    const want = spawnRate * delta;

    // probabilistic spawning
    for (let i = 0; i < max; i++) {
      if (life[i] <= 0 && Math.random() < want * 0.06) spawn(i);
    }

    for (let i = 0; i < max; i++) {
      if (life[i] <= 0) continue;

      tArr[i] += delta * speed[i];
      life[i] -= delta * 0.45;

      const t = tArr[i];

      if (t >= 1) {
        life[i] = 0;
        continue;
      }

      // position along chosen segment
      const start = seg[i] === 0 ? A : B;
      const end = seg[i] === 0 ? B : C;

      tmp.lerpVectors(start, end, t);

      // size pulse
      const s = 0.04 + 0.035 * strength;
      scl.setScalar(s);

      mtx.compose(tmp, new THREE.Quaternion(), scl);
      inst.setMatrixAt(i, mtx);
    }

    inst.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, max] as unknown as [THREE.BufferGeometry, THREE.Material | THREE.Material[], number]}
    >
      <sphereGeometry args={[1, 12, 12]} />
      <meshBasicMaterial
        color={"#22D3EE"}
        transparent
        opacity={0.0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
}

export default BeamPackets;
