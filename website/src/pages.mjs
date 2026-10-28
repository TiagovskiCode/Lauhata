// Page bodies. Each function returns { title, description, path, alt, body, ... } for layout().
// The homepage follows the approved design mock-up section by section; inner pages reuse its parts.
import { esc, fmt, href, figure, icon, waLink, hoursList, responseLine, breadcrumbs, imgUrl, site, rooms } from "./lib.mjs";
import { TAIS } from "./layout.mjs";
import { categories, items } from "./data/menu.mjs";

const other = (L) => (L === "pt" ? "en" : "pt");
const rv = (delay = 0) => ` data-reveal${delay ? ` style="--d:${delay}ms"` : ""}`;

// Section heading: eyebrow, title with an optional italic accent line, optional lead.
function heading({ eyebrow, title, accent = "", lead = "", id = "", center = false, tag = "h2", cls = "" }) {
  return `<header class="heading${center ? " is-center" : ""} ${cls}"${rv()}>
    <p class="eyebrow${center ? " eyebrow-lines" : ""}">${esc(eyebrow)}</p>
    <${tag}${id ? ` id="${id}"` : ""} class="title">${esc(title)}${accent ? `<br><em>${esc(accent)}</em>` : ""}</${tag}>
    ${lead ? `<p class="lead">${esc(lead)}</p>` : ""}
  </header>`;
}

// Split hero used by inner pages: text on the left, rounded photo on the right.
function pageHero(t, { eyebrow, title, accent = "", lead, image, crumbs, ctas = "" }) {
  return `<section class="page-hero">
  <div class="wrap page-hero-grid">
    <div class="page-hero-text">
      ${crumbs}
      <p class="eyebrow">${esc(eyebrow)}</p>
      <h1 class="title-xl">${esc(title)}${accent ? ` <em>${esc(accent)}</em>` : ""}</h1>
      <p class="lead">${esc(lead)}</p>
      ${ctas}
    </div>
    ${figure(t, image, { cls: "page-hero-img", eager: true, sizes: "(min-width: 900px) 46vw, 92vw" })}
  </div>
</section>`;
}

