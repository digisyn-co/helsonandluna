"use client";

import { useRef, type CSSProperties } from "react";
import { story } from "@/content/wedding";
import { photos, type Photo } from "@/content/images";
import { ease } from "@/animation/tokens";
import { fadeUp, focusIn, revealLines } from "@/animation/text";
import { useChapterTimeline } from "@/animation/useChapterTimeline";
import { Chapter } from "@/components/cinematic/Chapter";
import { Picture } from "@/components/ui/Picture";
import s from "./family.module.css";

/** Memories placed at real depths in a CSS 3D space; the camera travels through them. */
type Layer = { key: string; photo: Photo; x: string; y: string; z: number; w: string; blur: number; caption?: string };

const LAYERS: Layer[] = [
  // Offsets grow with depth so perspective places each memory near the frame edges.
  // Widths cap on large screens so desktop keeps the phone's composition, at a sane scale.
  { key: "fg", photo: photos.daughterLaughing, x: "max(-38vw, -300px)", y: "18svh", z: -120, w: "min(56vw, 380px)", blur: 6 },
  { key: "shoes", photo: photos.babyShoes, x: "max(-42vw, -380px)", y: "-16svh", z: -480, w: "min(50vw, 400px)", blur: 0, caption: story.family.shoes },
  { key: "father", photo: photos.fatherDaughter, x: "min(62vw, 560px)", y: "20svh", z: -760, w: "min(50vw, 420px)", blur: 1 },
  { key: "mother", photo: photos.motherDaughter, x: "max(-74vw, -700px)", y: "-22svh", z: -1040, w: "min(52vw, 440px)", blur: 2 },
];
const HERO_Z = -1320;
const TRAVEL = -HERO_Z; // camera travel distance in px

/**
 * 04 — Family. Not a gallery: photos hang in foreground / midground / background at real
 * depths with depth blur and light; the camera moves through the space (each memory
 * drifts past), then one photograph arrives and becomes the hero.
 */
export function Family() {
  const root = useRef<HTMLElement>(null);

  useChapterTimeline("family", root, {
    scrub: (tl, q) => {
      tl.fromTo(q("[data-space]"), { z: 0 }, { z: TRAVEL, duration: 0.78, ease: ease.camera }, 0);
      // Each layer fades as the camera passes through it (derived from its depth).
      LAYERS.forEach((l) => {
        const pass = (-l.z / TRAVEL) * 0.78; // when the camera reaches it
        tl.to(q(`[data-layer="${l.key}"]`), { opacity: 0, duration: 0.08 }, Math.max(0, pass - 0.1));
      });
      tl.fromTo(q("[data-shoes-caption]"), { opacity: 0 }, { opacity: 1, duration: 0.08 }, 0.12)
        .to(q("[data-shoes-caption]"), { opacity: 0, duration: 0.06 }, 0.26)
        .fromTo(q("[data-hero-edge]"), { opacity: 0 }, { opacity: 1, duration: 0.1 }, 0.78)
        .fromTo(q("[data-hero] img"), { scale: 1.12 }, { scale: 1, duration: 0.22 }, 0.78);
    },
    revealAt: 0.8,
    reveal: (tl, q) => {
      focusIn(tl, q("[data-caption]")[0] as HTMLElement, 0);
      revealLines(tl, q("[data-title]")[0] as HTMLElement, 0.2);
      fadeUp(tl, q("[data-body]"), 0.7);
    },
  });

  return (
    <Chapter ref={root} id="family" label="Family" pinClassName={s.pin}>
      <div className={s.viewport}>
        <div className={s.space} data-space>
          {LAYERS.map((l) => (
            <figure
              key={l.key}
              className={s.layer}
              data-layer={l.key}
              style={{ "--x": l.x, "--y": l.y, "--z": `${l.z}px`, "--w": l.w, "--blur": `${l.blur}px` } as CSSProperties}
            >
              <Picture photo={l.photo} className={`photo ${s.card}`} sizes="50vw" />
              {l.caption && (
                <figcaption className={`${s.layerCaption} on-photo`} data-shoes-caption>
                  {l.caption}
                </figcaption>
              )}
            </figure>
          ))}
          <figure className={`${s.layer} ${s.hero}`} style={{ "--x": "0vw", "--y": "-6svh", "--z": `${HERO_Z}px`, "--w": "min(82vw, 46svh)", "--blur": "0px" } as CSSProperties}>
            <div className={`photo ${s.card}`} data-hero>
              <Picture photo={photos.familyKneeling} className={s.fill} sizes="(max-width: 640px) 82vw, 440px" />
            </div>
            <span className={s.heroEdge} data-hero-edge aria-hidden="true" />
          </figure>
        </div>
      </div>
      <div className={`${s.copy} on-photo`}>
        <p className="meta" data-caption data-reveal>
          {story.journey.captions.three.title}
        </p>
        <h2 className={`display ${s.title}`} data-title data-reveal>
          {story.family.title[0]} <em>{story.family.title[1]}</em>
        </h2>
        <p className="body" data-body data-reveal>
          {story.family.body}
        </p>
      </div>
    </Chapter>
  );
}
