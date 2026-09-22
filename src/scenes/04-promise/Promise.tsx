"use client";

import { useRef } from "react";
import { TransitionClip, type ClipHandle } from "@/components/cinematic/TransitionClip";
import { story } from "@/content/wedding";
import { focusIn, revealLines } from "@/animation/text";
import { useChapterTimeline } from "@/animation/useChapterTimeline";
import { Chapter } from "@/components/cinematic/Chapter";
import s from "./promise.module.css";

/**
 * 03 — The Promise (DOM layer). The rings themselves render in WebGL (Rings.tsx), mounted
 * by the Stage only while this chapter is near. Here: the words, and the exit — the
 * ring's reflection blooms until it fills the viewport and carries into the Entourage.
 * Without WebGL, the chapter still reads: title, caption and a warm light bloom.
 */
export function ThePromise() {
  const root = useRef<HTMLElement>(null);
  const clip = useRef<ClipHandle>(null);

  useChapterTimeline("promise", root, {
    // Flow clip: a highlight travels the bands and blooms into golden bokeh → Entourage.
    // Starts just after the chapter's rest frame (0.75, content/scenes.ts), so it plays on the way out.
    onProgress: (t) => t > 0.77 && clip.current?.play(),
    scrub: (tl, q) => {
      // Same visual size as before (0.05 → 1 of 260vmax); the element is 60vmax, so ×4.33.
      tl.fromTo(q("[data-flare]"), { scale: 0.22, opacity: 0 }, { scale: 4.33, opacity: 1, duration: 0.16, ease: "power2.in" }, 0.8)
        .to(q("[data-flare]"), { opacity: 0, duration: 0.04 }, 0.96)
        .fromTo(q("[data-copy]"), { opacity: 1 }, { opacity: 0, duration: 0.08 }, 0.8)
        .fromTo(q("[data-clip-wrap]"), { opacity: 0 }, { opacity: 1, duration: 0.05 }, 0.77);
    },
    revealAt: 0.5,
    reveal: (tl, q) => {
      focusIn(tl, q("[data-caption]")[0] as HTMLElement, 0);
      revealLines(tl, q("[data-title]")[0] as HTMLElement, 0.35);
    },
  });

  return (
    <Chapter ref={root} id="promise" label="The promise" pinClassName={s.pin}>
      {/* Static stand-in shown only when WebGL is unavailable (html[data-webgl="false"]). */}
      <picture className={`photo ${s.fallback}`}>
        <source type="image/avif" srcSet="/images/rings-still-640.avif 640w, /images/rings-still-960.avif 960w" sizes="(max-width: 640px) 80vw, 420px" />
        <img
          src="/images/rings-still-640.webp"
          srcSet="/images/rings-still-640.webp 640w, /images/rings-still-960.webp 960w"
          sizes="(max-width: 640px) 80vw, 420px"
          alt="Two gold wedding rings resting on a white blossom"
          width={576}
          height={720}
          loading="lazy"
          decoding="async"
        />
      </picture>
      <div className={s.copy} data-copy>
        <p className="meta" data-caption data-reveal>
          {story.journey.captions.rings.title}
        </p>
        <h2 className={`display ${s.title}`} data-title data-reveal>
          {story.wedding.title[0]}
          <br />
          <em>{story.wedding.title[1]}</em>
        </h2>
      </div>
      <div className="clip" data-clip-wrap>
        <TransitionClip ref={clip} name="reflection" />
      </div>
      <div className={s.flare} data-flare aria-hidden="true" />
    </Chapter>
  );
}
