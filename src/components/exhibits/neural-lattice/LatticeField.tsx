import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type React from "react";
import type { VisualQuality } from "@/hooks/useVisualQuality";
import { buildLattice } from "./neuralLattice";
import { LatticePointsMaterial } from "./materials/LatticePointsMaterial";

type Props = {
  quality: VisualQuality;
  pointerLocalRef: React.MutableRefObject<THREE.Vector3>;
  interactive: boolean;
  reducedMotion: boolean;
};

// Small RNG for infrequent spawns (stable, no allocations).
function xorshift32(state: number) {
  let x = state | 0;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  return x | 0;
}

export function LatticeField({ quality, pointerLocalRef, interactive, reducedMotion }: Props) {
  const lattice = useMemo(() => buildLattice(quality), [quality]);

  const base = lattice.basePositions;
  const seeds = lattice.seeds;
  const edgesFrom = lattice.edgesFrom;
  const edgesTo = lattice.edgesTo;
  const edgeWeights = lattice.edgeWeights;
  const outOffsets = lattice.outOffsets;
  const outEdgeIndices = lattice.outEdgeIndices;

  const nodeCount = lattice.nodeCount;
  const edgeCount = lattice.edgeCount;

  const positions = useMemo(() => new Float32Array(base), [base]);
  const activity = useMemo(() => new Float32Array(nodeCount), [nodeCount]);
  const impulse = useMemo(() => new Float32Array(nodeCount), [nodeCount]);

  const nodeColors = useMemo(() => {
    const a = new THREE.Color("#6366F1");
    const b = new THREE.Color("#22D3EE");
    const out = new Float32Array(nodeCount * 3);
    for (let i = 0; i < nodeCount; i++) {
      const c = a.clone().lerp(b, seeds[i]);
      out[i * 3 + 0] = c.r;
      out[i * 3 + 1] = c.g;
      out[i * 3 + 2] = c.b;
    }
    return out;
  }, [nodeCount, seeds]);

  const edgeSubdiv = quality === "high" ? 8 : quality === "medium" ? 6 : 4;
  const edgeSegCount = edgeCount * edgeSubdiv;
  const edgePositions = useMemo(() => new Float32Array(edgeSegCount * 2 * 3), [edgeSegCount]);
  const edgeColors = useMemo(() => new Float32Array(edgeSegCount * 2 * 3), [edgeSegCount]);
  const edgeGlow = useMemo(() => new Float32Array(edgeSegCount), [edgeSegCount]);

  const maxPackets = quality === "high" ? 96 : quality === "medium" ? 64 : 40;
  const packetsEdge = useMemo(() => new Int32Array(maxPackets).fill(-1), [maxPackets]);
  const packetsT = useMemo(() => new Float32Array(maxPackets), [maxPackets]);
  const packetsSpeed = useMemo(() => new Float32Array(maxPackets), [maxPackets]);
  const packetsStrength = useMemo(() => new Float32Array(maxPackets), [maxPackets]);
  const packetsHops = useMemo(() => new Int8Array(maxPackets), [maxPackets]);
  const packetsAlive = useMemo(() => new Uint8Array(maxPackets), [maxPackets]);

  const packetPositions = useMemo(() => new Float32Array(maxPackets * 3), [maxPackets]);
  const packetColors = useMemo(() => new Float32Array(maxPackets * 3), [maxPackets]);

  const pointsGeom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    g.setAttribute("aActivity", new THREE.BufferAttribute(activity, 1));
    g.computeBoundingSphere();
    return g;
  }, [positions, seeds, activity]);

  const linesGeom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(edgePositions, 3));
    g.setAttribute("color", new THREE.BufferAttribute(edgeColors, 3));
    g.computeBoundingSphere();
    return g;
  }, [edgePositions, edgeColors]);

  const packetsGeom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(packetPositions, 3));
    g.setAttribute("color", new THREE.BufferAttribute(packetColors, 3));
    g.setDrawRange(0, 0);
    g.computeBoundingSphere();
    return g;
  }, [packetPositions, packetColors]);

  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const packetsRef = useRef<THREE.Points>(null);

  const timeRef = useRef(0);
  const rngRef = useRef(0x1234567);
  const nextAmbientRef = useRef(0.9);
  const pointerCooldownRef = useRef(0);

  const spawnPacketOnEdge = (edgeIndex: number, strength: number, hops: number, t0 = 0) => {
    // find a free slot (small max, linear scan is fine)
    for (let i = 0; i < maxPackets; i++) {
      if (packetsAlive[i] === 0) {
        packetsAlive[i] = 1;
        packetsEdge[i] = edgeIndex;
        packetsT[i] = t0;
        packetsStrength[i] = strength;
        packetsHops[i] = hops;
        // speed: subtle variation
        rngRef.current = xorshift32(rngRef.current);
        const r01 = ((rngRef.current >>> 0) % 10000) / 10000;
        packetsSpeed[i] = (quality === "low" ? 0.85 : 0.95) + r01 * (quality === "high" ? 0.55 : 0.45);
        return;
      }
    }
  };

  const spawnImpulseFromNode = (nodeIndex: number, baseStrength: number, hops: number) => {
    impulse[nodeIndex] = Math.min(1, Math.max(impulse[nodeIndex], baseStrength));

    const start = outOffsets[nodeIndex];
    const end = outOffsets[nodeIndex + 1];
    const outCount = end - start;
    if (outCount === 0) return;

    const branch = quality === "low" ? 1 : 2;
    const emit = Math.min(branch, outCount);
    for (let k = 0; k < emit; k++) {
      const eIdx = outEdgeIndices[start + k];
      const w = edgeWeights[eIdx];
      const s = baseStrength * (0.20 + 0.80 * w);
      spawnPacketOnEdge(eIdx, s, hops, 0);
    }
  };

  useFrame((_, delta) => {
    if (reducedMotion) return;

    timeRef.current += delta;
    const t = timeRef.current;

    const p = pointerLocalRef.current;
    const pr2 = lattice.pointerRadius * lattice.pointerRadius;

    // decay impulse energy
    const impulseDecay = Math.exp(-delta * 5.2);
    for (let i = 0; i < nodeCount; i++) impulse[i] *= impulseDecay;

    // ambient impulse spawn (every ~1–2s)
    nextAmbientRef.current -= delta;
    if (nextAmbientRef.current <= 0) {
      rngRef.current = xorshift32(rngRef.current);
      const r01 = ((rngRef.current >>> 0) % 100000) / 100000;
      const node = (r01 * nodeCount) | 0;
      spawnImpulseFromNode(node, quality === "low" ? 0.65 : 0.75, quality === "low" ? 2 : 3);

      rngRef.current = xorshift32(rngRef.current);
      const r02 = ((rngRef.current >>> 0) % 100000) / 100000;
      nextAmbientRef.current = 1.0 + r02 * (quality === "high" ? 1.0 : 1.2);
    }

    // pointer-driven subtle impulses (rate-limited)
    if (interactive) {
      pointerCooldownRef.current = Math.max(0, pointerCooldownRef.current - delta);
      if (pointerCooldownRef.current <= 0) {
        let best = -1;
        let bestD2 = 1e9;
        for (let i = 0; i < nodeCount; i++) {
          const ix = i * 3;
          const dx = positions[ix + 0] - p.x;
          const dy = positions[ix + 1] - p.y;
          const dz = positions[ix + 2] - p.z;
          const d2 = dx * dx + dy * dy + dz * dz;
          if (d2 < bestD2) {
            bestD2 = d2;
            best = i;
          }
        }
        if (best >= 0 && bestD2 < 1.05 * 1.05) {
          spawnImpulseFromNode(best, 0.42, quality === "low" ? 1 : 2);
          pointerCooldownRef.current = quality === "high" ? 0.14 : quality === "medium" ? 0.18 : 0.24;
        } else {
          pointerCooldownRef.current = 0.22;
        }
      }
    }

    // Animate positions + compute activity
    for (let i = 0; i < nodeCount; i++) {
      const ix = i * 3;

      const bx = base[ix + 0];
      const by = base[ix + 1];
      const bz = base[ix + 2];

      const s = seeds[i];
      const wobble =
        0.030 * Math.sin(t * 0.85 + s * 9.0) +
        0.018 * Math.sin(t * 1.35 + s * 21.0);

      positions[ix + 0] = bx + wobble * 0.9;
      positions[ix + 1] = by + wobble * 0.6;
      positions[ix + 2] = bz + wobble * 1.1;

      const dx = positions[ix + 0] - p.x;
      const dy = positions[ix + 1] - p.y;
      const dz = positions[ix + 2] - p.z;
      const d2 = dx * dx + dy * dy + dz * dz;

      const pointerTarget = interactive ? Math.exp(-d2 / pr2) : 0;
      const target = Math.max(pointerTarget, impulse[i]);
      activity[i] = THREE.MathUtils.damp(activity[i], target, 6.5, delta);
    }

    (pointsGeom.getAttribute("position") as THREE.BufferAttribute).needsUpdate = true;
    (pointsGeom.getAttribute("aActivity") as THREE.BufferAttribute).needsUpdate = true;

    // Decay edge glow (localized packet highlight)
    const glowDecay = Math.exp(-delta * 7.2);
    for (let i = 0; i < edgeSegCount; i++) edgeGlow[i] *= glowDecay;

    // Advance packets + propagate
    for (let i = 0; i < maxPackets; i++) {
      if (packetsAlive[i] === 0) continue;
      const e = packetsEdge[i];
      if (e < 0) {
        packetsAlive[i] = 0;
        continue;
      }

      const tt = packetsT[i] + delta * packetsSpeed[i];
      if (tt >= 1) {
        const target = edgesTo[e];
        const s = packetsStrength[i];
        impulse[target] = Math.min(1, impulse[target] + s * 1.05);

        const hops = packetsHops[i];
        if (hops > 0 && s > 0.16) {
          spawnImpulseFromNode(target, s * 0.78, hops - 1);
        }

        packetsAlive[i] = 0;
        packetsEdge[i] = -1;
        packetsT[i] = 0;
        continue;
      }

      packetsT[i] = tt;

      // local edge glow near the packet (subdiv-based)
      const seg = Math.min(edgeSubdiv - 1, (tt * edgeSubdiv) | 0);
      const baseIdx = e * edgeSubdiv + seg;
      const s = packetsStrength[i];
      if (edgeGlow[baseIdx] < s) edgeGlow[baseIdx] = s;
      if (seg > 0) edgeGlow[baseIdx - 1] = Math.max(edgeGlow[baseIdx - 1], s * 0.55);
      if (seg + 1 < edgeSubdiv) edgeGlow[baseIdx + 1] = Math.max(edgeGlow[baseIdx + 1], s * 0.55);
    }

    // Pack packet positions/colors for drawRange
    let packetWrite = 0;
    for (let i = 0; i < maxPackets; i++) {
      if (packetsAlive[i] === 0) continue;
      const e = packetsEdge[i];
      const tt = packetsT[i];
      const a = edgesFrom[e];
      const b = edgesTo[e];

      const a3 = a * 3;
      const b3 = b * 3;

      const ax = positions[a3 + 0], ay = positions[a3 + 1], az = positions[a3 + 2];
      const bx = positions[b3 + 0], by = positions[b3 + 1], bz = positions[b3 + 2];

      const px = ax + (bx - ax) * tt;
      const py = ay + (by - ay) * tt;
      const pz = az + (bz - az) * tt;

      const w3 = packetWrite * 3;
      packetPositions[w3 + 0] = px;
      packetPositions[w3 + 1] = py;
      packetPositions[w3 + 2] = pz;

      // subtle cyan accent, strength-weighted
      const s = packetsStrength[i];
      const cr = THREE.MathUtils.lerp(nodeColors[a3 + 0], nodeColors[b3 + 0], tt);
      const cg = THREE.MathUtils.lerp(nodeColors[a3 + 1], nodeColors[b3 + 1], tt);
      const cb = THREE.MathUtils.lerp(nodeColors[a3 + 2], nodeColors[b3 + 2], tt);

      const intensity = 0.55 + 0.70 * s;
      packetColors[w3 + 0] = cr * intensity;
      packetColors[w3 + 1] = cg * intensity;
      packetColors[w3 + 2] = cb * intensity;

      packetWrite++;
      if (packetWrite >= maxPackets) break;
    }

    packetsGeom.setDrawRange(0, packetWrite);
    (packetsGeom.getAttribute("position") as THREE.BufferAttribute).needsUpdate = true;
    (packetsGeom.getAttribute("color") as THREE.BufferAttribute).needsUpdate = true;

    // Rebuild edge segment positions + colors from node arrays (in-place)
    for (let e = 0; e < edgeCount; e++) {
      const a = edgesFrom[e];
      const b = edgesTo[e];

      const a3 = a * 3;
      const b3 = b * 3;

      const ax = positions[a3 + 0], ay = positions[a3 + 1], az = positions[a3 + 2];
      const bx = positions[b3 + 0], by = positions[b3 + 1], bz = positions[b3 + 2];

      const ia = activity[a];
      const ib = activity[b];
      const nodeBoost = Math.max(ia, ib);
      const w = edgeWeights[e];

      for (let k = 0; k < edgeSubdiv; k++) {
        const t0 = k / edgeSubdiv;
        const t1 = (k + 1) / edgeSubdiv;

        const segIdx = e * edgeSubdiv + k;
        const glow = edgeGlow[segIdx];

        const intensity = Math.min(1.4, 0.010 + 0.050 * w + 0.75 * glow + 0.25 * nodeBoost);

        const out = segIdx * 2 * 3;

        // segment positions
        edgePositions[out + 0] = ax + (bx - ax) * t0;
        edgePositions[out + 1] = ay + (by - ay) * t0;
        edgePositions[out + 2] = az + (bz - az) * t0;

        edgePositions[out + 3] = ax + (bx - ax) * t1;
        edgePositions[out + 4] = ay + (by - ay) * t1;
        edgePositions[out + 5] = az + (bz - az) * t1;

        // segment colors (lerp node colors along edge)
        const c0r = THREE.MathUtils.lerp(nodeColors[a3 + 0], nodeColors[b3 + 0], t0) * intensity;
        const c0g = THREE.MathUtils.lerp(nodeColors[a3 + 1], nodeColors[b3 + 1], t0) * intensity;
        const c0b = THREE.MathUtils.lerp(nodeColors[a3 + 2], nodeColors[b3 + 2], t0) * intensity;

        const c1r = THREE.MathUtils.lerp(nodeColors[a3 + 0], nodeColors[b3 + 0], t1) * intensity;
        const c1g = THREE.MathUtils.lerp(nodeColors[a3 + 1], nodeColors[b3 + 1], t1) * intensity;
        const c1b = THREE.MathUtils.lerp(nodeColors[a3 + 2], nodeColors[b3 + 2], t1) * intensity;

        edgeColors[out + 0] = c0r;
        edgeColors[out + 1] = c0g;
        edgeColors[out + 2] = c0b;

        edgeColors[out + 3] = c1r;
        edgeColors[out + 4] = c1g;
        edgeColors[out + 5] = c1b;
      }
    }

    (linesGeom.getAttribute("position") as THREE.BufferAttribute).needsUpdate = true;
    (linesGeom.getAttribute("color") as THREE.BufferAttribute).needsUpdate = true;
  });

  // For material time uniform
  const shaderTime = timeRef.current;

  return (
    <group>
      <lineSegments ref={linesRef} geometry={linesGeom} frustumCulled={false}>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.88}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      <points ref={packetsRef} geometry={packetsGeom} frustumCulled={false}>
        <pointsMaterial
          vertexColors
          transparent
          opacity={0.95}
          size={quality === "high" ? 0.07 : quality === "medium" ? 0.065 : 0.06}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      <points ref={pointsRef} geometry={pointsGeom} frustumCulled={false}>
        <LatticePointsMaterial time={shaderTime} quality={quality} />
      </points>
    </group>
  );
}
