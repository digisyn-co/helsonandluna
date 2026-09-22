"use client";

import { useEffect, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { mirrorEnvToDom } from "@/lib/device";
import { updateScenes } from "./sceneManager";
import { initStepper, tickStepper } from "./sceneStepper";

/**
 * Scroll strategy: a cinematic presentation, not a free-scrolling page.
 * One gesture (wheel, trackpad, swipe, keyboard) = one chapter; the scene stepper glides
 * to it and holds until it has settled (see sceneStepper.ts). The same on every device
 * and in reduced motion (where the glide is short and each chapter is a still frame).
 *
 * One GSAP ticker drives `updateScenes()`, the only scroll reader in the app.
 */
export function ScrollProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const unmirror = mirrorEnvToDom();
    const stopStepper = initStepper();

    const tick = () => {
      updateScenes();
      tickStepper();
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      stopStepper();
      unmirror();
    };
  }, []);

  return <>{children}</>;
}
