#!/usr/bin/env node
/**
 * QA for the invitation's sound (src/audio/ethereal.ts). Zero dependencies: drives Chrome over
 * the DevTools protocol, taps the audio graph with an AnalyserNode (by wrapping
 * AudioNode.connect before the page loads — the app has no test hooks in it) and measures what
 * a guest would actually hear:
 *   • silent until the first scroll
 *   • the song fades in and holds a musical level (never clipping)
 *   • every chapter step plays the bell slide (a spike above the music, climbing in pitch)
 *   • the toggle mutes it, and the choice survives a reload
 *   • the strongest frequencies belong to the song's key (it is music, not noise)
 *
 *   pnpm dev   # in another terminal
 *   node scripts/qa-sound.mjs [url]
 */
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const URL_ = process.argv[2] ?? "http://localhost:3200/";
const CHROME = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9377;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const profile = mkdtempSync(join(tmpdir(), "qa-"));
// Chrome writes a full profile here each run; left behind they fill the disk.
process.on("exit", () => { try { rmSync(profile, { recursive: true, force: true }); } catch {} });
const chrome = spawn(CHROME, [
  "--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
  "--no-first-run", "--no-default-browser-check", "--hide-scrollbars", "--mute-audio", // measured in-page, not played
  // Synthetic touches do not count as interaction for <audio>.play(), though a real tap does.
  // Without this the song could never start here; the app still only calls play() on a gesture,
  // so "silent until the first scroll" below is still a real check.
  "--autoplay-policy=no-user-gesture-required",
  "--use-angle=metal", "--enable-gpu", "about:blank",
], { stdio: "ignore" });

let ws;
let seq = 0;
const pending = new Map();
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = ++seq;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
const evaluate = async (expression) => (await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true })).result.value;

const results = [];
const check = (name, ok, detail = "") => {
  results.push(ok);
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`);
};

/** Installed before any page script: puts an analyser on whatever reaches the speakers. */
const TAP = `(() => {
  const connect = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function (dest, ...rest) {
    if (dest instanceof AudioDestinationNode && !window.__analyser) {
      const an = this.context.createAnalyser();
      an.fftSize = 4096;
      an.smoothingTimeConstant = 0;
      connect.call(this, an);
      window.__analyser = an;
    }
    return connect.call(this, dest, ...rest);
  };
  window.__rms = () => {
    const an = window.__analyser;
    if (!an) return null;
    const buf = new Float32Array(an.fftSize);
    an.getFloatTimeDomainData(buf);
    let sum = 0, peak = 0;
    for (const v of buf) { sum += v * v; peak = Math.max(peak, Math.abs(v)); }
    return { rms: Math.sqrt(sum / buf.length), peak };
  };
  // A handle on the song, so a check can hear the bell slide by itself. The app has no test
  // hooks; this notes every media element that plays and can mute the song for a moment.
  window.__media = [];
  const play = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function (...args) {
    if (!window.__media.includes(this)) window.__media.push(this);
    return play.apply(this, args);
  };
  window.__song = () => window.__media.find((m) => (m.src || "").includes("music.mp3")) || null;
  // Pause it, rather than mute it: through a MediaElementAudioSourceNode, Chrome keeps feeding
  // the graph whatever the element's own muted flag says.
  window.__hush = (on) => {
    const song = window.__song();
    if (!song) return false;
    if (on) song.pause();
    else void song.play().catch(() => {});
    return true;
  };
  window.__band = (lo, hi) => {
    const an = window.__analyser;
    if (!an) return 0;
    const bins = new Float32Array(an.frequencyBinCount);
    an.getFloatFrequencyData(bins);
    const hz = an.context.sampleRate / an.fftSize;
    let sum = 0, n = 0;
    bins.forEach((db, i) => {
      const f = i * hz;
      if (f < lo || f > hi) return;
      sum += Math.pow(10, db / 20); n += 1;
    });
    return n ? sum / n : 0;
  };
  window.__centroid = () => {
    const an = window.__analyser;
    if (!an) return 0;
    const bins = new Float32Array(an.frequencyBinCount);
    an.getFloatFrequencyData(bins);
    const hz = an.context.sampleRate / an.fftSize;
    let num = 0, den = 0;
    bins.forEach((db, i) => {
      const f = i * hz;
      if (f < 80 || f > 8000) return;
      const mag = Math.pow(10, db / 20);
      num += f * mag; den += mag;
    });
    return den ? num / den : 0;
  };
  window.__tones = () => {
    const an = window.__analyser;
    if (!an) return [];
    const bins = new Float32Array(an.frequencyBinCount);
    an.getFloatFrequencyData(bins);
    const hz = an.context.sampleRate / an.fftSize;
    return [...bins].map((db, i) => ({ hz: Math.round(i * hz), db }))
      .filter((b) => b.hz > 60 && b.hz < 2000)
      .sort((a, b) => b.db - a.db).slice(0, 6);
  };
})()`;

async function connect() {
  for (let i = 0; i < 50; i++) {
    try {
      const page = (await (await fetch(`http://127.0.0.1:${PORT}/json`)).json()).find((t) => t.type === "page");
      if (page) return page.webSocketDebuggerUrl;
    } catch {}
    await sleep(200);
  }
  throw new Error("Chrome did not start");
}

