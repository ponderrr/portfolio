import type { VisualQuality } from "@/hooks/useVisualQuality";

export type WeightsLayerJSON = {
  in: number;
  out: number;
  w: number[]; // row-major: out x in
  b: number[];
};

export type WeightsFileJSON = {
  name: string;
  createdAt: string;
  note?: string;
  layers: WeightsLayerJSON[];
};

export type WeightsLayer = {
  in: number;
  out: number;
  w: Float32Array;
  b: Float32Array;
};

export type WeightsFile = {
  name: string;
  layers: WeightsLayer[];
};

export async function loadExhibit001Weights(): Promise<WeightsFile> {
  const res = await fetch("/exhibits/exhibit001/mlp_weights.json", { cache: "force-cache" });
  if (!res.ok) throw new Error(`Failed to load weights: ${res.status}`);
  const json = (await res.json()) as WeightsFileJSON;

  const layers: WeightsLayer[] = json.layers.map((L) => ({
    in: L.in,
    out: L.out,
    w: new Float32Array(L.w),
    b: new Float32Array(L.b),
  }));

  return { name: json.name, layers };
}

export type NetworkModel = {
  totalNodes: number;
  layerStarts: number[]; // inclusive start index per layer
  layerCounts: number[];
  positions: Float32Array; // totalNodes * 3
  // edges (line segments)
  edgeCount: number;
  edges: Uint32Array; // edgeCount * 2 => (src, dst)
  edgeWeight: Float32Array; // edgeCount (weight value)
  // adjacency for packet spawning
  sourceEdgeStart: Uint32Array; // totalNodes
  sourceEdgeCount: Uint16Array; // totalNodes
  sourceEdgeList: Uint32Array; // edge indices
  // convenience
  outputStart: number;
  outputCount: number;
};

type BuildOptions = {
  topKIncoming: number; // per target neuron
};

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function buildPositions(layerCounts: number[]): Float32Array {
  // Layout along X axis (like a network diagram), with subtle Z depth
  // Layer 0 (input): 8x8 grid at x=-3.2
  // Layer 1: ring-ish at x=-1.2
  // Layer 2: ring-ish at x=+1.1
  // Layer 3 (output): vertical stack at x=+3.2

  const total = layerCounts.reduce((a, b) => a + b, 0);
  const pos = new Float32Array(total * 3);

  let cursor = 0;

  // Input: 8x8
  {
    const x = -3.2;
    const grid = 8;
    const spacing = 0.38;
    const half = (grid - 1) * 0.5;

    for (let gy = 0; gy < grid; gy++) {
      for (let gx = 0; gx < grid; gx++) {
        const i = cursor++;
        pos[i * 3 + 0] = x;
        pos[i * 3 + 1] = (gy - half) * spacing;
        pos[i * 3 + 2] = (gx - half) * spacing * 0.65; // subtle depth
      }
    }
  }

  // Hidden 1: 48 => 2 rings of 24
  {
    const x = -1.2;
    const n = layerCounts[1];
    const ring = 24;
    const r1 = 1.25;
    const r2 = 1.65;

    for (let i0 = 0; i0 < n; i0++) {
      const i = cursor++;
      const t = ((i0 % ring) / ring) * Math.PI * 2;
      const r = i0 < ring ? r1 : r2;
      const y = Math.sin(t) * r;
      const z = Math.cos(t) * r * 0.55 + (i0 < ring ? -0.15 : 0.15);
      pos[i * 3 + 0] = x;
      pos[i * 3 + 1] = y * 0.8;
      pos[i * 3 + 2] = z;
    }
  }

  // Hidden 2: 24 => 1 ring
  {
    const x = 1.1;
    const n = layerCounts[2];
    const r = 1.35;

    for (let i0 = 0; i0 < n; i0++) {
      const i = cursor++;
      const t = (i0 / n) * Math.PI * 2;
      pos[i * 3 + 0] = x;
      pos[i * 3 + 1] = Math.sin(t) * r * 0.75;
      pos[i * 3 + 2] = Math.cos(t) * r * 0.55;
    }
  }

  // Output: 10 vertical stack
  {
    const x = 3.2;
    const n = layerCounts[3];
    const spacing = 0.33;
    const half = (n - 1) * 0.5;

    for (let i0 = 0; i0 < n; i0++) {
      const i = cursor++;
      pos[i * 3 + 0] = x;
      pos[i * 3 + 1] = (i0 - half) * spacing;
      pos[i * 3 + 2] = 0.0;
    }
  }

  return pos;
}

