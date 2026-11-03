// Shared helpers for the static build: escaping, routes, images and small markup pieces.
import { readFileSync } from "node:fs";
import site from "./data/site.mjs";
import images from "./data/images.mjs";
import rooms from "./data/rooms.mjs";

export const LANGS = ["pt", "en"];

export const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const fmt = (s, vars = {}) => String(s).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));

// ---------- Routes ----------
const ROUTES = {
  home: { pt: "/", en: "/en/" },
  restaurant: { pt: "/restaurante/", en: "/en/restaurant/" },
  stay: { pt: "/alojamento/", en: "/en/stay/" },
  contact: { pt: "/contactos/", en: "/en/contact/" },
  thanks: { pt: "/obrigado/", en: "/en/thank-you/" },
  privacy: { pt: "/privacidade/", en: "/en/privacy/" },
  notFound: { pt: "/404.html", en: "/en/404.html" },
};

export function href(page, lang, hash = "") {
  if (page.startsWith("room:")) {
    const room = rooms.find((r) => r.id === page.slice(5));
    return `${ROUTES.stay[lang]}${room.slug[lang]}/${hash}`;
  }
  return ROUTES[page][lang] + hash;
}

export const absUrl = (path) => site.siteUrl + path;

// Output file for a route path ("/en/stay/" -> "en/stay/index.html").
export const outFile = (path) => (path.endsWith(".html") ? path.slice(1) : path.slice(1) + "index.html");

// ---------- Images ----------
const WIDTHS = [480, 768, 1080, 1440, 1920];
// Local photos ("foto:<slug>") are pre-sized by tools/otimizar-fotos.ps1 into these widths.
const FOTO_WIDTHS = [640, 1080, 1600];

function srcFor(src, w) {
  if (src.startsWith("unsplash:")) {
    return `https://images.unsplash.com/photo-${src.slice(9)}?auto=format&fit=crop&w=${w}&q=72`;
  }
  if (src.startsWith("foto:")) {
    const size = FOTO_WIDTHS.find((fw) => fw >= w) || FOTO_WIDTHS.at(-1);
    return `/assets/img/fotos/${src.slice(5)}-${size}.jpg`;
  }
  return src;
}

// srcset candidates; a local photo narrower than a size is described by its real width.
function srcsetFor(im) {
  if (im.src.startsWith("unsplash:")) return WIDTHS.map((w) => `${srcFor(im.src, w)} ${w}w`).join(", ");
  if (im.src.startsWith("foto:")) {
    const seen = new Set();
    return FOTO_WIDTHS.map((w) => [w, Math.min(w, im.width)])
      .filter(([, real]) => !seen.has(real) && seen.add(real))
      .map(([w, real]) => `${srcFor(im.src, w)} ${real}w`)
      .join(", ");
  }
  return "";
}

// Pixel size of a local photo, read from its JPEG header, so the browser can reserve the space before it loads
// (no layout shift). Stock photos are fetched cropped by a remote service, so they have no fixed size here.
const dimCache = new Map();
function dimsFor(im) {
  if (!im.src.startsWith("foto:")) return null;
  const slug = im.src.slice(5);
  if (dimCache.has(slug)) return dimCache.get(slug);
  let out = null;
  try {
    const b = readFileSync(new URL(`./assets/img/fotos/${slug}-${FOTO_WIDTHS.at(-1)}.jpg`, import.meta.url));
    for (let i = 2; i < b.length - 9; ) {
      if (b[i] !== 0xff) { i++; continue; }
      const m = b[i + 1];
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) { out = { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) }; break; }
      i += 2 + b.readUInt16BE(i + 2);
    }
  } catch { /* no file: no size */ }
  dimCache.set(slug, out);
  return out;
}

export function imgUrl(key, w = 1200) {
  return srcFor(images[key].src, w);
}

// <link rel="preload"> for a full-width hero, with the same candidates as its <img>.
export function preloadImage(key, sizes = "100vw", media = "") {
  const im = images[key];
  const srcset = srcsetFor(im);
  return `<link rel="preload" as="image" href="${srcFor(im.src, 1440)}"${srcset ? ` imagesrcset="${srcset}" imagesizes="${sizes}"` : ""}${media ? ` media="${media}"` : ""} fetchpriority="high">`;
}

// True while any illustrative stock photo is still in use: the footer then shows one notice
// for the whole site instead of a tag on every photo.
export const usesPlaceholderImages = () => site.showPlaceholderNotes && Object.values(images).some((im) => im.placeholder);

/**
 * Responsive <img> wrapped in a figure.
 * attrs: extra attributes for the figure (e.g. 'data-clip' for a reveal).
 * parallax: speed for the inner image drift (e.g. 0.12); the image is over-scaled to cover it.
 */
