// Page shell shared by every page: <head> with SEO tags, header, footer, global UI and scripts.
import { esc, href, absUrl, site, icon, waLink, hoursList, LANGS, usesPlaceholderImages, preloadImage } from "./lib.mjs";

const stroke = 'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"';
const SPRITE = `<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <defs>
    <symbol id="i-arrow" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" ${stroke}/></symbol>
    <symbol id="i-arrow-up-right" viewBox="0 0 24 24"><path d="M7 17 17 7M9 7h8v8" ${stroke}/></symbol>
    <symbol id="i-download" viewBox="0 0 24 24"><path d="M12 4v11M7 10l5 5 5-5M5 20h14" ${stroke}/></symbol>
    <symbol id="i-whatsapp" viewBox="0 0 24 24"><path fill="currentColor" d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.47-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.59-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.41-.08-.13-.28-.2-.57-.35m-5.42 7.4h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89a11.82 11.82 0 0 0-3.48-8.41Z"/></symbol>
    <symbol id="i-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" ${stroke}/><path d="M12 7.5V12l3 2" ${stroke}/></symbol>
    <symbol id="i-pin" viewBox="0 0 24 24"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" ${stroke}/><circle cx="12" cy="10" r="2.3" ${stroke}/></symbol>
    <symbol id="i-phone" viewBox="0 0 24 24"><path d="M6.6 3.5h2.6l1.4 4-2 1.4a11 11 0 0 0 6.5 6.5l1.4-2 4 1.4v2.6a2 2 0 0 1-2.2 2A16 16 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z" ${stroke}/></symbol>
    <symbol id="i-mail" viewBox="0 0 24 24"><rect x="3.5" y="5.5" width="17" height="13" rx="2" ${stroke}/><path d="m4 7 8 6 8-6" ${stroke}/></symbol>
    <symbol id="i-menu" viewBox="0 0 24 24"><path d="M4 8h16M4 16h16" ${stroke}/></symbol>
    <symbol id="i-close" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18" ${stroke}/></symbol>
    <symbol id="i-left" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" ${stroke}/></symbol>
    <symbol id="i-right" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" ${stroke}/></symbol>
    <symbol id="i-down" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" ${stroke}/></symbol>
    <symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" ${stroke}/></symbol>
    <symbol id="i-calendar" viewBox="0 0 24 24"><rect x="4" y="5.5" width="16" height="14.5" rx="2" ${stroke}/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" ${stroke}/></symbol>
    <symbol id="i-cutlery" viewBox="0 0 24 24"><path d="M7 3.5v7a2 2 0 0 0 4 0v-7M9 10.5v10M17 20.5v-17c-2 1-3 3.5-3 7h3" ${stroke}/></symbol>
    <symbol id="i-bed" viewBox="0 0 24 24"><path d="M3.5 18.5v-11M3.5 14h17v4.5M20.5 14v-2.5a3 3 0 0 0-3-3h-6V14" ${stroke}/><circle cx="7.5" cy="11" r="1.8" ${stroke}/></symbol>
    <symbol id="i-leaf" viewBox="0 0 24 24"><path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14M5 19c3-4 6-6.5 9-8.5" ${stroke}/></symbol>
    <symbol id="i-waves" viewBox="0 0 24 24"><path d="M3 9c2-1.6 3.5-1.6 5 0s3 1.6 4.5 0 3-1.6 4.5 0 3 1.6 4 0M3 14c2-1.6 3.5-1.6 5 0s3 1.6 4.5 0 3-1.6 4.5 0 3 1.6 4 0M7 6.5c1.5-1 3-1 4.5 0" ${stroke}/></symbol>
    <symbol id="i-heart" viewBox="0 0 24 24"><path d="M12 19.5s-7.5-4.4-7.5-10A4 4 0 0 1 12 7a4 4 0 0 1 7.5 2.5c0 5.6-7.5 10-7.5 10Z" ${stroke}/></symbol>
    <symbol id="i-coffee" viewBox="0 0 24 24"><path d="M5 9.5h11v4.5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5V9.5ZM16 11h1.5a2.5 2.5 0 0 1 0 5H16M8 3.5c-.6 1 .6 1.8 0 3M11.5 3.5c-.6 1 .6 1.8 0 3" ${stroke}/></symbol>
    <symbol id="i-sunset" viewBox="0 0 24 24"><path d="M4 18h16M7.5 14.5a4.5 4.5 0 0 1 9 0M12 4.5v3M5 9l1.8 1.5M19 9l-1.8 1.5M2.5 14.5h2.5M19 14.5h2.5M9.5 21h5" ${stroke}/></symbol>
    <symbol id="i-quote" viewBox="0 0 24 24"><path d="M10 7c-3 1-5 3.5-5 7v3h5v-5H7.5c0-2 1-3.5 3-4.2L10 7Zm9 0c-3 1-5 3.5-5 7v3h5v-5h-2.5c0-2 1-3.5 3-4.2L19 7Z" fill="currentColor"/></symbol>
    <symbol id="i-star" viewBox="0 0 24 24"><path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8L12 3.5Z" fill="currentColor"/></symbol>
    <symbol id="i-external" viewBox="0 0 24 24"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" ${stroke}/></symbol>
    <symbol id="i-hut" viewBox="0 0 48 48">
      <path d="M24 3 6 21h36L24 3Z" fill="currentColor"/>
      <path d="M24 3 15 12h18L24 3Z" fill="#C89640"/>
      <path d="M11 21v11M19 21v11M29 21v11M37 21v11M8 26.5h32" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M4 38c3-2.2 5.5-2.2 8.5 0s5.5 2.2 8.5 0 5.5-2.2 8.5 0 5.5 2.2 8.5 0 5-2.2 6 0M8 43.5c2.6-1.8 5-1.8 7.5 0s5 1.8 7.5 0 5-1.8 7.5 0 5 1.8 7.5 0" fill="none" stroke="#A8432A" stroke-width="2.4" stroke-linecap="round"/>
    </symbol>
  </defs>
</svg>`;

