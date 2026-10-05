"use client";

import { createStore } from "@/lib/store";

/**
 * The invitation's sound: the couple's song, and a bell slide on every chapter change.
 *
 *  • The song is "Married Life (Up) × Canon in D", a piano cover by Gerard Chua
 *    (`public/audio/music.mp3`, trimmed and levelled for the background). It plays from the
 *    guest's first gesture and loops, fading down and back up across the seam so the return
 *    is not a jolt.
 *  • Every chapter change plays a bell slide — a harp glissando with chimes (Pixabay Content
 *    License), in the song's C major. Travelling back up the invitation plays it reversed. If
 *    that file fails to load, a synthesised bell rings instead.
 *  • Sound is on for every guest, from the first gesture they make: a browser will not let
 *    audio begin before one, so there is no earlier moment to take. The speaker button mutes
 *    it, and only an explicit mute is remembered on their device.
 */

const STORE_KEY = "hl-sound";
const FADE_IN = 3; // s — the song arrives, rather than starting
const FADE_OUT = 1.2;
const MUSIC_LEVEL = 0.72;
const SEAM = 2.2; // s — fade across the loop seam

const MUSIC_URL = "/audio/music.mp3";
const SLIDE_URL = "/audio/bell-slide.mp3";

/** The fallback bell's pitches, in the song's C major, in step order. */
const BELL_NOTES = [72, 76, 79, 77, 76, 72, 81, 79, 76, 72] as const;
const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

/** `on`: the guest hears sound now. `started`: the engine has been started at least once. */
export const soundState = createStore<{ on: boolean; started: boolean }>({ on: false, started: false });

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let musicGain: GainNode | null = null;
let bellBus: GainNode | null = null;
let music: HTMLAudioElement | null = null;
let slide: AudioBuffer | null = null;
let slideBack: AudioBuffer | null = null;
let stopped = true;

const prefersOff = () => {
  try {
    return localStorage.getItem(STORE_KEY) === "off";
  } catch {
    return false;
  }
};
const remember = (on: boolean) => {
  try {
    localStorage.setItem(STORE_KEY, on ? "on" : "off");
  } catch {
    /* private mode: this guest's choice simply isn't remembered */
  }
};

/** A small generated hall, so the bell slide has somewhere to ring. */
function makeReverb(ac: AudioContext) {
  const seconds = 2.6;
  const rate = ac.sampleRate;
  const buffer = ac.createBuffer(2, Math.floor(rate * seconds), rate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < data.length; i++) {
      const t = i / data.length;
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 2.8) * 0.6;
    }
  }
  const convolver = ac.createConvolver();
  convolver.buffer = buffer;
  return convolver;
}

/** Fetch the bell slide once. A failure is not fatal: `cue` falls back to the synthesised bell. */
async function loadSlide(ac: AudioContext) {
  if (slide) return;
  try {
    const res = await fetch(SLIDE_URL);
    if (!res.ok) return;
    const buf = await ac.decodeAudioData(await res.arrayBuffer());
    const back = ac.createBuffer(buf.numberOfChannels, buf.length, buf.sampleRate);
    for (let c = 0; c < buf.numberOfChannels; c += 1) {
      back.copyToChannel(Float32Array.from(buf.getChannelData(c)).reverse(), c);
    }
    slide = buf;
    slideBack = back;
  } catch {
    /* no slide: the bell below still rings */
  }
}

/**
 * The song, routed through the graph so the toggle governs it. It loops, and because a piano
 * piece does not end where it begins, the last couple of seconds fade down and the first fade
 * back up.
 */
function makeMusic(ac: AudioContext, out: GainNode) {
  const el = new Audio(MUSIC_URL);
  el.loop = true;
  el.preload = "auto";
  ac.createMediaElementSource(el).connect(out);
  el.addEventListener("timeupdate", () => {
    if (!musicGain || !ctx || !el.duration) return;
    const left = el.duration - el.currentTime;
    const seam = left < SEAM ? left / SEAM : Math.min(1, el.currentTime / SEAM);
    musicGain.gain.setTargetAtTime(MUSIC_LEVEL * Math.max(0.12, seam), ctx.currentTime, 0.25);
  });
  return el;
}

/** One chapter change: the bell slide, running with the direction of travel. */
export function cue(step: number, dir = 1) {
  if (!ctx || !bellBus || stopped || !soundState.get().on) return;
  const buf = dir < 0 ? slideBack : slide;
  if (buf) {
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(bellBus);
    src.start(ctx.currentTime + 0.02);
    return;
  }
  synthBell(step);
}

