// Page bodies. Each function returns { title, description, path, alt, body, ... } for layout().
// The homepage follows the approved design mock-up section by section; inner pages reuse its parts.
import { esc, fmt, href, figure, icon, waLink, hoursList, responseLine, breadcrumbs, imgUrl, money, reservationSlots, slotPeriod, site, rooms, images } from "./lib.mjs";
import { existsSync } from "node:fs";
import { TAIS, tripadvisorBadge } from "./layout.mjs";
import { categories, items, menuNote } from "./data/menu.mjs";
import siteReviews from "./data/reviews.mjs";

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

// Full-screen photo hero used by inner pages (same language as the homepage hero).
function pageHero(t, { eyebrow, title, accent = "", lead, image, crumbs, ctas = "" }) {
  return `<section class="cine-hero is-page">
  <div class="cine-slides"><div class="slide is-active">${figure(t, image, { eager: true, sizes: "100vw" })}</div></div>
  <div class="cine-shade" aria-hidden="true"></div>
  <div class="wrap cine-content">
    <div data-fade>${crumbs}</div>
    <p class="eyebrow eyebrow-light" data-fade style="--d:100ms">${esc(eyebrow)}</p>
    <h1 class="cine-title is-page" data-split>${esc(title)}${accent ? ` <em>${esc(accent)}</em>` : ""}</h1>
    <p class="cine-lead" data-fade style="--d:300ms">${esc(lead)}</p>
    <div data-fade style="--d:400ms">${ctas}</div>
  </div>
</section>`;
}

// "From US$ X / night", or a clear "price to be confirmed" until Lauhata supplies the price.
function fromPrice(t, r) {
  const H = t.home.rooms;
  return r.price
    ? `<p class="from"><span>${esc(H.from)}</span><strong>${esc(r.price)}</strong> <small>${esc(H.night)}</small></p>`
    : `<p class="from is-tbc"><strong>${esc(t.common.priceTbc)}</strong></p>`;
}

// Capacity and amenities of a room, only once the owner has confirmed them (site.roomDetailsConfirmed); until then one
// quiet line says so, instead of chips that look like facts.
function roomFeatures(t, r) {
  if (site.roomDetailsConfirmed && r.features.length) return `<ul class="chips">${r.features.map((f) => `<li>${esc(f[t.lang])}</li>`).join("")}</ul>`;
  return `<p class="room-tbc">${esc(t.land.suites.tbc)}</p>`;
}

// Large alternating rows, one per room type (homepage and stay page).
function roomRows(t, list = rooms, { arch = false } = {}) {
  const L = t.lang;
  const H = t.home.rooms;
  return `<div class="room-rows">${list
    .map((r, i) => {
      const n = rooms.findIndex((x) => x.id === r.id); // its number among all room types
      return `<article class="room-row${i % 2 ? " is-flip" : ""}">
      <a class="room-row-img${arch ? " is-arch" : ""}" href="${href("room:" + r.id, L)}" tabindex="-1" aria-hidden="true">
        ${figure(t, r.images[0], { sizes: "(min-width: 900px) 56vw, 92vw", ratio: arch ? "1/1" : "5/4", attrs: "data-clip", parallax: 0.1 })}
        ${r.badge ? `<span class="pill pill-dark">${esc(r.badge[L])}</span>` : ""}
      </a>
      <div class="room-row-body"${rv(120)}>
        <span class="room-num">0${n + 1}<small>/0${rooms.length}</small></span>
        <h3><a href="${href("room:" + r.id, L)}">${esc(r.name[L])}</a></h3>
        <p>${esc(r.summary[L])}</p>
        ${roomFeatures(t, r)}
        <div class="room-foot">
          ${fromPrice(t, r)}
          <a class="btn btn-cream" href="${href("stay", L, "#reservar")}" data-room-link="${r.id}">${esc(H.book)}${icon("arrow")}</a>
        </div>
      </div>
    </article>`;
    })
    .join("")}</div>`;
}