// Woven band inspired by Timorese tais: a row of diamonds in terracotta and gold on forest green.
export const TAIS = `<div class="tais" aria-hidden="true"></div>`;

function jsonLd(obj) {
  return `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, "\\u003c")}</script>`;
}

// Restaurant + lodging in one entity; only confirmed fields are emitted.
function businessLd(t) {
  const ld = {
    "@context": "https://schema.org",
    "@type": ["Restaurant", "Hotel"],
    "@id": absUrl("/#business"),
    name: site.name,
    url: absUrl(href("home", t.lang)),
    image: absUrl("/assets/img/og-image.jpg"),
    address: {
      "@type": "PostalAddress",
      addressLocality: site.address.locality,
      addressRegion: site.address.region,
      addressCountry: site.address.countryCode,
    },
    hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.mapQuery)}`,
  };
  if (site.phone) ld.telephone = site.phone;
  if (site.email) ld.email = site.email;
  if (site.geo) ld.geo = { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng };
  const same = Object.values(site.social).filter(Boolean);
  if (same.length) ld.sameAs = same;
  if (site.stayTimes) {
    ld.checkinTime = site.stayTimes.checkIn;
    ld.checkoutTime = site.stayTimes.checkOut;
  }
  return ld;
}

export const logo = (t, cls = "") => `<a class="brand ${cls}" href="${href("home", t.lang)}" aria-label="${esc(site.name)} — ${esc(t.nav.home)}">
  <svg class="brand-mark" aria-hidden="true"><use href="#i-hut"></use></svg>
  <span class="brand-text"><span class="brand-name">Lauhata</span><span class="brand-line">${esc(t.brandLine)}</span></span>
</a>`;

function langSwitch(t, alt, cls = "") {
  const L = t.lang;
  const other = L === "pt" ? "en" : "pt";
  return `<div class="lang ${cls}" role="group" aria-label="${esc(t.nav.switchLang)}">
    <span class="lang-opt is-on" aria-current="true">${t.langShort}</span>
    <a class="lang-opt" href="${alt}" hreflang="${other === "pt" ? "pt" : "en"}" lang="${other === "pt" ? "pt-PT" : "en"}" title="${esc(t.nav.switchLang)}">${other.toUpperCase()}</a>
  </div>`;
}

function header(t, page, alt) {
  const L = t.lang;
  const link = (p, label, hash = "") =>
    `<a href="${href(p, L, hash)}"${page === p && !hash ? ' aria-current="page"' : ""}>${esc(label)}</a>`;
  const nav = [
    link("restaurant", t.nav.restaurant),
    link("stay", t.nav.stay),
    link("home", t.nav.story, "#historia"),
    link("contact", t.nav.contact),
  ].join("");
  return `<header class="site-header" data-header>
  <div class="wrap header-inner">
    ${logo(t)}
    <nav class="nav-main" aria-label="${esc(t.nav.primary)}">${nav}</nav>
    <div class="header-actions">
      ${langSwitch(t, alt)}
      <div class="book-menu" data-book-menu>
        <button class="btn btn-dark btn-sm" type="button" aria-expanded="false" aria-controls="book-pop-${L}" data-book-toggle>${esc(t.nav.book)}${icon("calendar")}</button>
        <div class="book-pop" id="book-pop-${L}" hidden>
          <a href="${href("restaurant", L, "#reservar")}">${icon("cutlery")}<span>${esc(t.nav.bookTable)}</span></a>
          <a href="${href("stay", L, "#reservar")}">${icon("bed")}<span>${esc(t.nav.bookRoom)}</span></a>
        </div>
      </div>
      <button class="icon-btn nav-toggle" type="button" aria-label="${esc(t.nav.openMenu)}" aria-expanded="false" aria-controls="mobile-nav" data-nav-open>${icon("menu")}</button>
    </div>
  </div>