const mapsLink = () => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.geo ? `${site.geo.lat},${site.geo.lng}` : site.mapQuery)}`;
const pend = (v, fallback) => (v ? esc(v) : `<span class="tbc">${esc(fallback)}</span>`);

// ---------- Booking card (hero): request straight to WhatsApp ----------
function bookingCard(t) {
  const q = t.home.quick;
  const times = [
    ...["12:00", "12:30", "13:00", "13:30", "14:00"].map((h) => [h, q.lunch]),
    ...["18:30", "19:00", "19:30", "20:00", "20:30", "21:00"].map((h) => [h, q.dinner]),
  ];
  const timeOpts = times.map(([h, m]) => `<option value="${h}"${h === "19:30" ? " selected" : ""}>${esc(m)} · ${h}</option>`).join("");
  const nOpts = (max, def) =>
    Array.from({ length: max }, (_, i) => i + 1)
      .map((n) => `<option value="${n}"${n === def ? " selected" : ""}>${n} ${esc(n === 1 ? q.person : q.persons)}</option>`)
      .join("") + `<option value="10+">${esc(q.more)}</option>`;
  const fld = (label, control) => `<label class="bc-field"><span>${esc(label)}</span>${control}</label>`;
  const sel = (name, opts) => `<span class="bc-select"><select name="${name}">${opts}</select>${icon("down")}</span>`;
  return `<form class="booking-card" data-quick-wa novalidate aria-label="${esc(q.label)}">
    <div class="bc-tabs" role="tablist">
      <button type="button" role="tab" aria-selected="true" aria-controls="bc-table" data-bc-tab="table">${icon("cutlery")}${esc(q.tabTable)}</button>
      <button type="button" role="tab" aria-selected="false" aria-controls="bc-room" data-bc-tab="room">${icon("bed")}${esc(q.tabRoom)}</button>
    </div>
    <div class="bc-row" id="bc-table" role="tabpanel" data-bc-panel="table">
      ${fld(q.date, `<input type="date" name="date">`)}
      ${fld(q.time, sel("time", timeOpts))}
      ${fld(q.people, sel("people", nOpts(10, 2)))}
      <button class="btn btn-terra btn-lg bc-submit" type="submit">${icon("chat")}${esc(q.submitTable)}</button>
    </div>
    <div class="bc-row" id="bc-room" role="tabpanel" data-bc-panel="room" hidden>
      ${fld(q.checkIn, `<input type="date" name="checkIn">`)}
      ${fld(q.checkOut, `<input type="date" name="checkOut">`)}
      ${fld(q.guests, sel("guests", nOpts(6, 2)))}
      <button class="btn btn-terra btn-lg bc-submit" type="submit">${icon("chat")}${esc(q.submitRoom)}</button>
    </div>
    <p class="bc-error" role="alert" hidden data-bc-error></p>
    <p class="bc-note">${site.responseTime ? esc(site.responseTime[t.lang]) : esc(t.contact.responsePending)}${site.whatsapp ? "" : ` <strong class="pending">${esc(t.common.pendingWhatsapp)}.</strong>`}</p>
  </form>`;
}

// ---------- Full forms (restaurant and stay pages) ----------
function field({ id, label, type = "text", name, attrs = "", hint = "", optional = "", full = false }) {
  const describedBy = [hint ? `${id}-hint` : "", `${id}-err`].filter(Boolean).join(" ");
  return `<div class="field${full ? " is-full" : ""}">
    <label for="${id}">${esc(label)}${optional ? ` <span class="opt">(${esc(optional)})</span>` : ""}</label>
    ${type === "textarea"
      ? `<textarea id="${id}" name="${name}" rows="3" ${attrs} aria-describedby="${describedBy}"></textarea>`
      : `<input id="${id}" name="${name}" type="${type}" ${attrs} aria-describedby="${describedBy}">`}
    ${hint ? `<p class="hint" id="${id}-hint">${esc(hint)}</p>` : ""}
    <p class="error" id="${id}-err" aria-live="polite"></p>
  </div>`;
}

function formFooter(t, submitLabel) {
  return `<div class="form-errors" role="alert" hidden data-form-errors>${esc(t.form.errorsTitle)}</div>
    <div class="form-actions">
      <button class="btn btn-terra btn-lg" type="submit">${icon("chat")}<span data-submit-label>${esc(submitLabel)}</span></button>
      ${responseLine(t)}
    </div>
    <p class="form-note">${esc(t.form.note)}${site.whatsapp ? "" : ` <strong class="pending">${esc(t.common.pendingWhatsapp)}.</strong>`}</p>`;
}

function tableForm(t) {
  const f = t.form;
  return `<form class="booking-form" data-booking="table" novalidate>
    <div class="form-grid">
      ${field({ id: "tb-name", name: "name", label: f.name, attrs: 'autocomplete="name" required maxlength="80"' })}
      ${field({ id: "tb-contact", name: "contact", label: f.contact, hint: f.contactHint, attrs: 'autocomplete="tel" required maxlength="80" inputmode="tel"' })}
      ${field({ id: "tb-date", name: "date", type: "date", label: f.date, attrs: "required" })}
      ${field({ id: "tb-time", name: "time", type: "time", label: f.time, attrs: 'required step="900"' })}
      ${field({ id: "tb-people", name: "people", type: "number", label: f.people, attrs: 'required min="1" max="50" value="2" inputmode="numeric"' })}
      ${field({ id: "tb-notes", name: "notes", type: "textarea", label: f.notes, optional: f.optional, attrs: `maxlength="400" placeholder="${esc(f.notesPlaceholder)}"`, full: true })}
    </div>
    ${formFooter(t, f.submitTable)}
  </form>`;
}

function roomForm(t) {
  const f = t.form;
  const options = [`<option value="">${esc(f.roomAny)}</option>`, ...rooms.map((r) => `<option value="${r.id}">${esc(r.name[t.lang])}</option>`)].join("");
  return `<form class="booking-form" data-booking="room" novalidate>
    <div class="form-grid">
      ${field({ id: "rm-in", name: "checkIn", type: "date", label: f.checkIn, attrs: "required" })}
      ${field({ id: "rm-out", name: "checkOut", type: "date", label: f.checkOut, attrs: "required" })}
      ${field({ id: "rm-guests", name: "guests", type: "number", label: f.guests, attrs: 'required min="1" max="20" value="2" inputmode="numeric"' })}
      <div class="field">
        <label for="rm-room">${esc(f.roomType)}</label>
        <div class="select"><select id="rm-room" name="room">${options}</select>${icon("down")}</div>
        <p class="error" id="rm-room-err" aria-live="polite"></p>
      </div>
      ${field({ id: "rm-name", name: "name", label: f.name, attrs: 'autocomplete="name" required maxlength="80"' })}
      ${field({ id: "rm-contact", name: "contact", label: f.contact, hint: f.contactHint, attrs: 'autocomplete="tel" required maxlength="80" inputmode="tel"' })}
      ${field({ id: "rm-notes", name: "notes", type: "textarea", label: f.notes, optional: f.optional, attrs: `maxlength="400" placeholder="${esc(f.notesPlaceholder)}"`, full: true })}
    </div>
    ${formFooter(t, f.submitRoom)}
  </form>`;
}

// ---------- Shared blocks ----------
function dishCards(t, { linkTo }) {
  const L = t.lang;
  return `<div class="dish-grid" data-dish-grid>${items
    .map((d, i) => `<article class="dish" data-cat="${d.category}"${d.category !== categories[0].id ? " hidden" : ""}>
      ${figure(t, d.image, { sizes: "(min-width: 1000px) 22vw, (min-width: 600px) 45vw, 90vw", ratio: "4/3" })}
      <div class="dish-body">
        <p class="dish-tag">${esc(d.tag[L])}</p>
        <h3>${esc(d.name[L])}</h3>
        <p class="dish-desc">${esc(d.description[L])}</p>
        <div class="dish-foot">
          <span class="price">${d.price ? esc(d.price) : "$ —"}</span>
          <a class="round-btn" href="${linkTo}" aria-label="${esc(t.common.bookTable)}: ${esc(d.name[L])}">${icon("arrow")}</a>
        </div>
      </div>
    </article>`)
    .join("")}</div>`;
}

function dishTabs(t) {
  return `<div class="seg" role="tablist" aria-label="${esc(t.home.dishes.tabsLabel)}" data-dish-tabs>${categories
    .map((c, i) => `<button type="button" role="tab" aria-selected="${i === 0}" data-dish-tab="${c.id}">${esc(c.name[t.lang])}</button>`)
    .join("")}</div>`;
}

function roomCards(t) {
  const L = t.lang;
  const h = t.home.rooms;
  return `<div class="room-grid">${rooms
    .map((r, i) => `<article class="room-card"${rv(i * 90)}>
      <a class="room-img" href="${href("room:" + r.id, L)}" tabindex="-1" aria-hidden="true">
        ${figure(t, r.images[0], { sizes: "(min-width: 1000px) 30vw, 92vw", ratio: "3/2" })}
        ${r.badge ? `<span class="pill pill-dark">${esc(r.badge[L])}</span>` : ""}
      </a>
      <div class="room-body">
        <h3><a href="${href("room:" + r.id, L)}">${esc(r.name[L])}</a></h3>
        <p>${esc(r.summary[L])}</p>
        ${r.features.length ? `<ul class="chips">${r.features.map((f) => `<li>${esc(f[L])}</li>`).join("")}</ul>` : ""}
        <div class="room-foot">
          <p class="from"><span>${esc(h.from)}</span><strong>${r.price ? esc(r.price) : "$ —"}</strong> <small>${esc(h.night)}</small></p>
          <a class="btn btn-cream btn-sm" href="${href("stay", L, "#reservar")}" data-room-link="${r.id}">${esc(h.book)}${icon("arrow")}</a>
        </div>
      </div>
    </article>`)
    .join("")}</div>`;
}

const HUT_DECO = `<svg class="hut-deco" viewBox="0 0 200 160" aria-hidden="true"><path d="M100 4 18 74h164L100 4Z" fill="currentColor"/><path d="M44 74v62M78 74v62M122 74v62M156 74v62M30 100h140" stroke="currentColor" stroke-width="10" stroke-linecap="round"/></svg>`;

function badgeSvg(t) {
  const text = esc(t.home.hero.badge.toUpperCase());
  return `<div class="badge-spin" aria-hidden="true">
    <svg viewBox="0 0 120 120"><defs><path id="badge-c-${t.lang}" d="M60 60m-44 0a44 44 0 1 1 88 0a44 44 0 1 1-88 0"/></defs>
      <circle cx="60" cy="60" r="58" fill="#FEFDF8"/>
      <text font-size="9" font-weight="600" fill="#0F2E28"><textPath href="#badge-c-${t.lang}" textLength="274" lengthAdjust="spacing">${text}</textPath></text>
    </svg>
    <svg class="badge-hut"><use href="#i-hut"></use></svg>
  </div>`;
}

// Illustrated coast: Lauhata to the west of Dili along the north coast, Atauro to the north.
function coastMap(t) {
  const h = t.home.location;
  const drive = site.driveFromDili ? fmt(h.drive, { t: site.driveFromDili }) : h.driveTbc;
  return `<figure class="coast-map"${rv(120)}>
    <svg viewBox="0 0 480 370" role="img" aria-label="${esc(t.location.mapTitle)}">
      <rect width="480" height="370" fill="#2F6E73"/>
      <g fill="none" stroke="#fff" stroke-opacity=".14" stroke-width="1.4">
        <path d="M-10 70c60-14 110 14 170 0s120-14 180 0 110 14 160 0"/>
        <path d="M-10 110c60-14 110 14 170 0s120-14 180 0 110 14 160 0"/>
        <path d="M-10 150c60-14 110 14 170 0s120-14 180 0 110 14 160 0"/>
      </g>
      <ellipse cx="400" cy="62" rx="44" ry="17" fill="#EBE4D4"/>
      <text x="400" y="104" text-anchor="middle" class="map-label">${esc(h.mapIsland.toUpperCase())}</text>
      <text x="240" y="30" text-anchor="middle" class="map-label">${esc(h.mapSea.toUpperCase())}</text>
      <path d="M0 196c60-18 120-6 170 6s110 10 160-6 100-26 150-18V370H0Z" fill="#E6DAC2"/>
      <path d="M0 236c70-14 140 4 210 8s140-8 200-22 70-6 70-6V370H0Z" fill="#D8C8A8"/>
      <path d="M0 290c90-10 170 10 250 6s150-22 230-16V370H0Z" fill="#C9B48F"/>
      <path d="M110 196C190 214 290 214 400 186" fill="none" stroke="#A8432A" stroke-width="2.6" stroke-dasharray="1 7" stroke-linecap="round"/>
      <circle cx="404" cy="186" r="7" fill="#0F2E28"/>
      <text x="404" y="214" text-anchor="middle" class="map-city">Díli</text>
      <text x="300" y="166" text-anchor="middle" class="map-drive">${esc(drive)}</text>
      <path d="M100 196c-14-16-22-27-22-38a22 22 0 1 1 44 0c0 11-8 22-22 38Z" fill="#A8432A"/>
      <circle cx="100" cy="158" r="8" fill="#FEFDF8"/>
      <rect x="40" y="214" width="122" height="46" rx="8" fill="#0F2E28"/>
      <text x="101" y="236" text-anchor="middle" class="map-name">Lauhata</text>
      <text x="101" y="251" text-anchor="middle" class="map-sub">Liquiçá</text>
    </svg>
  </figure>`;
}

function infoGrid(t) {
  const h = t.home.location;
  const hours = site.restaurantHours.length ? site.restaurantHours.map((x) => esc(x.hours)).join(", ") : null;
  return `<dl class="info-grid"${rv(160)}>
    <div>${icon("pin")}<dt>${esc(h.address)}</dt><dd>${esc(site.address.locality)}, ${esc(site.address.region)}<br>${esc(site.address.country)}</dd></div>
    <div>${icon("clock")}<dt>${esc(h.hours)}</dt><dd>${esc(h.restaurant)}: ${pend(hours, t.common.toConfirm)}<br>${esc(h.reception)}: ${pend(site.receptionHours && site.receptionHours[t.lang], t.common.toConfirm)}</dd></div>
    <div>${icon("chat")}<dt>${esc(t.common.whatsapp)}</dt><dd>${site.whatsapp ? `<a href="${waLink(t.form.waHello)}" target="_blank" rel="noopener">+${esc(site.whatsapp)}</a>` : `<span class="tbc">+670 [XXXX XXXX]</span>`}</dd></div>
    <div>${icon("mail")}<dt>${esc(t.common.email)}</dt><dd>${site.email ? `<a href="mailto:${esc(site.email)}">${esc(site.email)}</a>` : `<span class="tbc">[email]</span>`}</dd></div>
  </dl>`;
}

function locationBlock(t, id = "loc-title") {
  const h = t.home.location;
  return `<section class="section location" id="contacto" aria-labelledby="${id}">
  <div class="wrap location-grid">
    <div>
      ${heading({ eyebrow: h.eyebrow, title: h.title, accent: h.titleAccent, id })}
      <p class="body-text"${rv(80)}>${esc(h.body)}</p>
      ${infoGrid(t)}
      <a class="btn btn-dark"${rv(200)} href="${mapsLink()}" target="_blank" rel="noopener">${esc(t.common.openMaps)}${icon("arrow-up-right")}</a>
    </div>
    ${coastMap(t)}
  </div>
