import fs from "node:fs";
import path from "node:path";

// Deterministic PRNG
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randn(rng) {
  // Box-Muller
  let u = 0,
    v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function genLayer(rng, inDim, outDim) {
  // Xavier-ish scale
  const scale = 0.9 / Math.sqrt(inDim);
  const w = new Array(outDim * inDim);
  const b = new Array(outDim);

  for (let o = 0; o < outDim; o++) {
    b[o] = randn(rng) * 0.02;
    for (let i = 0; i < inDim; i++) {
      w[o * inDim + i] = randn(rng) * scale;
    }
  }
  return { in: inDim, out: outDim, w, b };
}

function main() {
  const rng = mulberry32(1337);

  // Small but meaningful network for visuals:
  // 8x8 input = 64, hidden layers 48, 24, output 10
  const layers = [genLayer(rng, 64, 48), genLayer(rng, 48, 24), genLayer(rng, 24, 10)];

  const json = {
    name: "exhibit001_mlp_demo_v1",
    createdAt: new Date().toISOString(),
    note: "Deterministic demo weights for Exhibit 001 visualization.",
    layers,
  };

  const outPath = path.join(process.cwd(), "public", "exhibits", "exhibit001", "mlp_weights.json");
  fs.writeFileSync(outPath, JSON.stringify(json, null, 2), "utf8");
  console.log("Wrote:", outPath);
}

main();
