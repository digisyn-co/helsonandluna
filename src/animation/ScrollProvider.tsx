"use client";

import { useEffect, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { mirrorEnvToDom } from "@/lib/device";
import { updateScenes, visibleScenes } from "./sceneManager";
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

    // Decode the images of chapters within reach ahead of time, so a glide never waits on
    // a big photo decoding (images in hidden layers are otherwise decoded on first show).
    const decoded = new Set<string>();
    const predecode = () =>
      visibleScenes.get().forEach((id) => {
        if (decoded.has(id)) return;
        decoded.add(id);
        document.getElementById(id)?.querySelectorAll("img").forEach((img) => {
          img.loading = "eager";
          img.decode().catch(() => {});
        });
      });
    predecode();
    const offDecode = visibleScenes.subscribe(predecode);

    const tick = () => {
      updateScenes();
      tickStepper();
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      stopStepper();
      offDecode();
      unmirror();
    };
  }, []);

  return <>{children}</>;
}