function buildTopKIncomingEdges(
  layers: WeightsLayer[],
  opts: BuildOptions,
  layerStarts: number[],
): { edges: Uint32Array; edgeWeight: Float32Array } {
  const topK = clamp(opts.topKIncoming, 1, 16);

  const edgesAcc: number[] = [];
  const weightAcc: number[] = [];

  for (let L = 0; L < layers.length; L++) {
    const prevStart = layerStarts[L];
    const nextStart = layerStarts[L + 1];

    const inDim = layers[L].in;
    const outDim = layers[L].out;
    const w = layers[L].w; // out x in

    for (let o = 0; o < outDim; o++) {
      // choose topK sources i by abs(w[o*in + i])
      const picks: { i: number; a: number; v: number }[] = [];
      for (let i = 0; i < inDim; i++) {
        const v = w[o * inDim + i];
        const a = Math.abs(v);
        if (picks.length < topK) {
          picks.push({ i, a, v });
          if (picks.length === topK) picks.sort((p, q) => p.a - q.a); // min-first
        } else if (a > picks[0].a) {
          picks[0] = { i, a, v };
          picks.sort((p, q) => p.a - q.a);
        }
      }
      // add edges source -> target
      for (const p of picks) {
        const src = prevStart + p.i;
        const dst = nextStart + o;
        edgesAcc.push(src, dst);
        weightAcc.push(p.v);
      }
    }
  }

  return {
    edges: new Uint32Array(edgesAcc),
    edgeWeight: new Float32Array(weightAcc),
  };
}

function buildSourceAdjacency(totalNodes: number, edges: Uint32Array) {
  // Count edges per source
  const counts = new Uint16Array(totalNodes);
  const edgeCount = edges.length / 2;

  for (let e = 0; e < edgeCount; e++) {
    const src = edges[e * 2 + 0];
    counts[src] = counts[src] + 1;
  }

  const start = new Uint32Array(totalNodes);
  let running = 0;
  for (let i = 0; i < totalNodes; i++) {
    start[i] = running;
    running += counts[i];
  }

  const cursor = new Uint32Array(totalNodes);
  const list = new Uint32Array(edgeCount);

  for (let e = 0; e < edgeCount; e++) {
    const src = edges[e * 2 + 0];
    const idx = start[src] + cursor[src];
    list[idx] = e;
    cursor[src] += 1;
  }

  return { sourceEdgeStart: start, sourceEdgeCount: counts, sourceEdgeList: list };
}

export function buildNetworkModel(weights: WeightsFile, topKIncoming: number): NetworkModel {
  const layerCounts = [weights.layers[0].in, weights.layers[0].out, weights.layers[1].out, weights.layers[2].out];

  const layerStarts: number[] = [];
  let s = 0;
  for (const c of layerCounts) {
    layerStarts.push(s);
    s += c;
  }

  const totalNodes = s;
  const positions = buildPositions(layerCounts);

  const built = buildTopKIncomingEdges(weights.layers, { topKIncoming }, layerStarts);
  const edgeCount = built.edges.length / 2;

  const adj = buildSourceAdjacency(totalNodes, built.edges);

  const outputStart = layerStarts[3];
  const outputCount = layerCounts[3];

  return {
    totalNodes,
    layerStarts,
    layerCounts,
    positions,
    edgeCount,
    edges: built.edges,
    edgeWeight: built.edgeWeight,
    ...adj,
    outputStart,
    outputCount,
  };
}

// ---------------------------------------------------------------------------
// Back-compat: existing exhibit code still expects buildLattice() until Phase023.
// This is a real implementation (not a stub) and will be unused/removed once
// the upgraded field is in place.

