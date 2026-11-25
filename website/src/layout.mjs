// Page shell shared by every page: <head> with SEO tags, header, footer, global UI and scripts.
import { esc, fmt, href, absUrl, site, icon, waLink, hoursList, LANGS, usesPlaceholderImages, preloadImage, menuJson } from "./lib.mjs";
import { bookingCard } from "./pages.mjs"; // used only at render time, so the two modules may import each other

const stroke = 'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"';
// Icons: Lucide (lucide.dev, ISC licence) for most, drawn into one sprite; a few of the site's own in the same stroke.
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
    <symbol id="i-globe" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" ${stroke}/><path d="M3 12h18M12 3c2.6 2.6 4 5.7 4 9s-1.4 6.4-4 9c-2.6-2.6-4-5.7-4-9s1.4-6.4 4-9Z" ${stroke}/></symbol>
    <symbol id="i-down" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" ${stroke}/></symbol>
    <symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" ${stroke}/></symbol>
    <symbol id="i-calendar" viewBox="0 0 24 24"><rect x="4" y="5.5" width="16" height="14.5" rx="2" ${stroke}/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" ${stroke}/></symbol>
    <symbol id="i-cutlery" viewBox="0 0 24 24"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" ${stroke}/><path d="M7 2v20" ${stroke}/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" ${stroke}/></symbol>
    <symbol id="i-bed" viewBox="0 0 24 24"><path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8" ${stroke}/><path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" ${stroke}/><path d="M12 4v6" ${stroke}/><path d="M2 18h20" ${stroke}/></symbol>
    <symbol id="i-bed-queen" viewBox="0 0 24 24"><path d="M3 19v-8.5M21 19v-8.5M3 15.5h18M3 13h18v2.5M5.5 13v-2.2a1.3 1.3 0 0 1 1.3-1.3h3.4a1.3 1.3 0 0 1 1.3 1.3V13M12.5 13v-2.2a1.3 1.3 0 0 1 1.3-1.3h3.4a1.3 1.3 0 0 1 1.3 1.3V13M3 10.5V6.5a1.5 1.5 0 0 1 1.5-1.5h15A1.5 1.5 0 0 1 21 6.5v4" ${stroke}/></symbol>
    <symbol id="i-bed-single" viewBox="0 0 24 24"><path d="M6.5 19.5v-9M17.5 19.5v-9M6.5 16h11M6.5 13.5h11V16M9 13.5v-1.8a1.2 1.2 0 0 1 1.2-1.2h3.6a1.2 1.2 0 0 1 1.2 1.2v1.8M6.5 10.5V6a1.5 1.5 0 0 1 1.5-1.5h8A1.5 1.5 0 0 1 17.5 6v4.5" ${stroke}/></symbol>
    <symbol id="i-tv" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="12" rx="2" ${stroke}/><path d="M8.5 20.5h7M12 17v3.5" ${stroke}/></symbol>
    <symbol id="i-wifi" viewBox="0 0 24 24"><path d="M12 20h.01" ${stroke}/><path d="M2 8.82a15 15 0 0 1 20 0" ${stroke}/><path d="M5 12.859a10 10 0 0 1 14 0" ${stroke}/><path d="M8.5 16.429a5 5 0 0 1 7 0" ${stroke}/></symbol>
    <symbol id="i-shower" viewBox="0 0 24 24"><path d="M10 4 8 6" ${stroke}/><path d="M17 19v2" ${stroke}/><path d="M2 12h20" ${stroke}/><path d="M7 19v2" ${stroke}/><path d="M9 5 7.621 3.621A2.121 2.121 0 0 0 4 5v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" ${stroke}/></symbol>
    <symbol id="i-snowflake" viewBox="0 0 24 24"><path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M9.5 4.5L12 7l2.5-2.5M9.5 19.5L12 17l2.5 2.5M3.5 10l3.3-.9-.9-3.3M20.5 14l-3.3.9.9 3.3M3.5 14l3.3.9-.9 3.3M20.5 10l-3.3-.9.9-3.3" ${stroke}/></symbol>
    <symbol id="i-up" viewBox="0 0 24 24"><path d="m5 12 7-7 7 7" ${stroke}/><path d="M12 19V5" ${stroke}/></symbol>
    <symbol id="i-plane" viewBox="0 0 24 24"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" ${stroke}/></symbol>
    <symbol id="i-nosmoke" viewBox="0 0 24 24"><path d="M12 12H3a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h13" ${stroke}/><path d="M18 8c0-2.5-2-2.5-2-5" ${stroke}/><path d="m2 2 20 20" ${stroke}/><path d="M21 12a1 1 0 0 1 1 1v2a1 1 0 0 1-.5.866" ${stroke}/><path d="M22 8c0-2.5-2-2.5-2-5" ${stroke}/><path d="M7 12v4" ${stroke}/></symbol>
    <symbol id="i-glass" viewBox="0 0 24 24"><path d="M8 22h8" ${stroke}/><path d="M12 11v11" ${stroke}/><path d="m19 3-7 8-7-8Z" ${stroke}/></symbol>
    <symbol id="i-car" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ${stroke}/><path d="M9 17V7h4a3 3 0 0 1 0 6H9" ${stroke}/></symbol>
    <symbol id="i-users" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" ${stroke}/><circle cx="9" cy="7" r="4" ${stroke}/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" ${stroke}/></symbol>
    <symbol id="i-leaf" viewBox="0 0 24 24"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" ${stroke}/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" ${stroke}/></symbol>
    <symbol id="i-waves" viewBox="0 0 24 24"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" ${stroke}/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" ${stroke}/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" ${stroke}/></symbol>
    <symbol id="i-heart" viewBox="0 0 24 24"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" ${stroke}/></symbol>
    <symbol id="i-coffee" viewBox="0 0 24 24"><path d="M10 2v2" ${stroke}/><path d="M14 2v2" ${stroke}/><path d="M6 2v2" ${stroke}/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1" ${stroke}/></symbol>
    <symbol id="i-sunset" viewBox="0 0 24 24"><path d="M12 10V2" ${stroke}/><path d="m4.93 10.93 1.41 1.41" ${stroke}/><path d="M2 18h2" ${stroke}/><path d="M20 18h2" ${stroke}/><path d="m19.07 10.93-1.41 1.41" ${stroke}/><path d="M22 22H2" ${stroke}/><path d="m16 6-4 4-4-4" ${stroke}/><path d="M16 18a4 4 0 0 0-8 0" ${stroke}/></symbol>
    <symbol id="i-quote" viewBox="0 0 24 24"><path d="M10 7c-3 1-5 3.5-5 7v3h5v-5H7.5c0-2 1-3.5 3-4.2L10 7Zm9 0c-3 1-5 3.5-5 7v3h5v-5h-2.5c0-2 1-3.5 3-4.2L19 7Z" fill="currentColor"/></symbol>
    <symbol id="i-star" viewBox="0 0 24 24"><path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8L12 3.5Z" fill="currentColor"/></symbol>
    <symbol id="i-external" viewBox="0 0 24 24"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" ${stroke}/></symbol>
    <symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5" ${stroke}/><path d="m16 16 4.5 4.5" ${stroke}/></symbol>
    <symbol id="i-cart" viewBox="0 0 24 24"><path d="M5 8h14l-1 11.5a1 1 0 0 1-1 .9H7a1 1 0 0 1-1-.9L5 8Z" ${stroke}/><path d="M9 8V6.5a3 3 0 0 1 6 0V8" ${stroke}/></symbol>
    <symbol id="i-minus" viewBox="0 0 24 24"><path d="M5 12h14" ${stroke}/></symbol>
    <symbol id="i-pause" viewBox="0 0 24 24"><rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor"/><rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor"/></symbol>
    <symbol id="i-play" viewBox="0 0 24 24"><path d="M6 3l14 9-14 9z" fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></symbol>
    <symbol id="i-palm" viewBox="0 0 24 24"><path d="M13 8c0-2.76-2.46-5-5.5-5S2 5.24 2 8h2l1-1 1 1h4" ${stroke}/><path d="M13 7.14A5.82 5.82 0 0 1 16.5 6c3.04 0 5.5 2.24 5.5 5h-3l-1-1-1 1h-3" ${stroke}/><path d="M5.89 9.71c-2.15 2.15-2.3 5.47-.35 7.43l4.24-4.25.7-.7.71-.71 2.12-2.12c-1.95-1.96-5.27-1.8-7.42.35" ${stroke}/><path d="M11 15.5c.5 2.5-.17 4.5-1 6.5h4c2-5.5-.5-12-1-14" ${stroke}/></symbol>
    <symbol id="i-check" viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5" ${stroke}/></symbol>
    <symbol id="i-trash" viewBox="0 0 24 24"><path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12M10 11v5M14 11v5" ${stroke}/></symbol>
  </defs>
