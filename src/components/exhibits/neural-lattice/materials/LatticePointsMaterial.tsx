import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import type { ReactThreeFiber } from "@react-three/fiber";

const vertexShader = `
uniform float uTime;
uniform float uSize;

attribute float aSeed;
attribute float aActivity;

varying float vSeed;
varying float vActivity;

void main() {
  vSeed = aSeed;
  vActivity = aActivity;

  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  float dist = max(0.001, -mvPosition.z);

  float size = uSize * (1.0 + vActivity * 1.35);
  gl_PointSize = clamp(size * (280.0 / dist), 1.0, 18.0);

  gl_Position = projectionMatrix * mvPosition;
}
`;

const fragmentShader = `
uniform vec3 uAccentA;
uniform vec3 uAccentB;
uniform float uOpacity;

varying float vSeed;
varying float vActivity;

void main() {
  vec2 p = gl_PointCoord - vec2(0.5);
  float d = length(p);

  float core = smoothstep(0.48, 0.0, d);
  float halo = smoothstep(0.50, 0.14, d);

  vec3 base = mix(uAccentA, uAccentB, vSeed);
  float pulse = 0.70 + 0.30 * sin(vSeed * 31.0 + vActivity * 5.0);

  float intensity = (0.35 + 0.65 * vActivity) * pulse;
  float alpha = (core * 0.90 + halo * 0.28) * uOpacity * intensity;

  if (alpha < 0.01) discard;
  gl_FragColor = vec4(base * intensity, alpha);
}
`;

const LatticePointsMaterialImpl = shaderMaterial(
  {
    uTime: 0,
    uSize: 2.25,
    uOpacity: 0.95,
    uAccentA: new THREE.Color("#6366F1"),
    uAccentB: new THREE.Color("#22D3EE"),
  },
  vertexShader,
  fragmentShader
);

extend({ LatticePointsMaterialImpl });

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      latticePointsMaterialImpl: ReactThreeFiber.Node<
        THREE.ShaderMaterial & {
          uTime: number;
          uSize: number;
          uOpacity: number;
          uAccentA: THREE.Color;
          uAccentB: THREE.Color;
        },
        typeof LatticePointsMaterialImpl
      >;
    }
  }
}

export function LatticePointsMaterial(props: {
  time: number;
  quality: "low" | "medium" | "high";
}) {
  const baseSize = props.quality === "high" ? 2.4 : props.quality === "medium" ? 2.2 : 2.0;

  return (
    <latticePointsMaterialImpl
      transparent
      depthWrite={false}
      blending={THREE.AdditiveBlending}
      uTime={props.time}
      uSize={baseSize}
      uOpacity={0.95}
    />
  );
}
