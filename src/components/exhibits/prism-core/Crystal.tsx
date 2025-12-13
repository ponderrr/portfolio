import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";

export type CrystalQuality = "low" | "medium" | "high";

type Props = {
  quality: CrystalQuality;
  ignite: number; // 0..1
  lock: number; // 0..1
  split: number; // 0..1
  lockPulse: number; // 0..1 (narrow peak during lock window)
};

type FresnelUniforms = {
  uFresnelColor: { value: THREE.Color };
  uFresnelIntensity: { value: number };
  uFresnelPower: { value: number };
};

type FresnelShader = {
  uniforms: FresnelUniforms;
  fragmentShader: string;
};

type PhysicalWithShader = THREE.MeshPhysicalMaterial & {
  userData: { shader?: FresnelShader };
};

function clamp01(x: number) {
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(1, x));
}

function clamp(x: number, a: number, b: number) {
  if (!Number.isFinite(x)) return a;
  return Math.max(a, Math.min(b, x));
}

export function Crystal({ quality, ignite, lock, split, lockPulse }: Props) {
  const prepareGeometry = (radius: number, scale: [number, number, number]) => {
    const g = new THREE.IcosahedronGeometry(radius, 0);
    g.scale(scale[0], scale[1], scale[2]);
    const ready = g.index ? g.toNonIndexed() : g.clone();
    ready.computeVertexNormals();
    ready.normalizeNormals();
    return ready;
  };

  const geom = useMemo(() => prepareGeometry(1.08, [1.08, 1.72, 1.08]), []);
  const coreGeom = useMemo(() => new THREE.SphereGeometry(0.38, 24, 24), []);

  const shellRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const fresnelColor = useMemo(() => new THREE.Color(), []);

  const i = clamp01(ignite);
  const l = clamp01(lock);
  const s = clamp01(split);
  const lp = clamp01(lockPulse);

  // Controlled “premium” edge glow: always readable, never a bloom source.
  const edgeIntensity = clamp(0.08 + 0.08 * i + 0.10 * l + 0.10 * lp, 0.06, 0.28);
  const edgePower = clamp(2.2 + 1.2 * (1 - l), 2.0, 3.8);

  // Inner core: restrained pulse during lock window, clamped <= 0.9
  const coreEmissiveIntensity = clamp(0.14 + 0.26 * i + 0.28 * l + 0.36 * lp, 0.12, 0.9);

  useEffect(() => {
    const mat = shellRef.current as PhysicalWithShader | null;
    const shader = mat?.userData?.shader;
    if (!shader) return;

    // Indigo → cyan shift during split, but stay subdued.
    fresnelColor.set("#4f46e5").lerp(new THREE.Color("#22d3ee"), 0.22 + 0.38 * s);

    shader.uniforms.uFresnelColor.value.copy(fresnelColor);
    shader.uniforms.uFresnelIntensity.value = edgeIntensity;
    shader.uniforms.uFresnelPower.value = edgePower;
  }, [edgeIntensity, edgePower, fresnelColor, s]);

  return (
    <group>
      {/* Outer shell: physical (no transmission) + controlled fresnel edge glow */}
      <mesh geometry={geom}>
        <meshPhysicalMaterial
          ref={shellRef}
          flatShading
          color={quality === "high" ? "#0f1224" : "#0c0f20"}
          metalness={0.22}
          roughness={0.34}
          clearcoat={0.9}
          clearcoatRoughness={0.22}
          onBeforeCompile={(shader) => {
            shader.uniforms.uFresnelColor = { value: new THREE.Color("#4f46e5") };
            shader.uniforms.uFresnelIntensity = { value: 0.12 };
            shader.uniforms.uFresnelPower = { value: 2.8 };

            shader.fragmentShader = shader.fragmentShader
              .replace(
                "void main() {",
                [
                  "uniform vec3 uFresnelColor;",
                  "uniform float uFresnelIntensity;",
                  "uniform float uFresnelPower;",
                  "void main() {",
                ].join("\\n")
              )
              .replace(
                "#include <output_fragment>",
                [
                  "float fresnel = pow(1.0 - saturate(dot(normalize(vNormal), normalize(-vViewPosition))), uFresnelPower);",
                  "vec3 fres = uFresnelColor * (uFresnelIntensity * fresnel);",
                  // clamp to avoid any chance of white blowout / bloom triggering
                  "outgoingLight = min(outgoingLight + fres, vec3(0.92));",
                  "#include <output_fragment>",
                ].join("\\n")
              );

            // allow uniform updates
            const mat = shellRef.current as PhysicalWithShader | null;
            if (mat) mat.userData.shader = shader as unknown as FresnelShader;
          }}
        />
      </mesh>

      {/* Inner core: small emissive gem (clamped) */}
      <mesh geometry={coreGeom}>
        <meshStandardMaterial
          color={"#070815"}
          emissive={fresnelColor}
          emissiveIntensity={coreEmissiveIntensity}
          roughness={0.65}
          metalness={0.0}
        />
      </mesh>

      {/* Silhouette assist: subtle backface tint (kept restrained now that fresnel exists) */}
      <mesh geometry={geom} scale={1.015}>
        <meshBasicMaterial
          color={"#303a82"}
          transparent
          opacity={0.18}
          depthWrite={false}
          depthTest={false}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

export default Crystal;
