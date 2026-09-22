import { lite } from "@/lib/device";

/**
 * Blur-to-focus, only where the GPU can afford it. On the lite tier (Android, low power)
 * animated `filter: blur()` is dropped and the same tween simply fades/scales.
 * Spread into tween vars: `{ opacity: 0, ...blurred(10) }` → `{ opacity: 1, ...focused() }`.
 */
export const blurred = (px: number) => (lite() ? {} : { filter: `blur(${px}px)` });
export const focused = () => (lite() ? {} : { filter: "blur(0px)" });
