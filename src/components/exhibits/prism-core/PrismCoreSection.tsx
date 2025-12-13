import { motion, useInView, useMotionValueEvent, useScroll } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PrismCoreCanvas from "./PrismCoreCanvas";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useVisualQuality, useIsFinePointer } from "@/hooks/useVisualQuality";

let didEnsureScrollContainerPosition = false;
function ensureScrollContainerPositioned() {
  if (didEnsureScrollContainerPosition) return;
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (!root) return;
  try {
    // Framer Motion warns if using a target with container position:static (documentElement by default).
    // Setting it to relative is layout-neutral and avoids the warning deterministically.
    if (getComputedStyle(root).position === "static") {
      root.style.position = "relative";
    }
  } catch {
    // ignore
  }
  didEnsureScrollContainerPosition = true;
}

export function PrismCoreSection() {
  const scrollTargetRef = useRef<HTMLDivElement>(null);

  const reducedMotion = usePrefersReducedMotion();
  const quality = useVisualQuality();
  const finePointer = useIsFinePointer();

  // Scroll progress drives the whole scene
  const progressRef = useRef(0);

  ensureScrollContainerPositioned();

  const { scrollYProgress } = useScroll({
    target: scrollTargetRef,
    offset: ["start start", "end start"],
  });

  const [debugProgress, setDebugProgress] = useState<number>(0);
  const debugEnabled = useMemo(
    () =>
      import.meta.env.DEV &&
      typeof localStorage !== "undefined" &&
      localStorage.getItem("prism_debug") === "1",
    []
  );

  const clampProgress = useCallback((value: number) => {
    if (!Number.isFinite(value)) return progressRef.current;
    if (value === Infinity || value === -Infinity) return progressRef.current;
    return Math.max(0, Math.min(1, value));
  }, []);

  const setProgress = useCallback(
    (value: number) => {
      const clamped = clampProgress(value);
      progressRef.current = clamped;
      if (debugEnabled) setDebugProgress(clamped);
    },
    [clampProgress, debugEnabled]
  );

  // Seed progress immediately on mount so progress=0 still renders deterministically.
  useEffect(() => {
    setProgress(scrollYProgress.get());
  }, [scrollYProgress, setProgress]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (!Number.isFinite(v)) return;
    // Reduced motion: keep a stable “final pose”, no scroll-scrub animation feel.
    if (reducedMotion) {
      setProgress(1);
      return;
    }
    setProgress(v);
  });

  const inView = useInView(scrollTargetRef, { margin: "-30% 0px -30% 0px" });

  const fallbackFine =
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(pointer: fine)").matches ?? true
      : true;

  const allowWebgl = finePointer || fallbackFine; // ensure desktop always allowed
  const interactive = allowWebgl && !reducedMotion;

  const [mounted, setMounted] = useState<boolean>(allowWebgl);

  useEffect(() => {
    // Mount immediately when allowed; still allow inView to trigger on touch fallback.
    if (allowWebgl) {
      setMounted(true);
      return;
    }
    if (inView) setMounted(true);
  }, [allowWebgl, inView]);

  useEffect(() => {
    if (reducedMotion) setProgress(1);
  }, [reducedMotion, setProgress]);

  const [dockOpen, setDockOpen] = useState(false);

  return (
    <section
      id="prism-core"
      className="relative w-full overflow-hidden bg-black"
      aria-label="EXHIBIT 002 — Prism Core"
    >
      <div ref={scrollTargetRef} className="relative w-full min-h-[320svh]">
        <div className="absolute inset-0 ap-prism-bg" />
        <div className="absolute inset-0 ap-noise pointer-events-none" />
        <div className="absolute inset-0 ap-scanlines pointer-events-none" />

        {/* Sticky viewport */}
        <div className="sticky top-0 h-[100svh] w-full">
          <div className="absolute inset-0">
            {mounted && allowWebgl ? (
              <PrismCoreCanvas
                progressRef={progressRef}
                quality={quality}
                interactive={interactive}
                reducedMotion={reducedMotion}
              />
            ) : (
              <div className="absolute inset-0 ap-prism-bg" />
            )}
          </div>

          {/* Tiny dock (tucked, collapsed by default) */}
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            onMouseEnter={() => setDockOpen(true)}
            onMouseLeave={() => setDockOpen(false)}
            onClick={() => setDockOpen((v) => !v)}
            className="ap-glass absolute bottom-6 right-6 z-20 rounded-2xl px-4 py-3 text-left"
            style={{ maxWidth: dockOpen ? 380 : 200 }}
            aria-expanded={dockOpen}
          >
            <div className="text-[10px] tracking-[0.26em] uppercase text-zinc-400">
              EXHIBIT 002
            </div>
            <div className="mt-1 text-sm font-semibold text-white">
              Prism Core
            </div>
            {debugEnabled && (
              <div className="mt-2 text-[11px] leading-relaxed text-zinc-400">
                <div>progress: {debugProgress.toFixed(2)}</div>
                <div>mounted: {mounted ? "true" : "false"}</div>
                <div>allowWebgl: {allowWebgl ? "true" : "false"}</div>
                <div>reducedMotion: {reducedMotion ? "true" : "false"}</div>
                <div>quality: {quality}</div>
              </div>
            )}
            {dockOpen && (
              <div className="mt-2 text-xs leading-relaxed text-zinc-300">
                Scroll to ignite → align → lock (dispersion) → sustain.
                <div className="mt-2 text-[11px] text-zinc-400">
                  {allowWebgl ? "Desktop: subtle parallax enabled." : "Touch mode: ambient fallback."}
                </div>
              </div>
            )}
          </motion.button>
        </div>
      </div>
    </section>
  );
}

export default PrismCoreSection;