</section>`;
}

function ctaBand(t) {
  const c = t.home.cta;
  return `<section class="section cta-section" aria-labelledby="cta-title">
  <div class="wrap">
    <div class="cta-card">
      ${figure(t, "palmSunset", { cls: "cta-img", sizes: "(min-width: 1000px) 1200px, 100vw" })}
      <div class="cta-content">
        <h2 id="cta-title" class="title"${rv()}>${esc(c.title)} <em>${esc(c.titleAccent)}</em></h2>
        <p${rv(80)}>${esc(c.body)}</p>
        <div class="btn-row"${rv(160)}>
          <a class="btn btn-white" href="${waLink(t.form.waHello)}" target="_blank" rel="noopener">${icon("chat")}${esc(c.wa)}</a>
          <a class="btn btn-ghost-light" href="${href("stay", t.lang, "#reservar")}">${esc(c.availability)}</a>
        </div>
      </div>
    </div>
  </div>
</section>`;
}

function faqBlock(t) {
  return `<div class="faq">${t.faq.items
    .map((it, i) => `<details${i === 0 ? " open" : ""}${rv(i * 60)}><summary><span>${esc(it.q)}</span>${icon("plus")}</summary><div class="faq-a"><p>${esc(it.a)}</p></div></details>`)
    .join("")}</div>`;
}

const faqLd = (t) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: t.faq.items.map((it) => ({ "@type": "Question", name: it.q, acceptedAnswer: { "@type": "Answer", text: it.a } })),
});

function galleryGrid(t, keys, cls = "") {
  return `<div class="gallery ${cls}" data-gallery>${keys
    .map((k, i) => `<button type="button" class="gallery-item g${i + 1}" data-lb-src="${imgUrl(k, 1920)}" aria-label="${esc(t.gallery.open)}"${rv((i % 4) * 70)}>${figure(t, k, { sizes: "(min-width: 900px) 40vw, 90vw" })}</button>`)
    .join("")}</div>`;
}

// ================= HOME =================
export function home(t) {
  const L = t.lang;
  const H = t.home;
  const hero = H.hero;
  const body = `