</svg>`;

// "+670 7740 1111" from the stored digits (country code 670, then two groups of four).
const fmtPhone = (d) => (/^670\d{8}$/.test(d) ? `+670 ${d.slice(3, 7)} ${d.slice(7)}` : `+${d}`);


function jsonLd(obj) {
  return `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, "\\u003c")}</script>`;
}

// Restaurant + lodging in one entity; only confirmed fields are emitted.
function businessLd(t) {
  const ld = {
    "@context": "https://schema.org",
    "@type": ["Restaurant", "LodgingBusiness"],
    "@id": absUrl("/#business"),
    name: site.name,
    url: absUrl(href("home", t.lang)),
    image: absUrl("/assets/img/og-image.jpg"),
    logo: absUrl("/assets/img/brand/logo-lauhata-beach-escape-160.png"),
    address: {
      "@type": "PostalAddress",
      ...(site.address.street ? { streetAddress: site.address.street } : {}),
      addressLocality: site.address.locality,
      addressRegion: site.address.region,
      addressCountry: site.address.countryCode,
    },
    hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.mapQuery)}`,
    hasMenu: absUrl(href("restaurant", t.lang, "#ementa")),
  };
  if (site.priceRange) ld.priceRange = site.priceRange;
  if (site.servesCuisine.length) ld.servesCuisine = site.servesCuisine;
  if (site.openingHoursSpec.length) {
    ld.openingHoursSpecification = site.openingHoursSpec.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.days,
      opens: h.opens,
      closes: h.closes,
    }));
  }
  if (site.phone) ld.telephone = `+${site.phone}`;
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
  <span class="brand-mark" aria-hidden="true"><img src="/assets/img/brand/logo-lauhata-beach-escape-160.webp" width="160" height="160" alt=""${cls ? " loading=\"lazy\"" : ""}></span>
  <span class="brand-text"><span class="brand-name">Lauhata</span> <span class="brand-line">${esc(t.brandLine)}</span></span>
