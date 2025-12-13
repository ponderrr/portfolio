import * as THREE from "three";
import { useMemo } from "react";

type Vec3 = [number, number, number];

type Props = {
  ignite: number;
  strength: number; // 0..1
  split: number;    // 0..1
  lockPulse: number; // 0..1 (peak during lock window)
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

export function EnergyBeam({ ignite, strength, split, lockPulse, a, b, c }: Props) {
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

  const s = Math.max(0, Math.min(1, strength));
  // Ignition should *boost* intensity/glow, never gate visibility by dropping opacity to zero.
  // Strength is what determines whether the beam exists at all.
  const igniteBoost = 0.35 + 0.65 * Math.max(0, Math.min(1, ignite));

  // Core beam parameters
  const coreOpacity = Math.min(0.68, 0.58 * s * igniteBoost * (0.9 + 0.1 * lockPulse));
  const coreRadius = 0.024 + 0.012 * s;
  
  // Halo beam parameters - thicker, lower opacity
  const haloOpacity = Math.min(0.26, 0.22 * s * igniteBoost * (0.9 + 0.1 * lockPulse));
  const haloRadius = coreRadius * (2.9 + 0.3 * split) + 0.05 * lockPulse; // Widens during lock/split

  const segIn = cylinderBetween(A, B);
  const segOut = cylinderBetween(B, C);

  // Internal segment - shorter, brighter, visible through crystal
  const internalMid = useMemo(() => new THREE.Vector3(), []);
  internalMid.lerpVectors(B, C, 0.15); // Starts just past hit point
  const internalEnd = useMemo(() => new THREE.Vector3(), []);
  internalEnd.lerpVectors(B, C, 0.55); // Ends about halfway through
  const segInternal = cylinderBetween(internalMid, internalEnd);
  const internalOpacity = Math.min(0.55, 0.48 * s * igniteBoost * (0.7 + 0.3 * lockPulse));

  // Split rays: rotate outgoing direction slightly around Y axis.
  const outDir = tmp0.subVectors(C, B);
  const outLen = outDir.length();
  outDir.normalize();

  const axis = new THREE.Vector3(0, 1, 0);

  const ang = 0.22 * split;
  const dirL = tmp1.copy(outDir).applyAxisAngle(axis, +ang);
  const dirR = tmp2.copy(outDir).applyAxisAngle(axis, -ang);

  C1v.copy(B).add(dirL.multiplyScalar(outLen));
  C2v.copy(B).add(outDir.clone().multiplyScalar(outLen));
  C3v.copy(B).add(dirR.multiplyScalar(outLen));

  const splitOpacity = Math.min(0.36, coreOpacity * split * 0.55);

  // Lens glint at exit point during lock
  const exitPoint = useMemo(() => new THREE.Vector3(), []);
  exitPoint.lerpVectors(B, C, 0.92);
  const glintOpacity = Math.min(0.28, (0.42 + 0.12 * split) * lockPulse * ignite);
  const glintScale = 0.14 + 0.1 * lockPulse + 0.06 * split;

  return (
    <group>
      {/* === INCOMING BEAM (2-layer: core + halo) === */}
      {/* Halo layer */}
      <mesh position={segIn.mid} quaternion={segIn.quat}>
        <cylinderGeometry args={[haloRadius, haloRadius, segIn.len, 16, 1, true]} />
        <meshBasicMaterial
          color={"#22D3EE"}
          transparent
          opacity={haloOpacity}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* Core layer */}
      <mesh position={segIn.mid} quaternion={segIn.quat}>
        <cylinderGeometry args={[coreRadius, coreRadius, segIn.len, 14, 1, true]} />
        <meshBasicMaterial
          color={"#c7d2fe"}
          transparent
          opacity={coreOpacity}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* === INTERNAL BEAM SEGMENT (visible through crystal) === */}
      {strength > 0.1 && (
        <>
          <mesh position={segInternal.mid} quaternion={segInternal.quat}>
            <cylinderGeometry args={[coreRadius * 1.1, coreRadius * 1.1, segInternal.len, 14, 1, true]} />
            <meshBasicMaterial
              color={"#e0e7ff"}
              transparent
              opacity={internalOpacity}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          {/* Internal halo */}
          <mesh position={segInternal.mid} quaternion={segInternal.quat}>
            <cylinderGeometry args={[haloRadius * 0.6, haloRadius * 0.6, segInternal.len, 14, 1, true]} />
            <meshBasicMaterial
              color={"#a5b4fc"}
              transparent
              opacity={internalOpacity * 0.35}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </>
      )}

      {/* === OUTGOING BEAM (2-layer, fades if split is active) === */}
      {/* Halo layer */}
      <mesh position={segOut.mid} quaternion={segOut.quat}>
        <cylinderGeometry args={[haloRadius, haloRadius, segOut.len, 16, 1, true]} />
        <meshBasicMaterial
          color={"#6366F1"}
          transparent
          opacity={haloOpacity * (1 - 0.55 * split)}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* Core layer */}
      <mesh position={segOut.mid} quaternion={segOut.quat}>
        <cylinderGeometry args={[coreRadius, coreRadius, segOut.len, 14, 1, true]} />
        <meshBasicMaterial
          color={"#c7d2fe"}
          transparent
          opacity={coreOpacity * (1 - 0.45 * split)}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* === SPLIT BEAMS (during lock pulse) === */}
      {split > 0.01 && (
        <group>
          {[
            { end: C1v, coreColor: "#67e8f9", haloColor: "#22D3EE" },
            { end: C2v, coreColor: "#e0e7ff", haloColor: "#c7d2fe" },
            { end: C3v, coreColor: "#a5b4fc", haloColor: "#6366F1" },
          ].map((r, idx) => {
            const seg = cylinderBetween(B, r.end);
            const opacity = splitOpacity * (idx === 1 ? 0.55 : 0.42);
            return (
              <group key={idx}>
                {/* Split halo */}
                <mesh position={seg.mid} quaternion={seg.quat}>
                  <cylinderGeometry args={[haloRadius * 0.7, haloRadius * 0.7, seg.len, 14, 1, true]} />
                  <meshBasicMaterial
                    color={r.haloColor}
                    transparent
                    opacity={opacity * 0.4}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                  />
                </mesh>
                {/* Split core */}
                <mesh position={seg.mid} quaternion={seg.quat}>
                  <cylinderGeometry args={[coreRadius * 0.9, coreRadius * 0.9, seg.len, 14, 1, true]} />
                  <meshBasicMaterial
                    color={r.coreColor}
                    transparent
                    opacity={opacity}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                  />
                </mesh>
              </group>
            );
          })}
        </group>
      )}

      {/* === HIT GLOW (entry point on crystal) === */}
      <mesh position={[B.x, B.y, B.z]}>
        <sphereGeometry args={[0.055 + 0.04 * strength, 16, 16]} />
        <meshBasicMaterial
          color={"#22D3EE"}
          transparent
          opacity={Math.min(0.24, 0.18 * ignite * (0.35 + 0.65 * strength))}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* === LENS GLINT SPRITE (exit point during lock) === */}
      {lockPulse > 0.05 && (
        <mesh position={[exitPoint.x, exitPoint.y, exitPoint.z]}>
          <planeGeometry args={[glintScale, glintScale]} />
          <meshBasicMaterial
            color={"#e0e7ff"}
            transparent
            opacity={glintOpacity}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}

export default EnergyBeam;