<section class="hero" aria-labelledby="hero-title">
  <div class="wrap hero-grid">
    <div class="hero-text">
      <p class="eyebrow eyebrow-dots hero-in">${hero.eyebrow.map((e) => `<span>${esc(e)}</span>`).join("")}</p>
      <h1 id="hero-title" class="title-hero hero-in" style="--d:120ms"><span class="line">${esc(hero.title1)}</span> <span class="line"><em>${esc(hero.titleAccent)}</em> ${esc(hero.title2)}</span></h1>
      <p class="lead hero-in" style="--d:240ms">${esc(hero.lead)}</p>
      <div class="btn-row hero-in" style="--d:340ms">
        <a class="btn btn-dark btn-lg" href="${href("restaurant", L, "#reservar")}">${esc(hero.ctaTable)}${icon("arrow")}</a>
        <a class="btn btn-outline btn-lg" href="${href("stay", L, "#reservar")}">${esc(hero.ctaRoom)}${icon("bed")}</a>
      </div>
      <dl class="hero-stats hero-in" style="--d:440ms">
        <div><dt>${esc(hero.stat1[0])}</dt><dd>${esc(hero.stat1[1])}</dd></div>
        <div><dt>${esc(hero.stat2[0])}</dt><dd>${esc(hero.stat2[1])}</dd></div>
      </dl>
    </div>
    <div class="hero-visual hero-in" style="--d:160ms">
      ${figure(t, "heroSunset", { cls: "hero-img", eager: true, sizes: "(min-width: 900px) 46vw, 92vw" })}
      ${badgeSvg(t)}
      <div class="hero-chip">
        <span class="hero-chip-icon">${icon("sunset")}</span>
        <span><small>${esc(hero.chipEyebrow)}</small><strong>${esc(hero.chipTitle)}</strong></span>
      </div>
    </div>
  </div>
  <div class="wrap booking-wrap hero-in" style="--d:520ms">${bookingCard(t)}</div>