</a>`;

// The header's language control: a globe button that opens a short list of the two languages (names in their own
// language). The current one is marked and is not a link; the other one goes to the same page in that language.
// Behaviour (open, close on Escape or outside click) is in assets/js/main.js.
function langMenu(t, alt) {
  const L = t.lang;
  const names = { en: "English", pt: "Português" };
  const item = (l) => l === L
    ? `<li><span class="lang-dd-item is-on" aria-current="true" lang="${l === "pt" ? "pt-PT" : "en"}">${names[l]}${icon("check")}</span></li>`
    : `<li><a class="lang-dd-item" href="${alt}" hreflang="${l}" lang="${l === "pt" ? "pt-PT" : "en"}">${names[l]}</a></li>`;
  return `<div class="lang-dd" data-lang-dd>
    <button class="lang-dd-btn" type="button" aria-expanded="false" aria-controls="lang-menu-${L}" aria-label="${t.langShort} · ${esc(t.nav.language)}: ${esc(t.langName)}">${icon("globe")}<span aria-hidden="true">${t.langShort}</span>${icon("down")}</button>
    <ul class="lang-dd-menu" id="lang-menu-${L}" hidden>${item("en")}${item("pt")}</ul>
  </div>`;
}

function langSwitch(t, alt, cls = "") {
  const L = t.lang;
  const other = L === "pt" ? "en" : "pt";
  // Fixed order, English first (it is the default language); the current one is the marked, non-link option.
  const opt = (l) => l === L
    ? `<span class="lang-opt is-on" aria-current="true">${t.langShort}</span>`
    : `<a class="lang-opt" href="${alt}" hreflang="${l === "pt" ? "pt" : "en"}" lang="${l === "pt" ? "pt-PT" : "en"}" title="${esc(t.nav.switchLang)}">${l.toUpperCase()}</a>`;
  return `<div class="lang ${cls}" role="group" aria-label="${esc(t.nav.switchLang)}">
    ${opt("en")}
    ${opt("pt")}
  </div>`;
}

// ---------- Restaurant order (cart) ----------
// Markup only: state, rendering and the WhatsApp message are in assets/js/order.js. The cart lives on
// every page so an order survives navigation; dishes are added from the menu and the homepage row.
const cartButton = (t) => `<button class="cart-btn" type="button" data-cart-open aria-haspopup="dialog" aria-label="${esc(t.order.open)}">${icon("cart")}<span class="cart-count" data-cart-count hidden>0</span></button>`;

function cartUi(t) {
  const L = t.lang;
  const O = t.order;
  const types = site.order.types;
  const typeField = types.length
    ? `<fieldset class="order-types"><legend>${esc(O.type)}</legend>${types
        .map((ty) => `<label class="choice"><input type="radio" name="type" value="${esc(ty.id)}" data-ask-table="${ty.askTable ? 1 : 0}"><span>${esc(ty.label[L])}</span></label>`)
        .join("")}<p class="error" data-err="type" aria-live="polite"></p></fieldset>`
    : "";
  const tableField = types.some((ty) => ty.askTable)
    ? `<div class="field" data-table-field hidden><label for="ord-table">${esc(O.table)}</label><input id="ord-table" name="table" maxlength="12" autocomplete="off"><p class="error" data-err="table" aria-live="polite"></p></div>`
    : "";
  return `<button class="cart-fab" type="button" data-cart-open data-cart-fab hidden>${icon("cart")}<span class="cart-fab-label">${esc(O.viewOrder)}</span><span class="cart-fab-n" data-fab-count></span><strong data-fab-total></strong></button>