const mapsLink = () => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.geo ? `${site.geo.lat},${site.geo.lng}` : site.mapQuery)}`;
const pend = (v, fallback) => (v ? esc(v) : `<span class="tbc">${esc(fallback)}</span>`);

// ---------- Booking card (hero): request straight to WhatsApp ----------
export function bookingCard(t) {
  const q = t.home.quick;
  const timeOpts = timeOptions(t, { selected: "19:30" });
  const fld = (label, control) => `<label class="bc-field"><span>${esc(label)}</span>${control}</label>`;
  // Quantities are number fields: the picker draws a stepper over them, and without JavaScript they still work.
  const qty = (name, max) => `<input type="number" name="${name}" min="1" max="${max}" value="2" inputmode="numeric" data-pick="number" data-unit-one="${esc(q.person)}" data-unit-many="${esc(q.persons)}">`;
  return `<form class="booking-card" data-quick-wa novalidate aria-label="${esc(q.label)}">
    <div class="bc-tabs" role="tablist">
      <button type="button" role="tab" aria-selected="false" aria-controls="bc-table" data-bc-tab="table">${icon("cutlery")}${esc(q.tabTable)}</button>
      <button type="button" role="tab" aria-selected="false" aria-controls="bc-room" data-bc-tab="room">${icon("bed")}${esc(q.tabRoom)}</button>
    </div>
    <p class="bc-hint" data-bc-hint>${esc(q.hint)}</p>
    <div class="bc-row" id="bc-table" role="tabpanel" data-bc-panel="table" hidden>
      ${fld(q.date, `<input type="date" name="date" data-pick="date">`)}
      ${fld(q.time, `<select name="time" data-pick="time">${timeOpts}</select>`)}
      ${fld(q.people, qty("people", 20))}
      <button class="btn btn-terra btn-lg bc-submit" type="submit">${icon("whatsapp")}${esc(q.submitTable)}</button>
    </div>
    <div class="bc-row" id="bc-room" role="tabpanel" data-bc-panel="room" hidden>
      ${fld(q.checkIn, `<input type="date" name="checkIn" data-pick="in">`)}
      ${fld(q.checkOut, `<input type="date" name="checkOut" data-pick="out">`)}
      ${fld(q.guests, qty("guests", 20))}
      ${fld(q.room, `<select name="room" data-pick="select"><option value="">${esc(q.roomAny)}</option>${rooms.map((r) => `<option value="${r.id}">${esc(r.name[t.lang])}</option>`).join("")}</select>`)}
      <button class="btn btn-terra btn-lg bc-submit" type="submit">${icon("whatsapp")}${esc(q.submitRoom)}</button>
    </div>
    <p class="bc-error" role="alert" hidden data-bc-error></p>
    <p class="bc-note">${site.responseTime ? esc(site.responseTime[t.lang]) : esc(t.contact.responsePending)}</p>
  </form>`;
}

// ---------- Full forms (restaurant and stay pages) ----------
// Reservation times as <option>s, grouped by part of the day (the time picker reads data-group and data-label).
function timeOptions(t, { selected = "", placeholder = "" } = {}) {
  const part = { morning: t.pick.morning, afternoon: t.pick.afternoon, evening: t.pick.evening };
  return (
    (placeholder ? `<option value="">${esc(placeholder)}</option>` : "") +
    reservationSlots()
      .map((h) => `<option value="${h}" data-group="${esc(part[slotPeriod(h)])}" data-label="${h}"${h === selected ? " selected" : ""}>${esc(part[slotPeriod(h)])} · ${h}</option>`)
      .join("")
  );
}

function field({ id, label, type = "text", name, attrs = "", hint = "", optional = "", full = false, control = "" }) {
  const describedBy = [hint ? `${id}-hint` : "", `${id}-err`].filter(Boolean).join(" ");
  return `<div class="field${full ? " is-full" : ""}">
    <label for="${id}">${esc(label)}${optional ? ` <span class="opt">(${esc(optional)})</span>` : ""}</label>
    ${control
      ? control.replace("<select ", `<select id="${id}" name="${name}" aria-describedby="${describedBy}" `)
      : type === "textarea"
      ? `<textarea id="${id}" name="${name}" rows="3" ${attrs} aria-describedby="${describedBy}"></textarea>`
      : `<input id="${id}" name="${name}" type="${type}" ${attrs} aria-describedby="${describedBy}">`}
    ${hint ? `<p class="hint" id="${id}-hint">${esc(hint)}</p>` : ""}
    <p class="error" id="${id}-err" aria-live="polite"></p>
  </div>`;
}

function formFooter(t, submitLabel) {
  return `<div class="form-errors" role="alert" hidden data-form-errors>${esc(t.form.errorsTitle)}</div>
    <div class="form-actions">
      <button class="btn btn-terra btn-lg" type="submit">${icon("whatsapp")}<span data-submit-label>${esc(submitLabel)}</span></button>
      ${responseLine(t)}
    </div>
    <p class="form-note">${esc(t.form.note)}</p>`;
}

function tableForm(t) {
  const f = t.form;
  return `<form class="booking-form" data-booking="table" novalidate>
    <div class="form-grid">
      ${field({ id: "tb-name", name: "name", label: f.name, attrs: 'autocomplete="name" required maxlength="80"' })}
      ${field({ id: "tb-contact", name: "contact", label: f.contact, hint: f.contactHint, optional: f.optional, attrs: 'autocomplete="tel" maxlength="80" inputmode="tel"' })}
      ${field({ id: "tb-date", name: "date", type: "date", label: f.date, attrs: 'required data-pick="date"' })}
      ${field({ id: "tb-time", name: "time", label: f.time, control: `<select data-pick="time" required>${timeOptions(t, { placeholder: t.pick.chooseTime })}</select>` })}
      ${field({ id: "tb-people", name: "people", type: "number", label: f.people, attrs: `required min="1" max="50" value="2" inputmode="numeric" data-pick="number" data-unit-one="${esc(t.home.quick.person)}" data-unit-many="${esc(t.home.quick.persons)}"` })}
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
      ${field({ id: "rm-in", name: "checkIn", type: "date", label: f.checkIn, attrs: 'required data-pick="in"' })}
      ${field({ id: "rm-out", name: "checkOut", type: "date", label: f.checkOut, attrs: 'required data-pick="out"' })}
      ${field({ id: "rm-guests", name: "guests", type: "number", label: f.guests, attrs: `required min="1" max="20" value="2" inputmode="numeric" data-pick="number" data-unit-one="${esc(f.guestOne)}" data-unit-many="${esc(f.guestMany)}"` })}
      ${field({ id: "rm-room", name: "room", label: f.roomType, control: `<select data-pick="select">${options}</select>` })}
      ${field({ id: "rm-name", name: "name", label: f.name, attrs: 'autocomplete="name" required maxlength="80"' })}
      ${field({ id: "rm-contact", name: "contact", label: f.contact, hint: f.contactHint, optional: f.optional, attrs: 'autocomplete="tel" maxlength="80" inputmode="tel"' })}
      ${field({ id: "rm-notes", name: "notes", type: "textarea", label: f.notes, optional: f.optional, attrs: `maxlength="400" placeholder="${esc(f.notesPlaceholder)}"`, full: true })}
    </div>
    ${formFooter(t, f.submitRoom)}
  </form>`;
}

// ---------- Shared blocks ----------
// ---------- Menu: dish cards, category bar, search ----------
const normalize = (v) => v.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

// A dish can be ordered when it has a price: its own, or one per size (chips).
const sizePriced = (d) => d.options.find((g) => g.choices.some((c) => c.price != null));
const canOrder = (d) => d.price != null || Boolean(sizePriced(d));

// Price on a card: the dish price, or each size with its price, or "price to be confirmed".
function dishPrice(t, d) {
  const sized = sizePriced(d);
  if (sized) return sized.choices.map((c) => `${esc(c.label[t.lang])} <b>${money(c.price)}</b>`).join(" · ");
  return d.price != null ? `<b>${money(d.price)}</b>` : esc(t.common.priceTbc);
}

// Every dish has its own photo slot: src/assets/img/pratos/<dish id>-640.jpg (4:3, 640 px wide; add <id>-1080.jpg for
// sharper screens). When the restaurant's photo of that dish is there, it is shown; until then the slot shows a quiet
// "photo coming soon" tile with the dish's initial, never a stock or AI picture standing in for the real dish.
// The build lists every slot and its status in FOTOS-PRATOS.md.
export const dishPhotoFile = (d, w = 640) => new URL(`./assets/img/pratos/${d.id}-${w}.jpg`, import.meta.url);
function dishPhoto(t, d) {
  if (d.image) return figure(t, d.image, { sizes: "(min-width: 1000px) 28vw, (min-width: 600px) 45vw, 30vw", ratio: "4/3" });
  if (existsSync(dishPhotoFile(d))) {
    const big = existsSync(dishPhotoFile(d, 1080));
    const src = `/assets/img/pratos/${d.id}-640.jpg`;
    return `<figure class="media dish-photo"><img src="${src}"${big ? ` srcset="${src} 640w, /assets/img/pratos/${d.id}-1080.jpg 1080w" sizes="(min-width: 1000px) 28vw, (min-width: 600px) 45vw, 30vw"` : ""} alt="${esc(d.name)}" width="640" height="480" loading="lazy" decoding="async"></figure>`;
  }
  return `<div class="dish-photo is-pending" aria-hidden="true"><span class="dp-mark">${esc(d.name.trim()[0])}</span><span class="dp-note">${esc(t.order.photoSoon)}</span></div>`;
}

// One dish. With \`link\` the name links to the menu (homepage row). \`image\` stays empty until the
// restaurant has a real photo of that dish: a card without a picture beats a picture of another dish.
function dishCard(t, d, { link = "" } = {}) {
  const L = t.lang;
  const O = t.order;
  const cat = categories.find((c) => c.id === d.category);
  const search = normalize([d.name, d.description?.en, d.description?.pt, cat.name.en, cat.name.pt].filter(Boolean).join(" "));
  const verb = d.options.length ? O.choose : O.add;
  return `<article class="dish has-photo" data-dish data-search="${esc(search)}">
      ${dishPhoto(t, d)}
      <div class="dish-body">
        <p class="dish-tag">${esc(cat.name[L])}</p>
        <h3>${link ? `<a class="dish-link" href="${link}">${esc(d.name)}</a>` : esc(d.name)}</h3>
        ${d.description ? `<p class="dish-desc">${esc(d.description[L])}</p>` : ""}
        <div class="dish-foot">
          <span class="price${canOrder(d) ? "" : " is-tbc"}">${dishPrice(t, d)}</span>
          ${canOrder(d) ? `<button class="btn btn-dark btn-sm dish-add" type="button" data-add="${d.id}" aria-label="${esc(verb)}: ${esc(d.name)}"><span data-add-label>${icon("plus")}<span>${esc(verb)}</span></span></button>` : ""}
        </div>
      </div>
    </article>`;
}

// A dish as one line of a printed menu: name and description, price, and a round add button.
function dishLine(t, d) {
  const L = t.lang;
  const O = t.order;
  const verb = d.options.length ? O.choose : O.add;
  return `<li class="dish-line">
      <div class="dl-text"><h3>${esc(d.name)}</h3>${d.description ? `<p>${esc(d.description[L])}</p>` : ""}</div>
      <span class="dl-price">${dishPrice(t, d)}</span>
      ${canOrder(d) ? `<button class="dl-add" type="button" data-add="${d.id}" aria-label="${esc(verb)}: ${esc(d.name)}"><span data-add-label>${icon("plus")}</span></button>` : ""}
    </li>`;
}

// The full interactive menu: search, a category bar that sticks while scrolling, and every category
// in the order of the printed menu. Behaviour lives in assets/js/order.js.
function menuSection(t) {
  const L = t.lang;
  const O = t.order;
  // A category with no dishes yet (the drinks, until the restaurant supplies them) is left out of the page and the bar.
  const shown = categories.filter((c) => items.some((d) => d.category === c.id));
  const nav = shown.map((c) => `<li><a href="#cat-${c.id}" data-cat-link="${c.id}">${esc(c.name[L])}</a></li>`).join("");
  const sections = shown
    .map((c) => `<section class="menu-cat" id="cat-${c.id}" data-cat="${c.id}" aria-labelledby="cat-${c.id}-title">
      <header class="menu-cat-head"><h3 id="cat-${c.id}-title">${esc(c.name[L])}</h3>${c.note ? `<p>${esc(c.note[L])}</p>` : ""}</header>
      ${c.groups
        ? Object.entries(c.groups)
            .map(([g, label]) => {
              const list = items.filter((d) => d.category === c.id && d.group === g);
              return list.length ? `<h4 class="menu-group">${esc(label[L])}</h4><div class="menu-grid">${list.map((d) => dishCard(t, d)).join("")}</div>` : "";
            })
            .join("")
        : `<div class="menu-grid">${items.filter((d) => d.category === c.id).map((d) => dishCard(t, d)).join("")}</div>`}
    </section>`)
    .join("");
  return `<section class="section menu" id="ementa" aria-labelledby="menu-title" data-menu>
  <div class="wrap">
    ${heading({ eyebrow: t.home.dishes.eyebrow, title: t.restaurant.menuTitle, lead: t.restaurant.menuLead, id: "menu-title", center: true })}
    <p class="menu-note"${rv(60)}>${esc(menuNote[L])}</p>
    <p class="dine-in"${rv(80)}>${icon("cutlery")}<span>${esc(O.dineIn)}</span></p>
    <div class="menu-search"${rv(100)}>
      <label for="menu-search"><span class="sr-only">${esc(O.searchLabel)}</span>${icon("search")}</label>
      <input id="menu-search" type="search" placeholder="${esc(O.searchPlaceholder)}" autocomplete="off" enterkeyhint="search" data-menu-search>
      <button class="icon-btn" type="button" hidden data-menu-clear aria-label="${esc(O.clearSearch)}">${icon("close")}</button>
    </div>
  </div>
  <nav class="menu-nav" aria-label="${esc(O.categories)}" data-menu-nav>
    <div class="wrap"><ul>${nav}</ul></div>
  </nav>
  <div class="wrap">
    <p class="sr-only" role="status" aria-live="polite" data-menu-status></p>
    ${sections}
    <p class="menu-empty" hidden data-menu-empty></p>
  </div>
