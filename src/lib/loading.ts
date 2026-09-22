import { createStore } from "./store";

/**
 * What must be ready before the curtain lifts: scene 00 only (fonts + monogram + first
 * WebGL frame, or WebGL confirmed unavailable). Later scenes load progressively.
 */
export const loadState = createStore({ fonts: false, monogram: false, stage: false });

export const isReady = (s: ReturnType<typeof loadState.get>, webgl: boolean) =>
  s.fonts && s.monogram && (s.stage || !webgl);

export const readyFraction = (s: ReturnType<typeof loadState.get>, webgl: boolean) => {
  const parts = [s.fonts, s.monogram, webgl ? s.stage : true];
  return parts.filter(Boolean).length / parts.length;
};