</header>
<dialog class="mobile-nav" id="mobile-nav" aria-label="${esc(t.nav.primary)}" data-mobile-nav>
  <div class="mobile-nav-top">
    ${logo(t)}
    <button class="icon-btn" type="button" aria-label="${esc(t.nav.closeMenu)}" data-nav-close>${icon("close")}</button>
  </div>
  <nav class="mobile-nav-links">
    ${link("home", t.nav.home)}${nav}
  </nav>
  <div class="mobile-nav-cta">
    <a class="btn btn-dark" href="${href("restaurant", L, "#reservar")}">${esc(t.home.hero.ctaTable)}${icon("arrow")}</a>
    <a class="btn btn-outline" href="${href("stay", L, "#reservar")}">${esc(t.home.hero.ctaRoom)}${icon("bed")}</a>
    ${langSwitch(t, alt, "lang-center")}
  </div>
</dialog>`;
}

function footer(t) {
  const L = t.lang;
  const year = new Date().getFullYear();
  const contacts = [
    `<li><a href="${waLink(t.form.waHello)}" target="_blank" rel="noopener">${icon("whatsapp")}<span>${esc(t.common.whatsapp)}${site.whatsapp ? "" : ` — ${esc(t.common.toConfirm)}`}</span></a></li>`,
    site.phone ? `<li><a href="tel:${esc(site.phone.replace(/\s/g, ""))}">${icon("phone")}<span>${esc(site.phone)}</span></a></li>` : "",
    site.email ? `<li><a href="mailto:${esc(site.email)}">${icon("mail")}<span>${esc(site.email)}</span></a></li>` : "",
    `<li><a href="${href("contact", L)}">${icon("pin")}<span>${esc(site.address.locality)}, ${esc(site.address.region)}</span></a></li>`,
  ].join("");
  const social = Object.entries(site.social).filter(([, u]) => u);
  return `<footer class="site-footer">
  ${TAIS}
  <div class="wrap footer-grid">
    <div class="footer-brand">
      ${logo(t, "brand-light")}
      <p>${esc(t.footer.tagline)}</p>
    </div>
    <div>
      <h2 class="footer-h">${esc(t.footer.explore)}</h2>
      <ul class="footer-list">
        <li><a href="${href("restaurant", L)}">${esc(t.nav.restaurant)}</a></li>
        <li><a href="${href("restaurant", L, "#ementa")}">${esc(t.nav.menu)}</a></li>
        <li><a href="${href("stay", L)}">${esc(t.nav.stay)}</a></li>
        <li><a href="${href("home", L, "#experiencias")}">${esc(t.nav.experiences)}</a></li>
        <li><a href="${href("home", L, "#historia")}">${esc(t.nav.story)}</a></li>
        <li><a href="${href("contact", L)}">${esc(t.nav.contact)}</a></li>
      </ul>
    </div>
    <div>
      <h2 class="footer-h">${esc(t.footer.contact)}</h2>
      <ul class="footer-list with-icons">${contacts}</ul>
      ${social.length ? `<ul class="social">${social.map(([k, u]) => `<li><a href="${esc(u)}" target="_blank" rel="noopener">${esc(k[0].toUpperCase() + k.slice(1))}</a></li>`).join("")}</ul>` : ""}
    </div>
    <div>
      <h2 class="footer-h">${esc(t.footer.hours)}</h2>
      ${hoursList(t)}
    </div>
  </div>
  <p class="footer-mega" aria-hidden="true">Lauhata</p>
  ${usesPlaceholderImages() ? `<p class="wrap footer-note">${esc(t.home.placeholderNote)}</p>` : ""}
  <div class="wrap footer-base">
    <p>© ${year} ${esc(site.name)}. ${esc(t.footer.rights)}</p>
    <p><a href="${href("privacy", L)}">${esc(t.footer.privacy)}</a> · <a href="https://theelevatewebstudios.com" target="_blank" rel="noopener">${esc(t.footer.credit)}</a></p>
  </div>
