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

/** Scene stepping: one scroll = one chapter (animation/sceneStepper.ts). */
export const step = {
  /** Glide duration (s) = base + perScreen × screens travelled, clamped to min..max. */
  base: 0.9,
  perScreen: 0.55,
  min: 1.4,
  max: 3,
  ease: "power2.inOut",
  /** Reduced motion: a short, plain hand-over. */
  reduced: 0.6,
  /** After arriving, input stays locked at least this long… */
  minHold: 0.25,
  /** …and at most this long while text reveals or a visible clip finish. */
  maxHold: 4.5,
  /** A wheel event starts a new gesture after this gap (ms) — trackpad momentum never re-triggers. */
  wheelGap: 200,
  /** Swipe distance (px) that counts as one scroll. */
  swipe: 40,
} as const;
