// Generates the Lauhata Beach Escape logo files (SVG) from one drawing, so every version stays in step.
// Usage (from website/): node tools/gerar-logotipo.mjs [outDir] [fontsDir]
// Writes the SVG logos to src/assets/img/brand/ (favicon.svg and the sprite snippets go to the same folder, see README).
import fs from "node:fs";
import path from "node:path";

const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const out = process.argv[2] || path.join(here, "..", "src", "assets", "img", "brand");
const fontsDir = process.argv[3] || path.join(here, "..", "src", "assets", "fonts");
fs.mkdirSync(out, { recursive: true });

// ---- Palette (see design.css tokens) ----
const P = {
  light: { ink: "#123B3A", leaf: "#244C3F", sun: "#D9A85F", wave: "#123B3A", mute: "#244C3F", geo: "#B07F2F" },
  dark: { ink: "#F3E9D7", leaf: "#A9C7B8", sun: "#D9A85F", wave: "#A9C7B8", mute: "#A9C7B8", geo: "#D9A85F" },
};

// ---- Symbol drawing: 120 x 120 ----
const f = (n) => Number(n.toFixed(2));
// A leaf-shaped frond from origin O to tip T, bowed to one side.
function frond([ox, oy], [tx, ty], bow = 6, thick = 0.55) {
  const mx = (ox + tx) / 2, my = (oy + ty) / 2;
  const dx = tx - ox, dy = ty - oy, len = Math.hypot(dx, dy);
  const nx = -dy / len, ny = dx / len; // normal
  const c1 = [mx + nx * bow, my + ny * bow];
  const c2 = [mx + nx * bow * thick, my + ny * bow * thick];
  return `M${f(ox)} ${f(oy)}Q${f(c1[0])} ${f(c1[1])} ${f(tx)} ${f(ty)}Q${f(c2[0])} ${f(c2[1])} ${f(ox)} ${f(oy)}Z`;
}
function wave(y, x0, x1, amp = 3.2, seg = 12) {
  let d = `M${x0} ${y}`;
  const n = Math.round((x1 - x0) / seg);
  d += `q${seg / 2} ${-amp} ${seg} 0`;
  for (let i = 1; i < n; i++) d += `t${seg} 0`;
  return d;
}

const ARCH = "M18 108V58a42 42 0 0 1 84 0v50"; // arch: x 18..102, crown at y 16
const SUN = "M40 78a20 20 0 0 1 40 0Z";        // half sun on the horizon (y = 78)
const HORIZON = "M24 78h72";

