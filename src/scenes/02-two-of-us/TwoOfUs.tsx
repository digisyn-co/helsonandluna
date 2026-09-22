"use client";

import { useRef } from "react";
import { story } from "@/content/wedding";
import { photos } from "@/content/images";
import { ease } from "@/animation/tokens";
import { fadeUp, focusIn, revealLines } from "@/animation/text";
import { useChapterTimeline } from "@/animation/useChapterTimeline";
import { Chapter } from "@/components/cinematic/Chapter";
import { Picture } from "@/components/ui/Picture";
import s from "./two-of-us.module.css";

/**
 * 02 — The Two of Us. Photos are discovered, not faded in:
 * drift through haze → a fragment of the photograph (their faces) appears → the camera
 * approaches → the full photo opens with gold framing, a soft memory behind it and
 * out-of-focus light in front → type.
 */
export function TwoOfUs() {
  const root = useRef<HTMLElement>(null);

  useChapterTimeline("two-of-us", root, {
    scrub: (tl, q) => {
      tl.fromTo(q("[data-back]"), { scale: 1.25, opacity: 0 }, { scale: 1.05, opacity: 0.4, duration: 0.6, ease: ease.camera }, 0)
        // A fragment: a narrow window around their faces (upper third of the beach photo).
        .fromTo(q("[data-frame]"), { clipPath: "inset(12% 26% 62% 26%)", opacity: 0 }, { opacity: 1, duration: 0.12 }, 0.08)
        .to(q("[data-frame]"), { clipPath: "inset(0% 0% 0% 0%)", duration: 0.45, ease: ease.camera }, 0.25)
        .fromTo(q("[data-frame] img"), { scale: 1.6 }, { scale: 1.08, duration: 0.6, ease: ease.camera }, 0.1)
        .fromTo(q("[data-edge]"), { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.6)
        .fromTo(q("[data-bokeh]"), { yPercent: 30, opacity: 0 }, { yPercent: -30, opacity: 1, duration: 1, ease: "none" }, 0)
        .to(q("[data-frame] img"), { scale: 1, duration: 0.3 }, 0.7);
    },
    revealAt: 0.55,
    reveal: (tl, q) => {
      focusIn(tl, q("[data-caption]")[0] as HTMLElement, 0);
      revealLines(tl, q("[data-title]")[0] as HTMLElement, 0.25);
      fadeUp(tl, q("[data-body]"), 0.8);
    },
  });

  return (
    <Chapter ref={root} id="two-of-us" label="The two of us" pinClassName={s.pin}>
      <Picture photo={photos.coupleCoast} className={`photo ${s.back}`} sizes="100vw" />
      <figure className={s.figure}>
        <div className={`photo ${s.frame}`} data-frame>
          <Picture photo={photos.coupleBeach} className={s.fill} sizes="(max-width: 640px) 84vw, 480px" />
        </div>
        <span className={s.edge} data-edge aria-hidden="true" />
        <figcaption className="meta" data-caption data-reveal>
          {story.journey.captions.afternoons.title}
        </figcaption>
      </figure>
      <div className={s.bokeh} data-bokeh aria-hidden="true" />
      <div className={s.copy}>
        <h2 className="display h2" data-title data-reveal>
          {story.journey.title[0]}
          <br />
          <em>{story.journey.title[1]}</em>
        </h2>
        <p className="body" data-body data-reveal>
          {story.journey.subtitle}
        </p>
      </div>
    </Chapter>
  );
}