<p class="sr-only" role="status" aria-live="polite" data-cart-live></p>
<dialog class="cart" data-cart aria-labelledby="cart-title">
  <div class="cart-panel">
    <header class="cart-head">
      <h2 id="cart-title" data-cart-title>${esc(O.cartTitle)}</h2>
      <button class="icon-btn" type="button" data-cart-close aria-label="${esc(O.close)}">${icon("close")}</button>
    </header>
    <div class="cart-step" data-step="list">
      <div class="cart-scroll">
        <ul class="cart-lines" data-cart-lines></ul>
        <div class="cart-empty" data-cart-empty hidden>
          <svg class="cart-empty-mark" aria-hidden="true"><use href="#i-cart"></use></svg>
          <h3>${esc(O.emptyTitle)}</h3>
          <p>${esc(O.emptyBody)}</p>
          <a class="btn btn-dark" href="${href("restaurant", L, "#ementa")}" data-cart-close>${esc(O.viewMenu)}${icon("arrow")}</a>
        </div>
      </div>
      <p class="dine-in is-cart">${icon("cutlery")}<span>${esc(O.dineIn)}</span></p>
      <footer class="cart-foot" data-cart-foot>
        <p class="cart-total"><span>${esc(O.total)}</span><strong data-cart-sum></strong></p>
        <button class="btn btn-terra btn-lg" type="button" data-cart-checkout>${esc(O.checkout)}${icon("arrow")}</button>
        <button class="btn btn-outline" type="button" data-cart-close>${esc(O.continue)}</button>
      </footer>
    </div>
    <form class="cart-step" data-step="checkout" data-order-form novalidate hidden>
      <div class="cart-scroll">
        <p class="cart-mini" data-cart-mini></p>
        <div class="field"><label for="ord-name">${esc(O.name)}</label><input id="ord-name" name="name" autocomplete="name" maxlength="80"><p class="error" data-err="name" aria-live="polite"></p></div>
        ${typeField}
        ${tableField}
        <div class="field"><label for="ord-notes">${esc(O.notes)} <span class="opt">(${esc(O.optional)})</span></label><textarea id="ord-notes" name="notes" rows="3" maxlength="400" placeholder="${esc(O.notesPlaceholder)}"></textarea></div>
        <p class="dine-in is-cart">${icon("cutlery")}<span>${esc(O.dineIn)}</span></p>
        <p class="form-note">${esc(O.note)}</p>
      </div>
      <footer class="cart-foot">
        <div class="form-errors" role="alert" hidden data-order-errors>${esc(O.errorsTitle)}</div>
        <button class="btn btn-terra btn-lg" type="submit">${icon("whatsapp")}<span data-order-send>${esc(O.send)}</span></button>
        <button class="btn btn-outline" type="button" data-cart-back>${esc(O.back)}</button>
      </footer>
    </form>
  </div>
