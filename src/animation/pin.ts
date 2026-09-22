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