</section>`;
}

function roomCards(t, list, cls = "") {
  const L = t.lang;
  const h = t.home.rooms;
  return `<div class="room-grid ${cls}">${list
    .map((r, i) => `<article class="room-card"${rv(i * 90)}>
      <a class="room-img" href="${href("room:" + r.id, L)}" tabindex="-1" aria-hidden="true">
        ${figure(t, r.images[0], { sizes: "(min-width: 1000px) 30vw, 92vw", ratio: "3/2" })}
        ${r.badge ? `<span class="pill pill-dark">${esc(r.badge[L])}</span>` : ""}
      </a>
      <div class="room-body">
        <h3><a href="${href("room:" + r.id, L)}">${esc(r.name[L])}</a></h3>
        <p>${esc(r.summary[L])}</p>
        ${roomFeatures(t, r)}
        <div class="room-foot">
          ${fromPrice(t, r)}
          <a class="btn btn-cream btn-sm" href="${href("stay", L, "#reservar")}" data-room-link="${r.id}">${esc(h.book)}${icon("arrow")}</a>
        </div>
      </div>
    </article>`)
    .join("")}</div>`;
}

const HUT_DECO = ""; // (the faint watermark was removed with the symbol redesign: the logo is the supplied one)

function infoGrid(t) {
  const L = t.lang;
  const h = t.home.location;
  const hours = site.restaurantHours.length ? site.restaurantHours.map((x) => `${x.days[L]} ${x.hours}`).join(" · ") : null;
  return `<dl class="info-grid"${rv(160)}>
    <div>${icon("pin")}<dt>${esc(h.address)}</dt><dd>${esc(site.address.locality)}, ${esc(site.address.region)}<br>${esc(site.address.country)}</dd></div>
    ${hours ? `<div>${icon("clock")}<dt>${esc(h.hours)}</dt><dd>${esc(h.restaurant)}: ${esc(hours)}${site.receptionHours ? `<br>${esc(h.reception)}: ${esc(site.receptionHours[L])}` : ""}</dd></div>` : ""}
    ${site.whatsapp ? `<div>${icon("whatsapp")}<dt>${esc(t.common.whatsapp)}</dt><dd><a href="${waLink(t.form.waHello)}" target="_blank" rel="noopener">+${esc(site.whatsapp)}</a></dd></div>` : ""}
    ${site.email ? `<div>${icon("mail")}<dt>${esc(t.common.email)}</dt><dd><a href="mailto:${esc(site.email)}">${esc(site.email)}</a></dd></div>` : ""}
  </dl>`;
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
// The homepage is one day at the coast, told in sections that each have their own composition:
// the hero, a diptych that sends people to eat or to sleep, the menu, a slow breakfast, rooms that open
// like an accordion, a day that changes colour as you scroll, culture on terracotta, and a real map.

// Breakfast times from the printed menu hours, or null while they are not filled in.
function breakfastHours() {
  const h = site.restaurantHours.find((x) => /pequeno|breakfast/i.test(`${x.days.pt} ${x.days.en}`));
  const m = h && String(h.hours).match(/(\d{1,2}:\d{2})\D+(\d{1,2}:\d{2})/);
  return m ? { from: m[1], to: m[2] } : null;
}

const mapQuery = () => (site.geo ? `${site.geo.lat},${site.geo.lng}` : site.mapQuery);
const directionsLink = () => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapQuery())}`;

// Comer / Dormir: two large panels, one a rounded frame and one an arch, side by side.
function chooseSection(t) {
  const L = t.lang;
  const C = t.land.choose;
  const panel = (cls, n, key, copy, target, sizes, extra = "") => `<a class="ch-panel ${cls}" href="${target}" data-reveal>
      <span class="ch-img">${figure(t, key, { sizes })}</span>
      <span class="ch-n" aria-hidden="true">${n}</span>
      <span class="ch-body">
        <span class="ch-title">${esc(copy.title)}</span>
        <span class="ch-sub">${esc(extra || copy.sub)}</span>
        <span class="ch-cta">${esc(copy.cta)}<i>${icon("arrow")}</i></span>
      </span>
    </a>`;
  return `<section class="choose" id="escolher" aria-label="${esc(C.aria)}">
  <div class="wrap">
    <p class="statement-text choose-line" data-fade>${esc(C.statement)}</p>
    <div class="choose-grid">
      ${panel("ch-eat", "01", "foodSpread", C.eat, "#comer", "(min-width: 900px) 56vw, 92vw")}
      ${panel("ch-sleep", "02", "roomFamily", C.sleep, "#quartos", "(min-width: 900px) 40vw, 92vw", fmt(C.sleep.sub, { n: rooms.length }))}
    </div>
  </div>
</section>`;
}

// Breakfast: a wide morning photo, the hours set large, and the real breakfast lines from the printed menu.
function breakfastSection(t, list) {
  const B = t.land.bkf;
  const hrs = breakfastHours();
  return `<section class="bkf" id="pequeno-almoco" aria-labelledby="bkf-title">
  <div class="bkf-grid">
    <div class="bkf-visual" data-reveal>
      ${figure(t, "terrace", { sizes: "(min-width: 900px) 58vw, 100vw", ratio: "5/4", parallax: 0.07 })}
      <div class="bkf-inset">${figure(t, "palmShadow", { sizes: "(min-width: 900px) 18vw, 40vw", ratio: "3/4" })}</div>
    </div>
    <div class="bkf-body">
      ${heading({ eyebrow: B.eyebrow, title: B.title1, accent: B.titleAccent, id: "bkf-title" })}
      <p class="bkf-lead"${rv(60)}>${esc(B.lead)}</p>
      ${hrs ? `<p class="bkf-hours"${rv(100)}><span>${esc(B.served)}</span><b>${hrs.from}</b><i aria-hidden="true"></i><b>${hrs.to}</b></p>` : ""}
      <p class="bkf-note"${rv(110)}>${esc(B.note)}</p>
      <h3 class="bkf-list-h"${rv(120)}>${esc(B.list)}</h3>
      <ul class="dish-lines bkf-list"${rv(140)}>${list.map((d) => dishLine(t, d)).join("")}</ul>
      <div class="btn-row"${rv(160)}><a class="btn btn-dark" href="${href("restaurant", t.lang, "#cat-breakfast")}">${esc(B.cta)}${icon("arrow")}</a></div>
    </div>
  </div>
</section>`;
}

// Rooms: panels that open on hover or focus (the first is open); on a phone they stack as cards. Capacity and
// amenities only show once the owner has confirmed them (site.roomDetailsConfirmed).
function suitesSection(t) {
  const L = t.lang;
  const S = t.land.suites;
  const sure = site.roomDetailsConfirmed;
  return `<section class="suites" id="quartos" aria-labelledby="rooms-title">
  <div class="wrap">
    <div class="su-head">
      ${heading({ eyebrow: S.eyebrow, title: S.title, accent: S.titleAccent, id: "rooms-title" })}
      <div${rv(100)}>
        <p class="su-lead">${esc(S.body)}</p>
        <a class="btn btn-cream" href="${href("stay", L, "#quartos")}">${esc(S.all)}${icon("arrow")}</a>
      </div>
    </div>
    <div class="su-row" data-suites>${rooms
      .map((r, i) => `<article class="su${i === 0 ? " is-on" : ""}" data-su>
      <a class="su-img" href="${href("room:" + r.id, L)}" tabindex="-1" aria-hidden="true">${figure(t, r.images[0], { sizes: "(min-width: 900px) 56vw, 92vw" })}</a>
      <div class="su-rail" aria-hidden="true"><span>0${i + 1}</span><b>${esc(r.name[L])}</b></div>
      <div class="su-body">
        <p class="su-top"><span>0${i + 1}<small>/0${rooms.length}</small></span></p>
        <h3><a href="${href("room:" + r.id, L)}">${esc(r.name[L])}</a></h3>
        <p class="su-sum">${esc(r.tagline[L])}</p>
        ${sure && r.features.length ? `<ul class="chips">${r.features.map((f) => `<li>${esc(f[L])}</li>`).join("")}</ul>` : ""}
        ${sure || r.price ? "" : `<p class="su-tbc">${esc(S.tbc)}</p>`}
        <div class="su-foot">
          ${r.price ? fromPrice(t, r) : ""}
          <div class="su-btns">
            <a class="btn btn-ghost-light btn-sm" href="${href("room:" + r.id, L)}">${esc(S.view)}</a>
            <a class="btn btn-cream btn-sm" href="${waLink(fmt(S.wa, { room: r.name[L] }))}" target="_blank" rel="noopener">${icon("whatsapp")}${esc(S.enquire)}</a>
          </div>
        </div>
      </div>
    </article>`)
      .join("")}</div>
  </div>
</section>`;
}

