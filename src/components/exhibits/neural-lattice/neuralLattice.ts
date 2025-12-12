import type { VisualQuality } from "@/hooks/useVisualQuality";

export type BuiltLattice = {
  nodeCount: number;
  edgeCount: number;
  basePositions: Float32Array; // length = nodeCount * 3
  seeds: Float32Array;         // length = nodeCount
  edgesFrom: Uint32Array;      // length = edgeCount
  edgesTo: Uint32Array;        // length = edgeCount
  edgeWeights: Float32Array;   // length = edgeCount (0..1)
  outOffsets: Uint32Array;     // length = nodeCount + 1 (CSR)
  outEdgeIndices: Uint32Array; // length = edgeCount (edge indices, grouped per node)
  layerIndex: Uint8Array;      // length = nodeCount
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
  if (q === "high") return { layers: [48, 64, 56, 32], depth: 4.9, radiusX: 2.35, radiusY: 1.55, jitter: 0.10, topN };
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
