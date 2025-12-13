export type PrismParams = {
  // gates
  ignite: number;     // 0..1
  align: number;      // 0..1
  lock: number;       // 0..1
  settle: number;     // 0..1

  // crystal transform targets
  rotX: number;
  rotY: number;
  rotZ: number;

  // beam behavior
  beamStrength: number; // 0..1
  split: number;        // 0..1 (dispersion moment)
  lockPulse: number;    // 0..1 (narrow lock window peak)
  caustic: number;      // 0..1 (fake wash)

  // camera micro-dolly (cinematic but subtle)
  camZ: number;
};

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function easeInOutCubic(x: number) {
  x = clamp01(x);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function pulse(a: number, b: number, x: number) {
  // 0..1..0 pulse between a..b
  const mid = (a + b) * 0.5;
  const up = smoothstep(a, mid, x);
  const down = 1 - smoothstep(mid, b, x);
  return clamp01(Math.min(up, down) * 1.6);
}

export function prismParamsFromProgress(p: number): PrismParams {
  p = clamp01(p);

  // Cinematic segments:
  const ignite = smoothstep(0.00, 0.18, p);
  const align = easeInOutCubic(smoothstep(0.18, 0.58, p));
  const lock = easeInOutCubic(smoothstep(0.58, 0.85, p));
  const settle = smoothstep(0.85, 1.00, p);

  // Rotation: start slightly off, end in "hero angle"
  const rotX = (0.32 * align) + (0.05 * lock);
  const rotY = (-0.80 * align) + (-0.06 * lock);
  const rotZ = (0.08 * align) + (0.04 * lock);

  // Beam appears during alignment and persists
  const beamStrength = smoothstep(0.18, 0.34, p) * (0.9 + 0.14 * lock);

  // Lock pulse - tighter, more readable "click" moment
  const lockPulse = pulse(0.635, 0.675, p);

  // Dispersion pulse during lock window (brief, controlled)
  const split = pulse(0.64, 0.695, p) * 0.85;

  // Fake caustics - pulse during lock window then fade
  const causticBase = pulse(0.58, 0.75, p) * 0.85;
  const caustic = Math.min(1, causticBase + split * 0.3);

  // Camera micro-dolly (very subtle), mostly during ignition/alignment
  const camZ = 7.4 - 0.18 * ignite - 0.10 * align + 0.04 * settle;

  return {
    ignite,
    align,
    lock,
    settle,
    rotX,
    rotY,
    rotZ,
    beamStrength,
    split,
    lockPulse,
    caustic,
    camZ,
  };
}