// A day at Lauhata, as a cinema scene: one pinned full-screen stage; as the page scrolls the picture changes from morning to
// dusk (the five real aerial frames, the camera rising as the day goes on) while the colour grade warms and darkens.
// Without JavaScript, with a failed script or without GSAP it is a plain list of five pictures with their text.
// The five moments are suggestions, not opening hours or guaranteed activities, and the section says so.
const DAY_FRAMES = [
  { key: "heroCover", grade: "rgba(70, 120, 150, 0.30)", dim: 0.1 },
  { key: "aerialDay2", grade: "rgba(120, 175, 165, 0.12)", dim: 0 },
  { key: "aerialGarden", grade: "rgba(255, 246, 226, 0.10)", dim: 0 },
  { key: "aerialDay4", grade: "rgba(217, 168, 95, 0.28)", dim: 0.12 },
  { key: "aerialCoast", grade: "rgba(199, 101, 69, 0.36)", dim: 0.42 },
];
function daySection(t) {
  const D = t.land.day;
  const steps = D.steps;
  return `<section class="day" id="experiencias" aria-labelledby="day-title" data-day>
  <div class="day-track"><div class="day-stage" data-day-stage>
    <header class="day-head">
      <h2 id="day-title" class="day-title">${esc(D.title)}</h2>
      <p class="day-lead">${esc(D.lead)}</p>
    </header>
    <ol class="day-steps">${steps
      .map((s, i) => `<li class="day-step" data-day-step data-grade="${DAY_FRAMES[i].grade}" data-dim="${DAY_FRAMES[i].dim}">
      ${figure(t, DAY_FRAMES[i].key, { sizes: "100vw", cls: "day-frame", decorative: true })}
      <div class="day-copy">
        <p class="day-meta"><time class="day-time">${esc(s.time)}</time><span class="day-period">${esc(s.period)}</span></p>
        <h3>${esc(s.t)}</h3>
        <p class="day-text">${esc(s.d)}</p>
      </div>
    </li>`)
      .join("")}</ol>
    <div class="day-grade" aria-hidden="true"></div>
    <div class="day-dim" aria-hidden="true"></div>
    <ol class="day-rail" aria-hidden="true">${steps.map((s) => `<li>${esc(s.time)}</li>`).join("")}<i class="day-rail-fill"></i></ol>
  </div></div>
  <p class="day-note">${esc(D.note)}</p>
</section>`;
}
// The end of the day: a coastal photograph beside two clear actions.
function duskSection(t) {
  const L = t.lang;
  const D = t.land.dusk;
  return `<section class="dusk" id="entardecer" aria-labelledby="dusk-title">
  <div class="dk-grid">
    <div class="dk-photo">${figure(t, "heroSunset", { sizes: "(min-width: 900px) 55vw, 100vw", ratio: "4/3", parallax: 0.06 })}</div>
    <div class="dk-body">
      <p class="eyebrow"${rv()}>${esc(D.eyebrow)}</p>
      <h2 id="dusk-title" class="dk-title" data-split>${esc(D.title)} <em>${esc(D.titleAccent)}</em></h2>
      <p class="dk-text"${rv(80)}>${esc(D.body)}</p>
      <div class="btn-row"${rv(140)}>
        <a class="btn btn-cream btn-lg" href="${href("restaurant", L)}">${esc(D.eat)}${icon("arrow")}</a>
        <a class="btn btn-ghost-light btn-lg" href="${href("stay", L, "#reservar")}">${esc(D.stay)}</a>
      </div>
    </div>
  </div>
</section>`;
}

// Culture on terracotta: the tais in an arch, general facts kept apart from the history of the place (still to
// be supplied by the owner), and the Tetum phrase set large.
function cultureSection(t) {
  const C = t.land.culture;
  return `<section class="cult" id="historia" aria-labelledby="story-title">
  <div class="wrap">
    <header class="cu-head"${rv()}>
      <p class="eyebrow">${esc(C.eyebrow)}</p>
      <h2 id="story-title" class="cu-title" data-split>${esc(C.title1)} ${esc(C.title2)} <em>${esc(C.titleAccent)}</em>.</h2>
    </header>
    <div class="cu-grid">
      <div class="cu-visual">
        <div class="cu-frame">${figure(t, "weaving", { sizes: "(min-width: 900px) 36vw, 82vw", ratio: "4/5", attrs: "data-clip", parallax: 0.05 })}</div>
        <p class="cu-cap">${esc(C.tais)}</p>
      </div>
      <div class="cu-text">
        <p class="cu-body"${rv(60)}>${esc(C.body)}</p>
        <h3 class="cu-group"${rv(90)}>${esc(C.themesLabel)}</h3>
        <ul class="cu-cards"${rv(120)}>${C.themes.map(([h, p]) => `<li><h4>${esc(h)}</h4><p>${esc(p)}</p></li>`).join("")}</ul>
        ${site.showPlaceholderNotes ? `<div class="cu-slot"${rv(160)}><h3>${esc(C.slot)}</h3><p>${esc(C.slotPending)}</p></div>` : ""}
      </div>
    </div>
    <div class="cu-quote"${rv()}>
      <p class="cu-label">${esc(C.quoteLabel)}</p>
      <p class="cu-big">${esc(C.quote)}</p>
      <p class="cu-gloss">${esc(C.gloss)}${site.showPlaceholderNotes ? ` <small>${esc(C.glossNote)}</small>` : ""}</p>
    </div>
  </div>
  ${TAIS}
</section>`;
}

// Visit and book: location, hours and bookings in three groups, and a real Google map.
function reachSection(t) {
  const L = t.lang;
  const R = t.land.reach;
  const q = mapQuery();
  const hours = site.restaurantHours.length
    ? site.restaurantHours.map((x) => `<span>${esc(x.days[L])} <b>${esc(x.hours)}</b></span>`).join("")
    : `<span class="tbc">${esc(t.common.toConfirm)}</span>`;
  const row = (ico, label, value) => `<div class="rc-row">${icon(ico)}<dt>${esc(label)}</dt><dd>${value}</dd></div>`;
  const drive = site.driveFromDili ? fmt(t.home.location.drive, { t: site.driveFromDili }) : "";
  const reception = site.receptionHours ? esc(site.receptionHours[L]) : `<span class="tbc">${esc(t.common.toConfirm)}</span>`;
  return `<section class="reach" id="contacto" aria-labelledby="loc-title">
  <div class="wrap rc-grid">
    <div class="rc-info">
      ${heading({ eyebrow: R.eyebrow, title: R.title, accent: R.titleAccent, lead: R.body, id: "loc-title" })}
      <div class="rc-groups">
        <section class="rc-group" aria-labelledby="rc-loc"${rv(60)}>
          <h3 id="rc-loc">${esc(R.location)}</h3>
          <dl>
            ${row("pin", R.address, `${esc(site.address.locality)}, ${esc(site.address.region)}<br>${esc(site.address.country)}`)}
            ${row("car", R.fromDili, drive ? esc(drive) : `<span class="tbc">${esc(t.common.toConfirm)}</span>`)}
          </dl>
          <div class="rc-actions">
            <a class="btn btn-dark" href="${directionsLink()}" target="_blank" rel="noopener">${icon("pin")}${esc(R.directions)}</a>
            <a class="btn btn-outline" href="${mapsLink()}" target="_blank" rel="noopener">${esc(t.common.openMaps)}${icon("arrow-up-right")}</a>
          </div>
        </section>
        <section class="rc-group" aria-labelledby="rc-hours"${rv(100)}>
          <h3 id="rc-hours">${esc(R.hours)}</h3>
          <dl>
            ${row("cutlery", t.home.location.restaurant, `<span class="rc-hours">${hours}</span>`)}
            ${row("bed", R.reception, reception)}
          </dl>
        </section>
        <section class="rc-group" aria-labelledby="rc-book"${rv(140)}>
          <h3 id="rc-book">${esc(R.bookings)}</h3>
          <p class="rc-text">${esc(R.bookingsText)}</p>
          <dl>
            ${row("whatsapp", t.common.whatsapp, site.whatsapp ? `<a href="${waLink(t.form.waHello)}" target="_blank" rel="noopener">+${esc(site.whatsapp)}</a>` : `<span class="tbc">+670 [XXXX XXXX]</span>`)}
            ${row("mail", t.common.email, site.email ? `<a href="mailto:${esc(site.email)}">${esc(site.email)}</a>` : `<span class="tbc">[email]</span>`)}
          </dl>
          <div class="rc-actions">
            <a class="btn btn-terra" href="${waLink(t.form.waHello)}" target="_blank" rel="noopener">${icon("whatsapp")}${esc(t.home.cta.wa)}</a>
            <a class="btn btn-outline" href="${href("restaurant", L, "#reservar")}">${esc(R.bookTable)}</a>
            <a class="btn btn-outline" href="${href("stay", L, "#reservar")}">${esc(R.bookRoom)}</a>
          </div>
        </section>
      </div>
    </div>
    <div class="rc-map"${rv(120)}>
      <div class="map-frame">
        <iframe title="${esc(t.location.mapTitle)}" src="https://www.google.com/maps?q=${encodeURIComponent(q)}&z=${site.geo ? 15 : 12}&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
      </div>
      ${site.geo ? "" : `<p class="rc-note">${esc(R.mapNote)}</p>`}
    </div>
  </div>
</section>`;
}

// The facts a visitor looks for first, right under the hero: when the restaurant is open, where it is and how to book.
// Everything shown here is confirmed data (hours from the printed menu); nothing is guessed.
function glanceSection(t) {
  const L = t.lang;
  const G = t.land.glance;
  const hours = site.restaurantHours.map((h) => `<span>${esc(h.days[L])} <b>${esc(h.hours)}</b></span>`).join("");
  return `<section class="glance" aria-label="${esc(G.aria)}">
  <div class="wrap glance-grid">
    <div class="gl-cell"><p class="gl-label">${icon("cutlery")}${esc(G.eat)}</p><p class="gl-value gl-hours">${hours || esc(t.common.hoursTbc)}</p></div>
    <div class="gl-cell"><p class="gl-label">${icon("pin")}${esc(G.place)}</p><p class="gl-value">${esc(G.placeValue)}</p><a class="gl-link" href="${directionsLink()}" target="_blank" rel="noopener">${esc(G.route)}</a></div>
    <div class="gl-cell"><p class="gl-label">${icon("whatsapp")}${esc(G.book)}</p><p class="gl-value">${esc(G.bookValue)}</p><a class="gl-link" href="${waLink(t.form.waHello)}" target="_blank" rel="noopener">${esc(G.bookLink)}</a></div>
  </div>
</section>`;
}

