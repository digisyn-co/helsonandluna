"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { dur, ease } from "@/animation/tokens";
import { isReady, loadState, readyFraction } from "@/lib/loading";
import { webglOk } from "@/lib/device";
import { createStore } from "@/lib/store";
import { Monogram } from "@/components/cinematic/Monogram";

/** Flips true when the curtain has lifted — scene 00 starts its opening then. */
export const curtainUp = createStore(false);

const FAILSAFE_MS = 7000;

export function LoadingScreen() {
  const root = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLDivElement>(null);
  const state = loadState.use();
  const webgl = webglOk.use();
  const [timedOut, setTimedOut] = useState(false);
  const ready = isReady(state, webgl) || timedOut;

  // Scene-00 prerequisites: fonts and the hero monogram image.
  useEffect(() => {
    document.fonts.ready.then(() => loadState.set({ ...loadState.get(), fonts: true }));
    const img = new Image();
    img.src = "/images/monogram-640.webp";
    img.decode().catch(() => {}).finally(() => loadState.set({ ...loadState.get(), monogram: true }));
    const t = setTimeout(() => setTimedOut(true), FAILSAFE_MS); // never trap guests
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (line.current) gsap.to(line.current, { scaleX: ready ? 1 : readyFraction(state, webgl), duration: dur.base, ease: ease.fade });
  }, [state, webgl, ready]);

  useEffect(() => {
    if (!ready || !root.current) return;
    const tl = gsap.timeline({ delay: 0.3, onComplete: () => curtainUp.set(true) });
    tl.to(root.current, { autoAlpha: 0, duration: dur.slow, ease: ease.camera });
    return () => {
      tl.kill();
    };
  }, [ready]);

  return (
    <div ref={root} className="loader" role="status" aria-live="polite">
      <Monogram size="loader" priority />
      <div className="loader__track" aria-hidden="true">
        <div ref={line} className="loader__line" />
      </div>
      <span className="sr-only">{ready ? "Invitation ready" : "Loading the invitation"}</span>
    </div>
  );
}
