// The photo lab: one colour treatment for every photograph of the site, and the web sizes.
// Reads the ORIGINALS (media-source/, originais/; never changed) and writes src/assets/img/fotos/<slug>-<width>.webp.
//   node tools/revelar-fotos.mjs            all of them
//   node tools/revelar-fotos.mjs mar-canoa  only those slugs
// The treatment only corrects exposure, contrast and colour. Nothing is added, removed or repainted in a photograph.
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { serve, withPage } from "./browser.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const only = process.argv.slice(2);
const WIDTHS = [640, 1080, 1600, 2200];
const DRONE = "originais/fotos/drone-2026-11/", DJI = "media-source/", REF = "originais/fotos/descobrir-referencias/";
// gamma < 1 opens the shadows; sat = saturation; con = contrast around the mid-tones; warm = red/blue balance;
// crop = [x, y, w, h] as fractions; at = the second of a film to take the still from.
const DAY = { gamma: 0.86, con: 1.1, sat: 1.18, warm: 0.02 };
const VERANDA = { gamma: 0.72, con: 1.06, sat: 1.12, warm: 0.035 };
const DUSK = { gamma: 0.66, con: 1.04, sat: 1.3, warm: 0.05 };
const JOBS = {
  "costa-montanhas": [DJI + "DJI_0828.JPG", { ...DAY, gamma: 0.8 }],
  "costa-retrato": [DJI + "DJI_0828.JPG", { ...DAY, gamma: 0.8, crop: [0.36, 0, 0.3164, 1], q: 0.52 }],
  "vista-de-cima": [DJI + "DJI_0829.JPG", { ...DAY, gamma: 0.8 }],
  "quarto-entrada": [DJI + "DJI_0833.JPG", VERANDA],
  "quartos-varanda": [DJI + "DJI_0839.JPG", VERANDA],
  "quartos-corredor": [DJI + "DJI_0832.JPG", { ...VERANDA, gamma: 0.66 }],
  "quartos-jardim": [DJI + "DJI_0836.JPG", { ...VERANDA, gamma: 0.7 }],
  "jardim-varanda": [DJI + "DJI_0838.JPG", { ...VERANDA, gamma: 0.78 }],
  "lauhata-praia-do-mar": [DRONE + "lauhata-praia-do-mar.jpg", { ...DAY, sat: 1.1 }],
  "mar-canoa": [DRONE + "mar-canoa.jpg", { ...DAY, gamma: 0.95, sat: 1.06 }],
  "costa-aldeia-cima": [DRONE + "costa-aldeia-cima.jpg", { ...DAY, gamma: 0.8 }],
  "arredores-ruinas": [DRONE + "arredores-ruinas.jpg", { ...DAY, sat: 1.1 }],
  "arredores-ruinas-cima": [DRONE + "arredores-ruinas-cima.jpg", { ...DAY, sat: 1.1 }],
  "por-do-sol-jardim": [DRONE + "por-do-sol-jardim.jpg", DUSK],
  "por-do-sol-mar": [DRONE + "por-do-sol-mar.jpg", { ...DUSK, gamma: 0.72 }],
  "por-do-sol-palmeiras": [DRONE + "por-do-sol-palmeiras.jpg", DUSK],
  "por-do-sol-palmeiras-alto": [DRONE + "por-do-sol-palmeiras-alto.jpg", DUSK],
  "aerea-lugar": ["originais/fotos/web-anterior/aerea-lugar-1600.jpg", { gamma: 0.9, con: 1.04, sat: 1.02, warm: 0.01 }],
  "lugar-forte-maubara": [REF + "place-maubara-fort.jpg", { max: 1600, gamma: 0.92, con: 1.02, sat: 1.02, warm: 0.01 }],
  "lugar-centro-liquica": [REF + "place-liquica-centre.jpg", { gamma: 1, con: 1, sat: 1, warm: 0.01 }],
  // A still of the drone film: the restaurant behind its palm trees, from the beach.
  "restaurante-praia": [DJI + "DJI_0826.MP4", { ...DAY, gamma: 0.78, at: 0.6 }],
};

const server = await serve(root);
await withPage(server.origin + "/blank", async ({ run }) => {
  await run(`
    window.load = async (src, at) => {
      if (/\\.mp4$/i.test(src)) {
        const v = document.createElement("video"); v.muted = true; v.src = src; v.preload = "auto";
        await new Promise((r, j) => { v.onloadeddata = r; v.onerror = j; });
        v.currentTime = at; await new Promise((r) => (v.onseeked = r));
        return [v, v.videoWidth, v.videoHeight];
      }
      const im = new Image(); im.src = src; await im.decode();
      return [im, im.naturalWidth, im.naturalHeight];
    };
    window.develop = (ctx, w, h, o) => {
      const d = ctx.getImageData(0, 0, w, h), p = d.data;
      const lut = [0, 1, 2].map((c) => {
        const t = new Float32Array(256);
        for (let i = 0; i < 256; i++) { let v = Math.pow(i / 255, o.gamma); v = (v - 0.5) * o.con + 0.5; v *= c === 0 ? 1 + o.warm : c === 2 ? 1 - o.warm : 1; t[i] = v; }
        return t;
      });
      for (let i = 0; i < p.length; i += 4) {
        const r = lut[0][p[i]], g = lut[1][p[i + 1]], b = lut[2][p[i + 2]], l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        p[i] = (l + (r - l) * o.sat) * 255; p[i + 1] = (l + (g - l) * o.sat) * 255; p[i + 2] = (l + (b - l) * o.sat) * 255;
      }
      ctx.putImageData(d, 0, 0);
    };`);
  for (const [slug, [src, o]] of Object.entries(JOBS)) {
    if (only.length && !only.includes(slug)) continue;
    const w0 = await run(`const [im, W, H] = await load(${JSON.stringify("/" + src)}, ${o.at || 0}); const c = ${JSON.stringify(o.crop || [0, 0, 1, 1])};
      window.S = { im, x: c[0] * W, y: c[1] * H, w: c[2] * W, h: c[3] * H }; return Math.round(S.w);`);
    for (const w of [...new Set(WIDTHS.map((x) => Math.min(x, w0, o.max || 9999)))]) {
      const url = await run(`const w = ${w}, h = Math.round(w * S.h / S.w), c = new OffscreenCanvas(w, h), x = c.getContext("2d", { willReadFrequently: true });
        x.imageSmoothingQuality = "high"; x.drawImage(S.im, S.x, S.y, S.w, S.h, 0, 0, w, h); develop(x, w, h, ${JSON.stringify(o)});
        const b = await c.convertToBlob({ type: "image/webp", quality: ${o.q || (w > 1600 ? 0.58 : w > 1080 ? 0.66 : 0.74)} });
        return await new Promise((r) => { const f = new FileReader(); f.onload = () => r(f.result); f.readAsDataURL(b); });`);
      const buf = Buffer.from(url.split(",")[1], "base64");
      writeFileSync(`${root}src/assets/img/fotos/${slug}-${w}.webp`, buf);
      console.log(slug, w, Math.round(buf.length / 1024) + " KB");
    }
  }
});
server.close();