</section>

${TAIS}
<section class="features" aria-label="${esc(H.two.eyebrow)}">
  <ul class="wrap features-grid">
    ${H.features.map((f, i) => `<li${rv(i * 70)}><span class="ring">${icon(f.icon)}</span><div><h3>${esc(f.t)}</h3><p>${esc(f.d)}</p></div></li>`).join("")}
  </ul>
</section>

<section class="section two-ways" aria-labelledby="two-title">
  <div class="wrap">
    <div class="split-head">
      ${heading({ eyebrow: H.two.eyebrow, title: H.two.title, accent: H.two.titleAccent, id: "two-title" })}
      <p class="body-text"${rv(100)}>${esc(H.two.body)}</p>
    </div>
    <div class="two-grid">
      <a class="feature-card" href="${href("restaurant", L, "#ementa")}"${rv()}>
        ${figure(t, "foodSpread", { sizes: "(min-width: 900px) 46vw, 92vw" })}
        <div class="feature-card-body">
          <span class="pill">${esc(H.two.restLabel)}</span>
          <h3>${esc(H.two.restTitle)}</h3>
          <p>${esc(H.two.restBody)}</p>
          <span class="gold-link">${esc(H.two.restLink)}${icon("arrow")}</span>
        </div>
      </a>
      <a class="feature-card" href="${href("stay", L)}"${rv(100)}>
        ${figure(t, "palmsSea", { sizes: "(min-width: 900px) 46vw, 92vw" })}
        <div class="feature-card-body">
          <span class="pill">${esc(H.two.stayLabel)}</span>
          <h3>${esc(H.two.stayTitle)}</h3>
          <p>${esc(H.two.stayBody)}</p>
          <span class="gold-link">${esc(H.two.stayLink)}${icon("arrow")}</span>
        </div>
      </a>
    </div>
  </div>
</section>

<section class="section dishes" aria-labelledby="dish-title">
  <div class="wrap">
    ${heading({ eyebrow: H.dishes.eyebrow, title: H.dishes.title, lead: H.dishes.body, id: "dish-title", center: true })}
    <div class="center-row"${rv(80)}>${dishTabs(t)}</div>
    ${dishCards(t, { linkTo: href("restaurant", L, "#reservar") })}
    <div class="btn-row center"${rv()}>
      <a class="btn btn-dark" href="${href("restaurant", L, "#ementa")}">${esc(H.dishes.fullMenu)}${icon("arrow")}</a>
      <a class="btn btn-outline" href="${href("restaurant", L, "#reservar")}">${esc(H.hero.ctaTable)}</a>
    </div>
  </div>
</section>

<section class="section rooms-dark" id="quartos" aria-labelledby="rooms-title">
  ${HUT_DECO}
  <div class="wrap">
    <div class="split-head">
      ${heading({ eyebrow: H.rooms.eyebrow, title: H.rooms.title, accent: H.rooms.titleAccent, id: "rooms-title" })}
      <p class="body-text"${rv(100)}>${esc(H.rooms.body)}</p>
    </div>
    ${roomCards(t)}
  </div>
</section>

<section class="section story" id="historia" aria-labelledby="story-title">
  <div class="wrap story-grid">
    <div class="story-visual"${rv()}>
      ${figure(t, "weaving", { cls: "arch", sizes: "(min-width: 900px) 34vw, 80vw", ratio: "4/5" })}
      <blockquote class="quote-card"><p>${esc(H.story.quote)}</p><footer>${esc(H.story.quoteNote)}</footer></blockquote>
    </div>
    <div class="story-text">
      <header class="heading"${rv()}>
        <p class="eyebrow">${esc(H.story.eyebrow)}</p>
        <h2 id="story-title" class="title">${esc(H.story.title1)}<br>${esc(H.story.title2)} <em>${esc(H.story.titleAccent)}</em>.</h2>
      </header>
      <p class="body-text"${rv(80)}>${esc(H.story.body)}</p>
      <p class="body-text tbc-block"${rv(120)}>${esc(H.story.pending)}</p>
      <div class="sand-cards"${rv(160)}>
        <div><h3>${esc(H.story.card1[0])}</h3><p>${esc(H.story.card1[1])}</p></div>
        <div><h3>${esc(H.story.card2[0])}</h3><p>${esc(H.story.card2[1])}</p></div>
      </div>
    </div>
  </div>
