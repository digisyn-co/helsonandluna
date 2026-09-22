"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import Snap from "lenis/snap";
import "lenis/dist/lenis.css";
import { gsap } from "@/lib/gsap";
import { env, mirrorEnvToDom } from "@/lib/device";
import { updateScenes } from "./sceneManager";
import { snap } from "./tokens";

/**
 * Scroll strategy (chosen for real iOS Safari / Android Chrome behaviour):
 *
 *  • Touch devices → NATIVE scrolling + CSS `scroll-snap-type: y proximity`.
 *    Keeps iOS momentum, rubber-banding and the address-bar collapse exactly as the OS
 *    intends; proximity (not mandatory) means a slow drag never gets yanked.
 *  • Mouse/trackpad → Lenis smoothing + Lenis Snap (proximity), which avoids the
 *    "wheel tick jumps a whole screen" feel of CSS snap on desktop.
 *  • Reduced motion → native scrolling, no smoothing, same proximity snap.
 *
 * Either way one GSAP ticker drives `updateScenes()` — the only scroll reader in the app.
 */
export function ScrollProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const unmirror = mirrorEnvToDom();
    const root = document.documentElement;
    const useLenis = !env.coarse && !env.reducedMotion;

    let lenis: Lenis | null = null;
    let snapper: Snap | null = null;

    if (useLenis) {
      lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.85, autoRaf: false });
      snapper = new Snap(lenis, {
        type: "proximity",
        duration: snap.duration,
        debounce: snap.debounce,
        distanceThreshold: `${snap.threshold * 100}%`,
      });
      document.querySelectorAll<HTMLElement>("[data-snap]").forEach((el) => snapper!.addElement(el, { align: ["start"] }));
      (window as Window & { __lenis?: Lenis }).__lenis = lenis;
    } else {
      root.classList.add("native-snap");
    }

    const tick = (time: number) => {
      lenis?.raf(time * 1000);
      updateScenes();
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      snapper?.destroy();
      lenis?.destroy();
      root.classList.remove("native-snap");
      unmirror();
    };
  }, []);

  return <>{children}</>;
}