/** The fallback: partials of a small struck bell, in the song's key. */
function synthBell(step: number) {
  if (!ctx || !bellBus) return;
  const ac = ctx;
  const base = midi(BELL_NOTES[((step % BELL_NOTES.length) + BELL_NOTES.length) % BELL_NOTES.length]);
  const at = ac.currentTime + 0.02;

  for (const [ratio, level, decay] of [
    [1, 0.5, 3.6],
    [2, 0.26, 2.4],
    [2.76, 0.16, 1.7],
    [5.4, 0.07, 1.1],
  ] as const) {
    const osc = ac.createOscillator();
    osc.type = "sine";
    osc.frequency.value = base * ratio;
    const gain = ac.createGain();
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(level, at + 0.012); // the strike
    gain.gain.exponentialRampToValueAtTime(0.0001, at + decay);
    osc.connect(gain).connect(bellBus!);
    osc.start(at);
    osc.stop(at + decay + 0.1);
  }
}

export function start() {
  if (soundState.get().on) return;
  try {
    if (!ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.0001;
      const reverb = makeReverb(ctx);
      const wet = ctx.createGain();
      wet.gain.value = 0.3; // the song carries its own room; this is for the bell
      musicGain = ctx.createGain();
      musicGain.gain.value = MUSIC_LEVEL;
      bellBus = ctx.createGain();
      bellBus.gain.value = 0.32; // the slide sits with the piano, never over it
      musicGain.connect(master);
      bellBus.connect(master);
      bellBus.connect(reverb);
      reverb.connect(wet).connect(master);
      master.connect(ctx.destination);
      music = makeMusic(ctx, musicGain);
    }
    void ctx.resume();
    void loadSlide(ctx); // the first chapter change may still use the bell above
    stopped = false;
    soundState.set({ on: true, started: true });
    remember(true);
    playMusic();
    master!.gain.cancelScheduledValues(ctx.currentTime);
    master!.gain.setValueAtTime(0.0001, ctx.currentTime);
    master!.gain.exponentialRampToValueAtTime(0.9, ctx.currentTime + FADE_IN);
  } catch {
    /* no Web Audio here: the invitation is silent, and otherwise unchanged */
  }
}

/**
 * Ask the song to play. A browser may still refuse — `play()` only counts inside a gesture,
 * and a stricter one (iOS with Low Power Mode, a tab restored from the background) can reject
 * it anyway — so a refusal re-arms the listener and the guest's next touch tries again.
 */
function playMusic() {
  void music?.play().catch(() => {
    if (!soundState.get().on) return;
    const retry = () => {
      void music?.play().catch(() => {});
      window.removeEventListener("pointerdown", retry);
      window.removeEventListener("touchstart", retry);
      window.removeEventListener("keydown", retry);
    };
    window.addEventListener("pointerdown", retry, { passive: true, once: true });
    window.addEventListener("touchstart", retry, { passive: true, once: true });
    window.addEventListener("keydown", retry, { once: true });
  });
}

export function stop() {
  soundState.set({ on: false, started: soundState.get().started });
  remember(false);
  if (!ctx || !master) return;
  master.gain.cancelScheduledValues(ctx.currentTime);
  master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), ctx.currentTime);
  master.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + FADE_OUT);
  window.setTimeout(() => {
    if (soundState.get().on) return; // turned back on meanwhile
    stopped = true;
    music?.pause();
    void ctx?.suspend();
  }, FADE_OUT * 1000 + 100);
}

export const toggle = () => (soundState.get().on ? stop() : start());

/**
 * Sound is on for everyone, so the only question is when a browser will allow it. This runs at
 * the guest's first gesture — a touch, a scroll, a key — not only at a chapter change, so the
 * song is playing as early as it possibly can.
 */
export function startOnFirstGesture() {
  if (prefersOff() || soundState.get().started) return;
  start();
}

/** Listen for that first gesture anywhere on the page, then stop listening. */
export function watchFirstGesture() {
  const events = ["pointerdown", "touchstart", "keydown", "wheel"] as const;
  const once = () => {
    startOnFirstGesture();
    if (soundState.get().started) off();
  };
  const off = () => events.forEach((e) => window.removeEventListener(e, once));
  events.forEach((e) => window.addEventListener(e, once, { passive: true }));
  return off;
}

export function watchVisibility() {
  const onChange = () => {
    if (!ctx || !soundState.get().on) return;
    if (document.hidden) {
      music?.pause();
      void ctx.suspend();
    } else {
      void ctx.resume();
      playMusic();
    }
  };
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}
