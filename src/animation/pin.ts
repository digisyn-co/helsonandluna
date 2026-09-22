import { clamp01 } from "./math";

/**
 * For a chapter `length` screens tall with sticky content, converts the scene manager's
 * progress (0 = top edge enters from below, 1 = bottom edge leaves above) into the
 * progress of the PINNED segment: 0 when the content locks, 1 when it releases.
 */
export function pinProgress(p: number, length: number) {
  if (length <= 1) return clamp01(p * 2 - 0.5);
  return clamp01((p * (length + 1) - 1) / (length - 1));
}

/** Local 0..1 for a sub-window of a 0..1 progress. */
export const segment = (t: number, start: number, end: number) => clamp01((t - start) / (end - start));

/**
 * Cross-dissolve opacity for a pinned chapter's fixed layer. The layer fades IN over the
 * screen of scroll where the chapter arrives and OUT over the screen where it leaves —
 * exactly when its neighbours fade the other way, so chapters dissolve into each other
 * (no sliding blocks, no hard edges, no empty gaps).
 */
export function layerOpacity(p: number, length: number, inScreens = 1, outScreens = 1) {
  const s = p * (length + 1); // screens scrolled since the chapter's top reached the viewport bottom
  const fadeIn = clamp01((s - (1 - inScreens)) / inScreens); // complete when the pin locks (s = 1)
  const fadeOut = clamp01((length + outScreens - s) / outScreens); // starts when the pin releases (s = length)
  return Math.min(fadeIn, fadeOut);
}