// A full-screen "scene": one real aerial still in a wide cinema frame, a single line over it. The photo opens like a
// shutter as it enters, drifts slowly against the scroll and is darkened at the edges (see design.css).
function sceneSection(t, key, copy) {
  return `<section class="scene" aria-label="${esc(copy.line)}">
  <div class="scene-media">${figure(t, key, { sizes: "100vw" })}</div>
  <div class="wrap scene-text">
    <p class="scene-note" data-fade>${esc(copy.note)}</p>
    <h2 class="scene-line" data-split>${esc(copy.line)}</h2>
  </div>
</section>`;
}

// Photographs: only the pictures marked real in images.mjs (placeholder: false), so no stock or illustrative image is
// ever shown here as Lauhata. The grid grows on its own as real photos are added. Each one opens in a lightbox
// (the shared <dialog> in layout.mjs: Escape closes it, the arrow keys move between photos, focus returns to the thumbnail).
// Without JavaScript each thumbnail is a plain link to the large photo.
function gallerySection(t) {
  const G = t.land.gallery;
  const real = Object.keys(images).filter((k) => !images[k].placeholder && k !== "heroCover");
  if (real.length < 3) return "";
  return `<section class="section gallery-real" id="fotografias" aria-labelledby="gal-title">
  <div class="wrap">
    <div class="gr-head">
      ${heading({ eyebrow: G.eyebrow, title: G.title, id: "gal-title" })}
      <p class="gr-lead"${rv(80)}>${esc(G.lead)}</p>
    </div>
    <ul class="gr-grid" data-gallery>${real
      .map((k, i) => `<li class="gr-item${i === 0 ? " is-wide" : ""}"><a class="gr-link" href="${imgUrl(k, 1600)}" data-lb-src="${imgUrl(k, 1600)}" aria-label="${esc(fmt(G.open, { alt: images[k].alt[t.lang] }))}">${figure(t, k, { sizes: i === 0 ? "(min-width: 900px) 62vw, 100vw" : "(min-width: 900px) 31vw, 50vw" })}</a></li>`)
      .join("")}</ul>
  </div>
</section>`;
}

// The last invitation before the footer: the real aerial view of the coast, one line and the two separate actions
// (a room request and a table request), so it is clear which one each button starts.
function finalSection(t, key = "aerialCoast") {
  const F = t.land.final;
  const L = t.lang;
  return `<section class="scene final-cta" aria-labelledby="final-title">
  <div class="scene-media">${figure(t, key, { sizes: "100vw", decorative: true })}</div>
  <div class="wrap scene-text">
    <p class="scene-note" data-fade>${esc(F.note)}</p>
    <h2 id="final-title" class="scene-line final-line" data-split>${esc(F.line)}</h2>
    <p class="final-lead" data-fade>${esc(F.lead)}</p>
    <div class="btn-row" data-fade>
      <a class="btn btn-cream btn-lg" href="${href("stay", L, "#reservar")}">${esc(F.stay)}${icon("arrow")}</a>
      <a class="btn btn-ghost-light btn-lg" href="${href("restaurant", L, "#reservar")}">${esc(F.eat)}</a>
    </div>
  </div>
</section>`;
}

// ================= HOME: hero, a short introduction, Comer & Ficar, a look at who we are, the invitation =================

// One statement about what Lauhata is, beside a real aerial photograph.
function introSection(t) {
  return `<section class="section intro-ed" id="lauhata" aria-labelledby="intro-title">
  <div class="wrap intro-grid">
    <div class="intro-text">
      <p class="eyebrow">${esc(t.land.intro.note)}</p>
      <h2 id="intro-title" class="intro-statement" data-split>${esc(t.home.statement)}</h2>
    </div>
    <div class="intro-photo">${figure(t, "sunsetGarden", { sizes: "(min-width: 900px) 34vw, 92vw", ratio: "4/5" })}</div>
  </div>
</section>`;
}

// Comer & Ficar: the two things Lauhata offers, as two photographic panels of different weight with an ampersand
// between them. Each whole panel is one link. The photos are keys here so the restaurant's and the rooms' own
// photographs can replace the illustrative ones in one place (they keep their "Illustrative image" tag until then).
const DUO_PHOTOS = { eat: "beachFront", stay: "aerialCoast" };
function duoSection(t) {
  const D = t.land.duo;
  const L = t.lang;
  const panel = (key, page, copy) => `<a class="duo-panel duo-${key}" href="${href(page, L)}">
      <div class="duo-media">${figure(t, DUO_PHOTOS[key], { sizes: key === "eat" ? "(min-width: 900px) 56vw, 100vw" : "(min-width: 900px) 40vw, 100vw" })}</div>
      <div class="duo-copy">
        <h2 class="duo-title">${esc(copy.title)}</h2>
        <p class="duo-line">${esc(copy.line)}</p>
        <span class="duo-link">${esc(copy.link)}<i class="duo-arrow" aria-hidden="true"></i></span>
      </div>
    </a>`;
  return `<section class="duo" aria-label="${esc(D.aria)}">
  <div class="wrap duo-grid">
    ${panel("eat", "restaurant", D.eat)}
    <span class="duo-amp" aria-hidden="true">&amp;</span>
    ${panel("stay", "stay", D.stay)}
  </div>
</section>`;
}

// Guest reviews: no review text is copied (that needs the reviewers' and the platform's permission). The section invites
// visitors to read them on the real Tripadvisor listing; rating and count appear only once set in site.reviews.
// The last section of the home page, by the owner's choice. Two sources, kept apart: the Tripadvisor listing (a link, with
// rating and count only when filled in site.reviews) and feedback left on this site and approved by Lauhata
// (src/data/reviews.mjs). The feedback form sends the text to Lauhata on WhatsApp; nothing is published automatically.
function reviewsSection(t) {
  const R = t.reviews;
  const FB = t.land.feedback;
  const L = t.lang;
  const approved = siteReviews.filter((r) => r && r.name && r.text);
  const stars = (n) => `<span class="rv-stars" role="img" aria-label="${esc(fmt(FB.stars, { n }))}">${"★".repeat(n)}${"☆".repeat(5 - n)}</span>`;
  const list = approved.length
    ? `<div class="rv-site"><h3 class="h-small">${esc(FB.siteLabel)}</h3><ul class="rv-list">${approved
        .map((r) => `<li><figure><blockquote lang="${esc(r.lang || L)}"><p>${esc(r.text)}</p></blockquote><figcaption>${stars(Math.max(1, Math.min(5, Number(r.rating) || 5)))}<span>${esc(r.name)}${r.experience ? ` · ${esc(r.experience[L] || "")}` : ""}${r.date ? ` · ${esc(r.date)}` : ""}</span></figcaption></figure></li>`)
        .join("")}</ul></div>`
    : "";
  const exp = FB.experiences.map((x) => `<option>${esc(x)}</option>`).join("");
  const rating = [5, 4, 3, 2, 1].map((n) => `<label class="rv-star"><input type="radio" name="rating" value="${n}"><span>${esc(fmt(FB.stars, { n }))}</span></label>`).join("");
  return `<section class="section reviews-ed" id="opinioes" aria-labelledby="rv-title">
  <div class="wrap rv-grid">
    <div>
      <h2 id="rv-title" class="rv-title" data-split>${esc(R.title)}</h2>
      <p class="rv-lead"${rv(80)}>${esc(R.lead)}</p>
      <div class="rv-badge"${rv(120)}>${tripadvisorBadge(t, "is-large")}</div>
    </div>
    <div>
      ${list}
      <details class="rv-form"${rv(140)}>
        <summary>${esc(FB.title)}${icon("plus")}</summary>
        <p class="rv-form-lead">${esc(FB.lead)}</p>
        <form class="booking-form" data-booking="review" novalidate data-wa="${esc(FB.wa)}" data-err-name="${esc(FB.errors.name)}" data-err-rating="${esc(FB.errors.rating)}" data-err-text="${esc(FB.errors.text)}" data-err-consent="${esc(FB.errors.consent)}">
          <div class="form-grid">
            ${field({ id: "fb-name", name: "name", label: FB.name, attrs: 'autocomplete="given-name" required maxlength="40"' })}
            ${field({ id: "fb-exp", name: "experience", label: FB.experience, control: `<select data-pick="select" data-icon="heart">${exp}</select>` })}
            <fieldset class="field is-full rv-rating"><legend>${esc(FB.rating)}</legend><div class="rv-stars-in">${rating}</div><p class="error" id="fb-rating-err" aria-live="polite"></p></fieldset>
            ${field({ id: "fb-text", name: "text", type: "textarea", label: FB.text, attrs: 'required minlength="20" maxlength="700"', full: true })}
            <div class="field is-full rv-consent"><label><input type="checkbox" name="consent"> <span>${esc(FB.consent)}</span></label><p class="error" aria-live="polite"></p></div>
            <div class="rv-hp" aria-hidden="true"><label>Website <input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>
          </div>
          <div class="form-errors" role="alert" hidden data-form-errors>${esc(t.form.errorsTitle)}</div>
          <div class="form-actions"><button class="btn btn-dark btn-lg" type="submit">${icon("whatsapp")}<span data-submit-label>${esc(FB.submit)}</span></button></div>
          <p class="form-note">${esc(FB.note)}</p>
        </form>
      </details>
    </div>
  </div>
</section>`;
}