</dialog>
<dialog class="pick" data-opt aria-labelledby="opt-title">
  <form class="pick-panel" data-opt-form novalidate>
    <header class="pick-head">
      <div><h2 id="opt-title" data-opt-title></h2><p data-opt-desc></p></div>
      <button class="icon-btn" type="button" data-opt-close aria-label="${esc(O.close)}">${icon("close")}</button>
    </header>
    <div class="pick-groups" data-opt-groups></div>
    <div class="pick-qty">
      <span id="opt-qty-label">${esc(O.qty)}</span>
      <div class="stepper" role="group" aria-labelledby="opt-qty-label">
        <button type="button" data-opt-dec aria-label="${esc(O.decrease.replace("{name}", ""))}">${icon("minus")}</button>
        <output data-opt-qty>1</output>
        <button type="button" data-opt-inc aria-label="${esc(O.increase.replace("{name}", ""))}">${icon("plus")}</button>
      </div>
    </div>
    <p class="error" data-opt-error aria-live="polite"></p>
    <footer class="pick-foot">
      <button class="btn btn-outline" type="button" data-opt-close>${esc(O.cancel)}</button>
      <button class="btn btn-terra" type="submit" data-opt-submit>${esc(O.addToOrder)}</button>
    </footer>
  </form>
</dialog>`;
}

function header(t, page, alt) {
  const L = t.lang;
  const link = (p, label, hash = "") =>
    `<a href="${href(p, L, hash)}"${page === p && !hash ? ' aria-current="page"' : ""}>${esc(label)}</a>`;
  // Primary navigation: exactly Restaurant, Hotel, Experiences, Gallery, Contact, plus a Reserve button. The logo is the way home. The same
  // names are used in the drawer and the footer. "Hotel" (client, 25 Nov 2026) leads to the accommodation pages (/stay/). "Experiences" is the events page. Our Story and Discover Liquiçá live on the
  // home page and in the footer.
  const items = [["restaurant", t.nav.restaurant], ["stay", t.nav.stay], ["events", t.nav.events], ["gallery", t.nav.gallery], ["contact", t.nav.contact]];
  const nav = [
    link("restaurant", t.nav.restaurant),
    link("stay", t.nav.stay),
    link("events", t.nav.events),
    link("gallery", t.nav.gallery),
    link("contact", t.nav.contact),
  ].join("");
  return `<header class="site-header" data-header>
  <div class="wrap header-inner">
    ${logo(t)}
    <nav class="nav-main" aria-label="${esc(t.nav.primary)}">${nav}</nav>
    <div class="header-actions">
      ${langMenu(t, alt)}
      ${cartButton(t)}
      <a class="btn btn-terra btn-sm book-btn" href="${href("contact", L)}" data-book-open aria-haspopup="dialog"><span class="bk-long">${esc(t.land.resort.reserveLong)}</span><span class="bk-short">${esc(t.land.resort.reserve)}</span></a>
      <button class="nav-toggle" type="button" aria-label="${esc(t.nav.openMenu)}" aria-expanded="false" aria-controls="mobile-nav" data-nav-open><span class="nav-bars" aria-hidden="true"><i></i><i></i><i></i></span></button>
    </div>
  </div>
