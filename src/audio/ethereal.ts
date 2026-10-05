"use client";

import { createStore } from "@/lib/store";

/**
 * The invitation's sound: an ethereal pad and a soft bell on every chapter change, built with
 * the Web Audio API — no files to download, no seam in the loop, nothing to license.
 *
 *  • A slow four-chord progression (A major, 7ths) breathes under the whole invitation: each
 *    chord holds ~16 s and cross-fades into the next, through a generated reverb.
 *  • Every scene step rings one bell, tuned to the chord that is playing, so the sound moves
 *    with the story instead of repeating one effect.
 *  • Nothing is created until a guest's first scroll (browsers only allow audio after a real
 *    gesture, and silence by default is the polite way round). A guest can mute at any time;
 *    the choice is remembered on their device.
 */

const STORE_KEY = "hl-sound";
const FADE_IN = 4; // s — the pad arrives slowly
const FADE_OUT = 1.2;
const CHORD_HOLD = 16; // s per chord, with a long cross-fade
const CHORD_FADE = 6;

/** A major, four chords: Amaj7 → F#m7 → Dmaj7 → Esus2/6. Midi notes, low and open. */
const PROGRESSION = [
  [57, 61, 64, 68], // A3 C#4 E4 G#4
  [54, 57, 61, 64], // F#3 A3 C#4 E4
  [50, 54, 57, 61], // D3 F#3 A3 C#4
  [52, 59, 61, 66], // E3 B3 C#4 F#4
] as const;

/** Bell pitches per chapter (one octave up from the chord's voices), in step order. */
const BELL_STEPS = [0, 2, 1, 3, 2, 0, 3, 1, 2, 0] as const;

const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

/** `on`: the guest hears sound now. `available`: the engine has been started at least once. */
export const soundState = createStore<{ on: boolean; started: boolean }>({ on: false, started: false });

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let padBus: GainNode | null = null;
let bellBus: GainNode | null = null;
let chordIndex = 0;
let chordTimer = 0;
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

/** A short, soft reverb tail built from decaying noise — the "ethereal" of it. */
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

/** One chord: each note as two slightly detuned voices, swelling in and out. */
function playChord(notes: readonly number[], at: number) {
  if (!ctx || !padBus) return;
  const ac = ctx;
  notes.forEach((note, i) => {
    for (const detune of [-5, 5]) {
      const osc = ac.createOscillator();
      osc.type = i === 0 ? "sine" : "triangle";
      osc.frequency.value = midi(note);
      osc.detune.value = detune;

      const tone = ac.createBiquadFilter();
      tone.type = "lowpass";
      tone.frequency.value = 900 + i * 180;
      tone.Q.value = 0.4;

      const gain = ac.createGain();
      const level = (i === 0 ? 0.16 : 0.1) / notes.length;
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(level, at + CHORD_FADE);
      gain.gain.setValueAtTime(level, at + CHORD_HOLD - CHORD_FADE * 0.5);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + CHORD_HOLD + CHORD_FADE * 0.5);

      osc.connect(tone).connect(gain).connect(padBus!);
      osc.start(at);
      osc.stop(at + CHORD_HOLD + CHORD_FADE);
    }
  });
}

function scheduleChords() {
  if (!ctx || stopped) return;
  playChord(PROGRESSION[chordIndex % PROGRESSION.length], ctx.currentTime + 0.05);
  chordIndex++;
  chordTimer = window.setTimeout(scheduleChords, (CHORD_HOLD - CHORD_FADE * 0.5) * 1000);
}

/**
 * One bell for a chapter change: a struck tone with inharmonic partials and a long tail,
 * tuned to the chord that is playing. `step` is the chapter index, so the pitch travels.
 */
export function cue(step: number) {
  if (!ctx || !bellBus || stopped || !soundState.get().on) return;
  const ac = ctx;
  const chord = PROGRESSION[Math.max(0, chordIndex - 1) % PROGRESSION.length];
  const note = chord[BELL_STEPS[((step % BELL_STEPS.length) + BELL_STEPS.length) % BELL_STEPS.length] % chord.length] + 12;
  const base = midi(note);
  const at = ac.currentTime + 0.02;

  // Partials of a small struck bell; the higher ones decay first.
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

/** Starts (or resumes) the sound. Must be called from a real user gesture. */
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
      wet.gain.value = 0.55;
      padBus = ctx.createGain();
      bellBus = ctx.createGain();
      bellBus.gain.value = 0.3; // the bell sits close to the pad, never startling
      padBus.connect(master);
      bellBus.connect(master);
      padBus.connect(reverb);
      bellBus.connect(reverb);
      reverb.connect(wet).connect(master);
      master.connect(ctx.destination);
    }
    void ctx.resume();
    stopped = false;
    master!.gain.cancelScheduledValues(ctx.currentTime);
    master!.gain.setValueAtTime(Math.max(0.0001, master!.gain.value), ctx.currentTime);
    master!.gain.exponentialRampToValueAtTime(0.85, ctx.currentTime + FADE_IN);
    if (!chordTimer) scheduleChords();
    soundState.set({ on: true, started: true });
    remember(true);
  } catch {
    /* no audio on this device: the invitation is unchanged */
  }
}

/** Fades out and silences everything (the engine stays, so turning it back on is instant). */
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
    window.clearTimeout(chordTimer);
    chordTimer = 0;
    void ctx?.suspend();
  }, FADE_OUT * 1000 + 100);
}

export const toggle = () => (soundState.get().on ? stop() : start());

/** The first scroll starts the sound, unless this guest has muted it before. */
export function startOnFirstGesture() {
  if (prefersOff() || soundState.get().started) return;
  start();
}

/** Pause while the tab is in the background; resume when it comes back (if still on). */
export function watchVisibility() {
  const onChange = () => {
    if (!ctx || !soundState.get().on) return;
    if (document.hidden) void ctx.suspend();
    else void ctx.resume();
  };
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}