// Discover Liquiçá, on the home page: one photograph, one line and the way to the guide.
function discoverPreview(t) {
  const D = t.land.discoverPage;
  return `<section class="section dsc-preview" aria-labelledby="dp-title">
  <div class="wrap pv-grid">
    <div class="pv-photo">${figure(t, "seaCanoe", { sizes: "(min-width: 900px) 46vw, 92vw", ratio: "5/4" })}</div>
    <div class="pv-text">
      <p class="eyebrow">${esc(D.eyebrow)}</p>
      <h2 id="dp-title" class="pv-title" data-split>${esc(D.title)}</h2>
      <p class="pv-body"${rv(80)}>${esc(D.lead)}</p>
      <div class="pv-links"${rv(120)}><a class="text-link" href="${href("discover", t.lang)}">${esc(t.nav.discover)}${icon("arrow")}</a><a class="text-link" href="${href("about", t.lang)}">${esc(t.land.preview.about)}${icon("arrow")}</a></div>
    </div>
  </div>
</section>`;
}

// A short look at who Lauhata is, leading to About us and Our story.
function previewSection(t) {
  const C = t.land.culture;
  const P = t.land.preview;
  const L = t.lang;
  return `<section class="section preview" aria-labelledby="pv-title">
  <div class="wrap pv-grid">
    <div class="pv-photo">${figure(t, "seaCanoe", { sizes: "(min-width: 900px) 46vw, 92vw", ratio: "5/4" })}</div>
    <div class="pv-text">
      <p class="eyebrow">${esc(P.note)}</p>
      <h2 id="pv-title" class="pv-title" data-split>${esc(C.title1)} ${esc(C.title2)} <em>${esc(C.titleAccent)}</em>.</h2>
      <p class="pv-body"${rv(80)}>${esc(C.body)}</p>
      <div class="pv-links"${rv(120)}>
        <a class="text-link" href="${href("about", L)}">${esc(P.about)}${icon("arrow")}</a>
      </div>
    </div>
  </div>
</section>`;
}

// ================= ABOUT US: what Lauhata is today =================
export function about(t) {
  const L = t.lang;
  const A = t.land.aboutPage;
  const C = t.land.culture;
  const bc = breadcrumbs(t, [{ name: t.nav.about, path: href("about", L) }]);
  const body = `
${pageHero(t, { eyebrow: A.eyebrow, title: A.title, lead: t.home.statement, image: "aerialDay2", crumbs: bc.html })}

<section class="section ab-intro" aria-labelledby="ab-title">
  <div class="wrap ab-grid">
    <h2 id="ab-title" class="ab-title" data-split>${esc(C.title1)} ${esc(C.title2)} <em>${esc(C.titleAccent)}</em>.</h2>
    <div>
      <p class="ab-body"${rv(60)}>${esc(C.body)}</p>
      <h3 class="h-small ab-values-h"${rv(80)}>${esc(A.valuesTitle)}</h3>
      <ul class="ab-values"${rv(100)}>${C.themes.map(([h, p]) => `<li><h4>${esc(h)}</h4><p>${esc(p)}</p></li>`).join("")}</ul>
    </div>
  </div>
</section>

<section class="section ab-quote" aria-labelledby="ab-quote-label">
  <div class="wrap">
    <p class="cu-label" id="ab-quote-label">${esc(C.quoteLabel)}</p>
    <p class="cu-big" lang="tet">${esc(C.quote)}</p>
    <p class="cu-gloss">${esc(C.gloss)}${site.showPlaceholderNotes ? ` <small>${esc(C.glossNote)}</small>` : ""}</p>
  </div>
</section>

${nextSteps(t, A.nextTitle)}`;
  return { page: "about", title: t.meta.about.title, description: t.meta.about.description, path: href("about", L), alt: href("about", other(L)), preload: "aerialDay2", hero: true, ld: [bc.ld], body };
}

// ================= EVENTS: an honest, enquiry-led page =================
// No calendar, packages, capacities or prices are published: none have been confirmed. The page explains how to ask,
// and the request goes through the same WhatsApp hand-off as the table and room forms (data-booking="event").
export function events(t) {
  const L = t.lang;
  const E = t.land.eventsPage;
  const f = t.form;
  const bc = breadcrumbs(t, [{ name: t.nav.events, path: href("events", L) }]);
  const kinds = E.kinds.map((k) => `<option>${esc(k)}</option>`).join("");
  const body = `
${pageHero(t, { eyebrow: E.eyebrow, title: E.title, lead: E.lead, image: "sunsetPalms", crumbs: bc.html, ctas: `<div class="btn-row"><a class="btn btn-white btn-lg" href="#pedido">${esc(E.formTitle)}${icon("arrow")}</a></div>` })}

<section class="section ev-how" aria-labelledby="ev-how-title">
  <div class="wrap">
    <div class="ev-types">
      <h2 class="gx-title">${esc(E.typesTitle)}</h2>
      <p class="ev-types-lead">${esc(E.typesLead)}</p>
      <ul class="ev-type-list">${E.kinds.slice(0, -1).map((k) => `<li>${esc(k)}</li>`).join("")}</ul>
    </div>
    <h2 id="ev-how-title" class="h-small">${esc(E.howTitle)}</h2>
    <ol class="ev-steps">${E.steps.map(([h, p], i) => `<li${rv(i * 80)}><span class="ev-n" aria-hidden="true">${i + 1}</span><h3>${esc(h)}</h3><p>${esc(p)}</p></li>`).join("")}</ol>
  </div>
</section>

<section class="section booking ev-form" id="pedido" aria-labelledby="ev-form-title">
  <div class="wrap booking-grid">
    <div>
      ${heading({ eyebrow: E.eyebrow, title: E.formTitle, id: "ev-form-title" })}
      <p class="body-text"${rv(80)}>${esc(E.formLead)}</p>
      <p class="ev-expect"${rv(90)}>${esc(E.expect)}</p>
      ${figure(t, "beachFront", { cls: "booking-img", sizes: "(min-width: 900px) 30vw, 80vw", ratio: "4/3" })}
    </div>
    <div class="form-card"${rv(100)}>
      <form class="booking-form" data-booking="event" novalidate>
        <div class="form-grid">
          ${field({ id: "ev-kind", name: "kind", label: E.kind, control: `<select data-pick="select" data-icon="heart">${kinds}</select>` })}
          ${field({ id: "ev-date", name: "date", type: "date", label: f.date, attrs: 'required data-pick="date"' })}
          ${field({ id: "ev-people", name: "people", type: "number", label: f.people, attrs: `required min="1" max="300" value="10" inputmode="numeric" data-pick="number" data-unit-one="${esc(t.home.quick.person)}" data-unit-many="${esc(t.home.quick.persons)}"` })}
          ${field({ id: "ev-name", name: "name", label: f.name, attrs: 'autocomplete="name" required maxlength="80"' })}
          ${field({ id: "ev-contact", name: "contact", label: f.contact, hint: f.contactHint, optional: f.optional, attrs: 'autocomplete="tel" maxlength="80" inputmode="tel"', full: true })}
          ${field({ id: "ev-notes", name: "notes", type: "textarea", label: f.notes, optional: f.optional, attrs: 'maxlength="600"', full: true })}
        </div>
        ${formFooter(t, E.submit)}
      </form>
    </div>
  </div>
</section>`;
  return { page: "events", title: t.meta.events.title, description: t.meta.events.description, path: href("events", L), alt: href("events", other(L)), preload: "sunsetPalms", hero: true, ld: [bc.ld], body };
}

// ================= GALLERY: real photographs only, grouped by what they show =================
// A photo appears here only when it is marked real (placeholder: false) and has a `group` in images.mjs. Each group opens
// with one wide frame; every photo opens in the site's lightbox (keyboard: Enter, arrows, Escape).
export function gallery(t) {
  const L = t.lang;
  const G = t.land.galleryPage;
  const bc = breadcrumbs(t, [{ name: t.nav.gallery, path: href("gallery", L) }]);
  const groups = Object.entries(G.groups)
    .map(([g, title]) => {
      const keys = Object.keys(images).filter((k) => !images[k].placeholder && images[k].group === g);
      if (!keys.length) return "";
      return `<section class="gx-group" aria-labelledby="gx-${g}">
      <h2 id="gx-${g}" class="gx-title">${esc(title)}</h2>
      <ul class="gr-grid gx-grid" data-gallery>${keys
        .map((k, i) => `<li class="gr-item${i === 0 ? " is-wide" : ""}"><a class="gr-link" href="${imgUrl(k, 1600)}" data-lb-src="${imgUrl(k, 1600)}" aria-label="${esc(fmt(t.land.gallery.open, { alt: images[k].alt[L] }))}">${figure(t, k, { sizes: i === 0 ? "(min-width: 900px) 80vw, 100vw" : "(min-width: 900px) 31vw, 50vw" })}</a></li>`)
        .join("")}</ul>
    </section>`;
    })
    .join("");
  const body = `
${pageHero(t, { eyebrow: G.eyebrow, title: G.title, lead: G.lead, image: "aerialGarden", crumbs: bc.html })}

<section class="section gallery-real gx" aria-label="${esc(G.eyebrow)}">
  <div class="wrap">${groups}</div>
</section>`;
  return { page: "gallery", title: t.meta.gallery.title, description: t.meta.gallery.description, path: href("gallery", L), alt: href("gallery", other(L)), preload: "aerialGarden", hero: true, ld: [bc.ld], body };
}