export type BuiltLattice = {
  nodeCount: number;
  edgeCount: number;
  basePositions: Float32Array; // length = nodeCount * 3
  seeds: Float32Array; // length = nodeCount
  edgesFrom: Uint32Array; // length = edgeCount
  edgesTo: Uint32Array; // length = edgeCount
  edgeWeights: Float32Array; // length = edgeCount (0..1)
  outOffsets: Uint32Array; // length = nodeCount + 1 (CSR)
  outEdgeIndices: Uint32Array; // length = edgeCount (edge indices, grouped per node)
  layerIndex: Uint8Array; // length = nodeCount
  boundsRadius: number;
  pointerRadius: number;
};

type Config = {
  layers: number[];
  depth: number;
  radiusX: number;
  radiusY: number;
  jitter: number;
  topN: number;
};

export function getLatticeConfig(q: VisualQuality): Config {
  // Feed-forward layered layout: input -> hidden -> output
  // Top-N edges per node keeps it legible (no spaghetti).
  const topN = q === "low" ? 4 : 6;
  if (q === "high") return { layers: [48, 64, 56, 32], depth: 4.9, radiusX: 2.35, radiusY: 1.55, jitter: 0.1, topN };
  if (q === "medium") return { layers: [36, 48, 40, 24], depth: 4.6, radiusX: 2.15, radiusY: 1.45, jitter: 0.095, topN };
  return { layers: [24, 32, 28, 16], depth: 4.2, radiusX: 1.95, radiusY: 1.35, jitter: 0.085, topN };
}

// Tiny deterministic-ish RNG (seeded by index) to avoid Math.random noise per frame.
function hash01(n: number): number {
  const x = Math.sin(n * 999.123 + 0.123) * 43758.5453;
  return x - Math.floor(x);
}

