import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useIsFinePointer, useVisualQuality } from "@/hooks/useVisualQuality";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { NeuralLatticeCanvas } from "./NeuralLatticeCanvas";

export function NeuralLatticeSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { margin: "-25% 0px -25% 0px" });

  const reducedMotion = usePrefersReducedMotion();
  const finePointer = useIsFinePointer();
  const quality = useVisualQuality();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (inView) setMounted(true);
  }, [inView]);

  const allowWebgl = finePointer; // desktop-first: touch gets fallback
  const interactive = finePointer && !reducedMotion;

  return (
    <section
      id="neural-lattice"
      ref={ref}
      data-cursor="neural"
      className="relative min-h-[100svh] w-full overflow-hidden bg-black"
      aria-label="EXHIBIT 001 — Neural Lattice"
    >
      <div className="absolute inset-0 ap-neural-bg" />
      <div className="absolute inset-0 ap-noise pointer-events-none" />
      <div className="absolute inset-0 ap-scanlines pointer-events-none" />

      {/* 3D layer */}
      <div className="absolute inset-0">
        {mounted && allowWebgl ? (
          <NeuralLatticeCanvas quality={quality} interactive={interactive} reducedMotion={reducedMotion} />
        ) : (
          <div className="absolute inset-0 ap-neural-bg" />
        )}
      </div>

      {/* overlay */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mx-auto flex h-[100svh] max-w-6xl items-end px-6 pb-10"
      >
        <div className="ap-glass rounded-2xl px-5 py-4 max-w-xl">
          <div className="text-xs tracking-[0.24em] uppercase text-zinc-400">
            EXHIBIT 001
          </div>
          <div className="mt-1 text-2xl font-semibold text-white">
            Neural Lattice
          </div>
          <div className="mt-2 text-sm leading-relaxed text-zinc-300">
            Ambient node network rendered with R3F. Subtle parallax + proximity activation.
          </div>
          <div className="mt-3 text-xs text-zinc-400">
            {allowWebgl ? "Pointer to energize nodes." : "Touch mode: ambient fallback."}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

export default NeuralLatticeSection;
