import * as THREE from "three";
import { useMemo } from "react";

type Props = {
  ignite: number;
  amount: number;    // 0..1
  lockPulse: number; // 0..1 (peak during lock window)
};

function makeRadialTexture() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, size, size);

  const g = ctx.createRadialGradient(size / 2, size / 2, 8, size / 2, size / 2, size / 2);
  g.addColorStop(0.0, "rgba(255,255,255,0.95)");
  g.addColorStop(0.20, "rgba(255,255,255,0.35)");
  g.addColorStop(0.55, "rgba(255,255,255,0.10)");
  g.addColorStop(1.0, "rgba(255,255,255,0.00)");

  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);

  // subtle noise speckle
  const img = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 18;
    img.data[i + 0] = Math.min(255, Math.max(0, img.data[i + 0] + n));
    img.data[i + 1] = Math.min(255, Math.max(0, img.data[i + 1] + n));
    img.data[i + 2] = Math.min(255, Math.max(0, img.data[i + 2] + n));
  }
  ctx.putImageData(img, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  return tex;
}

export function CausticsPlane({ ignite, amount, lockPulse }: Props) {
  const tex = useMemo(() => (typeof document !== "undefined" ? makeRadialTexture() : null), []);
  if (!tex) return null;

  // Base opacity with pulse boost during lock window
  const opacity = (0.12 * amount + 0.08 * lockPulse) * ignite;
  // Scale also pulses slightly during lock
  const scale = 1 + 0.15 * lockPulse;

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.15, -1.65, 0.0]} scale={[scale, scale, 1]}>
      <planeGeometry args={[6.5, 4.5, 1, 1]} />
      <meshBasicMaterial
        map={tex}
        color={"#22D3EE"}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

export default CausticsPlane;