</header>
<dialog class="mobile-nav" id="mobile-nav" aria-label="${esc(t.nav.primary)}" data-mobile-nav>
  <div class="mn-panel">
    <div class="mn-top">
      <span class="mn-title">${esc(t.nav.menuBtn)}</span>
      <button class="mn-close icon-btn" type="button" aria-label="${esc(t.nav.closeMenu)}" data-nav-close>${icon("close")}</button>
    </div>
    <nav class="mn-links" aria-label="${esc(t.nav.primary)}">
      <ul>${items.map(([p, label]) => `<li><a href="${href(p, L)}"${page === p ? ' aria-current="page"' : ""}>${esc(label)}</a></li>`).join("")}</ul>
    </nav>
    <ul class="mn-sub">
      <li><a href="${href("about", L)}">${esc(t.nav.story)}</a></li>
      <li><a href="${href("discover", L)}">${esc(t.nav.discover)}</a></li>
      <li><a href="${href("contact", L, "#faq")}">${esc(t.faq.linkLabel)}</a></li>
    </ul>
    <div class="mn-cta">
      <a class="btn btn-terra" href="${href("contact", L)}" data-book-open="table">${icon("cutlery")}${esc(t.home.hero.ctaTable)}</a>
      <a class="btn btn-outline" href="${href("contact", L)}" data-book-open="room">${icon("bed")}${esc(t.home.hero.ctaRoom)}</a>
      ${langSwitch(t, alt, "lang-center")}
    </div>
    ${Object.entries(site.social).filter(([, u]) => u).length ? `<ul class="mn-social">${Object.entries(site.social).filter(([, u]) => u).map(([k, u]) => `<li><a href="${esc(u)}" target="_blank" rel="noopener">${esc(k[0].toUpperCase() + k.slice(1))}</a></li>`).join("")}</ul>` : ""}
  </div>
</dialog>`;
}

// The Tripadvisor summary used by the footer and the home page: a link to the real listing, with the rating and the number
// of reviews only when they are filled in site.reviews (never invented, never scraped).
export function tripadvisorBadge(t, cls = "") {
  const ta = site.reviews && site.reviews.tripadvisor;
  if (!ta || !ta.url) return "";
  const R = t.reviews;
  const facts = [ta.rating ? `<span class="ta-rating">${esc(fmt(R.rating, { rating: String(ta.rating).replace(".", t.lang === "pt" ? "," : ".") }))}</span>` : "", ta.count ? `<span class="ta-count">${esc(fmt(R.count, { count: ta.count }))}</span>` : ""].filter(Boolean).join("");
  return `<a class="ta-badge ${cls}" href="${esc(ta.url)}" target="_blank" rel="noopener">
    <span class="ta-source">${esc(R.source)}</span>${facts ? `<span class="ta-facts">${facts}</span>` : ""}
    <span class="ta-link">${esc(R.link)}${icon("arrow-up-right")}</span>
  </a>`;
}

// The footer: an invitation with the two booking actions, then where to go, how to find Lauhata, how to reach it and
// what guests say. Only confirmed details are listed; a missing phone, email or social profile is simply left out.
function footer(t, { home = false } = {}) {
  const L = t.lang;
  const year = new Date().getFullYear();
  const F = t.footer;
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.geo ? `${site.geo.lat},${site.geo.lng}` : site.mapQuery)}`;
  const link = (h, label, ext = false) => `<li><a href="${h}"${ext ? ' target="_blank" rel="noopener"' : ""}>${esc(label)}</a></li>`;
  const social = Object.entries(site.social).filter(([, u]) => u);
  const hours = site.restaurantHours.map((h) => `<li><span>${esc(h.days[L])}</span><b>${esc(h.hours)}</b></li>`).join("");
  return `<footer class="site-footer">
  <div class="wrap ft-top">
    <div class="ft-brand">
      ${logo(t, "brand-light")}
      ${home ? "" : `<p class="ft-statement">${esc(F.statement)}</p>`}
    </div>
    ${home ? "" : `    <div class="ft-cta">
      <p>${esc(F.cta)}</p>
      <div class="ft-cta-btns">
        <a class="btn btn-cream" href="${href("contact", L)}" data-book-open="table">${esc(F.bookTable)}</a>
        <a class="btn btn-ghost-light" href="${href("contact", L)}" data-book-open="room">${esc(F.bookRoom)}</a>
      </div>
    </div>`}
  </div>
  <div class="wrap ft">
    <nav class="ft-col" aria-label="${esc(F.explore)}">
      <h2 class="footer-h">${esc(F.explore)}</h2>
      <ul class="footer-list">
        ${link(href("restaurant", L), t.nav.restaurant)}
        ${link(href("stay", L), t.nav.stay)}
        ${link(href("events", L), t.nav.events)}
        ${link(href("gallery", L), t.nav.gallery)}
        ${link(href("contact", L), t.nav.contact)}
        ${link(href("about", L), t.nav.story)}
        ${link(href("discover", L), t.nav.discover)}
        ${link(href("contact", L, "#faq"), t.faq.linkLabel)}
      </ul>
    </nav>
    <div class="ft-col">
      <h2 class="footer-h">${esc(F.visit)}</h2>
      <p class="ft-place">${site.address.street ? `${esc(site.address.street)}<br>` : ""}${esc(site.address.region)}, ${esc(site.address.country)}</p>
      ${hours ? `<p class="ft-sub">${esc(F.hours)}</p><ul class="ft-hours">${hours}</ul>` : ""}
      <ul class="footer-list">${link(maps, F.directions, true)}</ul>
    </div>
    <div class="ft-col">
      <h2 class="footer-h">${esc(F.contact)}</h2>
      <ul class="footer-list">
        ${site.whatsapp ? `<li class="ft-phone"><a href="${waLink(t.form.waHello)}" target="_blank" rel="noopener">${esc(fmtPhone(site.whatsapp))}</a><span>${esc(site.phone && site.phone === site.whatsapp ? F.phoneBoth : "WhatsApp")}</span></li>` : ""}
        ${site.phone && site.phone !== site.whatsapp ? link(`tel:+${esc(site.phone)}`, fmtPhone(site.phone)) : ""}
        ${site.email ? link(`mailto:${esc(site.email)}`, site.email) : ""}
        ${social.map(([k, u]) => link(esc(u), k[0].toUpperCase() + k.slice(1), true)).join("")}
      </ul>
    </div>
    <div class="ft-col">
      <h2 class="footer-h">${esc(F.reviews)}</h2>
      <ul class="footer-list ft-scores">${["tripadvisor", "booking"].filter((k) => site.reviews[k] && site.reviews[k].url).map((k) => { const r = site.reviews[k]; return `<li><a href="${esc(r.url)}" target="_blank" rel="noopener"><span>${esc(t.reviews.platforms[k])}</span>${r.rating ? `<b>${esc(String(r.rating).replace(".", t.lang === "pt" ? "," : "."))}<small>/${r.scale}</small></b>` : ""}</a></li>`; }).join("")}</ul>
    </div>
  </div>
  <div class="ft-mark" aria-hidden="true" data-ft-mark><span>LAUHATA</span></div>
  <div class="wrap footer-base">
    <p>© ${year} ${esc(site.name)}. ${esc(F.rights)}${usesPlaceholderImages() ? ` <span class="footer-note">${esc(t.home.placeholderNote)}</span>` : ""}</p>
    <p><a href="#top">${esc(t.common.backToTop)}</a> · <a href="${href("privacy", L)}">${esc(F.privacy)}</a> · ${esc(F.signature)} <a href="https://theelevatewebstudios.com" target="_blank" rel="noopener">${esc(F.credit)}</a></p>
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
    order: { currency: site.order.currency, types: site.order.types },
    i18n: { form: t.form, common: t.common, order: t.order, pick: t.pick },
  };
  return `<!doctype html>
