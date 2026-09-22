"use client";

import { useRef } from "react";
import { TransitionClip, type ClipHandle } from "@/components/cinematic/TransitionClip";
import { ceremony, details } from "@/content/wedding";
import { dur, ease } from "@/animation/tokens";
import { fadeUp, revealLines } from "@/animation/text";
import { useChapterTimeline } from "@/animation/useChapterTimeline";
import { Chapter } from "@/components/cinematic/Chapter";
import { Architecture } from "@/components/cinematic/Architecture";
import s from "./ceremony.module.css";

/**
 * 05 — The Ceremony. Monumental and calm:
 * blue atmosphere → distant architecture draws itself in gold → a light sweep crosses the
 * frame → the camera moves closer → the ceremony details settle in, clear and legible.
 */
export function Ceremony() {
  const root = useRef<HTMLElement>(null);
  const clip = useRef<ClipHandle>(null);

  useChapterTimeline("ceremony", root, {
    // Flow clip: morning light sweeps through arched windows (generic, not the real venue).
    onProgress: (t) => t > 0.02 && clip.current?.play(),
    scrub: (tl, q) => {
      tl.fromTo(q("[data-arch]"), { scale: 0.62, yPercent: 14, opacity: 0.35 }, { scale: 1.08, yPercent: -6, opacity: 1, duration: 0.75, ease: ease.camera }, 0)
        .fromTo(q("[data-arch] [data-draw]"), { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.45, stagger: 0.02, ease: ease.camera }, 0)
        .fromTo(q("[data-sweep]"), { xPercent: -120 }, { xPercent: 120, duration: 0.3, ease: ease.light }, 0.3)
        .to(q("[data-arch]"), { opacity: 0.28, duration: 0.2 }, 0.6)
        .fromTo(q("[data-clip-wrap]"), { opacity: 0 }, { opacity: 0.85, duration: 0.25 }, 0);
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
      <div className={`clip ${s.clip}`} data-clip-wrap>
        <TransitionClip ref={clip} name="chapel" />
      </div>
      <div className={s.archWrap} data-arch>
        <Architecture className={s.arch} />
        <span className={s.sweep} data-sweep aria-hidden="true" />
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
