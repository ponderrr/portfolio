import { useEffect, useMemo, useState } from "react";

export type VisualQuality = "low" | "medium" | "high";

function computeQuality(): VisualQuality {
  const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  const cores = navigator.hardwareConcurrency || 4;

  // Conservative defaults: you want "premium smooth", not "maxed out".
  if (cores >= 10 && dpr <= 2.0) return "high";
  if (cores >= 6) return "medium";
  return "low";
}

export function useVisualQuality(): VisualQuality {
  const [q, setQ] = useState<VisualQuality>(() => computeQuality());

  useEffect(() => {
    const onResize = () => setQ(computeQuality());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return q;
}

export function useIsFinePointer(): boolean {
  const initial = useMemo(() => {
    return typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(pointer: fine)").matches
      : false;
  }, []);

  const [fine, setFine] = useState(initial);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const onChange = () => setFine(mq.matches);

    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    } else {
      mq.addListener(onChange);
      return () => mq.removeListener(onChange);
    }
  }, []);

  return fine;
}
