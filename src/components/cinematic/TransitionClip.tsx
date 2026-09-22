"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useSyncExternalStore } from "react";
import { env, tierStore } from "@/lib/device";
import { registerSettle, sceneFrames, visibleScenes } from "@/animation/sceneManager";
import type { SceneId } from "@/content/scenes";
import { gsap } from "@/lib/gsap";

/**
 * A short, muted, AI-generated transition clip (Google Flow · Veo 3.1). Clips are an
 * enhancement, never a dependency: they are skipped for reduced motion and low-power /
 * data-saver, where the code-built transition plays instead.
 * The parent scene decides WHEN it plays (`play()`) and fades it via its own timeline.
 */
export type ClipHandle = { play: () => void };

/** Rendered opacity (product up the tree), so an off-screen or faded-out clip never holds a step. */
function shownOpacity(el: HTMLElement) {
  let o = 1;
  for (let n: HTMLElement | null = el; n && o > 0.05; n = n.parentElement) {
    const cs = getComputedStyle(n);
    if (cs.visibility === "hidden" || cs.display === "none") return 0;
    o *= Number(cs.opacity);
  }
  return o;
}

// Hardware video decode is cheap even on the lite tier; skipped only for reduced motion and low
// power / data saver. (tierStore stays subscribed so a runtime change re-renders.)
const enabled = () => !env.reducedMotion && !env.lowPower && Boolean(tierStore.get());

export const TransitionClip = forwardRef<ClipHandle, { name: string; className?: string }>(function TransitionClip({ name, className }, ref) {
  const video = useRef<HTMLVideoElement>(null);
  const played = useRef(false);
  const on = useSyncExternalStore(tierStore.subscribe, enabled, () => false);

  // Buffer the clip once its chapter is within reach, so it starts on time mid-glide.
  useEffect(() => {
    const v = video.current;
    const scene = v?.closest("section")?.id;
    if (!v || !scene) return;
    const check = () => {
      if (v.preload !== "auto" && (visibleScenes.get() as ReadonlySet<string>).has(scene)) {
        v.preload = "auto";
        v.load();
        // Warm the decoder (play one frame, rewind) so the real start mid-glide doesn't stall.
        v.addEventListener(
          "canplay",
          () => {
            if (played.current) return;
            v.play()
              .then(() => {
                if (played.current) return;
                v.pause();
                v.currentTime = 0;
              })
              .catch(() => {});
          },
          { once: true },
        );
      }
    };
    check();
    const off = visibleScenes.subscribe(check);
    // Rewind once the chapter is fully off screen, so the clip plays again on every arrival.
    const frame = sceneFrames[scene as SceneId];
    const rewind = () => {
      if (!played.current || !frame || (frame.progress > 0 && frame.progress < 1)) return;
      played.current = false;
      v.pause();
      v.currentTime = 0;
    };
    gsap.ticker.add(rewind);
    return () => {
      off();
      gsap.ticker.remove(rewind);
    };
  }, [on]);

  // While it plays in view, the scene stepper waits for it (up to its hold cap).
  useEffect(
    () =>
      registerSettle({
        busy: () => {
          const v = video.current;
          return Boolean(v && !v.paused && !v.ended && shownOpacity(v) > 0.05);
        },
      }),
    [],
  );

  useImperativeHandle(ref, () => ({
    play() {
      const v = video.current;
      if (!v || played.current) return;
      played.current = true;
      v.play().catch(() => {}); // autoplay refusal → the static poster frame remains
    },
  }));

  // Once started, a clip plays out even if the quality tier drops mid-glide.
  if (!on && !played.current) return null;

  return (
    <video
      ref={video}
      className={className}
      src={`/clips/${name}.mp4`}
      poster={`/clips/${name}-poster.webp`}
      muted
      playsInline
      preload="none"
      disablePictureInPicture
      aria-hidden="true"
      data-clip={name}
    />
  );
});