function symbolInner(c, { palm = true, waves = 3 } = {}) {
  let s = `<path d="${ARCH}" fill="none" stroke="${c.ink}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += `<path d="${SUN}" fill="${c.sun}"/>`;
  s += `<path d="${HORIZON}" stroke="${c.ink}" stroke-width="2.6" stroke-linecap="round"/>`;
  const rows = [[88, 30, 90], [96, 38, 82], [104, 46, 74]].slice(0, waves);
  rows.forEach(([y, a, b], i) => { s += `<path d="${wave(y, a, b, 3, 11)}" fill="none" stroke="${c.wave}" stroke-width="2.2" stroke-linecap="round" opacity="${i === 0 ? 1 : 0.75 - i * 0.1}"/>`; });
  if (palm) {
    // trunk: a gentle lean from the horizon up and to the left of the sun
    s += `<path d="M36 78C36 66 40 54 45 42" fill="none" stroke="${c.leaf}" stroke-width="2.8" stroke-linecap="round"/>`;
    const top = [45, 42];
    const fr = [[26, 55, -7], [30, 35, 6], [45, 27, 6], [62, 33, 6], [68, 50, -7], [35, 47, -4]];
    s += `<path fill="${c.leaf}" d="${fr.map(([x, y, b]) => frond(top, [x, y], b)).join("")}"/>`;
  }
  return s;
}

const symbol = (c, opts) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" role="img" aria-label="Lauhata Beach Escape">${symbolInner(c, opts)}</svg>`;

// ---- Fonts embedded so the SVG draws the same everywhere (use as a file, <img> or in a document) ----
const b64 = (file) => fs.readFileSync(path.join(fontsDir, file)).toString("base64");
const fontCss = () => `@font-face{font-family:"Cormorant Garamond";font-weight:300 700;src:url(data:font/woff2;base64,${b64("cormorant-garamond-latin.woff2")}) format("woff2")}@font-face{font-family:"Manrope";font-weight:400 700;src:url(data:font/woff2;base64,${b64("manrope-latin.woff2")}) format("woff2")}`;

function textSvg(w, h, body, c) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="Lauhata Beach Escape"><defs><style>${fontCss()}</style></defs>${body}</svg>`;
}
const serif = (c, size, y, x, text, extra = "") => `<text x="${x}" y="${y}" text-anchor="middle" font-family="'Cormorant Garamond',Georgia,serif" font-weight="600" font-size="${size}" letter-spacing="${(size * 0.26).toFixed(1)}" fill="${c.ink}"${extra}>${text}</text>`;
const sans = (color, size, y, x, text, track, weight = 500) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="'Manrope',system-ui,sans-serif" font-weight="${weight}" font-size="${size}" letter-spacing="${track}" fill="${color}">${text}</text>`;

function primary(c) {
  const W = 520, H = 380, cx = W / 2;
  // text is optically centred: letter-spacing adds trailing space, so shift by half of it
  const body =
    `<g transform="translate(${cx - 84} 6) scale(1.4)">${symbolInner(c, { palm: true, waves: 3 })}</g>` +
    serif(c, 62, 250, cx + 8, "LAUHATA") +
    `<path d="M${cx - 150} 274h110M${cx + 40} 274h110" stroke="${c.geo}" stroke-width="1.4"/><path d="M${cx} 268l5 6-5 6-5-6Z" fill="${c.sun}"/>` +
    sans(c.ink, 19, 312, cx + 5, "BEACH ESCAPE", 9.5, 500) +
    sans(c.geo, 11.5, 342, cx + 3, "LIQUIÇÁ · TIMOR-LESTE", 5, 500);
  return textSvg(W, H, body, c);
}
function secondary(c) {
  return symbol(c, { palm: false, waves: 2 });
}
function wordmark(c) {
  const W = 420, H = 90, cx = W / 2;
  return textSvg(W, H, serif(c, 56, 62, cx + 7, "LAUHATA"), c);
}
function primaryFull(c) { return primary(c); }

const files = {};
for (const [mode, c] of Object.entries(P)) {
  files[`lauhata-primary-${mode}.svg`] = primaryFull(c);
  files[`lauhata-symbol-${mode}.svg`] = secondary(c);
  files[`lauhata-wordmark-${mode}.svg`] = wordmark(c);
  files[`lauhata-symbol-full-${mode}.svg`] = symbol(c, { palm: true, waves: 3 });
}
// Favicon: the simplified symbol on a deep-ocean tile.
files["favicon.svg"] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#123B3A"/><g transform="translate(8 8) scale(0.4667)">${symbolInner({ ink: "#F3E9D7", leaf: "#A9C7B8", sun: "#D9A85F", wave: "#A9C7B8" }, { palm: false, waves: 2 })}</g></svg>`;
for (const [name, svg] of Object.entries(files)) fs.writeFileSync(path.join(out, name), svg);
// Symbol markup for the website sprite (current colour for strokes, gold sun)
fs.writeFileSync(path.join(out, "sprite-symbol.txt"), symbolInner({ ink: "currentColor", leaf: "currentColor", sun: "var(--mark-sun, #D9A85F)", wave: "currentColor" }, { palm: false, waves: 2 }));
fs.writeFileSync(path.join(out, "sprite-symbol-full.txt"), symbolInner({ ink: "currentColor", leaf: "currentColor", sun: "var(--mark-sun, #D9A85F)", wave: "currentColor" }, { palm: true, waves: 3 }));
console.log("written:", Object.keys(files).join(", "));