<html lang="${t.htmlLang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<script>/* The cross-fade between pages is a cross-document view transition. The browser skips it when the viewport changes
   mid-way (a phone's address bar moving) and rejects its promises; that is harmless, so it is not reported as an error. */
["pageswap", "pagereveal"].forEach(function (n) { addEventListener(n, function (e) { var v = e.viewTransition; if (v) ["ready", "finished", "updateCallbackDone"].forEach(function (k) { if (v[k]) v[k].catch(function () {}); }); }); });</script>
<title>${esc(o.title)}</title>
<meta name="description" content="${esc(o.description)}">
${o.robots ? `<meta name="robots" content="${o.robots}">` : `<link rel="canonical" href="${canonical}">`}
${o.robots ? "" : LANGS.map((l) => `<link rel="alternate" hreflang="${l === "pt" ? "pt-PT" : "en"}" href="${absUrl(alternates[l])}">`).join("\n")}
${o.robots ? "" : `<link rel="alternate" hreflang="x-default" href="${absUrl(alternates.en)}">`}
<meta name="theme-color" content="#17120F">
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
<link rel="icon" href="/assets/img/favicon-64.png" type="image/png" sizes="64x64">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<link rel="preload" href="/assets/fonts/cormorant-garamond-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/manrope-latin.woff2" as="font" type="font/woff2" crossorigin>
${[].concat(o.preload || []).map((p) => (typeof p === "string" ? preloadImage(p, "max(100vw, 92vh)") : preloadImage(p.key, p.sizes, p.media))).join("\n")}
<link rel="stylesheet" href="/assets/css/site.css">
<script type="speculationrules">{"prefetch":[{"where":{"href_matches":"/*"},"eagerness":"moderate"}]}</script>
${jsonLd(businessLd(t))}
${(o.ld || []).map(jsonLd).join("\n")}
<script>window.LAUHATA=${JSON.stringify(runtime).replace(/</g, "\\u003c")};</script>
${o.menu ? menuJson(o.menu) : ""}
<script src="/assets/js/picker.js" defer></script>
${o.page === "home" ? `<script src="/assets/js/vendor/gsap.min.js" defer></script>` : ""}
<script src="/assets/js/main.js" defer></script>
${o.page === "home" ? `<script src="/assets/js/cinema.js" defer></script>` : ""}
<script src="/assets/js/order.js" defer></script>
${site.gaId ? `<script>window.LAUHATA_GA=${JSON.stringify(site.gaId)};</script>
<script src="/assets/js/analytics.js" defer></script>` : ""}
</head>
<body id="top" class="${o.hero ? "has-hero" : ""}">
${SPRITE}
<a class="skip-link" href="#main">${esc(t.nav.skip)}</a>
${header(t, o.page, o.alt)}
<main id="main" tabindex="-1">
${o.body}
</main>
${footer(t, { home: o.page === "home" || o.body.includes("scene final-cta") })}
${cartUi(t)}
<div class="mobile-bar" data-mobile-bar>
  <a class="btn btn-dark" href="${href("contact", L)}" data-book-open="table">${icon("cutlery")}${esc(t.home.quick.tabTable.split(" ")[0])}</a>
  <a class="btn btn-terra" href="${href("contact", L)}" data-book-open="room">${icon("bed")}${esc(t.home.quick.tabRoom)}</a>
  <a class="icon-btn wa" href="${waLink(t.form.waHello)}" target="_blank" rel="noopener" aria-label="${esc(t.common.whatsapp)}">${icon("whatsapp")}</a>
</div>
<button class="to-top" type="button" data-to-top aria-label="${esc(t.common.backToTop)}" title="${esc(t.common.backToTop)}">${icon("up")}</button>
<a class="wa-float" href="${waLink(t.form.waHello)}" target="_blank" rel="noopener" aria-label="${esc(t.common.whatsapp)}">${icon("whatsapp")}</a>
${site.gaId ? `<div class="consent" data-consent role="region" aria-label="${esc(t.consent.label)}" hidden><p>${esc(t.consent.text)} <a href="${href("privacy", L)}">${esc(t.consent.more)}</a></p><div class="consent-btns"><button type="button" class="btn btn-outline btn-sm" data-consent-no>${esc(t.consent.decline)}</button><button type="button" class="btn btn-terra btn-sm" data-consent-yes>${esc(t.consent.accept)}</button></div></div>` : ""}
<dialog class="book-dialog" data-book-dialog aria-labelledby="bd-title-${t.lang}">
  <header class="bd-head"><h2 id="bd-title-${t.lang}">${esc(t.home.quick.title)}</h2><button class="icon-btn" type="button" aria-label="${esc(t.home.quick.close)}" data-book-close>${icon("close")}</button></header>
  <p class="bd-intro">${esc(t.home.quick.intro)}</p>
  ${bookingCard(t)}
</dialog>
<dialog class="lightbox" data-lightbox aria-label="${esc(t.gallery.label)}">
  <button class="icon-btn lb-close" type="button" aria-label="${esc(t.common.close)}" data-lb-close>${icon("close")}</button>
  <button class="icon-btn lb-prev" type="button" aria-label="${esc(t.common.previous)}" data-lb-prev>${icon("left")}</button>
  <figure class="lb-figure"><img alt="" data-lb-img src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="><figcaption data-lb-cap></figcaption></figure>
  <button class="icon-btn lb-next" type="button" aria-label="${esc(t.common.next)}" data-lb-next>${icon("right")}</button>
</dialog>
</body>
</html>
`;
}
