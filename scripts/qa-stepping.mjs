#!/usr/bin/env node
/**
 * QA for the scene stepper (one scroll = one chapter). Zero dependencies: drives the
 * installed Google Chrome (GPU-accelerated headless; software WebGL runs this page at a few
 * fps, which distorts input timing) with REAL input events (mouse wheel and touch). Checks:
 *   • one flick with a long momentum tail moves exactly one chapter
 *   • gestures during a glide or hold are ignored (nothing is skipped)
 *   • a long, fast wheel spin still moves only one chapter
 *   • reading chapters scroll inside, and step on only at their edge
 *   • stepping through every chapter visits each once, in order
 * and reports frame rate during each glide (smoothness).
 *
 *   pnpm dev            # in another terminal
 *   node scripts/qa-stepping.mjs [url]
 *   QA_TOUCH=1 node scripts/qa-stepping.mjs    # phone viewport with touch swipes
 *   QA_FILM=family node scripts/qa-stepping.mjs   # also film the step into that chapter → docs/qa/step/ (QA_FILM_FRAMES, every 220 ms)
 *   QA_DEVICE=android QA_THROTTLE=4 QA_GL=soft node scripts/qa-stepping.mjs
 *     # mid-range Android stand-in: 412×915 @2.625, Android UA, touch, CPU ÷4, software GPU (a weak GPU:
 *     # absolute fps is pessimistic, use it to compare before/after). Also reports fps at rest per chapter.
 */
import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const URL_ = process.argv[2] ?? "http://localhost:3200/";
const CHROME = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9334;
const ANDROID = process.env.QA_DEVICE === "android";
const TOUCH = Boolean(process.env.QA_TOUCH) || ANDROID;
const THROTTLE = Number(process.env.QA_THROTTLE || 1);
const SOFT_GL = process.env.QA_GL === "soft";
const ANDROID_UA = "Mozilla/5.0 (Linux; Android 14; SM-A546B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36";
const FILM = process.env.QA_FILM;
const VP = ANDROID ? { width: 412, height: 915, mobile: true, dpr: 2.625 } : TOUCH ? { width: 390, height: 844, mobile: true, dpr: 1 } : { width: 1440, height: 900, mobile: false, dpr: 1 };
const ORDER = ["The Invitation", "The Beginning", "The Two of Us", "Family", "The Promise", "The Entourage", "The Ceremony", "The Celebration", "The Details", "The Closing"];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const chrome = spawn(CHROME, [
  "--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), "qa-step-"))}`,
  "--no-first-run", "--no-default-browser-check", "--hide-scrollbars", ...(SOFT_GL ? ["--enable-unsafe-swiftshader", "--use-angle=swiftshader"] : ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"]), "about:blank",
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

const state = () => evaluate(`({ y: Math.round(scrollY), step: document.documentElement.dataset.step, title: document.querySelector('.progress__title')?.textContent })`);
const waitIdle = async (max = 15000) => {
  const t = Date.now();
  while (Date.now() - t < max) {
    if ((await state()).step === "idle") return Date.now() - t;
    await sleep(50);
  }
  throw new Error("never became idle");
};

/** A trackpad-style flick: ramps up, then a long decaying momentum tail (~0.8 s). */
async function flick(dir = 1, peak = 110, n = 50) {
  for (let i = 0; i < n; i++) {
    const d = i < 4 ? (peak * (i + 1)) / 4 : peak * Math.pow(0.92, i - 4);
    await send("Input.dispatchMouseEvent", { type: "mouseWheel", x: VP.width / 2, y: VP.height / 2, deltaX: 0, deltaY: dir * Math.max(1, d) });
    await sleep(16);
  }
}
/** A mouse wheel spun hard: many full notches, back to back. */
async function spin(dir = 1, n = 40) {
  for (let i = 0; i < n; i++) {
    await send("Input.dispatchMouseEvent", { type: "mouseWheel", x: VP.width / 2, y: VP.height / 2, deltaX: 0, deltaY: dir * 100 });
    await sleep(12);
  }
}
/** A finger swipe (dir 1 = swipe up = next chapter). */
async function swipe(dir = 1, dist = 320, x = VP.width / 2) {
  const y0 = VP.height / 2 + (dir * dist) / 2;
  const pts = 8;
  await send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y: y0 }] });
  for (let i = 1; i <= pts; i++) {
    await send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y: y0 - (dir * dist * i) / pts }] });
    await sleep(16);
  }
  await send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}