function clamp01(x: number) {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

function stableWeight(src: number, dst: number) {
  // 0..1
  return hash01(src * 131 + dst * 977 + 0.731);
}

export function buildLattice(q: VisualQuality): BuiltLattice {
  const cfg = getLatticeConfig(q);
  const nodeCount = cfg.layers.reduce((a, b) => a + b, 0);

  const basePositions = new Float32Array(nodeCount * 3);
  const seeds = new Float32Array(nodeCount);
  const layerIndex = new Uint8Array(nodeCount);

  // Layout: layered planes along Z, with a compact premium silhouette in X/Y.
  // Each layer uses a golden-angle spiral distribution for even spacing.
  const golden = Math.PI * (3 - Math.sqrt(5));
  const layerCount = cfg.layers.length;
  const z0 = -cfg.depth * 0.5;
  const zStep = layerCount <= 1 ? 0 : cfg.depth / (layerCount - 1);

  let cursor = 0;
  for (let li = 0; li < layerCount; li++) {
    const n = cfg.layers[li];
    const z = z0 + li * zStep;
    for (let k = 0; k < n; k++) {
      const i = cursor++;
      const t = (k + 0.5) / n;
      const r = Math.sqrt(t);
      const theta = k * golden;

      const jx = (hash01(i * 3 + 1) - 0.5) * cfg.jitter;
      const jy = (hash01(i * 3 + 2) - 0.5) * cfg.jitter;
      const jz = (hash01(i * 3 + 3) - 0.5) * cfg.jitter * 0.65;

      const x = Math.cos(theta) * r * cfg.radiusX + jx;
      const y = Math.sin(theta) * r * cfg.radiusY + jy;

      basePositions[i * 3 + 0] = x;
      basePositions[i * 3 + 1] = y;
      basePositions[i * 3 + 2] = z + jz;

      seeds[i] = hash01(i * 17 + 0.77);
      layerIndex[i] = li;
    }
  }

  // Build directed feed-forward edges between adjacent layers.
  // For each node, we compute candidate weights to next layer, then keep top-N.
  const layerStarts = new Uint32Array(layerCount + 1);
  layerStarts[0] = 0;
  for (let li = 0; li < layerCount; li++) layerStarts[li + 1] = layerStarts[li] + cfg.layers[li];

  const edgesFromArr: number[] = [];
  const edgesToArr: number[] = [];
  const edgeWeightsArr: number[] = [];

  // Temporary top-N buffers (tiny, per node).
  const bestJ = new Int32Array(cfg.topN);
  const bestW = new Float32Array(cfg.topN);

  const sigma2 = 0.75 * 0.75; // spatial bias width

  for (let li = 0; li < layerCount - 1; li++) {
    const a0 = layerStarts[li];
    const a1 = layerStarts[li + 1];
    const b0 = layerStarts[li + 1];
    const b1 = layerStarts[li + 2];

    for (let a = a0; a < a1; a++) {
      // init
      for (let k = 0; k < cfg.topN; k++) {
        bestJ[k] = -1;
        bestW[k] = -1;
      }

      const ax = basePositions[a * 3 + 0];
      const ay = basePositions[a * 3 + 1];
      const az = basePositions[a * 3 + 2];

      for (let b = b0; b < b1; b++) {
        const bx = basePositions[b * 3 + 0];
        const by = basePositions[b * 3 + 1];
        const bz = basePositions[b * 3 + 2];

        const dx = ax - bx;
        const dy = ay - by;
        const dz = az - bz;
        const d2 = dx * dx + dy * dy + dz * dz;

        // Weight: mostly deterministic random, gently biased toward spatial locality.
        const wRand = stableWeight(a, b);
        const wLocal = Math.exp(-d2 / sigma2);
        const w = clamp01(0.72 * wRand + 0.28 * wLocal);

        // Insert into top-N
        let minIdx = 0;
        let minW = bestW[0];
        for (let k = 1; k < cfg.topN; k++) {
          if (bestW[k] < minW) {
            minW = bestW[k];
            minIdx = k;
          }
        }
        if (w > minW) {
          bestW[minIdx] = w;
          bestJ[minIdx] = b;
        }
      }

      // Emit edges for this node, sorted by weight descending
      for (let k = 0; k < cfg.topN - 1; k++) {
        for (let m = k + 1; m < cfg.topN; m++) {
          if (bestW[m] > bestW[k]) {
            const tw = bestW[k];
            bestW[k] = bestW[m];
            bestW[m] = tw;
            const tj = bestJ[k];
            bestJ[k] = bestJ[m];
            bestJ[m] = tj;
          }
        }
      }

      for (let k = 0; k < cfg.topN; k++) {
        const b = bestJ[k];
        const w = bestW[k];
        if (b < 0 || w <= 0) continue;
        edgesFromArr.push(a);
        edgesToArr.push(b);
        edgeWeightsArr.push(w);
      }
    }
  }

  const edgeCount = edgesFromArr.length;
  const edgesFrom = new Uint32Array(edgesFromArr);
  const edgesTo = new Uint32Array(edgesToArr);
  const edgeWeights = new Float32Array(edgeWeightsArr);

  // Build outgoing adjacency (CSR)
  const outDegree = new Uint32Array(nodeCount);
  for (let e = 0; e < edgeCount; e++) outDegree[edgesFrom[e]]++;

  const outOffsets = new Uint32Array(nodeCount + 1);
  outOffsets[0] = 0;
  for (let i = 0; i < nodeCount; i++) outOffsets[i + 1] = outOffsets[i] + outDegree[i];

  const outEdgeIndices = new Uint32Array(edgeCount);
  const writeCursor = new Uint32Array(nodeCount);
  for (let i = 0; i < nodeCount; i++) writeCursor[i] = outOffsets[i];
  for (let e = 0; e < edgeCount; e++) {
    const a = edgesFrom[e];
    const w = writeCursor[a]++;
    outEdgeIndices[w] = e;
  }

  // Bounds + pointer radius
  let boundsRadius = 0;
  for (let i = 0; i < nodeCount; i++) {
    const x = basePositions[i * 3 + 0];
    const y = basePositions[i * 3 + 1];
    const z = basePositions[i * 3 + 2];
    const r = Math.sqrt(x * x + y * y + z * z);
    if (r > boundsRadius) boundsRadius = r;
  }
  boundsRadius *= 1.1;

  const pointerRadius = q === "high" ? 1.2 : q === "medium" ? 1.1 : 1.0;

  return {
    nodeCount,
    edgeCount,
    basePositions,
    seeds,
    edgesFrom,
    edgesTo,
    edgeWeights,
    outOffsets,
    outEdgeIndices,
    layerIndex,
    boundsRadius,
    pointerRadius,
  };
}
