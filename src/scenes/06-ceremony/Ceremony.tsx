"use client";

import { useRef } from "react";
import { BackgroundVideo } from "@/components/cinematic/BackgroundVideo";
import { ceremony, details } from "@/content/wedding";
import { dur, ease } from "@/animation/tokens";
import { fadeUp, revealLines } from "@/animation/text";
import { useChapterTimeline } from "@/animation/useChapterTimeline";
import { Chapter } from "@/components/cinematic/Chapter";
import s from "./ceremony.module.css";

/**
 * 05 — The Ceremony. Monumental and calm, over real drone footage of the church:
 * the film eases in with a slow push → a light sweep crosses the frame → the ceremony
 * details settle in, clear and legible on a periwinkle shade.
 */
export function Ceremony() {
  const root = useRef<HTMLElement>(null);

  useChapterTimeline("ceremony", root, {
    scrub: (tl, q) => {
      // The camera settles onto the church: a slow push-in that comes to rest.
      tl.fromTo(q("[data-bg-film]"), { scale: 1.14, yPercent: 3 }, { scale: 1, yPercent: 0, duration: 0.8, ease: ease.camera }, 0)
        .fromTo(q("[data-sweep]"), { xPercent: -120 }, { xPercent: 120, duration: 0.3, ease: ease.light }, 0.3);
    },
    revealAt: 0.35,
    reveal: (tl, q) => {
      fadeUp(tl, q("[data-card-bg]"), 0);
      fadeUp(tl, q("[data-meta]"), 0);
      revealLines(tl, q("[data-title]")[0] as HTMLElement, 0.1);
      fadeUp(tl, q("[data-info]"), 0.45);
      tl.duration(Math.min(tl.duration(), dur.slow * 1.6)); // details never wait long
    },
  });

  const time = ceremony.time ?? ceremony.timePending;

  return (
    <Chapter ref={root} id="ceremony" label="The ceremony" pinClassName={s.pin}>
      <div className={s.bg} aria-hidden="true">
        <div className={s.film} data-bg-film>
          <BackgroundVideo name="church" scene="ceremony" className={s.media} />
        </div>
        <span className={s.shade} />
        <span className={s.sweep} data-sweep />
      </div>
      <div className={s.card}>
        <span className={s.cardBg} data-card-bg data-reveal aria-hidden="true" />
        <p className="meta" data-meta data-reveal>
          The Ceremony
        </p>
        <h2 className={`display ${s.venue}`} data-title data-reveal>
          {ceremony.venue}
        </h2>
        <div className={s.info} data-info data-reveal>
          <p className={s.place}>
            {ceremony.area}
            <br />
            {ceremony.country}
          </p>
          <dl className={s.facts}>
            <div>
              <dt className="meta">Date</dt>
              <dd>{ceremony.date}</dd>
            </div>
            <div>
              <dt className="meta">Time</dt>
              <dd>{time}</dd>
            </div>
            <div>
              <dt className="meta">Attire</dt>
              <dd>{details.attireNote}</dd>
            </div>
          </dl>
          <a className={s.map} href={ceremony.mapUrl} target="_blank" rel="noopener noreferrer">
            Open the map <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </Chapter>
  );
}
