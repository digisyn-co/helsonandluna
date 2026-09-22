"use client";

import { useRef } from "react";
import { reception, story } from "@/content/wedding";
import { photos } from "@/content/images";
import { ease } from "@/animation/tokens";
import { fadeUp, focusIn, revealLines } from "@/animation/text";
import { useChapterTimeline } from "@/animation/useChapterTimeline";
import { Chapter } from "@/components/cinematic/Chapter";
import { Florals } from "@/components/cinematic/Florals";
import { Picture } from "@/components/ui/Picture";
import s from "./celebration.module.css";

/**
 * 06 — The Celebration. The most emotionally energetic chapter, still luxurious:
 * a livelier camera (photos drift on separate planes, slight tilt), florals rise, the gold
 * particles quicken (see moods.ts), then the reception details land clearly.
 */
export function Celebration() {
  const root = useRef<HTMLElement>(null);

  useChapterTimeline("celebration", root, {
    scrub: (tl, q) => {
      tl.fromTo(q("[data-main]"), { yPercent: 18, rotate: -3, scale: 0.92 }, { yPercent: -10, rotate: 1.5, scale: 1, duration: 1, ease: ease.camera }, 0)
        .fromTo(q("[data-second]"), { yPercent: 60, rotate: 6 }, { yPercent: -40, rotate: -2, duration: 1, ease: "none" }, 0)
        .fromTo(q("[data-floral]"), { yPercent: 40, opacity: 0 }, { yPercent: -10, opacity: 1, duration: 0.5, stagger: 0.1 }, 0.05)
        .fromTo(q("[data-glow]"), { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1.2, duration: 0.6 }, 0.1);
    },
    revealAt: 0.3,
    reveal: (tl, q) => {
      focusIn(tl, q("[data-meta]")[0] as HTMLElement, 0);
      revealLines(tl, q("[data-title]")[0] as HTMLElement, 0.15);
      fadeUp(tl, q("[data-info]"), 0.55);
    },
  });

  return (
    <Chapter ref={root} id="celebration" label="The celebration" pinClassName={s.pin}>
      <div className={s.glow} data-glow aria-hidden="true" />
      <div className={s.photos}>
        <div className={`photo photo--framed ${s.main}`} data-main>
          <Picture photo={photos.familyLaughing} className={s.fill} sizes="(max-width: 640px) 88vw, 560px" />
        </div>
        <div className={`photo photo--framed ${s.second}`} data-second>
          <Picture photo={photos.twirl} className={s.fill} sizes="(max-width: 640px) 34vw, 220px" />
        </div>
      </div>
      <Florals className={s.florals} />
      <div className={`${s.copy} on-photo`}>
        <p className="meta" data-meta data-reveal>
          The Celebration
        </p>
        <h2 className={`display ${s.venue}`} data-title data-reveal>
          {reception.venue}
        </h2>
        <div className={s.info} data-info data-reveal>
          <p className="body">{reception.description}</p>
          <p className={`meta ${s.when}`}>
            {reception.time ?? reception.timeLabel} · Candlelight · {reception.area}
          </p>
          <p className={s.quote}>{story.journey.captions.iloilo.body}</p>
        </div>
      </div>
    </Chapter>
  );
}
