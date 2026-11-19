// Tiny static server with gzip for text files (GitHub Pages compresses them too), for realistic Lighthouse runs.
import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname, normalize } from "node:path";
import { gzipSync } from "node:zlib";
const root = join(process.cwd(), "dist");
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".jpg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".woff2": "font/woff2", ".mp4": "video/mp4", ".xml": "application/xml", ".txt": "text/plain" };
http.createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (p.endsWith("/")) p += "index.html";
    const f = join(root, normalize(p));
    if (!f.startsWith(root)) throw new Error("path");
    await stat(f);
    let body = await readFile(f);
    const ext = extname(f);
    const headers = { "content-type": types[ext] || "application/octet-stream", "cache-control": "public, max-age=3600" };
    if ([".html", ".css", ".js", ".json", ".svg", ".xml", ".txt"].includes(ext) && /gzip/.test(req.headers["accept-encoding"] || "")) { body = gzipSync(body); headers["content-encoding"] = "gzip"; }
    res.writeHead(200, headers);
    res.end(body);
  } catch { res.writeHead(404); res.end("not found"); }
}).listen(8090, () => console.log("ready 8090"));
