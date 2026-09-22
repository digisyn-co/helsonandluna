"use client";

import { gsap } from "@/lib/gsap";
import { env } from "@/lib/device";
import { SCENES, isFlow, type SceneId } from "@/content/scenes";
import { anyBusy, nudgeAll, sceneBox } from "./sceneManager";
import { step } from "./tokens";

/**
 * The scene stepper — one scroll = one chapter. Nothing scrolls the page freely.
 *
 *   gesture (wheel / swipe / key) → glide from this chapter's rest frame to the next one's
 *   → hold while the new chapter's type reveals and any visible clip plays (capped)
 *   → accept the next gesture.
 *
 * Chapters are still driven by scroll position (sceneManager reads window.scrollY every
 * frame), so the glide plays each exit, dissolve and intro exactly as authored.
 * A fast flick or trackpad momentum counts once: wheel events only start a new step after
 * a pause (`step.wheelGap`) or a clearly new, stronger flick, and never while locked.
 * Reading chapters (Entourage, Details) are one screen with their own scroller: they scroll
 * natively inside, and a gesture made at their top/bottom edge steps to the neighbour.
 * Stray page scrolls (focus moving to a field, find-in-page, a dragged scrollbar) settle
 * to the nearest chapter.
 */

type Phase = "idle" | "moving" | "holding";

let current = 0;
let phase: Phase = "idle";
/** Mirrored to <html data-step="idle|moving|holding"> for QA scripts. */
function setPhase(p: Phase) {
  phase = p;
  document.documentElement.dataset.step = p;
}
let holdStart = 0;
let holdCap: number = step.maxHold;
let tween: gsap.core.Tween | null = null;
const proxy = { y: 0 };

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const vh = () => window.innerHeight;
const maxScroll = () => Math.max(0, document.documentElement.scrollHeight - vh());

function stopY(i: number) {
  const scene = SCENES[i];
  const box = sceneBox(scene.id);
  if (!box) return null;
  const range = Math.max(0, box.height - vh());
  return Math.round(Math.min(maxScroll(), box.top + (isFlow(i) ? 0 : scene.rest * range)));
}

function nearest(y = window.scrollY) {
  let best = current;
  let bestD = Infinity;
  SCENES.forEach((_, i) => {
    const s = stopY(i);
    if (s !== null && Math.abs(s - y) < bestD) [best, bestD] = [i, Math.abs(s - y)];
  });
  return best;
}

/** A reading chapter's own scroller (null for pinned chapters). */
const scrollerOf = (i: number) => document.getElementById(SCENES[i].id)?.querySelector<HTMLElement>(".chapter__scroll") ?? null;

function canScroll(el: HTMLElement | null, dir: 1 | -1) {
  if (!el) return false;
  return dir > 0 ? el.scrollTop + el.clientHeight < el.scrollHeight - 2 : el.scrollTop > 1;
}

type Pace = readonly (readonly [number, number])[];

/** Monotone cubic ease through (0,0) → points → (1,1), starting and ending at rest, so a
 *  step can spend its time where the transition needs it (Fritsch–Carlson, no overshoot). */
function paceEase(points: Pace) {
  const xs = [0, ...points.map((p) => p[0]), 1];
  const ys = [0, ...points.map((p) => p[1]), 1];
  const n = xs.length;
  const d = xs.slice(0, -1).map((x, i) => (ys[i + 1] - ys[i]) / (xs[i + 1] - x));
  const m = xs.map((_, i) => (i === 0 || i === n - 1 ? 0 : d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2));
  for (let i = 0; i < n - 1; i++) {
    const a = m[i] / d[i];
    const b = m[i + 1] / d[i];
    const r = a * a + b * b;
    if (r > 9) {
      const k = 3 / Math.sqrt(r);
      m[i] = k * a * d[i];
      m[i + 1] = k * b * d[i];
    }
  }
  return (x: number) => {
    let i = 0;
    while (i < n - 2 && x > xs[i + 1]) i++;
    const h = xs[i + 1] - xs[i];
    const t = (x - xs[i]) / h;
    const t2 = t * t;
    const t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h * m[i + 1];
  };
}

function hold(cap: number = step.maxHold) {
  setPhase("holding");
  holdStart = performance.now();
  holdCap = cap;
}

