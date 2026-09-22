"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { env } from "@/lib/device";
import { ease, dur } from "@/animation/tokens";
import { fadeUp, focusIn, revealLines } from "@/animation/text";
import { ceremony, couple, reception, wedding } from "@/content/wedding";
import { Monogram } from "@/components/cinematic/Monogram";
import { Florals } from "@/components/cinematic/Florals";
import s from "./thank-you.module.css";

type Props = { open: boolean; name: string; attending: boolean; onClose: () => void };

/**
 * The thank-you page shown after an RSVP is saved: a full-screen modal <dialog> over the
 * invitation (focus stays inside, Escape closes, the page behind never moves). Its own short
 * reveal plays on open; reduced motion gets a plain fade. Facts come from src/content only.
 */
export function ThankYou({ open, name, attending, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = dialog.current;
    if (!d || !open) return;
    if (!d.open) d.showModal(); // (the reveal below re-runs if the effect does, e.g. React dev)
    d.querySelector<HTMLElement>("[data-heading]")?.focus({ preventScroll: true });
    const q = gsap.utils.selector(d);
    const tl = gsap.timeline();
    tl.fromTo(d, { opacity: 0 }, { opacity: 1, duration: env.reducedMotion ? 0.4 : 0.9, ease: ease.fade });
    if (!env.reducedMotion) {
      tl.fromTo(q("[data-mono]"), { opacity: 0, scale: 0.92, filter: "blur(10px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: dur.slow, ease: ease.reveal, clearProps: "filter" }, 0.2)
        .fromTo(q(".monogram__sweep"), { xPercent: -80, opacity: 0 }, { xPercent: 80, opacity: 1, duration: dur.sweep, ease: ease.light }, 0.9)
        .to(q(".monogram__sweep"), { opacity: 0, duration: dur.base }, `>-${dur.base}`)
        .fromTo(q("[data-floral]"), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: dur.slow, stagger: 0.12, ease: ease.reveal }, 0.6);
      focusIn(tl, q("[data-meta]")[0] as HTMLElement, 0.7);
      revealLines(tl, q("[data-heading]")[0] as HTMLElement, 0.9);
      fadeUp(tl, q("[data-rest]"), 1.5);
    }
    return () => {
      tl.kill();
      gsap.set(d, { opacity: 1 }); // never leave an open dialog invisible
    };
  }, [open]);

  const close = () => {
    const d = dialog.current;
    if (!d?.open) return onClose();
    gsap.to(d, {
      opacity: 0,
      duration: env.reducedMotion ? 0.2 : 0.5,
      ease: ease.fade,
      onComplete: () => {
        d.close();
        onClose();
      },
    });
  };

  const who = name.trim().slice(0, 80);
  const time = ceremony.time ?? ceremony.timePending;

  return (
    <dialog
      ref={dialog}
      className={s.dialog}
      aria-labelledby="thank-you-heading"
      onCancel={(e) => {
        e.preventDefault(); // Escape: fade out like the button does
        close();
      }}
    >
      <Florals className={s.florals} />
      <div className={s.frame} aria-hidden="true" />
      <div className={s.content}>
        <div className={s.mono} data-mono>
          <Monogram size="closing" priority />
        </div>
        <p className="meta" data-meta>
          RSVP received
        </p>
        <h2 id="thank-you-heading" className={`display ${s.heading}`} data-heading tabIndex={-1}>
          Thank you{who ? `, ${who}` : ""}.
          <br />
          <em>{attending ? "We can’t wait to celebrate with you." : "You’ll be dearly missed."}</em>
        </h2>
        <p className={`body ${s.message}`} data-rest>
          {attending
            ? "Your seat in the garden is waiting. We’ll see you on our wedding day."
            : "Thank you for letting us know. You’ll be in our hearts on the day."}
        </p>
        {attending && (
          <dl className={s.recap} data-rest>
            <div>
              <dt className="meta">When</dt>
              <dd>
                {wedding.dateLong}
                <br />
                {time}
              </dd>
            </div>
            <div>
              <dt className="meta">Ceremony</dt>
              <dd>
                {ceremony.venue}
                <br />
                {ceremony.area}
              </dd>
            </div>
            <div>
              <dt className="meta">Reception</dt>
              <dd>
                {reception.venue}
                <br />
                {reception.timeLabel}
              </dd>
            </div>
          </dl>
        )}
        <p className={s.sign} data-rest>
          With love, <span className={s.names}>{couple.joined}</span>
        </p>
        <button type="button" className={s.back} onClick={close} data-rest>
          Back to the invitation
        </button>
      </div>
    </dialog>
  );
}