const gesture = (dir = 1) => (TOUCH ? swipe(dir) : flick(dir));

const results = [];
const check = (name, ok, detail = "") => {
  results.push(ok);
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`);
};

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
  const errors = [];
  ws.addEventListener("message", (e) => {
    const m = JSON.parse(e.data);
    if (m.method === "Runtime.exceptionThrown") errors.push(m.params.exceptionDetails.text);
  });
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: VP.width, height: VP.height, deviceScaleFactor: VP.dpr, mobile: VP.mobile });
  if (ANDROID) await send("Emulation.setUserAgentOverride", { userAgent: ANDROID_UA, platform: "Linux armv8l", userAgentMetadata: { platform: "Android", platformVersion: "14", architecture: "arm", model: "SM-A546B", mobile: true, brands: [{ brand: "Chromium", version: "129" }] } });
  if (THROTTLE > 1) await send("Emulation.setCPUThrottlingRate", { rate: THROTTLE });
  await send("Emulation.setTouchEmulationEnabled", { enabled: TOUCH });
  await send("Page.navigate", { url: URL_ });
  await sleep(3000);
  // Frame timing while gliding: per step, average fps and the worst frame.
  const SAMPLER = `window.__glides = []; let cur = null, last = 0;
    const f = (t) => { const moving = document.documentElement.dataset.step === "moving";
      if (moving && !cur) { cur = { to: "", n: 0, worst: 0, t0: t }; last = t; }
      else if (moving) { cur.n++; cur.worst = Math.max(cur.worst, t - last); last = t; }
      else if (cur) { cur.to = document.querySelector(".progress__title")?.textContent; cur.fps = Math.round(cur.n / ((t - cur.t0) / 1000)); __glides.push(cur); cur = null; }
      requestAnimationFrame(f); };
    requestAnimationFrame(f); true`;
  await evaluate(SAMPLER);
  console.log(`viewport ${VP.width}x${VP.height} ${TOUCH ? "touch" : "wheel"} · waiting for the opening: ${await waitIdle(20000)} ms more`);

  // Film the step into a chapter first, on a fresh load (optional), then reload for the checks.
  if (FILM) {
    const target = ORDER.findIndex((t) => t.toLowerCase().includes(FILM.toLowerCase()));
    mkdirSync("docs/qa/step", { recursive: true });
    // Get to the chapter before the target (Home first if we're already past it).
    if (ORDER.indexOf((await state()).title) > target - 1) {
      await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Home", code: "Home", windowsVirtualKeyCode: 36 });
      await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Home", code: "Home", windowsVirtualKeyCode: 36 });
      await sleep(300);
      await waitIdle();
    }
    while ((await state()).title !== ORDER[target - 1]) { await gesture(1); await waitIdle(); }
    await sleep(400);
    const film = gesture(1);
    const frames = Number(process.env.QA_FILM_FRAMES || 14);
    for (let k = 0; k < frames; k++) {
      const { data } = await send("Page.captureScreenshot", { format: "jpeg", quality: 55 });
      writeFileSync(join("docs/qa/step", `${FILM}-${String(k).padStart(2, "0")}.jpg`), Buffer.from(data, "base64"));
      await sleep(220);
    }
    await film;
    await waitIdle();
    console.log(`filmed the step into ${ORDER[target]} → docs/qa/step/ (${frames} frames)`);
    await send("Page.reload");
    await sleep(3000);
    await waitIdle(20000);
    await evaluate(SAMPLER);
  }

  // 1. One gesture = one chapter.
  let s = await state();
  await gesture(1);
  const moveMs = await waitIdle();
  let s2 = await state();
  check("one gesture moves exactly one chapter", s2.title === ORDER[1], `${s.title} → ${s2.title}, glide+hold ${moveMs} ms`);

  // 2. Keep gesturing through the whole glide and hold. The rule: a gesture that BEGINS while
  // the page is locked never moves it (one begun after it settled may — that's the next scroll).
  // The page logs each gesture (phase when it began, when it ended) and each step start; every
  // step is attributed to the last gesture that ended before it.
  await evaluate(`(() => {
    const root = document.documentElement;
    window.__gest = []; window.__steps = [];
    let cur = null, lastWheel = 0;
    addEventListener("touchstart", () => { cur = { phase: root.dataset.step }; }, { capture: true });
    addEventListener("touchend", () => { if (cur) { cur.end = performance.now(); window.__gest.push(cur); cur = null; } }, { capture: true });
    addEventListener("wheel", () => { const now = performance.now(); if (now - lastWheel > 200) window.__gest.push({ phase: root.dataset.step, end: now }); lastWheel = now; }, { capture: true });
    let prev = root.dataset.step;
    new MutationObserver(() => { const now = root.dataset.step; if (now === "moving" && prev !== "moving") window.__steps.push(performance.now()); prev = now; }).observe(root, { attributes: true, attributeFilter: ["data-step"] });
    return true; })()`);
  let from = ORDER.indexOf((await state()).title);
  await gesture(1);
  await sleep(TOUCH ? 100 : 260);
  while ((await state()).step !== "idle") {
    await gesture(1);
    await sleep(TOUCH ? 100 : 260); // wheel: past the 200 ms gap, so each flick is its own gesture
  }
  await waitIdle();
  s = await state();
  const { gest, steps } = await evaluate("({ gest: window.__gest, steps: window.__steps })");
  const culprits = steps.map((t) => gest.filter((g) => g.end <= t + 1).at(-1)).filter((g) => g && g.phase !== "idle");
  const lockedCount = gest.filter((g) => g.phase !== "idle").length;
  check(
    "gestures during a glide or hold never skip a chapter",
    culprits.length === 0 && lockedCount > 0,
    `${gest.length} gestures, ${lockedCount} begun while locked, ${culprits.length} of those moved the page; ${steps.length} step(s): ${ORDER[from]} → ${s.title}`,
  );

  // 3. A hard, long wheel spin (desktop) or a very long swipe (touch) = one chapter.
  from = ORDER.indexOf(s.title);
  if (TOUCH) await swipe(1, 700);
  else await spin(1, 60);
  await waitIdle();
  s = await state();
  check(TOUCH ? "a long swipe moves one chapter" : "a hard wheel spin moves one chapter", ORDER.indexOf(s.title) === from + 1, `${ORDER[from]} → ${s.title}`);

  // 5. Step through everything; each chapter once, in order. Reading chapters: scroll inside first.
  const visited = [(await state()).title];
  const restFps = [];
  let innerScrolled = 0;
  let edgeStepOk = true;
  for (let guard = 0; guard < 40 && visited.at(-1) !== ORDER.at(-1); guard++) {
    const before = await state();
    await gesture(1);
    await waitIdle();
    await sleep(250); // a real pause between gestures
    const after = await state();
    if (process.env.QA_REST_FPS !== "0") {
      const fps = await evaluate(`new Promise((r) => { let n = 0; const t0 = performance.now(); const f = () => { n++; performance.now() - t0 < 1500 ? requestAnimationFrame(f) : r(Math.round(n / ((performance.now() - t0) / 1000))); }; requestAnimationFrame(f); })`);
      restFps.push(`${after.title}: ${fps}`);
    }
    if (after.title === before.title) {
      const sel = `document.getElementById(${JSON.stringify(before.title === "The Details" ? "details" : "entourage")})?.querySelector('.chapter__scroll')`;
      const inner = await evaluate(`(() => { const s = ${sel}; return s ? { top: s.scrollTop, max: s.scrollHeight - s.clientHeight } : null; })()`);
      if (!inner) edgeStepOk = false; // a pinned chapter refused a settled gesture
      else if (TOUCH) {
        // DevTools touches don't pan natively: the swipe was (correctly) kept for reading,
        // so read to the end the way a finger would, then swipe on.
        innerScrolled++;
        await evaluate(`${sel}.scrollTop = 1e6`);
      } else if (inner.top > 0) innerScrolled++;
      else edgeStepOk = false;
    } else visited.push(after.title);
  }
  const expected = ORDER.slice(ORDER.indexOf(visited[0]));
  check("every chapter visited once, in order", JSON.stringify(visited) === JSON.stringify(expected), visited.join(" → "));
  check("reading chapters scroll inside before stepping on", innerScrolled > 0 && edgeStepOk, `${innerScrolled} inner scrolls`);

  // 6. Backwards works too.
  await gesture(-1);
  await waitIdle();
  s = await state();
  check("a gesture back moves one chapter back", s.title === ORDER.at(-2), `now on ${s.title}`);

  // 7. Typing in the RSVP form never moves the page (Space, arrows inside fields).
  await evaluate(`document.querySelector('#details input[name="name"]').focus(); true`);
  for (const ch of "Ana Luz") {
    if (ch === " ") {
      await send("Input.dispatchKeyEvent", { type: "keyDown", key: " ", code: "Space", text: " ", windowsVirtualKeyCode: 32 });
      await send("Input.dispatchKeyEvent", { type: "keyUp", key: " ", code: "Space", windowsVirtualKeyCode: 32 });
    } else await send("Input.insertText", { text: ch });
  }
  await sleep(600);
  s = await state();
  const typed = await evaluate(`document.querySelector('#details input[name="name"]').value`);
  check("typing a space in an RSVP field keeps the page still", s.title === "The Details" && s.step === "idle" && typed === "Ana Luz", `"${typed}" on ${s.title}`);
  await evaluate(`document.querySelector('#details input[name="name"]').value = ''; document.activeElement.blur(); true`);

  // 8. Keyboard: at the end of the Details reader, ArrowDown steps on; Home goes to the start.
  await evaluate(`document.querySelector('#details .chapter__scroll').scrollTop = 1e6; true`);
  await sleep(400);
  const key = async (k, code, vk) => {
    await send("Input.dispatchKeyEvent", { type: "keyDown", key: k, code, windowsVirtualKeyCode: vk });
    await send("Input.dispatchKeyEvent", { type: "keyUp", key: k, code, windowsVirtualKeyCode: vk });
  };
  await key("ArrowDown", "ArrowDown", 40);
  await waitIdle();
  s = await state();
  check("ArrowDown steps to the next chapter", s.title === "The Closing", `now on ${s.title}`);
  await key("Home", "Home", 36);
  await waitIdle();
  s = await state();
  check("Home returns to the invitation", s.title === "The Invitation", `now on ${s.title}`);

  // 9. The header's "Details & RSVP" link glides straight there.
  await evaluate(`document.querySelector('.progress__skip').click(); true`);
  await sleep(300);
  await waitIdle();
  s = await state();
  check('"Details & RSVP" link goes to The Details', s.title === "The Details", `now on ${s.title}`);

  if (restFps.length) console.log("fps at rest:", restFps.join(" · "));
  console.log("tier:", await evaluate("document.documentElement.dataset.tier"));
  const glides = await evaluate("__glides");
  console.log("glides (→ chapter: avg fps, worst frame ms):");
  for (const g of glides) console.log(`  → ${g.to}: ${g.fps} fps, worst ${Math.round(g.worst)} ms`);
  console.log(errors.length ? `console errors:\n  ${errors.join("\n  ")}` : "console errors: none");
  if (results.some((r) => !r) || errors.length) process.exitCode = 1;
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