</section>

<section class="section day" id="experiencias" aria-labelledby="day-title">
  <div class="wrap">
    ${heading({ eyebrow: H.day.eyebrow, title: H.day.title, lead: H.day.body, id: "day-title", center: true })}
    <ol class="timeline">
      ${H.day.steps.map((s, i) => `<li class="step step-${i + 1}"${rv(i * 80)}><span class="step-dot">${icon(s.icon)}</span><time>${esc(s.time)}</time><h3>${esc(s.t)}</h3><p>${esc(s.d)}</p></li>`).join("")}
    </ol>
  </div>
</section>

<section class="section reviews" aria-labelledby="rev-title">
  <div class="wrap">
    <div class="split-head reviews-head">
      ${heading({ eyebrow: H.reviews.eyebrow, title: H.reviews.title, id: "rev-title", cls: "heading-md" })}
      <a class="rating"${rv(100)} href="${site.reviewsUrl ? esc(site.reviewsUrl) : mapsLink()}" target="_blank" rel="noopener">
        <strong>${esc(H.reviews.rating)}</strong>
        <span><span class="stars">${icon("star").repeat(5)}</span><small>${esc(H.reviews.ratingNote)}</small></span>
      </a>
    </div>
    <div class="review-grid">
      ${H.reviews.items.map((r, i) => `<figure class="review"${rv(i * 90)}><span class="review-mark">${icon("quote")}</span><blockquote>${esc(r.q)}</blockquote><figcaption><span class="avatar av-${i + 1}">${esc(r.i)}</span><span><strong>${esc(r.n)}</strong><small>${esc(r.m)}</small></span></figcaption></figure>`).join("")}
    </div>
  </div>
</section>

${locationBlock(t)}
${ctaBand(t)}`;
  return {
    page: "home",
    title: t.meta.home.title,
    description: t.meta.home.description,
    path: href("home", L),
    alt: href("home", other(L)),
    preload: imgUrl("heroSunset", 1440),
    body,
  };
}

// ================= RESTAURANT =================
export function restaurant(t) {
  const L = t.lang;
  const bc = breadcrumbs(t, [{ name: t.nav.restaurant, path: href("restaurant", L) }]);
  const hasDemo = items.some((i) => i.placeholder) && site.showPlaceholderNotes;
  const body = `
${pageHero(t, {
  eyebrow: t.restaurant.eyebrow,
  title: t.home.two.restTitle,
  lead: t.home.two.restBody,
  image: "foodSpread",
  crumbs: bc.html,
  ctas: `<div class="btn-row"><a class="btn btn-dark btn-lg" href="#reservar">${esc(t.home.hero.ctaTable)}${icon("arrow")}</a><a class="btn btn-outline btn-lg" href="#ementa">${esc(t.common.viewMenu)}</a></div>
  <div class="hours-inline">${icon("clock")}<div><strong>${esc(t.home.location.hours)}</strong>${hoursList(t)}</div></div>`,
})}

${TAIS}
<section class="section dishes" id="ementa" aria-labelledby="menu-title">
  <div class="wrap">
    ${heading({ eyebrow: t.home.dishes.eyebrow, title: t.restaurant.menuTitle, lead: t.home.dishes.body, id: "menu-title", center: true })}
    ${hasDemo ? `<p class="demo-notice"${rv()}>${esc(t.restaurant.demoNotice)}</p>` : ""}
    <div class="center-row"${rv(80)}>${dishTabs(t)}</div>
    ${dishCards(t, { linkTo: "#reservar" })}
  </div>
</section>

<section class="section booking" id="reservar" aria-labelledby="book-title">
  <div class="wrap booking-grid">
    <div>
      ${heading({ eyebrow: t.restaurant.bookEyebrow, title: t.restaurant.bookTitle, id: "book-title" })}
      <p class="body-text"${rv(80)}>${esc(t.restaurant.bookLead)}</p>
      ${figure(t, "dishIkan", { cls: "booking-img", sizes: "(min-width: 900px) 30vw, 80vw", ratio: "4/3" })}
    </div>
    <div class="form-card"${rv(100)}>${tableForm(t)}</div>
  </div>
</section>

${ctaBand(t)}`;
  return {
    page: "restaurant",
    title: t.meta.restaurant.title,
    description: t.meta.restaurant.description,
    path: href("restaurant", L),
    alt: href("restaurant", other(L)),
    preload: imgUrl("foodSpread", 1080),
    ld: [bc.ld],
    body,
  };
}

// ================= STAY =================
export function stay(t) {
  const L = t.lang;
  const bc = breadcrumbs(t, [{ name: t.nav.stay, path: href("stay", L) }]);
  const H = t.home.rooms;
  const amenities = site.amenities.length
    ? `<div class="amenities"${rv()}><h3>${esc(t.stay.amenitiesTitle)}</h3><ul class="chips chips-light">${site.amenities.map((a) => `<li>${esc(a[L])}</li>`).join("")}</ul></div>`
    : "";
  const body = `
