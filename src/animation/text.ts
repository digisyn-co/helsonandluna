"use client";

import { gsap, SplitText } from "@/lib/gsap";
import { dur, ease, stagger } from "./tokens";
import { blurred, focused } from "./fx";

/**
 * Type-reveal building blocks. Each one ADDS tweens to a scene's timeline at `at`,
 * so choreography stays in one place per scene (no timers, no per-component triggers).
 * Elements are hidden via [data-reveal] in CSS until their timeline is built.
 */

type At = gsap.Position;

/** Lifts the [data-reveal] CSS hide. Visibility only — opacity belongs to the tween. */
const show = (el: Element) => gsap.set(el, { visibility: "visible" });

/**
 * Splits are made AFTER fonts load (timelines are built then) and reverted when the
 * reveal finishes, so text reflows naturally afterwards (rotation, resize).
 */
function revertAfter(tl: gsap.core.Timeline, split: SplitText) {
  tl.call(() => split.revert(), undefined, tl.duration());
}

/** Lines rise out of a mask. Editorial default for headlines. */
export function revealLines(tl: gsap.core.Timeline, el: HTMLElement | null, at: At = 0) {
  if (!el) return;
  const split = SplitText.create(el, { type: "lines", mask: "lines" });
  gsap.set(split.lines, { yPercent: 110 });
  show(el);
  tl.to(split.lines, { yPercent: 0, duration: dur.reveal, ease: ease.reveal, stagger: stagger.lines }, at);
  revertAfter(tl, split);
  return split;
}

/**
 * Blur-to-focus with tracking easing in. The tracking starts slightly WIDER than the
 * element's resting value (relative, so it never overflows a narrow phone line).
 */
export function focusIn(tl: gsap.core.Timeline, el: HTMLElement | null, at: At = 0, from = { blur: 12, trackingEm: 0.14 }) {
  if (!el) return;
  const cs = getComputedStyle(el);
  const rest = parseFloat(cs.letterSpacing) || 0;
  const wide = rest + from.trackingEm * parseFloat(cs.fontSize);
  gsap.set(el, { opacity: 0 });
  show(el);
  tl.fromTo(
    el,
    { opacity: 0, ...blurred(from.blur), letterSpacing: `${wide}px` },
    { opacity: 1, ...focused(), letterSpacing: `${rest}px`, duration: dur.slow, ease: ease.reveal, clearProps: "filter,letterSpacing" },
    at,
  );
}

/** Characters settle one by one (display moments only — the names). */
export function revealChars(tl: gsap.core.Timeline, el: HTMLElement | null, at: At = 0) {
  if (!el) return;
  const split = SplitText.create(el, { type: "chars" });
  gsap.set(split.chars, { opacity: 0, yPercent: 40, ...blurred(8) });
  show(el);
  tl.to(split.chars, { opacity: 1, yPercent: 0, ...focused(), duration: dur.reveal, ease: ease.reveal, stagger: stagger.chars }, at);
  revertAfter(tl, split);
  return split;
}

/** Slow opacity + slight rise. Body copy. */
export function fadeUp(tl: gsap.core.Timeline, el: Element | Element[] | null, at: At = 0) {
  if (!el) return;
  const els = Array.isArray(el) ? el : [el];
  gsap.set(els, { opacity: 0, y: 16 });
  els.forEach(show);
  tl.to(els, { opacity: 1, y: 0, duration: dur.slow, ease: ease.fade, stagger: stagger.words }, at);
}

/** Reduced motion: everything visible immediately, no movement. */
export function showAll(root: HTMLElement | null) {
  root?.querySelectorAll("[data-reveal]").forEach((el) => gsap.set(el, { autoAlpha: 1 }));
}
