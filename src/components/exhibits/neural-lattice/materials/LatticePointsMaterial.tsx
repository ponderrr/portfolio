import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import type { ReactThreeFiber } from "@react-three/fiber";

const vertexShader = `
uniform float uSize;
uniform float uIgnite;

attribute float aSeed;
attribute float aActivity;

varying float vSeed;
varying float vAct;
varying float vIgnite;

void main() {
  vSeed = aSeed;
  vAct = aActivity;
  vIgnite = uIgnite;

  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  float dist = max(0.001, -mvPosition.z);

  float size = uSize * (0.70 + 1.55 * vAct) * (0.35 + 0.65 * uIgnite);
  gl_PointSize = clamp(size * (260.0 / dist), 1.0, 20.0);

  gl_Position = projectionMatrix * mvPosition;
}
`;

const fragmentShader = `
uniform vec3 uAccentA;
uniform vec3 uAccentB;
uniform float uOpacity;

varying float vSeed;
varying float vAct;
varying float vIgnite;

void main() {
  vec2 p = gl_PointCoord - vec2(0.5);
  float d = length(p);

  float core = smoothstep(0.46, 0.0, d);
  float halo = smoothstep(0.55, 0.16, d);

  vec3 base = mix(uAccentA, uAccentB, vSeed);
  
  // Premium restraint: activity boosts intensity, but base stays calm
  float intensity = (0.25 + 0.90 * vAct);
  float alpha = (core * 0.90 + halo * 0.22) * uOpacity * (0.15 + 0.85 * vIgnite);

  if (alpha < 0.01) discard;
  gl_FragColor = vec4(base * intensity, alpha);
}
`;

const Impl = shaderMaterial(
  {
    uSize: 2.3,
    uIgnite: 0,
    uOpacity: 0.95,
    uAccentA: new THREE.Color("#6366F1"),
    uAccentB: new THREE.Color("#22D3EE"),
  },
  vertexShader,
  fragmentShader
);

extend({ LatticePointsMaterialImpl: Impl });

declare module "@react-three/fiber" {
  interface ThreeElements {
    latticePointsMaterialImpl: ReactThreeFiber.Node<
      THREE.ShaderMaterial & {
        uSize: number;
        uIgnite: number;
        uOpacity: number;
        uAccentA: THREE.Color;
        uAccentB: THREE.Color;
      },
      typeof Impl
    >;
  }
}

export function LatticePointsMaterial(props: {
  ignite: number;
  quality: "low" | "medium" | "high";
}) {
  const baseSize = props.quality === "high" ? 2.45 : props.quality === "medium" ? 2.25 : 2.05;

  return (
    <latticePointsMaterialImpl
      transparent
      depthWrite={false}
      blending={THREE.AdditiveBlending}
      uSize={baseSize}
      uOpacity={0.95}
      uIgnite={props.ignite}
    />
  );
}