type GoOpts = { immediate?: boolean; duration?: number; keepInner?: boolean };

/** Glide to chapter `i` (also used by the progress UI's "Details & RSVP"). */
export function goTo(index: number, opts: GoOpts = {}) {
  const i = clamp(index, 0, SCENES.length - 1);
  const y = stopY(i);
  if (y === null) return;
  const from = window.scrollY;
  const prev = current;
  const dir = i >= current ? 1 : -1;
  // A reading chapter is entered at the edge you arrive from.
  const inner = scrollerOf(i);
  if (inner && !opts.keepInner) inner.scrollTop = dir > 0 ? 0 : inner.scrollHeight;
  current = i;
  tween?.kill();

  if (opts.immediate || Math.abs(y - from) < 1) {
    window.scrollTo(0, y);
    setPhase("idle");
    return;
  }
  const screens = Math.abs(y - from) / vh();
  // A one-chapter step can have its own pace (`glide` on the later chapter of the pair).
  const later = SCENES[Math.max(i, prev)] as { glide?: number; pace?: Pace };
  const single = Math.abs(i - prev) === 1;
  const paced = single ? later.glide : undefined;
  let pace: ((x: number) => number) | null = null;
  if (single && later.pace && !env.reducedMotion) {
    const f = paceEase(later.pace);
    pace = dir > 0 ? f : (x) => 1 - f(1 - x); // mirrored going back
  }
  const duration = opts.duration ?? (env.reducedMotion ? step.reduced : (paced ?? clamp(step.base + step.perScreen * screens, step.min, step.max)));
  setPhase("moving");
  proxy.y = from;
  tween = gsap.to(proxy, {
    y,
    duration,
    // A paced step moves evenly (or along its own `pace`), so its key moment isn't rushed.
    ease: pace ?? (env.reducedMotion || paced ? "sine.inOut" : step.ease),
    onUpdate: () => window.scrollTo(0, proxy.y),
    onComplete: () => hold(),
  });
}

export function goToScene(id: SceneId) {
  goTo(SCENES.findIndex((s) => s.id === id));
}

/** One step forward/back — only when the current scene has settled. */
function request(dir: 1 | -1) {
  if (phase === "holding") nudgeAll();
  if (phase !== "idle") return;
  const next = current + dir;
  if (next < 0 || next >= SCENES.length) return;
  goTo(next);
}

/** Per frame (shared GSAP ticker): release the hold once the scene has settled. */
export function tickStepper() {
  if (phase !== "holding") return;
  const t = (performance.now() - holdStart) / 1000;
  if (t < step.minHold) return;
  if (t < holdCap && anyBusy()) return;
  setPhase("idle");
}

// ---------- Input ----------

let lastWheel = 0;
let lastAbs = 0;

function onWheel(e: WheelEvent) {
  if (e.ctrlKey) return; // pinch-zoom on trackpads
  const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? vh() : 1;
  const dy = e.deltaY * unit;
  const abs = Math.abs(dy);
  const now = performance.now();
  // New gesture = after a pause, or a clearly stronger flick during a decaying momentum tail.
  const fresh = now - lastWheel > step.wheelGap || (abs > lastAbs * 1.6 && abs > 25);
  lastWheel = now;
  lastAbs = abs;
  const dir: 1 | -1 = dy > 0 ? 1 : -1;
  if (phase === "idle" && canScroll(scrollerOf(current), dir) && abs > 0) return; // read on, natively
  e.preventDefault();
  if (abs < 2 || abs < Math.abs(e.deltaX * unit)) return; // horizontal or noise
  if (fresh) request(dir);
}

/** `settled`: the swipe began after the scene settled (a swipe begun while locked never counts).
 *  `canUp` / `canDown`: whether the reading chapter under the finger could still scroll then. */
type Touch0 = { y: number; time: number; settled: boolean; canUp: boolean; canDown: boolean };
let touch: Touch0 | null = null;

function onTouchStart(e: TouchEvent) {
  if (e.touches.length !== 1) return void (touch = null);
  const inner = (e.target as Element | null)?.closest<HTMLElement>(".chapter__scroll") ?? null;
  touch = { y: e.touches[0].clientY, time: performance.now(), settled: phase === "idle", canUp: canScroll(inner, -1), canDown: canScroll(inner, 1) };
}

