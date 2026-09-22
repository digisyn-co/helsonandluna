"use client";

import { useRef } from "react";
import { TransitionClip, type ClipHandle } from "@/components/cinematic/TransitionClip";
import { story } from "@/content/wedding";
import { photos } from "@/content/images";
import { ease } from "@/animation/tokens";
import { blurred, focused } from "@/animation/fx";
import { fadeUp, revealLines } from "@/animation/text";
import { useChapterTimeline } from "@/animation/useChapterTimeline";
import { Chapter } from "@/components/cinematic/Chapter";
import { Picture } from "@/components/ui/Picture";
import s from "./beginning.module.css";

/**
 * 01 — The Beginning. A connected transition, not a slide change:
 * the monogram's ornament becomes a gold circle → it opens like an aperture and the
 * camera passes through it → ethereal haze → the first photograph resolves inside.
 */
export function Beginning() {
  const root = useRef<HTMLElement>(null);
  const clip = useRef<ClipHandle>(null);

  useChapterTimeline("beginning", root, {
    // Flow clip: the camera passes through a gold ring into the garden sky.
    onProgress: (t) => t >= 0 && clip.current?.play(),
    scrub: (tl, q) => {
      tl.fromTo(q("[data-ring]"), { drawSVG: "20% 80%" }, { drawSVG: "0% 100%", duration: 0.2, ease: ease.camera }, 0)
        // Aperture opens: the circle grows past the screen edge as we move through it.
        .fromTo(q("[data-ring-wrap]"), { scale: 0.32 }, { scale: 3.2, duration: 0.55, ease: "power2.in" }, 0.2)
        .fromTo(q("[data-ring-wrap]"), { opacity: 1 }, { opacity: 0, duration: 0.12 }, 0.63)
        .fromTo(q("[data-aperture]"), { clipPath: "circle(0% at 50% 46%)" }, { clipPath: "circle(75% at 50% 46%)", duration: 0.55, ease: "power2.in" }, 0.2)
        .fromTo(q("[data-photo]"), { scale: 1.35, ...blurred(10) }, { scale: 1.05, ...focused(), duration: 0.6, ease: ease.camera }, 0.25)
        .fromTo(q("[data-haze]"), { opacity: 0.9 }, { opacity: 0.25, duration: 0.5 }, 0.3)
        .to(q("[data-photo]"), { scale: 1, yPercent: -3, duration: 0.25 }, 0.85)
        .fromTo(q("[data-clip-wrap]"), { opacity: 1 }, { opacity: 1, duration: 0.01 }, 0)
        .to(q("[data-clip-wrap]"), { opacity: 0, duration: 0.14 }, 0.5);
    },
    revealAt: 0.62,
    reveal: (tl, q) => {
      revealLines(tl, q("[data-title]")[0] as HTMLElement, 0);
      fadeUp(tl, q("[data-body]"), 0.5);
    },
  });

  return (
    <Chapter ref={root} id="beginning" label="The beginning" pinClassName={s.pin}>
      <div className={s.aperture} data-aperture>
        <Picture photo={photos.walkAway} className={`photo ${s.photo}`} sizes="100vw" />
        <div className={s.haze} data-haze aria-hidden="true" />
      </div>
      <div className="clip" data-clip-wrap>
        <TransitionClip ref={clip} name="ring" />
      </div>
      <div className={s.ringWrap} data-ring-wrap aria-hidden="true">
        <svg viewBox="0 0 200 200" className={s.ring}>
          <circle data-ring cx="100" cy="100" r="96" fill="none" stroke="url(#ring-gold)" strokeWidth="0.6" />
          <circle cx="100" cy="100" r="90" fill="none" stroke="#d4b483" strokeOpacity="0.25" strokeWidth="0.4" />
          <defs>
            <linearGradient id="ring-gold" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#efdcb7" />
              <stop offset="0.5" stopColor="#a8844e" />
              <stop offset="1" stopColor="#efdcb7" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className={`${s.copy} on-photo`}>
        <h2 className="display h2" data-title data-reveal>
          {story.beginning.title[0]}
          <br />
          <em>{story.beginning.title[1]}</em>
        </h2>
        <p className="body" data-body data-reveal>
          {story.beginning.body}
        </p>
      </div>
    </Chapter>
  );
}
