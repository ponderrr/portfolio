import type { VisualQuality } from "@/hooks/useVisualQuality";

export type BuiltLattice = {
  nodeCount: number;
  edgeCount: number;
  basePositions: Float32Array; // length = nodeCount * 3
  seeds: Float32Array;         // length = nodeCount
  edges: Uint32Array;          // length = edgeCount * 2 (pairs)
  boundsRadius: number;
  pointerRadius: number;
};

type Config = {
  nx: number;
  ny: number;
  nz: number;
  spacing: number;
  jitter: number;
  diagonals: boolean;
};

export function getLatticeConfig(q: VisualQuality): Config {
  if (q === "high") return { nx: 14, ny: 9, nz: 6, spacing: 0.55, jitter: 0.12, diagonals: true };
  if (q === "medium") return { nx: 12, ny: 8, nz: 5, spacing: 0.60, jitter: 0.11, diagonals: false };
  return { nx: 10, ny: 6, nz: 4, spacing: 0.66, jitter: 0.10, diagonals: false };
}

// Tiny deterministic-ish RNG (seeded by index) to avoid Math.random noise per frame.
function hash01(n: number): number {
  const x = Math.sin(n * 999.123 + 0.123) * 43758.5453;
  return x - Math.floor(x);
}

export function buildLattice(q: VisualQuality): BuiltLattice {
  const cfg = getLatticeConfig(q);
  const nodeCount = cfg.nx * cfg.ny * cfg.nz;

  const basePositions = new Float32Array(nodeCount * 3);
  const seeds = new Float32Array(nodeCount);

  const cx = (cfg.nx - 1) * 0.5;
  const cy = (cfg.ny - 1) * 0.5;
  const cz = (cfg.nz - 1) * 0.5;

  let idx = 0;
  for (let z = 0; z < cfg.nz; z++) {
    for (let y = 0; y < cfg.ny; y++) {
      for (let x = 0; x < cfg.nx; x++) {
        const i = idx++;
        const h1 = hash01(i * 3 + 1) - 0.5;
        const h2 = hash01(i * 3 + 2) - 0.5;
        const h3 = hash01(i * 3 + 3) - 0.5;

        basePositions[i * 3 + 0] = (x - cx) * cfg.spacing + h1 * cfg.jitter;
        basePositions[i * 3 + 1] = (y - cy) * cfg.spacing + h2 * cfg.jitter;
        basePositions[i * 3 + 2] = (z - cz) * cfg.spacing + h3 * cfg.jitter;

        seeds[i] = hash01(i * 17 + 0.77);
      }
    }
  }

  const edges: number[] = [];
  const indexOf = (x: number, y: number, z: number) => x + y * cfg.nx + z * cfg.nx * cfg.ny;

  const pushEdge = (a: number, b: number) => {
    // store each undirected edge once
    if (a === b) return;
    if (a < b) edges.push(a, b);
    else edges.push(b, a);
  };

  for (let z = 0; z < cfg.nz; z++) {
    for (let y = 0; y < cfg.ny; y++) {
      for (let x = 0; x < cfg.nx; x++) {
        const a = indexOf(x, y, z);

        if (x + 1 < cfg.nx) pushEdge(a, indexOf(x + 1, y, z));
        if (y + 1 < cfg.ny) pushEdge(a, indexOf(x, y + 1, z));
        if (z + 1 < cfg.nz) pushEdge(a, indexOf(x, y, z + 1));

        if (cfg.diagonals) {
          if (x + 1 < cfg.nx && y + 1 < cfg.ny) pushEdge(a, indexOf(x + 1, y + 1, z));
          if (x + 1 < cfg.nx && z + 1 < cfg.nz) pushEdge(a, indexOf(x + 1, y, z + 1));
          if (y + 1 < cfg.ny && z + 1 < cfg.nz) pushEdge(a, indexOf(x, y + 1, z + 1));
        }
      }
    }
  }

  // Deduplicate (diagonals can create duplicates depending on ordering)
  const seen = new Set<string>();
  const unique: number[] = [];
  for (let i = 0; i < edges.length; i += 2) {
    const a = edges[i], b = edges[i + 1];
    const key = a + ":" + b;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(a, b);
  }

  const edgeCount = unique.length / 2;
  const edgesTyped = new Uint32Array(unique);

  const boundsRadius = Math.max(cfg.nx, cfg.ny, cfg.nz) * cfg.spacing * 0.75;
  const pointerRadius = q === "high" ? 1.35 : q === "medium" ? 1.25 : 1.15;

  return {
    nodeCount,
    edgeCount,
    basePositions,
    seeds,
    edges: edgesTyped,
    boundsRadius,
    pointerRadius,
  };
}