// ================= DISCOVER LIQUIÇÁ: a short, sourced guide to the coast around Lauhata =================
// Every place and fact comes from the official tourism site (timorleste.tl, Liquiçá municipality page), which is credited
// on the page. No distances, travel times, prices or tours are given: none are confirmed. Lauhata does not run these visits.
export function discover(t) {
  const L = t.lang;
  const D = t.land.discoverPage;
  const bc = breadcrumbs(t, [{ name: t.nav.discover, path: href("discover", L) }]);
  const maps = (q) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
  const body = `
${pageHero(t, { eyebrow: D.eyebrow, title: D.title, lead: D.lead, image: "coastVillage", crumbs: bc.html })}

<section class="section dsc-intro" aria-labelledby="dsc-intro-title">
  <div class="wrap ab-grid">
    <h2 id="dsc-intro-title" class="ab-title">${esc(D.introTitle)}</h2>
    <p class="ab-body"${rv(60)}>${esc(D.intro)}</p>
  </div>
</section>

<section class="section dsc-places" aria-labelledby="dsc-places-title">
  <div class="wrap">
    <h2 id="dsc-places-title" class="gx-title">${esc(D.placesTitle)}</h2>
    <ol class="dsc-list">${D.places
      .map((p, i) => `<li class="dsc-item"${rv((i % 3) * 60)}>
        <span class="dsc-n" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span>
        <div><p class="dsc-kind">${esc(p.kind)}</p><h3>${esc(p.name)}</h3><p>${esc(p.text)}</p>${p.map ? `<a class="text-link" href="${maps(p.map)}" target="_blank" rel="noopener">${esc(D.mapLink)}${icon("arrow-up-right")}</a>` : ""}</div>
      </li>`)
      .join("")}</ol>
  </div>
</section>

<section class="section dsc-advice" aria-labelledby="dsc-adv-title">
  <div class="wrap ab-grid">
    <div>
      <h2 id="dsc-adv-title" class="ab-title">${esc(D.adviceTitle)}</h2>
      ${figure(t, "sunsetSea", { sizes: "(min-width: 900px) 40vw, 92vw", ratio: "4/3", cls: "dsc-photo" })}
    </div>
    <div>
      <ul class="dsc-advice-list">${D.advice.map((a) => `<li>${esc(a)}</li>`).join("")}</ul>
      <p class="dsc-source"><a href="https://timorleste.tl/destinations/municipalities/liquica" target="_blank" rel="noopener">${esc(D.source)}</a></p>
      <a class="btn btn-dark btn-lg" href="${href("stay", L)}">${esc(D.cta)}${icon("arrow")}</a>
    </div>
  </div>
</section>`;
  return { page: "discover", title: t.meta.discover.title, description: t.meta.discover.description, path: href("discover", L), alt: href("discover", other(L)), preload: "coastVillage", hero: true, ld: [bc.ld], body };
}

// The quiet end of About us and Our story: one line and the three places to go next.
function nextSteps(t, title) {
  const L = t.lang;
  const D = t.land.duo;
  return `<section class="next-steps" aria-labelledby="ns-title">
  <div class="wrap ns-inner">
    <h2 id="ns-title" class="ns-title">${esc(title)}</h2>
    <div class="ns-links">
      <a class="btn btn-cream btn-lg" href="${href("restaurant", L)}">${esc(D.eat.link)}${icon("arrow")}</a>
      <a class="btn btn-ghost-light btn-lg" href="${href("stay", L)}">${esc(D.stay.link)}</a>
      <a class="btn btn-ghost-light btn-lg" href="${href("contact", L)}">${esc(t.land.aboutPage.contact)}</a>
    </div>
  </div>
</section>`;
}

export function home(t) {
  const L = t.lang;
  const H = t.home;
  const LD = t.land;
  const hero = H.hero;
  const dishes = items.filter((d) => d.featured);
  const bkfDishes = items.filter((d) => d.category === "breakfast");
  const realReviews = H.reviews.items.filter((r) => !r.q.startsWith("["));
  const hours = site.restaurantHours.length
    ? site.restaurantHours.map((h) => `<div><dt>${esc(h.days[L])}</dt><dd>${esc(h.hours)}</dd></div>`).join("")
    : `<div><dd class="tbc">${esc(t.common.hoursTbc)}</dd></div>`;
  const body = `
<section class="cine-hero hx${site.heroVideo ? " has-video" : ""}" aria-labelledby="hero-title">
  <div class="hx-bg">
    ${figure(t, "heroCover", { eager: true, sizes: "100vw" })}
    ${site.heroVideo ? `<video class="hx-video" muted loop playsinline preload="none" aria-hidden="true" data-hero-video data-src="${esc(site.heroVideo)}"></video>` : ""}
  </div>
  <div class="hx-shade" aria-hidden="true"></div>
  <div class="wrap cine-content hx-content">
    <p class="eyebrow eyebrow-light eyebrow-dots" data-fade>${hero.eyebrow.map((e) => `<span>${esc(e)}</span>`).join("")}</p>
    <h1 id="hero-title" class="cine-title hx-title" data-split><span class="line">${esc(hero.title1)}</span> <span class="line l2"><em>${esc(hero.titleAccent)}</em> ${esc(hero.title2)}</span></h1>
    <p class="cine-lead" data-fade style="--d:300ms">${esc(hero.lead)}</p>
    <div class="hx-actions" data-fade style="--d:450ms">
      <a class="btn btn-cream btn-lg" href="${href("restaurant", L, "#reservar")}" data-book-open="table">${icon("cutlery")}${esc(t.home.quick.heroTable)}</a>
      <a class="btn btn-ghost-light btn-lg" href="${href("stay", L, "#quartos")}" data-book-open="room">${icon("bed")}${esc(t.home.quick.heroRoom)}</a>
    </div>
  </div>
</section>

${introSection(t)}

${duoSection(t)}

${discoverPreview(t)}

${finalSection(t, "aerialDay4")}

${reviewsSection(t)}`;
  return {
    page: "home",
    title: t.meta.home.title,
    description: t.meta.home.description,
    path: href("home", L),
    alt: href("home", other(L)),
    preload: [
      { key: "heroCover", sizes: "100vw" },
    ],
    hero: true,
    ld: [faqLd(t)],
    menu: [...dishes, ...bkfDishes],
    body,
  };
}

// ================= RESTAURANT =================
export function restaurant(t) {
  const L = t.lang;
  const bc = breadcrumbs(t, [{ name: t.nav.restaurant, path: href("restaurant", L) }]);
  const body = `
${pageHero(t, {
  eyebrow: t.restaurant.eyebrow,
  title: t.home.two.restTitle,
  lead: t.home.two.restBody,
  image: "sunsetPalmsHigh",
  crumbs: bc.html,
  ctas: `<div class="btn-row"><a class="btn btn-white btn-lg" href="#reservar">${esc(t.home.hero.ctaTable)}${icon("arrow")}</a><a class="btn btn-ghost-light btn-lg" href="#ementa">${esc(t.common.viewMenu)}</a></div>
  <p class="hero-hours">${icon("clock")}<span>${site.restaurantHours.length ? site.restaurantHours.map((h) => `${esc(h.days[L])} <b>${esc(h.hours)}</b>`).join('<i aria-hidden="true"> · </i>') : esc(t.common.hoursTbc)}</span></p>`,
})}

${TAIS}
${menuSection(t)}

<section class="section booking" id="reservar" aria-labelledby="book-title">
  <div class="wrap booking-grid">
    <div>
      ${heading({ eyebrow: t.restaurant.bookEyebrow, title: t.restaurant.bookTitle, id: "book-title" })}
      <p class="body-text"${rv(80)}>${esc(t.restaurant.bookLead)}</p>
      ${figure(t, "beachFront", { cls: "booking-img", sizes: "(min-width: 900px) 30vw, 80vw", ratio: "4/3" })}
    </div>
    <div class="form-card"${rv(100)}>${tableForm(t)}</div>
  </div>
</section>

${finalSection(t, "aerialGarden")}`;
  return {
    page: "restaurant",
    title: t.meta.restaurant.title,
    description: t.meta.restaurant.description,
    path: href("restaurant", L),
    alt: href("restaurant", other(L)),
    preload: "sunsetPalmsHigh",
    hero: true,
    menu: items,
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
  image: "sunsetSea",
  crumbs: bc.html,
  ctas: `<div class="btn-row"><a class="btn btn-white btn-lg" href="#reservar">${esc(t.home.hero.ctaRoom)}${icon("arrow")}</a><a class="btn btn-ghost-light btn-lg" href="#quartos">${esc(t.home.two.stayLink)}</a></div>`,
})}

