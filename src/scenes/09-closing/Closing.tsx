"use client";

import { useRef } from "react";
import { TransitionClip, type ClipHandle } from "@/components/cinematic/TransitionClip";
import { couple, wedding } from "@/content/wedding";
import { photos } from "@/content/images";
import { ease } from "@/animation/tokens";
import { blurred, focused } from "@/animation/fx";
import { focusIn, revealChars, revealLines } from "@/animation/text";
import { useChapterTimeline } from "@/animation/useChapterTimeline";
import { Chapter } from "@/components/cinematic/Chapter";
import { Florals } from "@/components/cinematic/Florals";
import { Monogram } from "@/components/cinematic/Monogram";
import { Picture } from "@/components/ui/Picture";
import s from "./closing.module.css";

/**
 * 08 — The Closing. The camera rises: the family sinks below frame as we lift above the
 * trees into blue twilight (see moods.ts) → gold motes and floral silhouettes → the
 * monogram returns with one last light sweep → names → date → the quote. Ends quietly.
 */
export function Closing() {
  const root = useRef<HTMLElement>(null);
  const clip = useRef<ClipHandle>(null);

  useChapterTimeline("closing", root, {
    // Flow clip: the camera rises past treetops into lavender twilight.
    onProgress: (t) => t > 0.2 && clip.current?.play(),
    scrub: (tl, q) => {
      tl.fromTo(q("[data-ground]"), { yPercent: 0, opacity: 1 }, { yPercent: 55, opacity: 0, duration: 0.55, ease: ease.camera }, 0)
        .fromTo(q("[data-floral]"), { yPercent: 30, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.3, stagger: 0.08 }, 0.35)
        .fromTo(q("[data-mono]"), { autoAlpha: 0, scale: 0.9, ...blurred(10) }, { autoAlpha: 1, scale: 1, ...focused(), duration: 0.25, ease: ease.reveal }, 0.42)
        .fromTo(q(".monogram__sweep"), { xPercent: -80, opacity: 0 }, { xPercent: 80, opacity: 1, duration: 0.25, ease: ease.light }, 0.55)
        .to(q(".monogram__sweep"), { opacity: 0, duration: 0.08 }, 0.72)
        .fromTo(q("[data-clip-wrap]"), { opacity: 0 }, { opacity: 0.9, duration: 0.25 }, 0.22);
    },
    revealAt: 0.62,
    reveal: (tl, q) => {
      revealChars(tl, q("[data-names]")[0] as HTMLElement, 0);
      focusIn(tl, q("[data-date]")[0] as HTMLElement, 0.9);
      revealLines(tl, q("[data-quote]")[0] as HTMLElement, 1.4);
      focusIn(tl, q("[data-sign]")[0] as HTMLElement, 2.1);
    },
  });

  return (
    <Chapter ref={root} id="closing" label="Closing" pinClassName={s.pin}>
      <div className={s.ground} data-ground aria-hidden="true">
        <Picture photo={photos.familyBacklit} className={`photo ${s.groundPhoto}`} sizes="100vw" />
      </div>
      <div className={`clip ${s.clip}`} data-clip-wrap>
        <TransitionClip ref={clip} name="twilight" />
      </div>
      <Florals className={s.florals} />
      <div className={s.content}>
        <div className={s.mono} data-mono data-reveal>
          <span className="monogram-halo" aria-hidden="true" />
          <Monogram size="closing" />
        </div>
        <p className={`display ${s.names}`} data-names data-reveal>
          {couple.first} <em>&amp;</em> {couple.second}
        </p>
        <p className={`meta ${s.date}`} data-date data-reveal>
          {wedding.dateShort}
        </p>
        <p className={`display ${s.quote}`} data-quote data-reveal>
          “{wedding.quote}”
        </p>
        <p className={`meta ${s.sign}`} data-sign data-reveal>
          Garden Sky · {wedding.city}
        </p>
      </div>
    </Chapter>
  );
}
