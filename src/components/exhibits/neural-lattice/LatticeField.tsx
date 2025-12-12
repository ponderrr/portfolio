import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import type React from "react";
import type { VisualQuality } from "@/hooks/useVisualQuality";
import { LatticePointsMaterial } from "./materials/LatticePointsMaterial";
import ProbabilityHUD3D from "./ProbabilityHUD3D";
import { buildNetworkModel, loadExhibit001Weights, type NetworkModel, type WeightsFile } from "./neuralLattice";

type Props = {
  quality: VisualQuality;
  pointerOnInputPlaneRef: React.MutableRefObject<THREE.Vector3>;
  interactive: boolean;
  reducedMotion: boolean;
  ignite: number;
};

function relu(x: number) {
  return x > 0 ? x : 0;
}

function softmax(logits: Float32Array, out: Float32Array) {
  let max = -Infinity;
  for (let i = 0; i < logits.length; i++) max = Math.max(max, logits[i]);
  let sum = 0;
  for (let i = 0; i < logits.length; i++) {
    const v = Math.exp(logits[i] - max);
    out[i] = v;
    sum += v;
  }
  const inv = sum > 0 ? 1 / sum : 0.1;
  for (let i = 0; i < logits.length; i++) out[i] *= inv;
}

export function LatticeField({ quality, pointerOnInputPlaneRef, interactive, reducedMotion, ignite }: Props) {
  const [weights, setWeights] = useState<WeightsFile | null>(null);
  const [model, setModel] = useState<NetworkModel | null>(null);

  // Load weights once
  useEffect(() => {
    let alive = true;
    loadExhibit001Weights()
      .then((w) => {
        if (alive) setWeights(w);
      })
      .catch((e) => console.error(e));
    return () => {
      alive = false;
    };
  }, []);

  // Build model from weights
  useEffect(() => {
    if (!weights) return;
    const topK = quality === "high" ? 6 : quality === "medium" ? 5 : 4;

    setModel(buildNetworkModel(weights, topK));
  }, [weights, quality]);

  const total = model?.totalNodes ?? 0;

  // Node geometry (static positions, dynamic activity)
  const positions = useMemo(() => (model ? new Float32Array(model.positions) : new Float32Array(0)), [model]);
  const seeds = useMemo(() => {
    const s = new Float32Array(total);
    for (let i = 0; i < total; i++) s[i] = (i * 0.6180339887) % 1; // deterministic
    return s;
  }, [total]);

  const activity = useMemo(() => new Float32Array(total), [total]);

  const pointsGeom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    g.setAttribute("aActivity", new THREE.BufferAttribute(activity, 1));
    g.computeBoundingSphere();
    return g;
  }, [positions, seeds, activity]);

  // Edge geometry (static positions, dynamic colors)
  const edgeCount = model?.edgeCount ?? 0;
  const edgePositions = useMemo(() => new Float32Array(edgeCount * 2 * 3), [edgeCount]);
  const edgeColors = useMemo(() => new Float32Array(edgeCount * 2 * 3), [edgeCount]);

  const linesGeom = useMemo(() => {
    if (model) {
      // initial positions
      for (let e = 0; e < edgeCount; e++) {
        const a = model.edges[e * 2 + 0];
        const b = model.edges[e * 2 + 1];
        const out = e * 2 * 3;
        edgePositions[out + 0] = positions[a * 3 + 0];
        edgePositions[out + 1] = positions[a * 3 + 1];
        edgePositions[out + 2] = positions[a * 3 + 2];
        edgePositions[out + 3] = positions[b * 3 + 0];
        edgePositions[out + 4] = positions[b * 3 + 1];
        edgePositions[out + 5] = positions[b * 3 + 2];
      }
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(edgePositions, 3));
    g.setAttribute("color", new THREE.BufferAttribute(edgeColors, 3));
    g.computeBoundingSphere();
    return g;
  }, [edgeCount, model, positions, edgePositions, edgeColors]);

  // Output positions (10*3) for HUD
  const outputPositions = useMemo(() => {
    if (!model) return new Float32Array(0);
    const out = new Float32Array(model.outputCount * 3);
    for (let k = 0; k < model.outputCount; k++) {
      const idx = model.outputStart + k;
      out[k * 3 + 0] = positions[idx * 3 + 0];
      out[k * 3 + 1] = positions[idx * 3 + 1];
      out[k * 3 + 2] = positions[idx * 3 + 2];
    }
    return out;
  }, [model, positions]);

  // Packet system (wow): points traveling along edges
  const maxPackets = quality === "high" ? 160 : quality === "medium" ? 110 : 70;

  const packetPos = useMemo(() => new Float32Array(maxPackets * 3), [maxPackets]);
  const packetLife = useMemo(() => new Float32Array(maxPackets), [maxPackets]);
  const packetEdge = useMemo(() => new Uint32Array(maxPackets), [maxPackets]);
  const packetT = useMemo(() => new Float32Array(maxPackets), [maxPackets]);
  const packetSpeed = useMemo(() => new Float32Array(maxPackets), [maxPackets]);

  const packetsGeom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(packetPos, 3));
    g.setAttribute("aLife", new THREE.BufferAttribute(packetLife, 1));
    return g;
  }, [packetPos, packetLife]);

  const packetsMat = useMemo(() => {
    return new THREE.PointsMaterial({
      color: new THREE.Color("#22D3EE"),
      size: 0.06,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  // Activations buffers per layer
  const a0 = useRef<Float32Array>(new Float32Array(0));
  const a1 = useRef<Float32Array>(new Float32Array(0));
  const a2 = useRef<Float32Array>(new Float32Array(0));
  const logits = useRef<Float32Array>(new Float32Array(0));
  const probs = useRef<Float32Array>(new Float32Array(0));

  useEffect(() => {
    if (!model) {
      a0.current = new Float32Array(0);
      a1.current = new Float32Array(0);
      a2.current = new Float32Array(0);
      logits.current = new Float32Array(0);
      probs.current = new Float32Array(0);
      return;
    }
    a0.current = new Float32Array(model.layerCounts[0]);
    a1.current = new Float32Array(model.layerCounts[1]);
    a2.current = new Float32Array(model.layerCounts[2]);
    logits.current = new Float32Array(model.layerCounts[3]);
    probs.current = new Float32Array(model.layerCounts[3]);
  }, [model]);

  // Cached max weight for normalization
  const wAbsMax = useMemo(() => {
    if (!model) return 1;
    let m = 1e-6;
    for (let i = 0; i < model.edgeWeight.length; i++) m = Math.max(m, Math.abs(model.edgeWeight[i]));
    return m;
  }, [model]);

  const timeRef = useRef(0);
  const simRef = useRef({
    // rate limit compute
    acc: 0,
    // random impulse cadence
    impulseAcc: 0,
    // pointer drawing
    pointerAcc: 0,
  });

  function spawnPacket(edgeIndex: number, strength: number) {
    // find dead slot
    for (let i = 0; i < maxPackets; i++) {
      if (packetLife[i] <= 0) {
        packetEdge[i] = edgeIndex;
        packetT[i] = 0;
        packetLife[i] = Math.max(0.25, Math.min(1.0, strength));
        packetSpeed[i] = 0.55 + 0.85 * strength;
        return;
      }
    }
  }

  useFrame((_, delta) => {
    if (!weights || !model) return;

    timeRef.current += delta;

    // Ignition gates: do not run sim until late ignition (premium sequencing)
    const igniteNodes = THREE.MathUtils.smoothstep(ignite, 0.05, 0.45);
    const igniteEdges = THREE.MathUtils.smoothstep(ignite, 0.25, 0.85);
    const igniteSim = ignite > 0.78 && !reducedMotion;

    // gentle idle: small baseline activity so nodes aren't dead
    for (let i = 0; i < total; i++) {
      activity[i] = THREE.MathUtils.damp(activity[i], 0.035 * igniteNodes, 3.0, delta);
    }

    // Input drawing (pointer influences input layer only)
    if (interactive && igniteSim) {
      simRef.current.pointerAcc += delta;
      if (simRef.current.pointerAcc > 0.016) {
        // ~60Hz sampling
        simRef.current.pointerAcc = 0;
        const p = pointerOnInputPlaneRef.current;

        // map pointer (y,z) to input grid indices by distance
        const inputStart = model.layerStarts[0];
        const inputCount = model.layerCounts[0];

        for (let i = 0; i < inputCount; i++) {
          const idx = inputStart + i;
          const dy = positions[idx * 3 + 1] - p.y;
          const dz = positions[idx * 3 + 2] - p.z;
          const d2 = dy * dy + dz * dz;
          const target = Math.exp(-d2 / 0.06); // tight brush
          a0.current[i] = THREE.MathUtils.damp(a0.current[i], target, 10.0, delta);
        }
      }
    } else {
      // decay input
      for (let i = 0; i < a0.current.length; i++) {
        a0.current[i] = THREE.MathUtils.damp(a0.current[i], 0, 6.0, delta);
      }
    }

    // Sim forward pass at ~30Hz for stability
    simRef.current.acc += delta;
    const step = 1 / 30;

    if (igniteSim && simRef.current.acc >= step) {
      simRef.current.acc = 0;

      // Occasionally inject a soft impulse so it's alive even without pointer
      simRef.current.impulseAcc += step;
      if (simRef.current.impulseAcc > 1.25) {
        simRef.current.impulseAcc = 0;
        const i = Math.floor(Math.random() * a0.current.length);
        a0.current[i] = Math.min(1, a0.current[i] + 0.9);
      }

      // Layer 1
      {
        const L = weights.layers[0];
        const inD = L.in,
          outD = L.out;
        for (let o = 0; o < outD; o++) {
          let sum = L.b[o];
          const row = o * inD;
          for (let i = 0; i < inD; i++) sum += L.w[row + i] * a0.current[i];
          a1.current[o] = relu(sum);
        }
      }

      // Layer 2
      {
        const L = weights.layers[1];
        const inD = L.in,
          outD = L.out;
        for (let o = 0; o < outD; o++) {
          let sum = L.b[o];
          const row = o * inD;
          for (let i = 0; i < inD; i++) sum += L.w[row + i] * a1.current[i];
          a2.current[o] = relu(sum);
        }
      }

      // Output logits + probs
      {
        const L = weights.layers[2];
        const inD = L.in,
          outD = L.out;
        for (let o = 0; o < outD; o++) {
          let sum = L.b[o];
          const row = o * inD;
          for (let i = 0; i < inD; i++) sum += L.w[row + i] * a2.current[i];
          logits.current[o] = sum;
        }
        softmax(logits.current, probs.current);
      }

      // Normalize & write node activity
      const writeLayer = (layerIndex: number, acts: Float32Array, gain: number) => {
        const start = model.layerStarts[layerIndex];
        const n = model.layerCounts[layerIndex];

        let mx = 1e-6;
        for (let i = 0; i < n; i++) mx = Math.max(mx, acts[i]);

        for (let i = 0; i < n; i++) {
          const idx = start + i;
          const v = (acts[i] / mx) * gain;
          activity[idx] = Math.max(activity[idx], v);
        }
      };

      writeLayer(0, a0.current, 0.9);
      writeLayer(1, a1.current, 0.8);
      writeLayer(2, a2.current, 0.75);

      // Output layer activity: use probs directly
      {
        const start = model.outputStart;
        for (let k = 0; k < model.outputCount; k++) {
          activity[start + k] = Math.max(activity[start + k], probs.current[k] * 1.0);
        }
      }

      // Spawn packets biased by active sources (wow)
      // Only spawn a few per step
      const packetBudget = quality === "high" ? 6 : quality === "medium" ? 4 : 3;

      for (let s = 0; s < packetBudget; s++) {
        const src = Math.floor(Math.random() * total);
        const srcAct = activity[src];

        if (srcAct < 0.25) continue;

        const start = model.sourceEdgeStart[src];
        const count = model.sourceEdgeCount[src];
        if (count === 0) continue;

        const pick = start + Math.floor(Math.random() * count);
        const eIdx = model.sourceEdgeList[pick];

        spawnPacket(eIdx, srcAct);
      }
    }

    // Update edge colors based on activations + weight
    const indigo = new THREE.Color("#6366F1");
    const cyan = new THREE.Color("#22D3EE");

    for (let e = 0; e < edgeCount; e++) {
      const a = model.edges[e * 2 + 0];
      const b = model.edges[e * 2 + 1];

      const w = model.edgeWeight[e];
      const wn = Math.min(1, Math.abs(w) / wAbsMax);

      const srcAct = activity[a];
      const dstAct = activity[b];
      const act = Math.max(srcAct, dstAct);

      // base faint + activation boost
      const intensity = (0.03 + 0.85 * act * wn) * igniteEdges;

      const base = w >= 0 ? cyan : indigo;

      const out = e * 2 * 3;
      edgeColors[out + 0] = base.r * intensity;
      edgeColors[out + 1] = base.g * intensity;
      edgeColors[out + 2] = base.b * intensity;
      edgeColors[out + 3] = base.r * intensity;
      edgeColors[out + 4] = base.g * intensity;
      edgeColors[out + 5] = base.b * intensity;
    }

    (pointsGeom.getAttribute("aActivity") as THREE.BufferAttribute).needsUpdate = true;
    (linesGeom.getAttribute("color") as THREE.BufferAttribute).needsUpdate = true;

    // Update packets
    for (let i = 0; i < maxPackets; i++) {
      if (packetLife[i] <= 0 || !igniteSim) {
        packetLife[i] = Math.max(0, packetLife[i] - delta * 1.2);
        continue;
      }

      const eIdx = packetEdge[i];
      const t = packetT[i] + delta * packetSpeed[i] * 0.9;
      packetT[i] = t;

      const src = model.edges[eIdx * 2 + 0];
      const dst = model.edges[eIdx * 2 + 1];

      const sx = positions[src * 3 + 0],
        sy = positions[src * 3 + 1],
        sz = positions[src * 3 + 2];
      const dx = positions[dst * 3 + 0],
        dy = positions[dst * 3 + 1],
        dz = positions[dst * 3 + 2];

      const px = THREE.MathUtils.lerp(sx, dx, t);
      const py = THREE.MathUtils.lerp(sy, dy, t);
      const pz = THREE.MathUtils.lerp(sz, dz, t);

      packetPos[i * 3 + 0] = px;
      packetPos[i * 3 + 1] = py;
      packetPos[i * 3 + 2] = pz;

      // when reaches end, die + spike node briefly
      if (t >= 1) {
        packetLife[i] = 0;
        packetT[i] = 0;
        activity[dst] = Math.max(activity[dst], 0.95);
      } else {
        packetLife[i] = Math.max(0, packetLife[i] - delta * 0.35);
      }
    }

    (packetsGeom.getAttribute("position") as THREE.BufferAttribute).needsUpdate = true;

    // material size adjustment (quality)
    packetsMat.size = quality === "high" ? 0.062 : quality === "medium" ? 0.058 : 0.054;
    packetsMat.opacity = 0.85 * igniteEdges;
  });

  // Until loaded, render nothing (background still shows)
  if (!weights || !model) return null;

  return (
    <group>
      <lineSegments geometry={linesGeom} frustumCulled={false}>
        <lineBasicMaterial vertexColors transparent opacity={0.95} blending={THREE.AdditiveBlending} depthWrite={false} />
      </lineSegments>

      <points geometry={pointsGeom} frustumCulled={false}>
        <LatticePointsMaterial ignite={ignite} quality={quality} />
      </points>

      <points geometry={packetsGeom} material={packetsMat} frustumCulled={false} />

      <ProbabilityHUD3D outputPositions={outputPositions} probs={probs.current} ignite={ignite} />
    </group>
  );
}

export default LatticeField;
