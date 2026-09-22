#!/usr/bin/env node
/**
 * QA screenshots — zero dependencies. Drives the installed Google Chrome over the
 * DevTools protocol (Node 22 has a built-in WebSocket), sets each viewport, scrolls to
 * each chapter's composed frame and saves a screenshot.
 *
 *   pnpm dev            # in another terminal
 *   node scripts/qa-screenshots.mjs [url] [outDir]
 *
 * Output: docs/qa/<viewport>-<scene>.png (default)
 */
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const URL_ = process.argv[2] ?? "http://localhost:3200/";
const OUT = process.argv[3] ?? "docs/qa";
const CHROME = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9333;

// [scene id, pinned progress 0..1 at which the chapter is fully composed]
const SCENES = [
  ["invitation", 0], ["beginning", 0.95], ["two-of-us", 0.9], ["promise", 0.66], ["family", 0.97],
  ["ceremony", 0.7], ["celebration", 0.75], ["details", 0], ["closing", 1],
];
const VIEWPORTS = [
  { name: "375x812", width: 375, height: 812, mobile: true, scenes: ["invitation", "promise", "details"] },
  { name: "390x844", width: 390, height: 844, mobile: true, scenes: SCENES.map((s) => s[0]) },
  { name: "393x852", width: 393, height: 852, mobile: true, scenes: ["invitation", "family", "details"] },
  { name: "430x932", width: 430, height: 932, mobile: true, scenes: ["invitation", "celebration", "details"] },
  { name: "1440x900", width: 1440, height: 900, mobile: false, scenes: ["invitation", "two-of-us", "promise", "ceremony", "closing"] },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const chrome = spawn(CHROME, [
  "--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), "qa-chrome-"))}`,
  "--no-first-run", "--no-default-browser-check", "--hide-scrollbars", "--enable-unsafe-swiftshader", "--use-angle=swiftshader",
  "about:blank",
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

async function connect() {
  for (let i = 0; i < 50; i++) {
    try {
      const targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
      const page = targets.find((t) => t.type === "page");
      if (page) return page.webSocketDebuggerUrl;
    } catch {}
    await sleep(200);
  }
  throw new Error("Chrome did not start");
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  ws = new WebSocket(await connect());
  await new Promise((r) => ws.addEventListener("open", r, { once: true }));
  ws.addEventListener("message", (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && pending.has(msg.id)) {
      const p = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) p.reject(new Error(msg.error.message));
      else p.resolve(msg.result);
    }
  });
  await send("Page.enable");
  await send("Runtime.enable");
  const errors = [];
  ws.addEventListener("message", (e) => {
    const m = JSON.parse(e.data);
    if (m.method === "Runtime.exceptionThrown") errors.push(m.params.exceptionDetails.text);
    if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") errors.push(m.params.args.map((a) => a.value ?? a.description).join(" "));
  });

  for (const vp of VIEWPORTS) {
    await send("Emulation.setDeviceMetricsOverride", { width: vp.width, height: vp.height, deviceScaleFactor: vp.mobile ? 2 : 1, mobile: vp.mobile });
    await send("Emulation.setTouchEmulationEnabled", { enabled: vp.mobile });
    await send("Page.navigate", { url: URL_ });
    await sleep(9000); // loader + opening sequence
    for (const id of vp.scenes) {
      const t = SCENES.find((s) => s[0] === id)[1];
      await send("Runtime.evaluate", {
        awaitPromise: true,
        expression: `(async () => {
          const el = document.getElementById(${JSON.stringify(id)});
          const top = el.getBoundingClientRect().top + scrollY;
          const y = top + ${t} * Math.max(0, el.offsetHeight - innerHeight);
          window.__lenis ? __lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 3200));
        })()`,
      });
      const { data } = await send("Page.captureScreenshot", { format: "png" });
      const file = join(OUT, `${vp.name}-${id}.png`);
      writeFileSync(file, Buffer.from(data, "base64"));
      console.log("saved", file);
    }
  }
  console.log(errors.length ? `console errors:\n  ${errors.join("\n  ")}` : "console errors: none");
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
