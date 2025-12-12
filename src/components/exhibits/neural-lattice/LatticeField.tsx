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

export function LatticeField({ quality, pointerLocalRef, interactive, reducedMotion }: Props) {
  const lattice = useMemo(() => buildLattice(quality), [quality]);

  const base = lattice.basePositions;
  const seeds = lattice.seeds;
  const edges = lattice.edges;

  const nodeCount = lattice.nodeCount;
  const edgeCount = lattice.edgeCount;

  const positions = useMemo(() => new Float32Array(base), [base]);
  const activity = useMemo(() => new Float32Array(nodeCount), [nodeCount]);

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

  const edgePositions = useMemo(() => new Float32Array(edgeCount * 2 * 3), [edgeCount]);
  const edgeColors = useMemo(() => new Float32Array(edgeCount * 2 * 3), [edgeCount]);

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

  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  const timeRef = useRef(0);

  useFrame((_, delta) => {
    if (reducedMotion) return;

    timeRef.current += delta;
    const t = timeRef.current;

    const p = pointerLocalRef.current;
    const pr2 = lattice.pointerRadius * lattice.pointerRadius;

    // Animate positions + compute activity
    for (let i = 0; i < nodeCount; i++) {
      const ix = i * 3;

      const bx = base[ix + 0];
      const by = base[ix + 1];
      const bz = base[ix + 2];

      const s = seeds[i];
      const wobble =
        0.035 * Math.sin(t * 0.85 + s * 9.0) +
        0.020 * Math.sin(t * 1.35 + s * 21.0);

      positions[ix + 0] = bx + wobble * 0.9;
      positions[ix + 1] = by + wobble * 0.6;
      positions[ix + 2] = bz + wobble * 1.1;

      const dx = positions[ix + 0] - p.x;
      const dy = positions[ix + 1] - p.y;
      const dz = positions[ix + 2] - p.z;
      const d2 = dx * dx + dy * dy + dz * dz;

      const target = interactive ? Math.exp(-d2 / pr2) : 0;
      activity[i] = THREE.MathUtils.damp(activity[i], target, 6.5, delta);
    }

    (pointsGeom.getAttribute("position") as THREE.BufferAttribute).needsUpdate = true;
    (pointsGeom.getAttribute("aActivity") as THREE.BufferAttribute).needsUpdate = true;

    // Rebuild edge positions + colors from node arrays (in-place)
    for (let e = 0; e < edgeCount; e++) {
      const a = edges[e * 2 + 0];
      const b = edges[e * 2 + 1];

      const a3 = a * 3;
      const b3 = b * 3;

      const out = e * 2 * 3;

      // positions
      edgePositions[out + 0] = positions[a3 + 0];
      edgePositions[out + 1] = positions[a3 + 1];
      edgePositions[out + 2] = positions[a3 + 2];

      edgePositions[out + 3] = positions[b3 + 0];
      edgePositions[out + 4] = positions[b3 + 1];
      edgePositions[out + 5] = positions[b3 + 2];

      // colors (activity-weighted)
      const ia = activity[a];
      const ib = activity[b];
      const intensity = 0.08 + 0.75 * Math.max(ia, ib);

      edgeColors[out + 0] = nodeColors[a3 + 0] * intensity;
      edgeColors[out + 1] = nodeColors[a3 + 1] * intensity;
      edgeColors[out + 2] = nodeColors[a3 + 2] * intensity;

      edgeColors[out + 3] = nodeColors[b3 + 0] * intensity;
      edgeColors[out + 4] = nodeColors[b3 + 1] * intensity;
      edgeColors[out + 5] = nodeColors[b3 + 2] * intensity;
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
          opacity={0.85}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      <points ref={pointsRef} geometry={pointsGeom} frustumCulled={false}>
        <LatticePointsMaterial time={shaderTime} quality={quality} />
      </points>
    </group>
  );
}