<section class="section rooms-cine" id="quartos" aria-labelledby="rooms-title">
  ${HUT_DECO}
  <div class="wrap">
    <div class="split-head">
      ${heading({ eyebrow: H.eyebrow, title: H.title, accent: H.titleAccent, id: "rooms-title" })}
      <p class="body-text"${rv(100)}>${esc(H.body)}</p>
    </div>
    ${roomRows(t)}
    ${amenities}
  </div>
</section>

<section class="section booking" id="reservar" aria-labelledby="book-title">
  <div class="wrap booking-grid">
    <div>
      ${heading({ eyebrow: t.stay.bookEyebrow, title: t.stay.bookTitle, id: "book-title" })}
      <p class="body-text"${rv(80)}>${esc(t.stay.bookLead)}</p>
      ${figure(t, "sunsetPalmsHigh", { cls: "booking-img", sizes: "(min-width: 900px) 30vw, 80vw", ratio: "4/3" })}
    </div>
    <div class="form-card"${rv(100)}>${roomForm(t)}</div>
  </div>
</section>`;
  return {
    page: "stay",
    title: t.meta.stay.title,
    description: t.meta.stay.description,
    path: href("stay", L),
    alt: href("stay", other(L)),
    preload: "sunsetSea",
    hero: true,
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
  const S = t.stay;
  // The room sheet shows only what Lauhata has confirmed (site.roomDetailsConfirmed, stayTimes, price). The price is
  // "on request" until it is set; capacity, beds, amenities and times appear once confirmed, never guessed.
  const sure = site.roomDetailsConfirmed;
  const row = (label, value) => `<div><dt>${esc(label)}</dt><dd>${value}</dd></div>`;
  const facts = [
    r.badge ? row(S.roomType, esc(r.badge[L])) : "",
    sure && r.capacity ? row(S.roomCapacity, esc(r.capacity[L])) : "",
    sure && r.beds ? row(S.roomBeds, esc(r.beds[L])) : "",
    sure && r.features.length ? row(S.roomFeatures, r.features.map((f) => esc(f[L])).join(", ")) : "",
    site.stayTimes ? row(S.roomCheck, `${esc(S.checkIn)} ${esc(site.stayTimes.checkIn)} · ${esc(S.checkOut)} ${esc(site.stayTimes.checkOut)}`) : "",
    row(S.roomPrice, r.price ? `${esc(r.price)} <small>${esc(H.night)}</small>` : esc(t.common.priceTbc)),
  ].join("");
  const anyTbc = !sure;
  const i = rooms.findIndex((x) => x.id === r.id);
  const others = [rooms[(i + 1) % rooms.length], rooms[(i + 2) % rooms.length]].filter((x) => x.id !== r.id);
  const body = `
${pageHero(t, {
  eyebrow: r.badge ? r.badge[L] : t.stay.eyebrow,
  title: name,
  lead: r.summary[L],
  image: r.images[0],
  crumbs: bc.html,
  ctas: `<div class="btn-row"><a class="btn btn-white btn-lg" href="${href("stay", L, "#reservar")}" data-room-link="${r.id}">${esc(t.stay.roomBook)}${icon("arrow")}</a><a class="btn btn-ghost-light btn-lg" href="${waLink(t.form.waHello)}" target="_blank" rel="noopener">${icon("whatsapp")}${esc(t.common.whatsapp)}</a></div>`,
})}

<section class="section" aria-labelledby="sheet-title">
  <div class="wrap room-intro">
    <div>
      <p class="lead-serif"${rv()}>${esc(r.tagline[L])}</p>
      <p class="body-text"${rv(60)}>${esc(r.description[L])}</p>
      <h2 id="sheet-title" class="h-small"${rv(80)}>${esc(S.sheetTitle)}</h2>
      <dl class="room-sheet"${rv(100)}>${facts}</dl>
      ${anyTbc ? `<p class="room-sheet-note">${esc(S.sheetNote)}</p>` : ""}
    </div>
    <aside class="room-ask" aria-labelledby="ask-title"${rv(120)}>
      <h2 id="ask-title">${esc(S.askTitle)}</h2>
      <p>${esc(S.askBody)}</p>
      <a class="btn btn-dark btn-lg" href="${href("stay", L, "#reservar")}" data-room-link="${r.id}">${esc(S.roomBook)}${icon("arrow")}</a>
      <a class="btn btn-outline btn-lg" href="${waLink(fmt(t.land.suites.wa, { room: name }))}" target="_blank" rel="noopener">${icon("whatsapp")}${esc(t.common.whatsapp)}</a>
      ${responseLine(t)}
    </aside>
    <a class="room-back" href="${href("stay", L, "#quartos")}">${icon("arrow")}${esc(S.allRooms)}</a>
  </div>
</section>
${r.images.length > 1 ? `
<section class="section room-photos" aria-label="${esc(t.gallery.eyebrow)}">
  <div class="wrap">${galleryGrid(t, r.images.slice(1), "gallery-room")}</div>
</section>` : ""}

<section class="section rooms-dark" aria-labelledby="other-title">
  <div class="wrap">
    ${heading({ eyebrow: S.nextRoom, title: S.otherRooms, id: "other-title" })}
    <div class="room-pager">${others
      .map((o) => `<a class="room-next" href="${href("room:" + o.id, L)}">${figure(t, o.images[0], { sizes: "(min-width: 900px) 45vw, 92vw" })}<div><span>${esc(o.badge ? o.badge[L] : S.eyebrow)}</span><strong>${esc(o.name[L])}</strong></div></a>`)
      .join("")}</div>
  </div>
</section>`;
  return {
    page: "stay",
    title: fmt(t.meta.room.title, { room: name }),
    description: fmt(t.meta.room.description, { room: name }),
    path: href("room:" + r.id, L),
    alt: href("room:" + r.id, other(L)),
    preload: r.images[0],
    hero: true,
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
  image: "coastVillage",
  crumbs: bc.html,
  ctas: `<div class="btn-row"><a class="btn btn-white btn-lg" href="${waLink(t.form.waHello)}" target="_blank" rel="noopener">${icon("whatsapp")}${esc(t.home.cta.wa)}</a><a class="btn btn-ghost-light btn-lg" href="${mapsLink()}" target="_blank" rel="noopener">${esc(t.common.openMaps)}${icon("arrow-up-right")}</a></div>`,
})}

<section class="section location" aria-labelledby="loc2-title">
  <div class="wrap location-grid">
    <div>
      ${heading({ eyebrow: t.location.eyebrow, title: t.location.title, id: "loc2-title" })}
      ${infoGrid(t)}
      <div class="get-there"${rv(180)}><h3>${esc(t.land.getThere.title)}</h3><p>${esc(t.land.getThere.lead)}</p><p>${esc(t.land.getThere.help)}</p></div>
      <div class="contact-actions"${rv(200)}>
        <a class="btn btn-dark" href="${href("restaurant", L, "#reservar")}" data-book-open="table">${icon("cutlery")}${esc(t.home.quick.heroTable)}</a>
        <a class="btn btn-outline" href="${href("stay", L, "#reservar")}" data-book-open="room">${icon("bed")}${esc(t.footer.bookRoom)}</a>
        <a class="btn btn-outline" href="${waLink(t.form.waHello)}" target="_blank" rel="noopener">${icon("whatsapp")}${esc(t.common.whatsapp)}</a>
        <a class="btn btn-outline" href="${mapsLink()}" target="_blank" rel="noopener">${icon("pin")}${esc(t.footer.directions)}</a>
      </div>
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

${finalSection(t, "aerialDay4")}`;
  return {
    page: "contact",
    title: t.meta.contact.title,
    description: t.meta.contact.description,
    path: href("contact", L),
    alt: href("contact", other(L)),
    preload: "coastVillage",
    hero: true,
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
    <span class="simple-mark" aria-hidden="true"><img src="/assets/img/brand/logo-lauhata-beach-escape-160.png" width="160" height="160" alt=""></span>
    <p class="eyebrow eyebrow-lines">${esc(t.thanks.eyebrow)}</p>
    <h1 class="title">${esc(t.thanks.title)}</h1>
    <p class="lead" data-thanks-body data-table="${esc(t.thanks.tableBody)}" data-room="${esc(t.thanks.roomBody)}" data-event="${esc(t.thanks.eventBody)}" data-review="${esc(t.thanks.reviewBody)}" data-order="${esc(t.thanks.orderBody)}">${esc(t.thanks.genericBody)}</p>
    <div class="btn-row center">
      <a class="btn btn-terra btn-lg" href="${waLink()}" target="_blank" rel="noopener" data-thanks-reopen>${icon("whatsapp")}${esc(t.thanks.reopen)}</a>
      <a class="btn btn-outline btn-lg" href="${href("home", L)}">${esc(t.thanks.back)}</a>
      <a class="btn btn-outline btn-lg" href="${href("restaurant", L, "#ementa")}" data-thanks-menu hidden>${esc(t.thanks.backMenu)}</a>
      <button class="btn btn-outline btn-lg" type="button" data-thanks-clear hidden>${esc(t.thanks.clearOrder)}</button>
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
    <span class="simple-mark" aria-hidden="true"><img src="/assets/img/brand/logo-lauhata-beach-escape-160.png" width="160" height="160" alt=""></span>
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