const swipe = async (dist = 320) => {
  const y0 = 600;
  await send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 195, y: y0 }] });
  for (let i = 1; i <= 8; i++) {
    await send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 195, y: y0 - (dist * i) / 8 }] });
    await sleep(16);
  }
  await send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
};
const waitIdle = async (max = 20000) => {
  const t = Date.now();
  while (Date.now() - t < max) {
    if ((await evaluate(`document.documentElement.dataset.step`)) === "idle") return;
    await sleep(100);
  }
};
/** Highest RMS seen over `ms`, sampled fast enough to catch a bell strike. */
async function level(ms) {
  let max = 0;
  let peak = 0;
  const until = Date.now() + ms;
  while (Date.now() < until) {
    const v = await evaluate("window.__rms && window.__rms()");
    if (v) {
      max = Math.max(max, v.rms);
      peak = Math.max(peak, v.peak);
    }
    await sleep(60);
  }
  return { rms: max, peak };
}

async function main() {
  ws = new WebSocket(await connect());
  await new Promise((r) => ws.addEventListener("open", r, { once: true }));
  ws.addEventListener("message", (e) => {
    const msg = JSON.parse(e.data);
    const p = msg.id && pending.get(msg.id);
    if (!p) return;
    pending.delete(msg.id);
    if (msg.error) p.reject(new Error(msg.error.message));
    else p.resolve(msg.result);
  });
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await send("Emulation.setTouchEmulationEnabled", { enabled: true });
  await send("Page.addScriptToEvaluateOnNewDocument", { source: TAP });
  await send("Page.navigate", { url: URL_ });
  await sleep(4000);

  // The page must really be there. Without this guard a dead dev server reads as
  // silence, and the silence checks below pass on nothing at all.
  const loaded = await evaluate(
    `!!document.querySelector(".sound-toggle") && !!document.querySelector("[data-step]")`,
  );
  if (loaded !== true) {
    console.error(
      `\nThe invitation did not load at ${URL_}. Start it with \`pnpm dev\` first — ` +
        `these checks cannot tell a muted page from a missing one.\n`,
    );
    chrome.kill();
    process.exit(2);
  }
  await waitIdle();

  // 1. Silent before any gesture.
  const before = await level(1500);
  check("silent until the first scroll", !(await evaluate("!!window.__analyser")) || before.rms < 0.0005, `rms ${before.rms.toFixed(5)}`);

  // 2. The first scroll starts the pad; it fades in.
  await swipe();
  await waitIdle();
  await sleep(4000); // the fade is slow on purpose
  const pad = await level(2500);
  check("the song plays after the first gesture", pad.rms > 0.004, `rms ${pad.rms.toFixed(4)}`);
  check("never clips", pad.peak < 0.99, `peak ${pad.peak.toFixed(3)}`);

  // 3. It is tonal — the loudest frequencies are the chord's notes.
  const tones = await evaluate("window.__tones && window.__tones()");
  // C major, as the song is: the pitches a piano actually plays across these octaves.
  const SCALE = [65.4, 73.4, 82.4, 87.3, 98, 110, 123.5, 130.8, 146.8, 164.8, 174.6, 196, 220, 246.9, 261.6, 293.7, 329.6, 349.2, 392, 440, 493.9, 523.3, 587.3, 659.3, 698.5, 784, 880, 987.8];
  const inKey = (tones ?? []).filter((t) => SCALE.some((n) => Math.abs(t.hz - n) < n * 0.03));
  check("the music is in the song's key (C major)", inKey.length >= 3, (tones ?? []).slice(0, 4).map((t) => `${t.hz}Hz`).join(" "));

  // 3b. The song file was really fetched, so this is the couple's music, not the fallback bell.
  const got = await evaluate(
    `performance.getEntriesByType("resource").filter((r) => r.name.includes("/audio/music.mp3")).length`,
  );
  check("the song file loads", got > 0, `${got} request(s)`);

  // 4. The bell slide plays on each chapter step. The song is muted for a moment so the slide
  // is heard by itself: a plain level spike is no good against a piano, which outpeaks it.
  const hushed = await evaluate("window.__hush && window.__hush(true)");
  await sleep(400); // the paused song takes a moment to leave the graph
  const quiet = await level(1200);
  const ring = (async () => level(2600))();
  await sleep(150);
  await swipe();
  const withSlide = await ring;
  await evaluate("window.__hush && window.__hush(false)");
  check(
    "the bell slide rings on each chapter change",
    hushed === true && withSlide.peak > Math.max(0.01, quiet.peak * 3),
    `without the song ${quiet.peak.toFixed(3)} → with the slide ${withSlide.peak.toFixed(3)}`,
  );
  await waitIdle();

  // 4b. It is the bell *slide*: a harp glissando climbs, so the sound brightens as it plays.
  // The synthesised fallback bell decays from its strike instead, and would fail this.
  const sweep = (async () => {
    const seen = [];
    for (let i = 0; i < 14; i += 1) {
      seen.push(await evaluate("window.__centroid && window.__centroid()"));
      await sleep(90);
    }
    return seen.filter((v) => typeof v === "number" && v > 0);
  })();
  await sleep(120);
  await swipe();
  const curve = await sweep;
  const early = Math.min(...curve.slice(0, 4));
  const later = Math.max(...curve.slice(3));
  check(
    "the chapter change slides upward in pitch",
    curve.length > 6 && later > early * 1.25,
    `${Math.round(early)}Hz → ${Math.round(later)}Hz`,
  );
  await waitIdle();

  // 5. The toggle mutes it.
  await evaluate(`document.querySelector(".sound-toggle").click()`);
  await sleep(2200);
  const muted = await level(1500);
  check("the toggle silences the music", muted.rms < Math.max(0.0008, pad.rms * 0.1), `rms ${muted.rms.toFixed(5)}`);

  // 6. The choice survives a reload: no sound until the guest asks for it.
  await send("Page.reload");
  await sleep(4000);
  await waitIdle();
  await swipe();
  await waitIdle();
  await sleep(3000);
  const afterReload = await level(2000);
  check("muted stays muted after a reload", afterReload.rms < 0.0008, `rms ${afterReload.rms.toFixed(5)}`);
  await evaluate(`document.querySelector(".sound-toggle").click()`);
  await sleep(4000);
  const back = await level(2000);
  check("turning it back on works", back.rms > 0.004, `rms ${back.rms.toFixed(4)}`);

  if (results.some((r) => !r)) process.exitCode = 1;
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => {
    ws?.close();
    chrome.kill();
  });
