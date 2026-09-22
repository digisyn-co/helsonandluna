import { createStore } from "./store";

/**
 * Load milestones. The curtain lifts on scene 00's essentials (fonts + monogram);
 * `stage` only reports when WebGL has drawn its first frame. Later scenes load progressively.
 */
export const loadState = createStore({ fonts: false, monogram: false, stage: false });

/** The curtain waits for type and the monogram only — never for WebGL, which can take
 *  seconds to compile on mid-range phones and fades in on its own. */
export const isReady = (s: ReturnType<typeof loadState.get>) => s.fonts && s.monogram;

export const readyFraction = (s: ReturnType<typeof loadState.get>) => [s.fonts, s.monogram].filter(Boolean).length / 2;
