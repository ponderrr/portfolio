import { useInView } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
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
  const [dockOpen, setDockOpen] = useState(false);
  const [dockPinned, setDockPinned] = useState(false);
  const [dockHover, setDockHover] = useState(false);
  const dockTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (inView) setMounted(true);
  }, [inView]);

  const allowWebgl = finePointer; // desktop-first: touch gets fallback
  const interactive = finePointer && !reducedMotion;

  const clearDockTimeout = useCallback(() => {
    if (dockTimeoutRef.current) {
      window.clearTimeout(dockTimeoutRef.current);
      dockTimeoutRef.current = null;
    }
  }, []);

  const scheduleAutoCollapse = useCallback(() => {
    clearDockTimeout();
    if (dockPinned) return;
    if (finePointer && dockHover) return;
    dockTimeoutRef.current = window.setTimeout(() => {
      setDockOpen(false);
    }, 2500);
  }, [clearDockTimeout, dockHover, dockPinned, finePointer]);

  useEffect(() => {
    // keep the timer logic consistent when state changes (pinned/hover/open)
    if (!dockOpen) {
      clearDockTimeout();
      return;
    }
    scheduleAutoCollapse();
    return clearDockTimeout;
  }, [clearDockTimeout, dockOpen, scheduleAutoCollapse]);

  const bumpDock = useCallback(() => {
    setDockOpen(true);
    scheduleAutoCollapse();
  }, [scheduleAutoCollapse]);

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

      {/* HUD (tucked dock) */}
      <div
        className="absolute bottom-5 right-5 z-20 pointer-events-auto select-none"
        onMouseEnter={() => {
          if (!finePointer) return;
          setDockHover(true);
          bumpDock();
        }}
        onMouseLeave={() => {
          if (!finePointer) return;
          setDockHover(false);
          scheduleAutoCollapse();
        }}
        onMouseMove={() => {
          if (!finePointer) return;
          // treat hover movement as activity to keep it open while engaged
          scheduleAutoCollapse();
        }}
      >
        <div
          className={[
            "ap-glass",
            "rounded-2xl",
            "border border-white/10",
            "shadow-[0_0_0_1px_rgba(99,102,241,0.06)_inset]",
            "backdrop-blur-xl",
            "transition-all duration-200 ease-out motion-reduce:transition-none",
            dockOpen ? "w-[18.5rem] px-4 py-3" : "w-auto px-3 py-2 rounded-full",
          ].join(" ")}
          style={{
            // make the dock slightly more subtle than default ap-glass
            background: "rgba(10,10,15,0.38)",
          }}
        >
          <button
            type="button"
            className="flex w-full items-center justify-between gap-3 text-left"
            aria-expanded={dockOpen}
            aria-controls="ap-neural-dock-panel"
            onClick={() => {
              // tap/click toggles open; pinned keeps it open until unpinned
              setDockOpen((v) => !v);
              scheduleAutoCollapse();
            }}
            onFocus={() => bumpDock()}
          >
            <div className="flex items-center gap-2">
              <div
                aria-hidden="true"
                className="h-2 w-2 rounded-full"
                style={{
                  background: "rgba(99,102,241,0.9)",
                  boxShadow: "0 0 12px rgba(99,102,241,0.25)",
                }}
              />
              <div className="text-[11px] tracking-[0.28em] uppercase text-zinc-300">
                Neural Lattice
              </div>
            </div>

            <div className="flex items-center gap-2">
              {dockOpen && (
                <span className="text-[11px] text-zinc-400">
                  {dockPinned ? "Pinned" : "Auto-hide"}
                </span>
              )}
              <span
                aria-hidden="true"
                className={[
                  "text-zinc-400",
                  "transition-transform duration-200 motion-reduce:transition-none",
                  dockOpen ? "rotate-180" : "rotate-0",
                ].join(" ")}
              >
                ▾
              </span>
            </div>
          </button>

          <div
            id="ap-neural-dock-panel"
            className={[
              "grid gap-2 overflow-hidden",
              "transition-[grid-template-rows,opacity,margin] duration-200 ease-out motion-reduce:transition-none",
              dockOpen ? "mt-2 opacity-100" : "mt-0 opacity-0",
            ].join(" ")}
            style={{
              gridTemplateRows: dockOpen ? "1fr" : "0fr",
            }}
          >
            <div className="min-h-0">
              <div className="text-sm leading-snug text-zinc-300">
                Signal flow + activation pulses through a layered node network.
              </div>
              <div className="mt-1 text-xs text-zinc-400">
                {allowWebgl ? "Pointer: subtle stimulation." : "Touch: ambient fallback."}
              </div>

              <div className="mt-2 flex items-center justify-between">
                <button
                  type="button"
                  className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-zinc-300 hover:border-white/20 hover:text-white transition-colors motion-reduce:transition-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDockPinned((v) => !v);
                    setDockOpen(true);
                    scheduleAutoCollapse();
                  }}
                  aria-pressed={dockPinned}
                >
                  {dockPinned ? "Unpin" : "Pin"}
                </button>

                <div className="text-[11px] text-zinc-500">
                  EXHIBIT 001
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default NeuralLatticeSection;
