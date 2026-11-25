// Drives a headless Chromium (Brave, Chrome or Edge) over the DevTools protocol, with no dependencies. The media tools use it as an
// image and video lab: <canvas> for the colour work and WebP, WebCodecs for H.264. CHROME_PATH overrides the browser.
import { spawn } from "node:child_process";
import http from "node:http";
import { createReadStream, existsSync, mkdtempSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { extname, join } from "node:path";

const CANDIDATES = [process.env.CHROME_PATH, "C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe", "C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "/usr/bin/google-chrome", "/usr/bin/chromium"];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const TYPES = { ".mp4": "video/mp4", ".jpg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };

// A static server with byte ranges (a <video> cannot seek without them), bound to this computer only.
export function serve(root) {
  const server = http.createServer((q, r) => {
    const path = decodeURIComponent(new URL(q.url, "http://x").pathname);
    if (path === "/blank") { r.writeHead(200, { "content-type": "text/html" }); return r.end("<!doctype html><body></body>"); }
    const file = join(root, path);
    if (!file.startsWith(join(root)) || !existsSync(file) || statSync(file).isDirectory()) { r.writeHead(404); return r.end(); }
    const size = statSync(file).size;
    const head = { "content-type": TYPES[extname(file).toLowerCase()] || "application/octet-stream", "accept-ranges": "bytes" };
    const m = /bytes=(\d+)-(\d*)/.exec(q.headers.range || "");
    const a = m ? +m[1] : 0, b = m && m[2] ? +m[2] : size - 1;
    r.writeHead(m ? 206 : 200, { ...head, "content-length": b - a + 1, ...(m ? { "content-range": `bytes ${a}-${b}/${size}` } : {}) });
    createReadStream(file, { start: a, end: b }).pipe(r);
  });
  return new Promise((res) => server.listen(0, "127.0.0.1", () => res({ origin: `http://127.0.0.1:${server.address().port}`, close: () => server.close() })));
}

// Runs `work({ run })` in a page; run(source) evaluates an async function body there and returns its value.
export async function withPage(url, work) {
  const exe = CANDIDATES.find((p) => p && existsSync(p));
  if (!exe) throw new Error("No Chromium found: set CHROME_PATH");
  const port = 9300 + Math.floor(Math.random() * 500);
  const proc = spawn(exe, [`--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), "lauhata-"))}`, "--headless=new", "--no-first-run", url], { stdio: "ignore" });
  try {
    let target;
    for (let i = 0; i < 60 && !target; i++) {
      await wait(200);
      try { target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === "page"); } catch { /* starting */ }
    }
    if (!target) throw new Error("The browser did not start");
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((r) => (ws.onopen = r));
    let id = 0;
    const pending = new Map();
    ws.onmessage = (m) => { const d = JSON.parse(m.data); pending.get(d.id)?.(d); pending.delete(d.id); };
    const send = (method, params = {}) => new Promise((r) => { pending.set(++id, r); ws.send(JSON.stringify({ id, method, params })); });
    await wait(600);
    const run = async (body) => {
      const r = await send("Runtime.evaluate", { expression: `(async()=>{${body}})()`, awaitPromise: true, returnByValue: true });
      if (r.result.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || "page error");
      return r.result.result.value;
    };
    const out = await work({ run, send });
    ws.close();
    return out;
  } finally { proc.kill(); }
}
