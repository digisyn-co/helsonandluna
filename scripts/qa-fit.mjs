#!/usr/bin/env node
/**
 * QA for fit — zero dependencies. Steps through every chapter at a spread of viewports and
 * measures whether anything a guest should read falls outside the screen.
 *
 * The screenshot pass (qa-screenshots.mjs) covers phones and one wide desktop; this covers the
 * sizes in between — tablets, split windows, short laptops — where a chapter is wide enough to
 * keep a large photo but not tall enough to hold the heading under it. That is how the heading
 * on "The Two of Us" came to be cut off at 598×834.
 *
 *   pnpm dev   # in another terminal
 *   node scripts/qa-fit.mjs [url]
 *   QA_FIT_VIEWPORTS=598x834,768x1024 node scripts/qa-fit.mjs
 */
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// `free` turns the scene stepper off, so each chapter can be positioned directly — pressing
// ArrowDown does not work past a flow chapter, whose own scroller swallows the key.
const withFree = (u) => { const x = new URL(u); x.searchParams.set("free", ""); return x.toString(); };
const URL_ = withFree(process.argv[2] ?? "http://localhost:3200/");
const CHROME = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9379;
// [chapter id, progress through its pin at which it is fully composed] — as qa-screenshots.mjs.
const SCENES = [
  ["invitation", 0], ["beginning", 0.95], ["two-of-us", 0.9], ["family", 0.97], ["promise", 0.66],
  ["ceremony", 0.7], ["celebration", 0.75], ["closing", 1],
]; // entourage and details are flow chapters: they scroll inside themselves by design.
const SLACK = 2; // px — rounding, not a layout fault

const ALL = [
  { name: "390x844", width: 390, height: 844, mobile: true }, // iPhone 14
  { name: "430x932", width: 430, height: 932, mobile: true }, // iPhone Pro Max
  { name: "598x834", width: 598, height: 834, mobile: false }, // split window / small tablet
  { name: "768x1024", width: 768, height: 1024, mobile: false }, // iPad portrait
  { name: "820x1180", width: 820, height: 1180, mobile: false }, // iPad Air portrait
  { name: "1024x768", width: 1024, height: 768, mobile: false }, // iPad landscape
  { name: "1280x720", width: 1280, height: 720, mobile: false }, // short laptop
  { name: "1440x900", width: 1440, height: 900, mobile: false },
];
const ONLY = process.env.QA_FIT_VIEWPORTS?.split(",");
const VIEWPORTS = ALL.filter((v) => !ONLY || ONLY.includes(v.name));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const profile = mkdtempSync(join(tmpdir(), "qa-"));
// Chrome writes a full profile here each run; left behind they fill the disk.
process.on("exit", () => { try { rmSync(profile, { recursive: true, force: true }); } catch {} });
const chrome = spawn(CHROME, [
  "--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
  "--no-first-run", "--no-default-browser-check", "--hide-scrollbars", "--mute-audio",
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
const evaluate = async (expression) =>
  (await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true })).result.value;

/**
 * Everything a guest reads, measured against the screen it is on. Runs in the page: finds the
 * chapter layer that is actually visible and reports anything sticking out past the edges.
 */
const MEASURE = `(() => {
  // Only pinned chapters: a "flow" chapter (the entourage list, the details) has its own
  // scroller, so content below the fold there is the point, not a fault. The invitation is
  // its own one-screen section with no pin layer, so it is measured directly.
  const pins = [...document.querySelectorAll(".chapter__pin")];
  const live =
    pins.find((p) => {
      const st = getComputedStyle(p);
      return st.visibility !== "hidden" && Number(st.opacity) > 0.5;
    }) ?? (scrollY < innerHeight * 0.5 ? document.getElementById("invitation") : null);
  if (!live) return { error: "no visible chapter" };
  const chapter = live.closest("section");
  const box = live.getBoundingClientRect();
  const pad = getComputedStyle(live);
  const top = box.top + parseFloat(pad.paddingTop || 0);
  const bottom = box.bottom - parseFloat(pad.paddingBottom || 0);
  const parts = [...live.querySelectorAll("h1, h2, h3, p, figcaption, .meta, li, dd, dt, button, a")];
  const out = [];
  for (const el of parts) {
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;                       // not laid out
    if (Number(getComputedStyle(el).opacity) === 0) continue;         // not revealed yet
    if (el.closest("[aria-hidden='true']")) continue;
    const over = Math.max(0, r.bottom - Math.min(bottom, window.innerHeight)) + Math.max(0, Math.min(top, 0) - r.top);
    const past = Math.max(0, r.bottom - window.innerHeight);
    if (over > 0 || past > 0) {
      out.push({
        text: (el.textContent || "").trim().slice(0, 42),
        tag: el.tagName.toLowerCase(),
        over: Math.round(Math.max(over, past)),
      });
    }
  }
  return { chapter: chapter ? chapter.id : "?", clipped: out };
})()`;

const results = [];
const fail = (vp, chapter, detail) => results.push({ vp, chapter, detail });

async function connect() {
  for (let i = 0; i < 50; i += 1) {
    try {
      const page = (await (await fetch(`http://127.0.0.1:${PORT}/json`)).json()).find((t) => t.type === "page");
      if (page) return page.webSocketDebuggerUrl;
    } catch {}
    await sleep(200);
  }
  throw new Error("Chrome did not start");
}

const waitIdle = async () => {
  for (let i = 0; i < 120; i += 1) {
    if ((await evaluate(`document.documentElement.dataset.step`)) === "idle") return;
    await sleep(100);
  }
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
  await send("Page.enable");
  await send("Runtime.enable");

  for (const vp of VIEWPORTS) {
    await send("Emulation.setDeviceMetricsOverride", {
      width: vp.width, height: vp.height, deviceScaleFactor: vp.mobile ? 2 : 1, mobile: vp.mobile,
    });
    await send("Page.navigate", { url: URL_ });
    await sleep(9000); // loader + opening sequence

    for (const [id, t] of SCENES) {
      await send("Runtime.evaluate", {
        awaitPromise: true,
        expression: `(async () => {
          const el = document.getElementById(${JSON.stringify(id)});
          const top = el.getBoundingClientRect().top + scrollY;
          scrollTo(0, top + ${t} * Math.max(0, el.offsetHeight - innerHeight));
          await new Promise((r) => setTimeout(r, 3000));
        })()`,
      });
      const seen = await evaluate(MEASURE);
      if (seen?.error) fail(vp.name, id, seen.error);
      else for (const c of seen.clipped ?? []) {
        if (c.over > SLACK) fail(vp.name, seen.chapter, `${c.tag} "${c.text}" ${c.over}px past the bottom`);
      }
    }
    console.log(`${results.some((r) => r.vp === vp.name) ? "FAIL" : "PASS"}  ${vp.name}`);
    for (const r of results.filter((x) => x.vp === vp.name)) console.log(`        ${r.chapter}: ${r.detail}`);
  }

  chrome.kill();
  console.log(results.length ? `\n${results.length} clipped element(s)` : "\nNothing clipped");
  process.exit(results.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  chrome.kill();
  process.exit(1);
});
