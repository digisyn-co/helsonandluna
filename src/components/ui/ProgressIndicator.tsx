"use client";

import { useEffect, useRef } from "react";
import { SCENES } from "@/content/scenes";
import { activeScene, page } from "@/animation/sceneManager";
import { goToScene } from "@/animation/sceneStepper";
import { gsap } from "@/lib/gsap";

const pad = (n: number) => String(n).padStart(2, "0");

/** `03 / 09 · THE PROMISE` with a thin champagne line, plus a jump link to Details & RSVP. */
export function ProgressIndicator() {
  const index = activeScene.use();
  const bar = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = bar.current;
    if (!el) return;
    const set = gsap.quickSetter(el, "scaleX");
    const tick = () => set(page.progress);
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  const scene = SCENES[index];
  const onDetails = index === SCENES.findIndex((s) => s.id === "details");

  return (
    <nav className="progress" aria-label="Invitation chapters">
      <p className="progress__label" aria-live="polite">
        <span className="progress__num">
          {pad(index + 1)} / {pad(SCENES.length)}
        </span>
        <span className="progress__dot" aria-hidden="true">·</span>
        <span className="progress__title">{scene.title}</span>
      </p>
      <span className="progress__track" aria-hidden="true">
        <span ref={bar} className="progress__bar" />
      </span>
      <a
        href="#details"
        className="progress__skip"
        aria-hidden={onDetails}
        tabIndex={onDetails ? -1 : 0}
        onClick={(e) => {
          e.preventDefault();
          goToScene("details");
          document.getElementById("details")?.focus({ preventScroll: true });
        }}
      >
        Details &amp; RSVP
      </a>
    </nav>
  );
}
