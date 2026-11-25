// The home hero film: an edit of the original drone footage (media-source/DJI_0827.MP4, never changed).
//   - opens on the beach and pulls back to the surf and the mountains, so the words sit over sand and sea;
//   - its last second dissolves into its own beginning, so the loop has no cut;
//   - carries the same colour treatment as the photographs (tools/revelar-fotos.mjs);
//   - 1600x900, 24 fps, H.264, no sound, faststart.
// It also writes the poster: the film's own first frame, decoded from the finished file, so the picture on screen before the film and
// the film's first frame are the same picture.
//   node tools/filme-hero.mjs
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { serve, withPage } from "./browser.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const SRC = "/media-source/DJI_0827.MP4", OUT = "src/assets/video/hero-lauhata-1600.mp4", POSTER = "src/assets/img/fotos/hero-filme";
const W = 1600, H = 900, FPS = 24, START = 9.4, END = 25.9, FADE = 1.6, BITRATE = 2_300_000;
const LOOK = "contrast(1.07) saturate(1.2) brightness(1.1)"; // canvas filter, applied to every frame
const WARM = "rgba(255, 196, 128, 0.10)"; // soft-light wash: the warm light of the photographs

// ---------- MP4 (one H.264 track, no B-frames) ----------
const u32 = (n) => { const b = Buffer.alloc(4); b.writeUInt32BE(n >>> 0); return b; };
const u16 = (n) => { const b = Buffer.alloc(2); b.writeUInt16BE(n); return b; };
const box = (type, ...parts) => { const body = Buffer.concat(parts); return Buffer.concat([u32(body.length + 8), Buffer.from(type), body]); };
const full = (type, flags, ...parts) => box(type, u32(flags), ...parts);
const MATRIX = Buffer.concat([0x10000, 0, 0, 0, 0x10000, 0, 0, 0, 0x40000000].map(u32));
function mp4(samples, avcC) {
  const n = samples.length, ts = 24000, dur = n * (ts / FPS);
  const stsd = full("stsd", 0, u32(1), box("avc1", Buffer.alloc(6), u16(1), Buffer.alloc(16), u16(W), u16(H), u32(0x480000), u32(0x480000), u32(0), u16(1), Buffer.alloc(32), u16(24), u16(0xffff),
    box("avcC", avcC), box("colr", Buffer.from("nclx"), u16(1), u16(1), u16(1), Buffer.from([0]))));
  const moov = (offset) => box("moov",
    full("mvhd", 0, u32(0), u32(0), u32(ts), u32(dur), u32(0x10000), u16(0x100), Buffer.alloc(10), MATRIX, Buffer.alloc(24), u32(2)),
    box("trak", full("tkhd", 3, u32(0), u32(0), u32(1), u32(0), u32(dur), Buffer.alloc(8), u16(0), u16(0), u16(0), u16(0), MATRIX, u32(W << 16), u32(H << 16)),
      box("mdia", full("mdhd", 0, u32(0), u32(0), u32(ts), u32(dur), u16(0x55c4), u16(0)), full("hdlr", 0, u32(0), Buffer.from("vide"), Buffer.alloc(12), Buffer.from("video\0")),
        box("minf", full("vmhd", 1, Buffer.alloc(8)), box("dinf", full("dref", 0, u32(1), full("url ", 1))),
          box("stbl", stsd, full("stts", 0, u32(1), u32(n), u32(ts / FPS)),
            full("stss", 0, u32(samples.filter((s) => s.key).length), ...samples.flatMap((s, i) => (s.key ? [u32(i + 1)] : []))),
            full("stsc", 0, u32(1), u32(1), u32(n), u32(1)), full("stsz", 0, u32(0), u32(n), ...samples.map((s) => u32(s.data.length))), full("stco", 0, u32(1), u32(offset)))))));
  const ftyp = box("ftyp", Buffer.from("isom"), u32(512), Buffer.from("isomiso2avc1mp41"));
  const head = ftyp.length + moov(0).length + 8;
  const data = Buffer.concat(samples.map((s) => s.data));
  return Buffer.concat([ftyp, moov(head), u32(data.length + 8), Buffer.from("mdat"), data]);
}