${pageHero(t, {
  eyebrow: t.stay.eyebrow,
  title: t.home.two.stayTitle,
  lead: t.home.two.stayBody,
  image: "roomSea",
  crumbs: bc.html,
  ctas: `<div class="btn-row"><a class="btn btn-dark btn-lg" href="#reservar">${esc(t.home.hero.ctaRoom)}${icon("arrow")}</a><a class="btn btn-outline btn-lg" href="#quartos">${esc(t.home.two.stayLink)}</a></div>`,
})}

<section class="section rooms-dark" id="quartos" aria-labelledby="rooms-title">
  ${HUT_DECO}
  <div class="wrap">
    <div class="split-head">
      ${heading({ eyebrow: H.eyebrow, title: H.title, accent: H.titleAccent, id: "rooms-title" })}
      <p class="body-text"${rv(100)}>${esc(H.body)}</p>
    </div>
    ${roomCards(t)}
    ${amenities}
  </div>
</section>

<section class="section booking" id="reservar" aria-labelledby="book-title">
  <div class="wrap booking-grid">
    <div>
      ${heading({ eyebrow: t.stay.bookEyebrow, title: t.stay.bookTitle, id: "book-title" })}
      <p class="body-text"${rv(80)}>${esc(t.stay.bookLead)}</p>
      ${figure(t, "palmsSea", { cls: "booking-img", sizes: "(min-width: 900px) 30vw, 80vw", ratio: "4/3" })}
    </div>
    <div class="form-card"${rv(100)}>${roomForm(t)}</div>
  </div>
</section>

<section class="section gallery-section" aria-labelledby="sg-title">
  <div class="wrap">
    ${heading({ eyebrow: t.gallery.eyebrow, title: t.gallery.title, id: "sg-title" })}
    ${galleryGrid(t, ["verandaWicker", "roomGarden", "coastAerial", "verandaBamboo"], "gallery-4")}
  </div>
</section>`;
  return {
    page: "stay",
    title: t.meta.stay.title,
    description: t.meta.stay.description,
    path: href("stay", L),
    alt: href("stay", other(L)),
    preload: imgUrl("roomSea", 1080),
    ld: [bc.ld],
    body,
  };
}

// ================= ROOM =================
export function room(t, r) {
  const L = t.lang;
  const name = r.name[L];
  const bc = breadcrumbs(t, [
    { name: t.nav.stay, path: href("stay", L) },
    { name, path: href("room:" + r.id, L) },
  ]);
  const H = t.home.rooms;
  const facts = [
    r.capacity ? `<div><dt>${esc(t.stay.roomCapacity)}</dt><dd>${esc(r.capacity[L])}</dd></div>` : "",
    r.beds ? `<div><dt>${esc(t.stay.roomBeds)}</dt><dd>${esc(r.beds[L])}</dd></div>` : "",
    `<div><dt>${esc(H.from)}</dt><dd>${r.price ? esc(r.price) : "$ —"} <small>${esc(H.night)}</small></dd></div>`,
  ].join("");
  const body = `
${pageHero(t, {
  eyebrow: r.badge ? r.badge[L] : t.stay.eyebrow,
  title: name,
  lead: r.summary[L],
  image: r.images[0],
  crumbs: bc.html,
  ctas: `<div class="btn-row"><a class="btn btn-dark btn-lg" href="${href("stay", L, "#reservar")}" data-room-link="${r.id}">${esc(t.stay.roomBook)}${icon("arrow")}</a><a class="btn btn-outline btn-lg" href="${waLink(t.form.waHello)}" target="_blank" rel="noopener">${icon("chat")}${esc(t.common.whatsapp)}</a></div>`,
})}

<section class="section">
  <div class="wrap room-detail">
    <div>
      <p class="body-text${r.placeholder ? " tbc-block" : ""}"${rv()}>${esc(r.description[L])}</p>
      <dl class="room-facts"${rv(80)}>${facts}</dl>
      ${r.features.length ? `<div${rv(120)}><h2 class="h-small">${esc(t.stay.roomFeatures)}</h2><ul class="chips chips-light">${r.features.map((f) => `<li>${esc(f[L])}</li>`).join("")}</ul></div>` : ""}
      ${responseLine(t)}
    </div>
    ${galleryGrid(t, r.images.slice(1), "gallery-room")}
  </div>
</section>

<section class="section rooms-dark" aria-labelledby="other-title">
  ${HUT_DECO}
  <div class="wrap">
    ${heading({ eyebrow: H.eyebrow, title: t.stay.otherRooms, id: "other-title" })}
    ${roomCards(t)}
  </div>
</section>`;
  return {
    page: "stay",
    title: fmt(t.meta.room.title, { room: name }),
    description: fmt(t.meta.room.description, { room: name }),
    path: href("room:" + r.id, L),
    alt: href("room:" + r.id, other(L)),
    preload: imgUrl(r.images[0], 1080),
    ld: [bc.ld],
    body,
  };
}

// ================= CONTACT =================
export function contact(t) {
  const L = t.lang;
  const bc = breadcrumbs(t, [{ name: t.nav.contact, path: href("contact", L) }]);
  const q = site.geo ? `${site.geo.lat},${site.geo.lng}` : site.mapQuery;
  const body = `
