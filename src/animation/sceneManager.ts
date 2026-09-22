"use client";

import { createStore } from "@/lib/store";
import { SCENES, type SceneId } from "@/content/scenes";

/**
 * The one scroll controller. Every scene registers here; nothing else listens to scroll.
 *
 * Per scene, per frame:
 *   progress  0 → 1  as the chapter travels from "top edge at viewport bottom" to
 *                    "bottom edge at viewport top". 0.5 = chapter exactly fills the screen.
 *   presence  0 → 1 → 0  peaks at 0.5 (handy for fades and 3D visibility).
 *   visible   whether any part of the chapter is within `preloadScreens` of the viewport
 *             (used to mount/unmount GPU work).
 * Lifecycle: enter(direction) → progress(p) → exit(direction), where the "hold" is p ≈ 0.5.
 */

export type SceneFrame = { progress: number; presence: number; visible: boolean; active: boolean };
export type SceneHandlers = {
  enter?: (direction: 1 | -1) => void;
  progress?: (p: number, frame: SceneFrame) => void;
  exit?: (direction: 1 | -1) => void;
};

type Entry = { el: HTMLElement; top: number; height: number; handlers: Set<SceneHandlers>; frame: SceneFrame };

const PRELOAD_SCREENS = 1;

const entries = new Map<SceneId, Entry>();
/** Read-only per-frame state for render loops (WebGL), keyed by scene id. */
export const sceneFrames = Object.fromEntries(
  SCENES.map((s) => [s.id, { progress: 0, presence: 0, visible: false, active: false }]),
) as Record<SceneId, SceneFrame>;

/** Index of the chapter under the viewport centre — React-subscribable (changes rarely). */
export const activeScene = createStore(0);
/** Ids of chapters currently near the viewport — React-subscribable, for mounting 3D. */
export const visibleScenes = createStore<ReadonlySet<SceneId>>(new Set());
/** Page-level progress 0..1 (atmosphere colour, closing rise). */
export const page = { progress: 0, scrollY: 0, vh: 1 };

let lastY = -1;
let lastVh = -1;
let dirty = true;

function measure() {
  entries.forEach((e) => {
    const r = e.el.getBoundingClientRect();
    e.top = r.top + window.scrollY;
    e.height = r.height;
  });
  dirty = true;
}

let ro: ResizeObserver | null = null;

export function registerScene(id: SceneId, el: HTMLElement, handlers: SceneHandlers) {
  let entry = entries.get(id);
  if (!entry) {
    entry = { el, top: 0, height: 0, handlers: new Set(), frame: sceneFrames[id] };
    entries.set(id, entry);
    ro ??= new ResizeObserver(measure);
    ro.observe(el);
    measure();
  }
  entry.el = el;
  entry.handlers.add(handlers);
  return () => {
    entry!.handlers.delete(handlers);
    if (entry!.handlers.size === 0) {
      ro?.unobserve(entry!.el);
      entries.delete(id);
    }
  };
}

/** Called once per frame from the shared GSAP ticker (see SmoothScroll). */
export function updateScenes() {
  const y = window.scrollY;
  const vh = window.innerHeight;
  if (vh !== lastVh) measure();
  if (!dirty && y === lastY) return;
  const direction: 1 | -1 = y >= lastY ? 1 : -1;
  lastY = y;
  lastVh = vh;
  dirty = false;

  const max = Math.max(1, document.documentElement.scrollHeight - vh);
  page.progress = Math.min(1, Math.max(0, y / max));
  page.scrollY = y;
  page.vh = vh;

  const centre = y + vh / 2;
  let active = activeScene.get();
  const visible = new Set<SceneId>();

  SCENES.forEach(({ id }, index) => {
    const e = entries.get(id);
    if (!e) return;
    const f = e.frame;
    const span = e.height + vh;
    const p = Math.min(1, Math.max(0, (y + vh - e.top) / span));
    const wasInside = f.progress > 0 && f.progress < 1;
    const isInside = p > 0 && p < 1;

    f.progress = p;
    f.presence = 1 - Math.abs(p - 0.5) * 2;
    f.visible = y + vh * (1 + PRELOAD_SCREENS) > e.top && y - vh * PRELOAD_SCREENS < e.top + e.height;
    f.active = centre >= e.top && centre < e.top + e.height;
    if (f.visible) visible.add(id);
    if (f.active) active = index;

    e.handlers.forEach((h) => {
      if (isInside && !wasInside) h.enter?.(direction);
      if (isInside || wasInside) h.progress?.(p, f);
      if (!isInside && wasInside) h.exit?.(direction);
    });
  });

  activeScene.set(active);
  const prev = visibleScenes.get();
  if (prev.size !== visible.size || [...visible].some((v) => !prev.has(v))) visibleScenes.set(visible);
}

/** Scroll to a chapter (used by the progress UI and "Skip to details"). */
export function scrollToScene(id: SceneId, immediate = false) {
  const e = entries.get(id);
  if (!e) return;
  const lenis = (window as Window & { __lenis?: { scrollTo: (y: number, o?: object) => void } }).__lenis;
  if (lenis && !immediate) lenis.scrollTo(e.top, { duration: 1.6 });
  else window.scrollTo({ top: e.top, behavior: immediate ? "auto" : "smooth" });
}