function onTouchMove(e: TouchEvent) {
  // The page itself never pans (CSS touch-action); reading scrollers pan natively.
  const inReader = (e.target as Element | null)?.closest(".chapter__scroll");
  if (touch && !inReader && e.touches.length === 1 && e.cancelable) e.preventDefault();
}

function onTouchEnd(e: TouchEvent) {
  const g = touch;
  touch = null;
  if (!g) return;
  if (!g.settled) return void (phase === "holding" && nudgeAll());
  const dy = g.y - e.changedTouches[0].clientY;
  const quick = performance.now() - g.time < 250;
  if (Math.abs(dy) < (quick ? step.swipe / 2 : step.swipe)) return;
  const dir: 1 | -1 = dy > 0 ? 1 : -1;
  if (dir > 0 ? g.canDown : g.canUp) return; // that swipe scrolled the reading chapter
  request(dir);
}

const clearTouch = () => void (touch = null);

function onKey(e: KeyboardEvent) {
  if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
  const t = e.target as HTMLElement | null;
  if (t?.closest("input, textarea, select, [contenteditable]")) return;
  if (e.key === " " && t?.closest("button, a, label, summary")) return;

  let dir: 1 | -1;
  let page = true;
  switch (e.key) {
    case "ArrowDown": dir = 1; page = false; break;
    case "ArrowUp": dir = -1; page = false; break;
    case "PageDown": dir = 1; break;
    case "PageUp": dir = -1; break;
    case " ": dir = e.shiftKey ? -1 : 1; break;
    case "Home": e.preventDefault(); if (phase !== "moving") goTo(0); return;
    case "End": e.preventDefault(); if (phase !== "moving") goTo(SCENES.length - 1); return;
    default: return;
  }
  e.preventDefault();
  const inner = scrollerOf(current);
  if (phase === "idle" && canScroll(inner, dir)) {
    inner!.scrollBy({ top: dir * (page ? inner!.clientHeight * 0.85 : 80), behavior: env.reducedMotion ? "auto" : "smooth" });
    return;
  }
  if (!e.repeat) request(dir);
}

let settleTimer = 0;
function onScroll() {
  if (phase === "moving") return;
  window.clearTimeout(settleTimer);
  settleTimer = window.setTimeout(() => {
    if (phase === "moving") return;
    const at = stopY(current);
    if (at !== null && Math.abs(window.scrollY - at) < 2) return;
    goTo(nearest(), { duration: env.reducedMotion ? step.reduced : step.min, keepInner: true });
  }, 180);
}

let resizeTimer = 0;
function onResize() {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(() => phase !== "moving" && goTo(current, { immediate: true, keepInner: true }), 150);
}

/** Wire input. Starts at the URL's #chapter if any, else the nearest chapter.
 *  `?free` (QA only) leaves the stepper off so scripts can scroll to any position. */
export function initStepper() {
  if (new URLSearchParams(location.search).has("free")) return () => {};
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  const fromHash = SCENES.findIndex((s) => s.id === location.hash.slice(1));
  goTo(fromHash >= 0 ? fromHash : nearest(), { immediate: true });
  // The opening sequence plays on load; the first step waits for it (a scroll fast-forwards it).
  if (current === 0) hold(12);

  const opts = { passive: false } as const;
  window.addEventListener("wheel", onWheel, opts);
  window.addEventListener("touchstart", onTouchStart, { passive: true });
  window.addEventListener("touchmove", onTouchMove, opts);
  window.addEventListener("touchend", onTouchEnd);
  window.addEventListener("touchcancel", clearTouch);
  window.addEventListener("keydown", onKey);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize);
  return () => {
    tween?.kill();
    window.clearTimeout(settleTimer);
    window.clearTimeout(resizeTimer);
    window.removeEventListener("wheel", onWheel);
    window.removeEventListener("touchstart", onTouchStart);
    window.removeEventListener("touchmove", onTouchMove);
    window.removeEventListener("touchend", onTouchEnd);
    window.removeEventListener("touchcancel", clearTouch);
    window.removeEventListener("keydown", onKey);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onResize);
  };
}