const server = await serve(root);
await withPage(server.origin + "/blank", async ({ run }) => {
  await run(`
    window.v = document.createElement("video"); v.muted = true; v.preload = "auto"; v.src = ${JSON.stringify(SRC)};
    await new Promise((r, j) => { v.onloadeddata = r; v.onerror = () => j(v.error); });
    window.c = new OffscreenCanvas(${W}, ${H}); window.x = c.getContext("2d"); x.imageSmoothingQuality = "high";
    window.head = []; window.out = []; window.desc = null;
    window.enc = new VideoEncoder({ error: (e) => (window.err = String(e)), output: (k, m) => {
      const d = new Uint8Array(k.byteLength); k.copyTo(d); out.push({ d, key: k.type === "key", t: k.timestamp });
      if (m && m.decoderConfig && m.decoderConfig.description) desc = new Uint8Array(m.decoderConfig.description);
    } });
    enc.configure({ codec: "avc1.640028", width: ${W}, height: ${H}, bitrate: ${BITRATE}, framerate: ${FPS}, latencyMode: "quality", avc: { format: "avc" }, hardwareAcceleration: "prefer-hardware" });
    window.draw = async (t) => {
      if (Math.abs(v.currentTime - t) > 0.001) { v.currentTime = t; await new Promise((r) => (v.onseeked = r)); }
      x.globalCompositeOperation = "source-over"; x.filter = ${JSON.stringify(LOOK)}; x.drawImage(v, 0, 0, ${W}, ${H}); x.filter = "none";
      x.globalCompositeOperation = "soft-light"; x.fillStyle = ${JSON.stringify(WARM)}; x.fillRect(0, 0, ${W}, ${H}); x.globalCompositeOperation = "source-over";
    };
    return true;`);
  const total = Math.round((END - START - FADE) * FPS), fade = Math.round(FADE * FPS), lead = START;
  // The film runs from START+FADE to END; over its last FADE seconds the opening (START to START+FADE) dissolves in, so the last frame
  // leads into the first one.
  for (let i = 0; i < total; i++) {
    await run(`const i = ${i}, total = ${total}, fade = ${fade};
      await draw(${lead + FADE} + i / ${FPS});
      const k = i - (total - fade);
      if (k >= 0) { const a = await createImageBitmap(c); await draw(${lead} + k / ${FPS}); const b = await createImageBitmap(c); const t = (k + 1) / (fade + 1), e = t * t * (3 - 2 * t); x.drawImage(a, 0, 0); x.globalAlpha = e; x.drawImage(b, 0, 0); x.globalAlpha = 1; a.close(); b.close(); }
      const f = new VideoFrame(c, { timestamp: Math.round(i * 1e6 / ${FPS}), duration: Math.round(1e6 / ${FPS}) }); enc.encode(f, { keyFrame: i % 48 === 0 }); f.close();
      if (window.err) throw new Error(err); return true;`);
    if (i % 48 === 0) console.log(`frame ${i}/${total}`);
  }
  const n = await run(`await enc.flush(); return out.length;`);
  const b64 = "const b = (u) => { let s = ''; for (let i = 0; i < u.length; i += 8192) s += String.fromCharCode(...u.subarray(i, i + 8192)); return btoa(s); };";
  const avcC = Buffer.from(await run(`${b64} return b(desc);`), "base64");
  const samples = [];
  for (let i = 0; i < n; i++) { const s = await run(`${b64} return { k: out[${i}].key, d: b(out[${i}].d) };`); samples.push({ key: s.k, data: Buffer.from(s.d, "base64") }); }
  const file = mp4(samples, avcC);
  writeFileSync(root + OUT, file);
  console.log(OUT, n, "frames", (file.length / 1e6).toFixed(2) + " MB");

  // The poster, from the finished film itself.
  for (const w of [640, 1080, 1600]) {
    const url = await run(`const p = document.createElement("video"); p.muted = true; p.preload = "auto"; p.src = ${JSON.stringify("/" + OUT + "?")} + Date.now(); await new Promise((r, j) => { p.onloadeddata = r; p.onerror = () => j(p.error); });
      const w = ${w}, o = new OffscreenCanvas(w, Math.round(w * ${H / W})), y = o.getContext("2d"); y.imageSmoothingQuality = "high"; y.drawImage(p, 0, 0, o.width, o.height);
      const blob = await o.convertToBlob({ type: "image/webp", quality: 0.8 }); return await new Promise((r) => { const f = new FileReader(); f.onload = () => r(f.result); f.readAsDataURL(blob); });`);
    const buf = Buffer.from(url.split(",")[1], "base64");
    writeFileSync(`${root}${POSTER}-${w}.webp`, buf);
    console.log("poster", w, Math.round(buf.length / 1024) + " KB");
  }
});
server.close();
