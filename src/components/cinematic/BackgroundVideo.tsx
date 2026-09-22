"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { gsap } from "@/lib/gsap";
import { env, tierStore } from "@/lib/device";
import { sceneFrames, visibleScenes } from "@/animation/sceneManager";
import type { SceneId } from "@/content/scenes";

/**
 * A muted, looping background film for one chapter (e.g. the real drone footage of the
 * church). Unlike TransitionClip it never holds a scene step: it buffers and plays while its
 * chapter is within reach (sceneManager's preload window) and pauses otherwise.
 * Reduced motion, low power / data saver and the low tier get its poster as a still.
 */
const enabled = () => !env.reducedMotion && !env.lowPower && tierStore.get() !== "low";

export function BackgroundVideo({ name, scene, className }: { name: string; scene: SceneId; className?: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const on = useSyncExternalStore(tierStore.subscribe, enabled, () => false);
  const poster = `/clips/${name}-poster.webp`;

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    const buffer = () => {
      if (v.preload !== "auto" && visibleScenes.get().has(scene)) {
        v.preload = "auto";
        v.load();
      }
    };
    buffer();
    const off = visibleScenes.subscribe(buffer);
    // Play while the chapter is within reach, so decoding starts during the previous
    // chapter's hold rather than mid-glide; pause once it's out of range.
    let playing = false;
    const tick = () => {
      const want = sceneFrames[scene].visible && v.preload === "auto";
      if (want === playing) return;
      playing = want;
      if (want) v.play().catch(() => {}); // autoplay refusal → the poster remains
      else v.pause();
    };
    gsap.ticker.add(tick);
    return () => {
      off();
      gsap.ticker.remove(tick);
      v.pause();
    };
  }, [on, scene]);

  if (!on) {
    // eslint-disable-next-line @next/next/no-img-element -- a decorative still, sized by CSS
    return <img className={className} src={poster} alt="" aria-hidden="true" decoding="async" />;
  }
  return (
    <video
      ref={video}
      className={className}
      src={`/clips/${name}.mp4`}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      disablePictureInPicture
      aria-hidden="true"
      data-bg-video={name}
    />
  );
}
