"use client";

import { useRef } from "react";
import { ceremony, details, reception, story, wedding } from "@/content/wedding";
import { useScene } from "@/animation/useScene";
import { Chapter } from "@/components/cinematic/Chapter";
import { Ornament } from "@/components/cinematic/Ornament";
import { Countdown } from "@/components/ui/Countdown";
import { RSVPForm } from "@/components/ui/RSVPForm";
import s from "./details.module.css";

/**
 * 07 — The Details. The most readable chapter: every practical fact and the RSVP, with
 * minimal motion. Nothing here is ever hidden behind an animation (no [data-reveal]).
 */
export function Details() {
  const root = useRef<HTMLElement>(null);
  useScene("details", root);

  return (
    <Chapter ref={root} id="details" label="Details and RSVP" pinned={false} pinClassName={s.flow}>
      <header className={s.header}>
        <p className="meta">The Details</p>
        <h2 className={`display ${s.date}`}>{wedding.dateLong}</h2>
        <p className={s.city}>
          {wedding.city}, {wedding.country}
        </p>
        <Countdown className={s.countdown} />
      </header>

      <Ornament className={s.ornament} />

      <dl className={s.list}>
        <div className={s.item}>
          <dt className="meta">Ceremony</dt>
          <dd>
            <strong>{ceremony.venue}</strong>
            <span>
              {ceremony.area}, {ceremony.country}
            </span>
            <span>Time: {ceremony.time ?? ceremony.timePending}</span>
            <a href={ceremony.mapUrl} target="_blank" rel="noopener noreferrer" className={s.link}>
              Open the map <span aria-hidden="true">↗</span>
            </a>
          </dd>
        </div>
        <div className={s.item}>
          <dt className="meta">Reception</dt>
          <dd>
            <strong>{reception.venue}</strong>
            <span>
              {reception.area}, {reception.country}
            </span>
            <span>{reception.description}</span>
            <span>{reception.time ?? reception.timeLabel}</span>
          </dd>
        </div>
        <div className={s.item}>
          <dt className="meta">Attire</dt>
          <dd>
            <strong>{details.attire}</strong>
            <span>{details.attireNote}</span>
          </dd>
        </div>
        <div className={s.item}>
          <dt className="meta">Guests</dt>
          <dd>
            <strong>{details.guests}</strong>
          </dd>
        </div>
      </dl>

      <section className={s.rsvp} aria-labelledby="rsvp-title">
        <h3 id="rsvp-title" className={`display ${s.rsvpTitle}`}>
          {story.rsvp.title[0]} <em>{story.rsvp.title[1]}</em>
        </h3>
        <p className={s.rsvpNote}>{details.rsvpNote}</p>
        <RSVPForm />
      </section>
    </Chapter>
  );
}
