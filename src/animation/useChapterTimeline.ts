"use client";

import { useRef, type RefObject } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { env } from "@/lib/device";
import { fadeScreens, sceneLength, type SceneId } from "@/content/scenes";
import { layerOpacity, pinProgress } from "./pin";
import { showAll } from "./text";
import { useScene } from "./useScene";

type Build = {
  /**
   * Scroll-scrubbed choreography (camera, photos, light), built on a timeline of
   * duration 1 that is driven by pinned progress 0..1. Use tween positions 0..1.
   */
  scrub?: (tl: gsap.core.Timeline, q: (sel: string) => Element[]) => void;
  /** Time-based reveals (type) played once when pinned progress passes `revealAt`. */
  reveal?: (tl: gsap.core.Timeline, q: (sel: string) => Element[]) => void;
  revealAt?: number;
  /** Extra per-frame work (e.g. WebGL uniforms), receives pinned progress. */
  onProgress?: (t: number) => void;
};

/**
 * One place that wires a chapter to the scene manager:
 * pinned progress → scrub timeline; threshold → reveal timeline (plays once, reverses
 * never — type stays readable); reduced motion → static, everything visible.
 */
export function useChapterTimeline(id: SceneId, root: RefObject<HTMLElement | null>, build: Build) {
  const scrub = useRef<gsap.core.Timeline | null>(null);
  const reveal = useRef<gsap.core.Timeline | null>(null);
  const length = sceneLength(id);
  const fades = fadeScreens(id);
  const revealAt = build.revealAt ?? 0.3;

  useGSAP(
    () => {
      const q = gsap.utils.selector(root) as (sel: string) => Element[];
      if (build.scrub) {
        const tl = gsap.timeline({ paused: true, defaults: { ease: "none", duration: 1 } });
        build.scrub(tl, q);
        scrub.current = tl; // .progress(t) is normalised, whatever the total duration
      }
      if (env.reducedMotion) {
        showAll(root.current);
        scrub.current?.progress(0.5); // a calm, composed middle frame
        return;
      }
      if (build.reveal) {
        // Split text only once real fonts are in, so line breaks are measured correctly.
        let cancelled = false;
        document.fonts.ready.then(() => {
          if (cancelled) return;
          const tl = gsap.timeline({ paused: true });
          build.reveal!(tl, q);
          reveal.current = tl;
        });
        return () => {
          cancelled = true;
          reveal.current?.kill();
        };
      }
    },
    { scope: root },
  );

  const layer = useRef<HTMLElement | null>(null);
  const shown = useRef(-1);

  useScene(id, root, {
    progress: (p) => {
      // Cross-dissolve the fixed chapter layer (pinned chapters only).
      layer.current ??= root.current?.querySelector<HTMLElement>(":scope > .chapter__pin") ?? null;
      const el = layer.current;
      if (el) {
        const o = Math.round(layerOpacity(p, length, fades.in, fades.out) * 1000) / 1000;
        if (o !== shown.current) {
          shown.current = o;
          el.style.opacity = String(o);
          el.style.visibility = o > 0 ? "visible" : "hidden";
        }
      }
      const t = pinProgress(p, length);
      if (!env.reducedMotion) scrub.current?.progress(t);
      const r = reveal.current;
      if (r && t >= revealAt && r.progress() === 0 && !r.isActive()) r.play();
      if (p > 0) build.onProgress?.(t);
    },
  });
}
