"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { blendMood, createMoodBlend, rgbToCss } from "@/animation/moods";

/**
 * The sky: a CSS gradient behind everything. Works with or without WebGL, so the
 * static fallback keeps the same colour story. Updated per frame from the scene blend.
 */
export function Sky() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mood = createMoodBlend();
    let last = "";
    const tick = () => {
      blendMood(mood);
      const top = rgbToCss(mood.top);
      const bottom = rgbToCss(mood.bottom);
      if (top + bottom === last) return;
      last = top + bottom;
      el.style.setProperty("--sky-top", top);
      el.style.setProperty("--sky-bottom", bottom);
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  return <div ref={ref} className="sky" aria-hidden="true" />;
}