// art: [{ key, media }] swaps in another photo when the media query matches (e.g. a more portrait-friendly
// crop on phones): the browser then downloads only the photo it shows.
export function figure(t, key, { sizes = "100vw", cls = "", eager = false, ratio = "", caption = "", attrs = "", parallax = 0, art = [], decorative = false } = {}) {
  const im = images[key];
  if (!im) throw new Error(`Unknown image: ${key}`);
  const srcset = srcsetFor(im);
  const style = ratio ? ` style="--ratio:${ratio}"` : "";
  const d = dimsFor(im);
  const img = `<img src="${srcFor(im.src, 1440)}"${srcset ? ` srcset="${srcset}" sizes="${sizes}"` : ""} alt="${decorative ? "" : esc(im.alt[t.lang])}"${d ? ` width="${d.w}" height="${d.h}"` : ""} ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"${parallax ? ` data-parallax="${parallax}"` : ""}>`;
  const sources = art.map((a) => `<source media="${a.media}" srcset="${srcsetFor(images[a.key])}" sizes="${sizes}">`).join("");
  // A stock or illustrative photo is marked in the HTML; the "Illustrative image" label only shows where the picture
  // stands for the place itself (rooms, galleries, page heroes: see design.css). It goes once the photo is marked real.
  const illus = im.placeholder && site.showPlaceholderNotes;
  return `<figure class="media ${cls}${parallax ? " has-parallax" : ""}${illus ? " is-placeholder" : ""}"${illus ? ` data-ph="${esc(t.common.placeholderImage)}"` : ""}${style}${attrs ? " " + attrs : ""}>
  ${sources ? `<picture>${sources}${img}</picture>` : img}${caption ? `\n  <figcaption>${esc(caption)}</figcaption>` : ""}
</figure>`;
}

// ---------- Reservation times ----------
// Every 30 minutes through the printed opening hours, the last one 30 minutes before closing. Falls back to a
// sensible default while the hours are not filled in.
export function reservationSlots() {
  const out = [];
  for (const h of site.restaurantHours) {
    const m = String(h.hours).match(/(\d{1,2}):(\d{2})\D+(\d{1,2}):(\d{2})/);
    if (!m) continue;
    const end = Number(m[3]) * 60 + Number(m[4]);
    for (let a = Number(m[1]) * 60 + Number(m[2]); a <= end - 30; a += 30) {
      out.push(`${String(Math.floor(a / 60)).padStart(2, "0")}:${String(a % 60).padStart(2, "0")}`);
    }
  }
  return out.length ? [...new Set(out)] : ["12:00", "12:30", "13:00", "13:30", "14:00", "18:30", "19:00", "19:30", "20:00", "20:30"];
}
export const slotPeriod = (v) => (v < "12:00" ? "morning" : v < "18:00" ? "afternoon" : "evening");

// ---------- Menu and orders ----------
// "$18" or "$6.50": the currency symbol comes from site.order.currency.
export const money = (n) => site.order.currency + (Number.isInteger(n) ? n : n.toFixed(2));

// The dishes a page can add to the order, for the cart script (window.LAUHATA_MENU, by dish id).
export function menuJson(list) {
  const data = Object.fromEntries(
    list.map((d) => [d.id, { id: d.id, name: d.name, price: d.price, desc: d.description ?? null, options: d.options }])
  );
  return `<script>window.LAUHATA_MENU=${JSON.stringify(data).replace(/</g, "\\u003c")};</script>`;
}

// ---------- Small pieces ----------
export const icon = (name) => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"></use></svg>`;

export function waLink(text = "") {
  const base = site.whatsapp ? `https://wa.me/${site.whatsapp}` : "https://wa.me/";
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export function hoursList(t, cls = "") {
  if (!site.restaurantHours.length) return `<p class="muted ${cls}">${esc(t.common.hoursTbc)}</p>`;
  return `<dl class="hours ${cls}">${site.restaurantHours
    .map((h) => `<div><dt>${esc(h.days[t.lang])}</dt><dd>${esc(h.hours)}</dd></div>`)
    .join("")}</dl>`;
}

export function responseLine(t) {
  return site.responseTime
    ? `<p class="response">${icon("clock")}<span>${esc(site.responseTime[t.lang])}</span></p>`
    : `<p class="response is-pending">${icon("clock")}<span>${esc(t.contact.responsePending)}</span></p>`;
}

export function breadcrumbs(t, trail) {
  const items = [{ name: t.nav.home, path: href("home", t.lang) }, ...trail];
  const html = `<nav class="crumbs" aria-label="${esc(t.nav.breadcrumb)}"><ol>${items
    .map((it, i) =>
      i === items.length - 1
        ? `<li><span aria-current="page">${esc(it.name)}</span></li>`
        : `<li><a href="${it.path}">${esc(it.name)}</a></li>`
    )
    .join("")}</ol></nav>`;
  const ld = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: absUrl(it.path) })),
  };
  return { html, ld };
}

export { site, images, rooms };