</footer>`;
}

/**
 * @param {object} t        strings for the page language
 * @param {object} o        page options
 *   page     route key (for aria-current), alt: same page in the other language
 *   title, description, path, robots, ld (extra JSON-LD objects), preload (hero image key), body (main HTML)
 */
export function layout(t, o) {
  const L = t.lang;
  const other = L === "pt" ? "en" : "pt";
  const canonical = absUrl(o.path);
  const alternates = { [L]: o.path, [other]: o.alt };
  const runtime = {
    lang: L,
    whatsapp: site.whatsapp,
    thanks: href("thanks", L),
    i18n: { form: t.form, common: t.common },
  };
  return `<!doctype html>
<html lang="${t.htmlLang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(o.title)}</title>
<meta name="description" content="${esc(o.description)}">
${o.robots ? `<meta name="robots" content="${o.robots}">` : `<link rel="canonical" href="${canonical}">`}
${o.robots ? "" : LANGS.map((l) => `<link rel="alternate" hreflang="${l === "pt" ? "pt-PT" : "en"}" href="${absUrl(alternates[l])}">`).join("\n")}
${o.robots ? "" : `<link rel="alternate" hreflang="x-default" href="${absUrl(alternates.pt)}">`}
<meta name="theme-color" content="#0F2E28">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:locale" content="${t.locale}">
<meta property="og:title" content="${esc(o.title)}">
<meta property="og:description" content="${esc(o.description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${absUrl("/assets/img/og-image.jpg")}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(t.footer.tagline)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://images.unsplash.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+Display:ital,wght@0,400;0,500;1,400&family=Manrope:wght@400;500;600;700&display=swap">
${o.preload ? preloadImage(o.preload) : ""}
<link rel="stylesheet" href="/assets/css/main.css">
<link rel="stylesheet" href="/assets/css/cinema.css">
${jsonLd(businessLd(t))}
${(o.ld || []).map(jsonLd).join("\n")}
<script>window.LAUHATA=${JSON.stringify(runtime).replace(/</g, "\\u003c")};</script>
<script src="/assets/js/main.js" defer></script>
${site.gaId ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${esc(site.gaId)}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag("js",new Date());gtag("config","${esc(site.gaId)}",{anonymize_ip:true});</script>` : ""}
</head>
<body class="${o.hero ? "has-hero" : ""}">
${SPRITE}
${o.intro ? `<div class="intro" data-intro aria-hidden="true">
  <svg class="intro-mark"><use href="#i-hut"></use></svg>
  <p class="intro-name">${"Lauhata".split("").map((c, i) => `<span style="--i:${i}">${c}</span>`).join("")}</p>
  <p class="intro-line">${esc(t.brandLine)}</p>
</div>
<script>try{if(sessionStorage.getItem("lauhata-intro")||matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("no-intro");sessionStorage.setItem("lauhata-intro","1")}catch(e){}</script>` : ""}
<div class="cursor" data-cursor-dot aria-hidden="true"><span data-cursor-label></span></div>
<a class="skip-link" href="#main">${esc(t.nav.skip)}</a>
${header(t, o.page, o.alt)}
<main id="main" tabindex="-1">
${o.body}
</main>
${footer(t)}
<div class="mobile-bar" data-mobile-bar>
  <a class="btn btn-dark" href="${href("restaurant", L, "#reservar")}">${icon("cutlery")}${esc(t.home.quick.tabTable.split(" ")[0])}</a>
  <a class="btn btn-terra" href="${href("stay", L, "#reservar")}">${icon("bed")}${esc(t.home.quick.tabRoom)}</a>
  <a class="icon-btn wa" href="${waLink(t.form.waHello)}" target="_blank" rel="noopener" aria-label="${esc(t.common.whatsapp)}">${icon("whatsapp")}</a>
</div>
<a class="wa-float" href="${waLink(t.form.waHello)}" target="_blank" rel="noopener" aria-label="${esc(t.common.whatsapp)}">${icon("whatsapp")}</a>
<dialog class="lightbox" data-lightbox aria-label="${esc(t.gallery.label)}">
  <button class="icon-btn lb-close" type="button" aria-label="${esc(t.common.close)}" data-lb-close>${icon("close")}</button>
  <button class="icon-btn lb-prev" type="button" aria-label="${esc(t.common.previous)}" data-lb-prev>${icon("left")}</button>
  <figure class="lb-figure"><img alt="" data-lb-img><figcaption data-lb-cap></figcaption></figure>
  <button class="icon-btn lb-next" type="button" aria-label="${esc(t.common.next)}" data-lb-next>${icon("right")}</button>
</dialog>
<script src="https://unpkg.com/lenis@1.1.13/dist/lenis.min.js" defer></script>
</body>
</html>
`;
}
