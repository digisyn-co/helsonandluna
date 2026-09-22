/**
 * Motion tokens for GSAP. Mirrors src/styles/tokens.css. Every duration/ease used in a
 * timeline comes from here — no inline magic numbers in scenes.
 */
export const ease = {
  /** Default reveal: long, weightless deceleration. */
  reveal: "expo.out",
  /** Camera and large moves: slow start, slow settle. */
  camera: "power2.inOut",
  /** Light sweeps and glints. */
  light: "sine.inOut",
  /** Fades. */
  fade: "power1.out",
  /** Scrub-driven timelines use linear time; easing lives inside each tween. */
  scrub: "none",
} as const;

export const dur = {
  glint: 0.6,
  fast: 0.4,
  base: 0.9,
  reveal: 1.4,
  slow: 1.8,
  sweep: 2.4,
  line: 1.6,
} as const;

export const stagger = {
  chars: 0.035,
  words: 0.08,
  lines: 0.12,
} as const;

/** Opening sequence (scene 00) beat times, in seconds from load. */
export const opening = {
  glimmer: 0.3,
  line: 0.9,
  monogram: 1.7,
  sweep: 2.9,
  florals: 3.3,
  names: 3.6,
  date: 4.3,
  cue: 5.0,
} as const;

/** Scroll snapping. */
export const snap = {
  /** Desktop (Lenis) snap settle duration. */
  duration: 1.1,
  /** Only snap when this close to a chapter start (fraction of viewport height). */
  threshold: 0.35,
  /** Wait for the scroll to settle before snapping (ms). */
  debounce: 140,
} as const;
