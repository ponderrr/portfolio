import * as THREE from "three";
import { useMemo } from "react";

type Vec3 = [number, number, number];

type Props = {
  ignite: number;
  strength: number; // 0..1
  split: number;    // 0..1
  a: Vec3;          // entry
  b: Vec3;          // hit
  c: Vec3;          // exit base
};

function cylinderBetween(start: THREE.Vector3, end: THREE.Vector3) {
  const dir = new THREE.Vector3().subVectors(end, start);
  const len = dir.length();
  const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);

  const quat = new THREE.Quaternion();
  quat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());

  return { len, mid, quat };
}

export function EnergyBeam({ ignite, strength, split, a, b, c }: Props) {
  const A = useMemo(() => new THREE.Vector3(), []);
  const B = useMemo(() => new THREE.Vector3(), []);
  const C = useMemo(() => new THREE.Vector3(), []);

  const tmp0 = useMemo(() => new THREE.Vector3(), []);
  const tmp1 = useMemo(() => new THREE.Vector3(), []);
  const tmp2 = useMemo(() => new THREE.Vector3(), []);

  const C1v = useMemo(() => new THREE.Vector3(), []);
  const C2v = useMemo(() => new THREE.Vector3(), []);
  const C3v = useMemo(() => new THREE.Vector3(), []);

  A.set(a[0], a[1], a[2]);
  B.set(b[0], b[1], b[2]);
  C.set(c[0], c[1], c[2]);

  const baseOpacity = 0.75 * ignite * (0.35 + 0.65 * strength);
  const radius = 0.025 + 0.015 * strength;

  const segIn = cylinderBetween(A, B);
  const segOut = cylinderBetween(B, C);

  // Split rays: rotate outgoing direction slightly around Y axis.
  const outDir = tmp0.subVectors(C, B);
  const outLen = outDir.length();
  outDir.normalize();

  const axis = new THREE.Vector3(0, 1, 0);

  const ang = 0.24 * split;
  const dirL = tmp1.copy(outDir).applyAxisAngle(axis, +ang);
  const dirR = tmp2.copy(outDir).applyAxisAngle(axis, -ang);

  C1v.copy(B).add(dirL.multiplyScalar(outLen));
  C2v.copy(B).add(outDir.clone().multiplyScalar(outLen));
  C3v.copy(B).add(dirR.multiplyScalar(outLen));

  const splitOpacity = baseOpacity * split * 0.9 * 0.85;

  return (
    <group>
      {/* Incoming beam */}
      <mesh position={segIn.mid} quaternion={segIn.quat}>
        <cylinderGeometry args={[radius, radius, segIn.len, 14, 1, true]} />
        <meshBasicMaterial
          color={"#22D3EE"}
          transparent
          opacity={baseOpacity}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Outgoing base beam (faint if split is active) */}
      <mesh position={segOut.mid} quaternion={segOut.quat}>
        <cylinderGeometry args={[radius, radius, segOut.len, 14, 1, true]} />
        <meshBasicMaterial
          color={"#6366F1"}
          transparent
          opacity={baseOpacity * (1 - 0.55 * split)}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Split beams (only during lock pulse) */}
      {split > 0.001 && (
        <group>
          {[
            { end: C1v, color: "#22D3EE" },
            { end: C2v, color: "#F8FAFF" },
            { end: C3v, color: "#6366F1" },
          ].map((r, idx) => {
            const seg = cylinderBetween(B, r.end);
            return (
              <mesh key={idx} position={seg.mid} quaternion={seg.quat}>
                <cylinderGeometry args={[radius * 0.92, radius * 0.92, seg.len, 14, 1, true]} />
                <meshBasicMaterial
                  color={r.color}
                  transparent
                  opacity={splitOpacity * (idx === 1 ? 0.7 : 0.55)}
                  depthWrite={false}
                  blending={THREE.AdditiveBlending}
                />
              </mesh>
            );
          })}
        </group>
      )}

      {/* Hit glow */}
      <mesh position={[B.x, B.y, B.z]}>
        <sphereGeometry args={[0.06 + 0.05 * strength, 18, 18]} />
        <meshBasicMaterial
          color={"#22D3EE"}
          transparent
          opacity={0.28 * ignite * (0.3 + 0.7 * strength)}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

export default EnergyBeam;
