"use client";

import { forwardRef, useImperativeHandle, useRef, useSyncExternalStore } from "react";
import { env, tierStore } from "@/lib/device";

/**
 * A short, muted, AI-generated transition clip (Google Flow · Veo 3.1). Clips are an
 * enhancement, never a dependency: they are skipped for reduced motion, low-power /
 * data-saver and the low tier, where the code-built transition plays instead.
 * The parent scene decides WHEN it plays (`play()`) and fades it via its own timeline.
 */
export type ClipHandle = { play: () => void };

const enabled = () => !env.reducedMotion && !env.lowPower && tierStore.get() !== "low";

export const TransitionClip = forwardRef<ClipHandle, { name: string; className?: string }>(function TransitionClip({ name, className }, ref) {
  const video = useRef<HTMLVideoElement>(null);
  const played = useRef(false);
  const on = useSyncExternalStore(tierStore.subscribe, enabled, () => false);

  useImperativeHandle(ref, () => ({
    play() {
      const v = video.current;
      if (!v || played.current) return;
      played.current = true;
      v.play().catch(() => {}); // autoplay refusal → the static poster frame remains
    },
  }));

  if (!on) return null;

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
