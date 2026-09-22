"use client";

import { useEffect, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { env } from "@/lib/device";
import { couple, wedding } from "@/content/wedding";
import { dur, ease, opening } from "@/animation/tokens";
import { blurred, focused } from "@/animation/fx";
import { focusIn, revealChars } from "@/animation/text";
import { useScene } from "@/animation/useScene";
import { registerSettle } from "@/animation/sceneManager";
import { curtainUp } from "@/components/ui/LoadingScreen";
import { Monogram } from "@/components/cinematic/Monogram";
import { Ornament } from "@/components/cinematic/Ornament";
import { Florals } from "@/components/cinematic/Florals";
import s from "./invitation.module.css";

/**
 * 00 — The Invitation. Plays on load (after the curtain), a few seconds long:
 * darkness → glimmer → ornament draws → approach → monogram → light sweep + crystal glints
 * → florals → names → date → scroll cue. Scrolling during it fast-forwards to the end
 * (the scene stepper holds the first step until it has finished).
 * Scrolling away scrubs the exit: the monogram rises toward camera and dissolves into haze.
 */
export function Invitation() {
  const root = useRef<HTMLElement>(null);
  const intro = useRef<gsap.core.Timeline | null>(null);
  const exit = useRef<gsap.core.Timeline | null>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mono = q("[data-mono]")[0];

      // Scroll exit (scrubbed by the scene manager, second half of the chapter).
      exit.current = gsap
        .timeline({ paused: true, defaults: { ease: ease.scrub } })
        .to(q("[data-stage-inner]"), { scale: env.reducedMotion ? 1 : 1.18, yPercent: env.reducedMotion ? 0 : -8, opacity: 0, duration: 1 }, 0)
        .to(q("[data-cue]"), { opacity: 0, duration: 0.2 }, 0);

      if (env.reducedMotion) {
        gsap.set(q("[data-reveal]"), { autoAlpha: 1 });
        gsap.set(q("[data-glimmer]"), { autoAlpha: 0 });
        return;
      }

      const tl = gsap.timeline({ paused: true });
      tl.fromTo(q("[data-glimmer]"), { autoAlpha: 0, scale: 0.2 }, { autoAlpha: 1, scale: 1, duration: dur.slow, ease: ease.light }, opening.glimmer)
        .to(q("[data-glimmer]"), { autoAlpha: 0, scale: 2.4, duration: dur.slow, ease: ease.fade }, opening.monogram)
        .set(q("[data-ornament]"), { autoAlpha: 1 }, opening.line)
        .from(q("[data-draw]"), { drawSVG: "0%", duration: dur.line, ease: ease.camera, stagger: 0.12 }, opening.line)
        .from(q("[data-diamond]"), { scale: 0, transformOrigin: "50% 50%", duration: dur.base, ease: ease.reveal }, opening.line)
        // Camera approach: the whole frame drifts toward us as the monogram resolves.
        .fromTo(q("[data-stage-inner]"), { scale: 0.9 }, { scale: 1, duration: opening.cue, ease: ease.camera }, 0)
        .fromTo(mono, { autoAlpha: 0, ...blurred(14), scale: 0.94 }, { autoAlpha: 1, ...focused(), scale: 1, duration: dur.slow * 1.2, ease: ease.reveal, clearProps: "filter" }, opening.monogram)
        .fromTo(q(".monogram__sweep"), { xPercent: -80, opacity: 0 }, { xPercent: 80, opacity: 1, duration: dur.sweep, ease: ease.light }, opening.sweep)
        .to(q(".monogram__sweep"), { opacity: 0, duration: dur.base }, `>-${dur.base}`)
        .fromTo(q(".monogram__glint"), { autoAlpha: 0, scale: 0.2, rotate: -30 }, { autoAlpha: 1, scale: 1, rotate: 0, duration: dur.glint, ease: ease.light, stagger: 0.25, yoyo: true, repeat: 1 }, opening.sweep + dur.sweep * 0.45)
        .fromTo(q("[data-floral]"), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: dur.slow * 1.4, ease: ease.reveal, stagger: 0.15 }, opening.florals);

      tl.fromTo(q("[data-cue]"), { autoAlpha: 0, y: -6 }, { autoAlpha: 1, y: 0, duration: dur.base, ease: ease.fade }, opening.cue);
      intro.current = tl;

      // Type is split after fonts load (the curtain waits for fonts too).
      let off = () => {};
      document.fonts.ready.then(() => {
        revealChars(tl, q("[data-names]")[0] as HTMLElement, opening.names);
        focusIn(tl, q("[data-date]")[0] as HTMLElement, opening.date);
        const start = () => tl.play(0);
        if (curtainUp.get()) start();
        off = curtainUp.subscribe(() => curtainUp.get() && start());
      });
      return () => off();
    },
    { scope: root },
  );

  // The first step waits for the curtain and the opening; scrolling during it fast-forwards.
  useEffect(
    () =>
      registerSettle({
        busy: () => !env.reducedMotion && (!curtainUp.get() || Boolean(intro.current?.isActive())),
        nudge: () => void (intro.current?.isActive() && intro.current.timeScale(5)),
      }),
    [],
  );

  useScene("invitation", root, {
    progress: (p) => {
      exit.current?.progress(Math.max(0, (p - 0.5) * 2));
    },
  });

  return (
    <section ref={root} id="invitation" className={`chapter ${s.scene}`} aria-label="The invitation">
      <div className={s.inner} data-stage-inner>
        <span className={s.glimmer} data-glimmer aria-hidden="true" />
        <Ornament className={s.ornament} />
        <div data-mono data-reveal className={s.mono}>
          <span className="monogram-halo" aria-hidden="true" />
          <Monogram size="hero" priority />
        </div>
        <Florals className={s.florals} />
        <h1 className={s.names}>
          <span data-names data-reveal className="display">
            {couple.first} <em>&amp;</em> {couple.second}
          </span>
        </h1>
        <p className={`meta ${s.date}`} data-date data-reveal>
          {wedding.dateShort} · {wedding.city}
        </p>
      </div>
      <p className={s.cue} data-cue data-reveal aria-hidden="true">
        <span className="meta">Scroll</span>
        <span className={s.cueLine} />
      </p>
    </section>
  );
}
