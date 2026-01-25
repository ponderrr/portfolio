import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useIsFinePointer, useVisualQuality } from "@/hooks/useVisualQuality";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import NeuralLatticeCanvas from "./NeuralLatticeCanvas";
import { LatticeControlsProvider } from "./LatticeControls";
import LatticeControlPanel from "./LatticeControlPanel";

export function NeuralLatticeSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { margin: "-30% 0px -30% 0px" });

  const reducedMotion = usePrefersReducedMotion();
  const finePointer = useIsFinePointer();
  const quality = useVisualQuality();

  const [mounted, setMounted] = useState(false);
  const [start, setStart] = useState(false);
  const [dockOpen, setDockOpen] = useState(false);
  const [controlsOpen, setControlsOpen] = useState(false);

  useEffect(() => {
    if (inView) {
      setMounted(true);
      setStart(true);
    }
  }, [inView]);

  const allowWebgl = finePointer; // touch fallback
  const interactive = finePointer && !reducedMotion;

  return (
    <LatticeControlsProvider>
      <section
        id="neural-lattice"
        ref={sectionRef}
        data-cursor="neural"
        className="relative w-full min-h-[200svh] overflow-hidden bg-black"
        aria-label="EXHIBIT 001 — Neural Lattice"
      >
        <div className="absolute inset-0 ap-neural-bg" />
        <div className="absolute inset-0 ap-noise pointer-events-none" />
        <div className="absolute inset-0 ap-scanlines pointer-events-none" />

        {/* Sticky "view window" */}
        <div className="sticky top-0 h-[100svh] w-full">
          <div className="absolute inset-0">
            {mounted && allowWebgl ? (
              <NeuralLatticeCanvas quality={quality} interactive={interactive} reducedMotion={reducedMotion} start={start} />
            ) : (
              <div className="absolute inset-0 ap-neural-bg" />
            )}
          </div>

          {/* Control Panel (top left) */}
          {mounted && allowWebgl && (
            <LatticeControlPanel isOpen={controlsOpen} onToggle={() => setControlsOpen((v) => !v)} />
          )}

          {/* Tiny dock (bottom left) */}
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            onMouseEnter={() => setDockOpen(true)}
            onMouseLeave={() => setDockOpen(false)}
            onClick={() => setDockOpen((v) => !v)}
            className="ap-glass absolute bottom-6 left-6 z-20 rounded-2xl px-4 py-3 text-left"
            style={{ maxWidth: dockOpen ? 360 : 190 }}
            aria-expanded={dockOpen}
          >
            <div className="text-[10px] tracking-[0.26em] uppercase text-zinc-400">EXHIBIT 001</div>
            <div className="mt-1 text-sm font-semibold text-white">Neural Lattice</div>
            {dockOpen && (
              <div className="mt-2 text-xs leading-relaxed text-zinc-300">
                Data-driven weights → top connections → activation flow → in-scene probabilities.
                <div className="mt-2 text-[11px] text-zinc-400">
                  {allowWebgl ? "Use the ⚙ panel (top left) to tweak activation functions & patterns." : "Touch mode: ambient fallback."}
                </div>
              </div>
            )}
          </motion.button>
        </div>
      </section>
    </LatticeControlsProvider>
  );
}

export default NeuralLatticeSection;