${pageHero(t, {
  eyebrow: t.contact.eyebrow,
  title: t.home.location.title,
  accent: t.home.location.titleAccent,
  lead: t.home.location.body,
  image: "coastAerial",
  crumbs: bc.html,
  ctas: `<div class="btn-row"><a class="btn btn-dark btn-lg" href="${waLink(t.form.waHello)}" target="_blank" rel="noopener">${icon("chat")}${esc(t.home.cta.wa)}</a><a class="btn btn-outline btn-lg" href="${mapsLink()}" target="_blank" rel="noopener">${esc(t.common.openMaps)}${icon("arrow-up-right")}</a></div>`,
})}

<section class="section location" aria-labelledby="loc2-title">
  <div class="wrap location-grid">
    <div>
      ${heading({ eyebrow: t.location.eyebrow, title: t.location.title, id: "loc2-title" })}
      ${infoGrid(t)}
      <p class="body-text tbc-block"${rv(200)}>${esc(t.location.directionsPending)}</p>
    </div>
    <div class="map-frame"${rv(120)}>
      <iframe title="${esc(t.location.mapTitle)}" src="https://www.google.com/maps?q=${encodeURIComponent(q)}&z=12&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
    </div>
  </div>
</section>

<section class="section faq-section" aria-labelledby="faq-title">
  <div class="wrap faq-grid">
    ${heading({ eyebrow: t.faq.eyebrow, title: t.faq.title, id: "faq-title" })}
    ${faqBlock(t)}
  </div>
</section>

${ctaBand(t)}`;
  return {
    page: "contact",
    title: t.meta.contact.title,
    description: t.meta.contact.description,
    path: href("contact", L),
    alt: href("contact", other(L)),
    preload: imgUrl("coastAerial", 1080),
    ld: [bc.ld, faqLd(t)],
    body,
  };
}

// ================= THANK YOU =================
export function thanks(t) {
  const L = t.lang;
  const body = `
<section class="section simple-page">
  <div class="wrap narrow center">
    <svg class="simple-mark" aria-hidden="true"><use href="#i-hut"></use></svg>
    <p class="eyebrow eyebrow-lines">${esc(t.thanks.eyebrow)}</p>
    <h1 class="title">${esc(t.thanks.title)}</h1>
    <p class="lead" data-thanks-body data-table="${esc(t.thanks.tableBody)}" data-room="${esc(t.thanks.roomBody)}">${esc(t.thanks.genericBody)}</p>
    <div class="btn-row center">
      <a class="btn btn-terra btn-lg" href="${waLink()}" target="_blank" rel="noopener" data-thanks-reopen>${icon("chat")}${esc(t.thanks.reopen)}</a>
      <a class="btn btn-outline btn-lg" href="${href("home", L)}">${esc(t.thanks.back)}</a>
    </div>
    ${responseLine(t)}
  </div>
</section>`;
  return {
    page: "thanks",
    title: t.meta.thanks.title,
    description: t.meta.thanks.description,
    path: href("thanks", L),
    alt: href("thanks", other(L)),
    robots: "noindex",
    body,
  };
}

// ================= PRIVACY =================
export function privacy(t) {
  const L = t.lang;
  const bc = breadcrumbs(t, [{ name: t.privacy.title, path: href("privacy", L) }]);
  const body = `
<section class="section simple-page">
  <div class="wrap narrow prose">
    ${bc.html}
    <h1 class="title">${esc(t.privacy.title)}</h1>
    <p class="tbc-block">${esc(t.privacy.reviewNote)}</p>
    ${t.privacy.sections.map((s) => `<h2>${esc(s.h)}</h2><p>${esc(s.p)}</p>`).join("")}
  </div>
</section>`;
  return {
    page: "privacy",
    title: t.meta.privacy.title,
    description: t.meta.privacy.description,
    path: href("privacy", L),
    alt: href("privacy", other(L)),
    ld: [bc.ld],
    body,
  };
}

// ================= 404 =================
export function notFound(t) {
  const L = t.lang;
  const body = `
<section class="section simple-page">
  <div class="wrap narrow center">
    <svg class="simple-mark" aria-hidden="true"><use href="#i-hut"></use></svg>
    <p class="eyebrow eyebrow-lines">${esc(t.notFound.eyebrow)}</p>
    <h1 class="title">${esc(t.notFound.title)}</h1>
    <p class="lead">${esc(t.notFound.body)}</p>
    <div class="btn-row center">
      <a class="btn btn-dark" href="${href("home", L)}">${esc(t.nav.home)}${icon("arrow")}</a>
      <a class="btn btn-outline" href="${href("restaurant", L)}">${esc(t.nav.restaurant)}</a>
      <a class="btn btn-outline" href="${href("stay", L)}">${esc(t.nav.stay)}</a>
      <a class="btn btn-outline" href="${href("contact", L)}">${esc(t.nav.contact)}</a>
    </div>
  </div>
</section>`;
  return {
    page: "notFound",
    title: t.meta.notFound.title,
    description: t.meta.notFound.description,
    path: href("notFound", L),
    alt: href("notFound", other(L)),
    robots: "noindex",
    body,
  };
}
