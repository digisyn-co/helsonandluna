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
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// `free` turns the scene stepper off, so each chapter can be positioned directly — pressing
// ArrowDown does not work past a flow chapter, whose own scroller swallows the key.
const withFree = (u) => { const x = new URL(u); x.searchParams.set("free", ""); return x.toString(); };
const URL_ = withFree(process.argv[2] ?? "http://localhost:3200/");
const CHROME = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9379;
// [chapter id, progress through its pin at which it is fully composed] — as qa-screenshots.mjs.
// Every chapter, each measured at the points where its text has settled — not only the one
// frame that composes best. A heading can fit at the end of a chapter and not in the middle.
const SCENES = [
  ["invitation", [0]],
  ["beginning", [0.5, 0.95]],
  ["two-of-us", [0.6, 0.9, 1]],
  ["family", [0.6, 0.97]],
  ["promise", [0.45, 0.66, 0.9]],
  ["entourage", [0, 0.5, 1]],
  ["ceremony", [0.5, 0.7, 1]],
  ["celebration", [0.5, 0.75, 1]],
  ["details", [0, 0.5, 1]],
  ["closing", [0.6, 1]],
];
const SLACK = 2; // px — rounding, not a layout fault

const ALL = [
  { name: "320x568", width: 320, height: 568, mobile: true }, // the smallest phone still about
  { name: "360x640", width: 360, height: 640, mobile: true }, // small Android
  { name: "390x844", width: 390, height: 844, mobile: true }, // iPhone 14
  { name: "844x390", width: 844, height: 390, mobile: true }, // a phone on its side
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
  // The chapter a guest is looking at: the pinned layer that is actually painted, or the
  // invitation, which is its own one-screen section with no pin layer.
  const pins = [...document.querySelectorAll(".chapter__pin")];
  let live = pins.find((p) => {
    const st = getComputedStyle(p);
    return st.visibility !== "hidden" && Number(st.opacity) > 0.5;
  });
  // A flow chapter (the entourage list, the details) scrolls inside itself: its own box is
  // what content must fit, and anything below that is reached by scrolling, not cut off.
  if (!live) live = [...document.querySelectorAll(".chapter__scroll")].find((p) => {
    const r = p.getBoundingClientRect();
    return r.top < innerHeight * 0.5 && r.bottom > innerHeight * 0.5;
  });
  if (!live) live = scrollY < innerHeight * 0.5 ? document.getElementById("invitation") : null;
  if (!live) return { error: "no visible chapter" };
  const chapter = live.closest("section");

  // Every box between an element and its chapter that crops what it holds. A scroller inside
  // the chapter crops nothing a guest cannot reach — it just has to be scrolled to — so it
  // only lifts the screen-edge test for that axis; hidden/clip is a real cut.
  const cropsOf = (el) => {
    const list = [];
    let scrollsY = false;
    let scrollsX = false;
    for (let p = el.parentElement; p; p = p.parentElement) {
      const st = getComputedStyle(p);
      if (/auto|scroll/.test(st.overflowY)) scrollsY = true;
      if (/auto|scroll/.test(st.overflowX)) scrollsX = true;
      const hx = /hidden|clip/.test(st.overflowX);
      const hy = /hidden|clip/.test(st.overflowY);
      if (hx || hy) list.push({ r: p.getBoundingClientRect(), hx, hy });
      if (p === live) break; // the page itself scrolls; that is not this chapter's business
    }
    return { list, scrollsY, scrollsX };
  };

  const parts = [...live.querySelectorAll("h1, h2, h3, h4, p, figcaption, .meta, li, dd, dt, button, a, time, address")];
  const out = [];
  for (const el of parts) {
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;                 // not laid out
    const st = getComputedStyle(el);
    if (Number(st.opacity) === 0 || st.visibility === "hidden") continue; // not revealed yet
    if (el.closest("[aria-hidden='true']")) continue;
    if (!(el.textContent || "").trim()) continue;

    // How far it is cut on each side, by the screen and by every cropping ancestor.
    const crops = cropsOf(el);
    const cut = {
      top: crops.scrollsY ? 0 : Math.max(0, -r.top),
      bottom: crops.scrollsY ? 0 : Math.max(0, r.bottom - innerHeight),
      left: crops.scrollsX ? 0 : Math.max(0, -r.left),
      right: crops.scrollsX ? 0 : Math.max(0, r.right - innerWidth),
    };
    for (const c of crops.list) {
      if (c.hy) {
        cut.top = Math.max(cut.top, c.r.top - r.top);
        cut.bottom = Math.max(cut.bottom, r.bottom - c.r.bottom);
      }
      if (c.hx) {
        cut.left = Math.max(cut.left, c.r.left - r.left);
        cut.right = Math.max(cut.right, r.right - c.r.right);
      }
    }
    const side = Object.entries(cut).sort((a, b) => b[1] - a[1])[0];
    if (side[1] > 0) {
      out.push({
        text: (el.textContent || "").trim().slice(0, 40),
        tag: el.tagName.toLowerCase(),
        side: side[0],
        over: Math.round(side[1]),
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

    for (const [id, stops] of SCENES) for (const t of stops) {
      await send("Runtime.evaluate", {
        awaitPromise: true,
        expression: `(async () => {
          const el = document.getElementById(${JSON.stringify(id)});
          const top = el.getBoundingClientRect().top + scrollY;
          scrollTo(0, top + ${t} * Math.max(0, el.offsetHeight - innerHeight));
          await new Promise((r) => setTimeout(r, 3000));
        })()`,
      });
      if (process.env.QA_FIT_DUMP === id) {
        const dump = await evaluate(`(() => {
          const sec = document.getElementById(${JSON.stringify(id)});
          const walk = (el, depth) => {
            const r = el.getBoundingClientRect();
            const row = { d: depth, tag: el.tagName.toLowerCase(), cls: (typeof el.className === "string" ? el.className : "").split(" ").filter(Boolean).slice(0, 2).join("."), top: Math.round(r.top), h: Math.round(r.height) };
            return depth > 2 || r.height < 2 ? [row] : [row, ...[...el.children].flatMap((c) => walk(c, depth + 1))];
          };
          return { vh: innerHeight, rows: walk(sec, 0) };
        })()`);
        console.log(`  dump ${id} @${t} (vh=${dump.vh}):`);
        for (const r of dump.rows) console.log(`    ${"  ".repeat(r.d)}${r.tag}.${r.cls} top=${r.top} h=${r.h}`);
      }
      const seen = await evaluate(MEASURE);
      if (seen?.error) fail(vp.name, id, seen.error);
      else for (const c of seen.clipped ?? []) {
        if (c.over > SLACK) fail(vp.name, `${seen.chapter} @${t}`, `${c.tag} "${c.text}" cut ${c.over}px at the ${c.side}`);
      }
    }
    console.log(`${results.some((r) => r.vp === vp.name) ? "FAIL" : "PASS"}  ${vp.name}`);
    const mine = results.filter((x) => x.vp === vp.name);
    for (const r of mine.slice(0, 6)) console.log(`        ${r.chapter}: ${r.detail}`);
    if (mine.length > 6) console.log(`        … and ${mine.length - 6} more`);
  }

  chrome.kill();
  const REPORT = process.env.QA_FIT_REPORT ?? "/tmp/qa-fit-report.txt";
  writeFileSync(REPORT, results.map((r) => `${r.vp}  ${r.chapter}: ${r.detail}`).join("\n") + "\n");
  if (results.length) {
    const byChapter = {};
    for (const r of results) {
      const key = r.chapter.split(" @")[0];
      byChapter[key] = (byChapter[key] ?? 0) + 1;
    }
    console.log("\nBy chapter:");
    for (const [k, n] of Object.entries(byChapter).sort((a, b) => b[1] - a[1])) console.log(`  ${k}: ${n}`);
    console.log(`\n${results.length} clipped element(s) — full list in ${REPORT}`);
  } else console.log("\nNothing clipped");
  process.exit(results.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  chrome.kill();
  process.exit(1);
});
