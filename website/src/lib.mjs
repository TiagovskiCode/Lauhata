// Shared helpers for the static build: escaping, routes, images and small markup pieces.
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

function srcFor(src, w) {
  if (src.startsWith("unsplash:")) {
    return `https://images.unsplash.com/photo-${src.slice(9)}?auto=format&fit=crop&w=${w}&q=72`;
  }
  return src;
}

export function imgUrl(key, w = 1200) {
  return srcFor(images[key].src, w);
}

/**
 * Responsive <img> wrapped in a figure. Illustrative stock photos get a small tag
 * (while site.showPlaceholderNotes is on) so nobody mistakes them for the real place.
 */
export function figure(t, key, { sizes = "100vw", cls = "", eager = false, ratio = "", caption = "" } = {}) {
  const im = images[key];
  if (!im) throw new Error(`Unknown image: ${key}`);
  const isRemote = im.src.startsWith("unsplash:");
  const srcset = isRemote ? WIDTHS.map((w) => `${srcFor(im.src, w)} ${w}w`).join(", ") : "";
  const ph = im.placeholder && site.showPlaceholderNotes;
  const style = ratio ? ` style="--ratio:${ratio}"` : "";
  return `<figure class="media ${cls}${ph ? " is-placeholder" : ""}"${style}${ph ? ` data-ph="${esc(t.common.placeholderImage)}"` : ""}>
  <img src="${srcFor(im.src, 1440)}"${srcset ? ` srcset="${srcset}" sizes="${sizes}"` : ""} alt="${esc(im.alt[t.lang])}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">${caption ? `\n  <figcaption>${esc(caption)}</figcaption>` : ""}
</figure>`;
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
