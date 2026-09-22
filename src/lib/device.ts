"use client";

import { createStore } from "./store";

export type Tier = "low" | "medium" | "high";

/** Fidelity per tier. Scales detail, never the story. */
export const TIER_PRESETS = {
  low: { dpr: [1, 1] as [number, number], particles: 140, postfx: false, ringSegments: 96 },
  medium: { dpr: [1, 1.75] as [number, number], particles: 420, postfx: true, ringSegments: 160 },
  high: { dpr: [1, 2] as [number, number], particles: 900, postfx: true, ringSegments: 256 },
} as const;

const ORDER: Tier[] = ["low", "medium", "high"];

/** `android`: an Android phone/tablet — their GPUs struggle with full-screen shaders, blend
 *  modes and filters, so they always use the lite "low" tier. (Chrome caps deviceMemory at 8,
 *  so a mid-range 8 GB phone can't be told apart from a flagship: no "high-end" exception.) */
type Env = { reducedMotion: boolean; coarse: boolean; lowPower: boolean; webgl: boolean; android: boolean };

function detectEnv(): Env {
  if (typeof window === "undefined") return { reducedMotion: false, coarse: true, lowPower: false, webgl: true, android: false };
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const params = new URLSearchParams(location.search);
  return {
    reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches || params.has("reduced"),
    coarse: matchMedia("(pointer: coarse)").matches,
    lowPower: Boolean(nav.connection?.saveData) || (nav.deviceMemory ?? 8) <= 3 || params.has("lowpower"),
    webgl: !params.has("nowebgl") && supportsWebGL(),
    android: /Android/i.test(navigator.userAgent),
  };
}

function supportsWebGL() {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** QA override: ?tier=low|medium|high pins the tier (PerformanceMonitor won't move it). */
const forcedTier = (): Tier | null => {
  if (typeof window === "undefined") return null;
  const t = new URLSearchParams(location.search).get("tier");
  return t === "low" || t === "medium" || t === "high" ? t : null;
};

function initialTier(env: Env): Tier {
  const forced = forcedTier();
  if (forced) return forced;
  if (env.lowPower) return "low";
  if (env.android) return "low";
  if (env.coarse) return (navigator.hardwareConcurrency ?? 4) >= 8 ? "medium" : "low";
  return "high";
}

export const env: Env = detectEnv();
export const tierStore = createStore<Tier>(initialTier(env));
/** The lite rendering path (low tier): no animated blurs, no full-screen blend modes or filters,
 *  WebGL drawn only while something moves. Read when timelines are built. */
export const lite = () => tierStore.get() === "low";

/** Flips false if WebGL fails at runtime (context loss, shader error) → static fallback. */
export const webglOk = createStore<boolean>(env.webgl);

export function stepTier(direction: -1 | 1) {
  if (forcedTier()) return;
  if (env.lowPower && direction === 1) return; // never climb out of low-power mode
  if (env.android && direction === 1) return; // Android stays lite
  const i = ORDER.indexOf(tierStore.get());
  tierStore.set(ORDER[Math.min(ORDER.length - 1, Math.max(0, i + direction))]);
}

/** Persistent frame-rate trouble: drop straight to low (unless QA pinned the tier). */
export function fallbackTier() {
  if (forcedTier()) return;
  tierStore.set("low");
}

export function useTier() {
  const tier = tierStore.use();
  return { tier, ...TIER_PRESETS[tier] };
}

/** QA hooks: <html data-tier="…" data-webgl="…" data-motion="…"> */
export function mirrorEnvToDom() {
  const d = document.documentElement.dataset;
  const sync = () => {
    d.tier = tierStore.get();
    d.webgl = String(webglOk.get());
    d.motion = env.reducedMotion ? "reduced" : "full";
    d.input = env.coarse ? "touch" : "pointer";
  };
  sync();
  const a = tierStore.subscribe(sync);
  const b = webglOk.subscribe(sync);
  return () => {
    a();
    b();
  };
}
