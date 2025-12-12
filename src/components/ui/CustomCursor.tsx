import { motion, motionValue } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

type CursorState = "default" | "link" | "button" | "card" | "drag" | "neural";

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function closestCursorState(el: Element | null): CursorState | null {
  if (!el) return null;
  const withAttr = (el as HTMLElement).closest("[data-cursor]") as HTMLElement | null;
  if (withAttr) {
    const v = withAttr.getAttribute("data-cursor") as CursorState | null;
    if (v) return v;
  }

  if ((el as HTMLElement).closest("a, [role='link']")) return "link";
  if ((el as HTMLElement).closest("button, [role='button'], input[type='submit']")) return "button";
  if ((el as HTMLElement).closest("[data-card], .cursor-card")) return "card";
  return null;
}

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hidden, setHidden] = useState(true);
  const [state, setState] = useState<CursorState>("default");
  const [isDown, setIsDown] = useState(false);

  const targetX = useMemo(() => motionValue(-100), []);
  const targetY = useMemo(() => motionValue(-100), []);

  const ringX = useMemo(() => motionValue(-100), []);
  const ringY = useMemo(() => motionValue(-100), []);

  const trail = useMemo(() => {
    return Array.from({ length: 8 }, () => ({
      x: motionValue(-100),
      y: motionValue(-100),
    }));
  }, []);

  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const finePointer = window.matchMedia?.("(pointer: fine)")?.matches ?? false;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    if (!finePointer || reduceMotion) {
      setEnabled(false);
      return;
    }

    setEnabled(true);
    document.documentElement.classList.add("ap-hide-native-cursor");

    const onMove = (e: MouseEvent) => {
      setHidden(false);
      targetX.set(e.clientX);
      targetY.set(e.clientY);

      const el = document.elementFromPoint(e.clientX, e.clientY);
      const next = closestCursorState(el) ?? "default";
      setState(() => (isDown ? "drag" : next));
    };

    const onEnter = () => setHidden(false);
    const onLeave = () => setHidden(true);

    const onDown = (e: MouseEvent) => {
      setIsDown(true);
      // only force drag if interacting with canvas or explicit drag zone
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const isCanvas = !!(el && (el as HTMLElement).closest("canvas"));
      if (isCanvas) setState("drag");
    };

    const onUp = (e: MouseEvent) => {
      setIsDown(false);
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const next = closestCursorState(el) ?? "default";
      setState(next);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseenter", onEnter);
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);

    // RAF loop for smooth trailing without React re-renders
    const tick = () => {
      const tx = targetX.get();
      const ty = targetY.get();

      ringX.set(lerp(ringX.get(), tx, 0.22));
      ringY.set(lerp(ringY.get(), ty, 0.22));

      let px = ringX.get();
      let py = ringY.get();

      for (let i = 0; i < trail.length; i++) {
        const t = 0.18 - i * 0.012;
        const nx = lerp(trail[i].x.get(), px, t);
        const ny = lerp(trail[i].y.get(), py, t);
        trail[i].x.set(nx);
        trail[i].y.set(ny);
        px = nx;
        py = ny;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseenter", onEnter);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      document.documentElement.classList.remove("ap-hide-native-cursor");
    };
  }, [isDown, ringX, ringY, targetX, targetY, trail]);

  if (!enabled) return null;

  const ringSize =
    state === "neural" ? 52 :
    state === "drag" ? 56 :
    state === "button" ? 44 :
    state === "link" ? 40 :
    state === "card" ? 46 :
    36;

  const ringBorder =
    state === "neural" ? "rgba(99,102,241,0.65)" :
    state === "drag" ? "rgba(34,211,238,0.65)" :
    state === "button" ? "rgba(255,255,255,0.55)" :
    "rgba(255,255,255,0.28)";

  const ringGlow =
    state === "neural"
      ? "0 0 28px rgba(99,102,241,0.18), 0 0 40px rgba(34,211,238,0.10)"
      : state === "button"
      ? "0 0 22px rgba(255,255,255,0.10)"
      : "0 0 0 rgba(0,0,0,0)";

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]">
      {/* trail */}
      {trail.map((p, i) => (
        <motion.div
          key={i}
          style={{ x: p.x, y: p.y }}
          className="absolute"
        >
          <div
            style={{
              width: 6 - i * 0.35,
              height: 6 - i * 0.35,
              opacity: hidden ? 0 : 0.14 - i * 0.012,
              background: "rgba(99,102,241,0.55)",
              borderRadius: 999,
              filter: "blur(0.2px)",
              transform: "translate(-50%,-50%)",
            }}
          />
        </motion.div>
      ))}

      {/* ring */}
      <motion.div style={{ x: ringX, y: ringY }} className="absolute">
        <div
          style={{
            width: ringSize,
            height: ringSize,
            opacity: hidden ? 0 : 1,
            borderRadius: 999,
            border: `1px solid ${ringBorder}`,
            boxShadow: ringGlow,
            background: "rgba(10,10,15,0.06)",
            transform: "translate(-50%,-50%)",
            transition: "width 160ms ease, height 160ms ease, border-color 160ms ease",
          }}
        >
          {/* neural orbit dots (subtle) */}
          {state === "neural" && (
            <div
              style={{
                position: "absolute",
                inset: -2,
                borderRadius: 999,
                animation: "ap_orbit 2.8s linear infinite",
              }}
            >
              {Array.from({ length: 3 }).map((_, k) => (
                <div
                  key={k}
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    width: 5,
                    height: 5,
                    borderRadius: 999,
                    background: k === 0 ? "rgba(99,102,241,0.85)" : "rgba(34,211,238,0.75)",
                    transform: `translate(-50%,-50%) rotate(${k * 120}deg) translate(24px)`,
                    boxShadow: "0 0 12px rgba(99,102,241,0.25)",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* dot */}
      <motion.div style={{ x: targetX, y: targetY }} className="absolute">
        <div
          style={{
            width: 6,
            height: 6,
            opacity: hidden ? 0 : 0.9,
            borderRadius: 999,
            background: state === "neural" ? "rgba(34,211,238,0.9)" : "rgba(255,255,255,0.75)",
            transform: "translate(-50%,-50%)",
            boxShadow: state === "neural" ? "0 0 16px rgba(34,211,238,0.25)" : "none",
          }}
        />
      </motion.div>

      <style>{`
        @keyframes ap_orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default CustomCursor;
