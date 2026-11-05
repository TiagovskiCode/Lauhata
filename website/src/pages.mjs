// Page bodies. Each function returns { title, description, path, alt, body, ... } for layout().
// The homepage follows the approved design mock-up section by section; inner pages reuse its parts.
import { esc, fmt, href, figure, icon, waLink, hoursList, responseLine, breadcrumbs, imgUrl, money, reservationSlots, slotPeriod, site, rooms, images } from "./lib.mjs";
import { existsSync, readFileSync } from "node:fs";
import { TAIS, tripadvisorBadge } from "./layout.mjs";
import { categories, items, menuNote } from "./data/menu.mjs";
import siteReviews from "./data/reviews.mjs";
import externalReviews from "./data/reviews-external.mjs";
import { sampleDrinks } from "./data/sample-drinks.mjs";

const other = (L) => (L === "pt" ? "en" : "pt");
const rv = (delay = 0) => ` data-reveal${delay ? ` style="--d:${delay}ms"` : ""}`;

// Section heading: the title (with an optional second line) and an optional lead. Phase 7 ("Diário da costa"): no
// label above every title; the `eyebrow` argument is kept for callers but no longer printed.
function heading({ eyebrow, title, accent = "", lead = "", id = "", center = false, tag = "h2", cls = "" }) {
  return `<header class="heading${center ? " is-center" : ""} ${cls}"${rv()}>
    ${eyebrow ? `<p class="eyebrow-rule">${esc(eyebrow)}</p>` : ""}
    <${tag}${id ? ` id="${id}"` : ""} class="title">${esc(title)}${accent ? `<br><span class="title-2">${esc(accent)}</span>` : ""}</${tag}>
    ${lead ? `<p class="lead">${esc(lead)}</p>` : ""}
  </header>`;
}

// Full-screen photo hero used by inner pages (same language as the homepage hero).
function pageHero(t, { eyebrow, title, accent = "", lead, image, crumbs, ctas = "" }) {
  return `<section class="cine-hero is-page">
  <div class="cine-slides"><div class="slide is-active">${figure(t, image, { eager: true, sizes: "100vw", credit: true })}</div></div>
  <div class="cine-shade" aria-hidden="true"></div>
  <div class="wrap cine-content">
    ${eyebrow ? `<p class="eyebrow-rule is-light" data-fade>${esc(eyebrow)}</p>` : ""}
    <h1 class="cine-title is-page" data-split>${esc(title)}${accent ? ` ${esc(accent)}` : ""}</h1>
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

// The owner-confirmed facts of a room, as one quiet line: beds, then each confirmed amenity. Nothing unconfirmed is listed.
function roomFeatures(t, r) {
  const L = t.lang;
  const facts = [r.beds && r.beds[L], ...(r.amenities || []).map((a) => a[L]), r.suitability && `${t.stay.roomSuits}: ${r.suitability[L]}`].filter(Boolean);
  return facts.length ? `<ul class="room-facts-line">${facts.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>` : "";
}

// The suite's confirmed amenities with their icons: the beds (rooms.mjs `bedPlan`) and the owner-confirmed `amenities`.
// Nothing else is listed (Wi-Fi, breakfast, bathroom, air conditioning are not confirmed: docs/CHECKLISTS.md).
const AMEN_ICON = { Television: "tv" };
function suiteAmenities(t, r) {
  const S = t.stay;
  const L = t.lang;
  const beds = (r.bedPlan || []).map((b) => (b === "king" ? ["bed-king", S.amenKing] : b === "single" ? ["bed-single", S.amenSingle] : null)).filter(Boolean);
  const more = (r.amenities || []).map((a) => [a.icon || AMEN_ICON[a.en] || "check", a[L]]);
  const items = [...beds, ...more];
  if (!items.length) return "";
  return `<div class="si-amen">
        <h3 class="si-amen-title">${esc(S.amenTitle)}</h3>
        <ul>${items.map(([ic, label]) => `<li>${icon(ic)}<span>${esc(label)}</span></li>`).join("")}</ul>
      </div>`;
}

// The suite's beds drawn from above, each labelled. Only the beds the owner confirmed (rooms.mjs `bedPlan`); generic
// proportions, no measurements (the real bed sizes are not known), no walls or furniture (the room layout is not known).
function bedPlan(t, r) {
  const S = t.stay;
  const beds = r.bedPlan || [];
  const dims = { king: [193, 203], single: [90, 190] };
  let x = 0;
  const parts = beds.map((b) => {
    const [w, h] = dims[b];
    const g = `<g transform="translate(${x} ${203 - h})">
      <rect class="bp-bed" x="0" y="0" width="${w}" height="${h}" rx="4"/>
      ${b === "king" ? `<rect class="bp-pillow" x="14" y="12" width="76" height="34" rx="8"/><rect class="bp-pillow" x="103" y="12" width="76" height="34" rx="8"/>` : `<rect class="bp-pillow" x="12" y="12" width="66" height="30" rx="8"/>`}
      <line class="bp-fold" x1="0" y1="${Math.round(h * 0.62)}" x2="${w}" y2="${Math.round(h * 0.62)}"/>
      <text class="bp-label" x="${w / 2}" y="${h + 26}" text-anchor="middle">${esc(b === "king" ? S.king : S.single)}</text>    </g>`;
    x += w + 40;
    return g;
  });
  const width = Math.max(0, x - 40);
  return `<svg class="bed-plan" viewBox="-6 -6 ${width + 12} 265" role="img" aria-label="${esc(S.bedPlan)}: ${esc(r.beds[t.lang])}">${parts.join("")}</svg>`;
}

// A room's photographs as a carousel: a scroll-snap strip (swipe on touch, arrow keys when focused), previous/next
// buttons, a position counter, and every photo opens in the site's lightbox (data-gallery). Without JavaScript it is a
// strip that scrolls sideways.
function roomCarousel(t, r, { sizes = "(min-width: 900px) 56vw, 92vw", cls = "" } = {}) {
  const L = t.lang;
  const C = t.carousel;
  const n = r.images.length;
  return `<div class="carousel ${cls}" data-carousel role="group" aria-roledescription="${esc(C.role)}" aria-label="${esc(fmt(C.label, { room: r.name[L] }))}">
    <div class="cr-track" data-cr-track data-gallery tabindex="0">${r.images
      .map((k, i) => `<div class="cr-slide" role="group" aria-roledescription="${esc(C.slide)}" aria-label="${esc(fmt(C.count, { n: i + 1, total: n }))}"><a class="cr-link" href="${imgUrl(k, 1600)}" data-lb-src="${imgUrl(k, 1600)}" aria-label="${esc(fmt(t.land.gallery.open, { alt: images[k].alt[L] }))}">${figure(t, k, { sizes })}</a></div>`)
      .join("")}</div>
    ${n > 1 ? `<div class="cr-controls"><button class="cr-btn" type="button" data-cr-prev aria-label="${esc(C.prev)}">${icon("left")}</button><p class="cr-count" data-cr-count aria-live="polite">1 / ${n}</p><button class="cr-btn" type="button" data-cr-next aria-label="${esc(C.next)}">${icon("right")}</button></div>` : ""}
  </div>`;
}

// Large alternating rows, one per room type (homepage and stay page).
function roomRows(t, list = rooms, { arch = false } = {}) {
  const L = t.lang;
  const H = t.home.rooms;
  return `<div class="room-rows">${list
    .map((r, i) => {
      const n = rooms.findIndex((x) => x.id === r.id); // its number among all room types
      return `<article class="room-row room-is-${r.id}${i % 2 ? " is-flip" : ""}">
      <div class="room-row-img">${roomCarousel(t, r)}</div>
      <div class="room-row-body"${rv(120)}>
        <p class="room-kind">${esc(r.badge ? r.badge[L] : "")}</p>
        <h3><a href="${href("room:" + r.id, L)}">${esc(r.name[L])}</a></h3>
        <p>${esc(r.summary[L])}</p>
        ${roomFeatures(t, r)}
        <div class="room-foot">
          ${fromPrice(t, r)}
          <div class="room-foot-btns"><a class="btn btn-cream" href="${href("stay", L, "#reservar")}" data-room-link="${r.id}">${esc(H.book)}</a><a class="text-link" href="${href("room:" + r.id, L)}">${esc(t.stay.viewRoom)}</a></div>
        </div>
      </div>
    </article>`;
    })
    .join("")}</div>`;
}

const mapsLink = () => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.geo ? `${site.geo.lat},${site.geo.lng}` : site.mapQuery)}`;
const pend = (v, fallback) => (v ? esc(v) : `<span class="tbc">${esc(fallback)}</span>`);

// ---------- Booking card (hero): request straight to WhatsApp ----------
// `prefix` keeps ids unique when two cards share a page; `hero` is the home hero panel: it starts collapsed (just the two mode buttons) and opens when the visitor picks one.
export function bookingCard(t, { prefix = "bc", hero = false } = {}) {
  const q = t.home.quick;
  const timeOpts = timeOptions(t, { selected: "19:30" });
  const fld = (label, control) => `<label class="bc-field"><span>${esc(label)}</span>${control}</label>`;
  // Quantities are number fields: the picker draws a stepper over them, and without JavaScript they still work.
  const qty = (name, max, { min = 1, value = 2, one = q.person, many = q.persons } = {}) => `<input type="number" name="${name}" min="${min}" max="${max}" value="${value}" inputmode="numeric" data-pick="number" data-unit-one="${esc(one)}" data-unit-many="${esc(many)}">`;
  const f = t.form;
  const tabT = `<button type="button" role="tab" aria-selected="false" aria-controls="${prefix}-table" data-bc-tab="table">${icon("cutlery")}${esc(hero ? q.heroTabTable : q.tabTable)}</button>`;
  const tabR = `<button type="button" role="tab" aria-selected="false" aria-controls="${prefix}-room" data-bc-tab="room">${icon("bed")}${esc(hero ? q.heroTabRoom : q.tabRoom)}</button>`;
  return `<form class="booking-card${hero ? " is-hero" : ""}" data-quick-wa novalidate aria-label="${esc(q.label)}">
    <div class="bc-tabs" role="tablist">
      ${hero ? tabR + tabT : tabT + tabR}
    </div>
    <p class="bc-hint" data-bc-hint>${esc(q.hint)}</p>
    <div class="bc-row" id="${prefix}-table" role="tabpanel" data-bc-panel="table" hidden>
      ${fld(q.date, `<input type="date" name="date" data-pick="date">`)}
      ${fld(q.time, `<select name="time" data-pick="time">${timeOpts}</select>`)}
      ${fld(q.people, qty("people", 20))}
      <button class="btn btn-terra btn-lg bc-submit" type="submit">${icon("whatsapp")}${esc(hero ? q.heroSubmitTable : q.submitTable)}</button>
    </div>
    <div class="bc-row" id="${prefix}-room" role="tabpanel" data-bc-panel="room" hidden>
      ${fld(q.checkIn, `<input type="date" name="checkIn" data-pick="in">`)}
      ${fld(q.checkOut, `<input type="date" name="checkOut" data-pick="out">`)}
      ${fld(f.adults, qty("adults", 20, { one: f.adultOne, many: f.adultMany }))}
      ${fld(f.children, qty("children", 10, { min: 0, value: 0, one: f.childOne, many: f.childMany }))}
      ${fld(q.room, `<select name="room" data-pick="select"><option value="">${esc(q.roomAny)}</option>${rooms.map((r) => `<option value="${r.id}">${esc(r.name[t.lang])}</option>`).join("")}</select>`)}
      <button class="btn btn-terra btn-lg bc-submit" type="submit">${icon("whatsapp")}${esc(hero ? q.heroSubmitRoom : q.submitRoom)}</button>
    </div>
    <p class="bc-error" role="alert" hidden data-bc-error></p>
    <p class="bc-note">${site.responseTime ? esc(site.responseTime[t.lang]) : esc(t.contact.responsePending)} ${site.payInPerson ? esc(t.form.payNote) : ""}</p>
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
    <p class="form-note">${esc(t.form.note)}${site.payInPerson ? ` ${esc(t.form.payNote)}` : ""}</p>`;
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
  return `<form class="booking-form" data-booking="room" data-review-step novalidate>
    <div class="form-grid">
      ${field({ id: "rm-in", name: "checkIn", type: "date", label: f.checkIn, attrs: 'required data-pick="in"' })}
      ${field({ id: "rm-out", name: "checkOut", type: "date", label: f.checkOut, attrs: 'required data-pick="out"' })}
      ${field({ id: "rm-adults", name: "adults", type: "number", label: f.adults, attrs: `required min="1" max="20" value="2" inputmode="numeric" data-pick="number" data-unit-one="${esc(f.adultOne)}" data-unit-many="${esc(f.adultMany)}"` })}
      ${field({ id: "rm-children", name: "children", type: "number", label: f.children, attrs: `min="0" max="10" value="0" inputmode="numeric" data-pick="number" data-unit-one="${esc(f.childOne)}" data-unit-many="${esc(f.childMany)}"` })}
      ${field({ id: "rm-room", name: "room", label: f.roomType, control: `<select data-pick="select">${options}</select>`, full: true })}
      ${field({ id: "rm-name", name: "name", label: f.name, attrs: 'autocomplete="name" required maxlength="80"', full: true })}
      ${field({ id: "rm-email", name: "email", type: "email", label: f.email, optional: f.optional, attrs: 'autocomplete="email" maxlength="120"' })}
      ${field({ id: "rm-phone", name: "phone", type: "tel", label: f.phone, hint: f.phoneHint, optional: f.optional, attrs: 'autocomplete="tel" maxlength="40" inputmode="tel"' })}
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
// The build lists every slot and its status in docs/FOTOS-PRATOS.md.
export const dishPhotoFile = (d, w = 640) => new URL(`./assets/img/pratos/${d.id}-${w}.jpg`, import.meta.url);
function dishPhoto(t, d) {
  if (d.image) return figure(t, d.image, { sizes: "(min-width: 1000px) 28vw, (min-width: 600px) 45vw, 30vw", ratio: "4/3" });
  if (existsSync(dishPhotoFile(d))) {
    const big = existsSync(dishPhotoFile(d, 1080));
    const src = `/assets/img/pratos/${d.id}-640.jpg`;
    return `<figure class="media dish-photo"><img src="${src}"${big ? ` srcset="${src} 640w, /assets/img/pratos/${d.id}-1080.jpg 1080w" sizes="(min-width: 1000px) 28vw, (min-width: 600px) 45vw, 30vw"` : ""} alt="${esc(d.name)}" width="640" height="480" loading="lazy" decoding="async"></figure>`;
  }
  // A temporary, openly licensed photo of a similar dish (tools/fotos-temporarias.mjs), labelled "Illustrative image".
  if (existsSync(tempPhotoFile(d.id))) return tempPhoto(t, d.id, typeof d.name === "string" ? d.name : d.name[t.lang]);
  return `<div class="dish-photo is-pending" aria-hidden="true"><span class="dp-mark">${esc(d.name.trim()[0])}</span><span class="dp-note">${esc(t.order.photoSoon)}</span></div>`;
}
const tempPhotoFile = (id, w = 640) => new URL(`./assets/img/pratos-temp/${id}-${w}.jpg`, import.meta.url);
function tempPhoto(t, id, name) {
  const src = `/assets/img/pratos-temp/${id}-640.jpg`;
  const big = existsSync(tempPhotoFile(id, 1080));
  return `<figure class="media dish-photo is-placeholder" data-ph="${esc(t.common.placeholderImage)}"><img src="${src}"${big ? ` srcset="${src} 640w, /assets/img/pratos-temp/${id}-1080.jpg 1080w" sizes="(min-width: 1200px) 22vw, (min-width: 600px) 45vw, 30vw"` : ""} alt="${esc(fmt(t.order.tempAlt, { name }))}" width="640" height="480" loading="lazy" decoding="async"></figure>`;
}

// The sample drinks of the development preview (src/data/sample-drinks.mjs): photo, name and an "Example" tag; no
// price and no add button, so nothing unconfirmed can be ordered. Shown only while site.showSamples is true and the
// menu has no real drinks.
function sampleDrinksSection(t, cat) {
  const L = t.lang;
  const O = t.order;
  // Refinement phase: one compact grid in the groups' order, the group as each card's small tag (most groups hold a
  // single sample, so a sub-heading per group only repeated the drink's name). Real drinks keep their sub-headings.
  const order = Object.keys(cat.groups);
  const list = [...sampleDrinks].sort((a, b) => order.indexOf(a.group) - order.indexOf(b.group));
  const groups = `<div class="menu-grid is-samples">${list.map((d) => `<article class="dish has-photo is-sample" data-dish data-search="${esc(normalize(d.name.pt + " " + d.name.en + " " + cat.name.pt + " " + cat.name.en))}">
        ${existsSync(tempPhotoFile(d.id)) ? tempPhoto(t, d.id, d.name[L]) : ""}
        <div class="dish-body"><h3>${esc(d.name[L])}</h3><div class="dish-foot"><span class="sample-tag">${esc(O.sampleTag)}</span>${cat.groups[d.group] && cat.groups[d.group][L] !== d.name[L] ? `<span class="dish-group">${esc(cat.groups[d.group][L])}</span>` : ""}</div></div>
      </article>`).join("")}</div>`;
  return `<section class="menu-cat" id="cat-${cat.id}" data-cat="${cat.id}" aria-labelledby="cat-${cat.id}-title">
      <header class="menu-cat-head"><h3 id="cat-${cat.id}-title">${esc(cat.name[L])}</h3><p>${esc(O.sampleNote)}</p></header>
      ${groups}
    </section>`;
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
  const drinksCat = categories.find((c) => c.id === "drinks");
  const sampleDrinksOn = site.showSamples && drinksCat && !items.some((d) => d.category === "drinks");
  const shown = categories.filter((c) => items.some((d) => d.category === c.id) || (sampleDrinksOn && c === drinksCat));
  const nav = shown.map((c) => `<li><a href="#cat-${c.id}" data-cat-link="${c.id}">${esc(c.name[L])}</a></li>`).join("");
  const sections = shown
    .map((c) => (sampleDrinksOn && c === drinksCat ? sampleDrinksSection(t, c) : `<section class="menu-cat" id="cat-${c.id}" data-cat="${c.id}" aria-labelledby="cat-${c.id}-title">
      <header class="menu-cat-head"><h3 id="cat-${c.id}-title">${esc(c.name[L])}</h3>${c.note ? `<p>${esc(c.note[L])}</p>` : ""}</header>
      ${c.groups
        ? Object.entries(c.groups)
            .map(([g, label]) => {
              const list = items.filter((d) => d.category === c.id && d.group === g);
              return list.length ? `<h4 class="menu-group">${esc(label[L])}</h4><div class="menu-grid">${list.map((d) => dishCard(t, d)).join("")}</div>` : "";
            })
            .join("")
        : `<div class="menu-grid">${items.filter((d) => d.category === c.id).map((d) => dishCard(t, d)).join("")}</div>`}
    </section>`))
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
    <div>${icon("pin")}<dt>${esc(h.address)}</dt><dd>${site.address.street ? `${esc(site.address.street)}<br>${esc(site.address.district[L])}<br>` : `${esc(site.address.locality)}, `}${esc(site.address.region)}, ${esc(site.address.country)}</dd></div>
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
// Embedded maps search the place name: checked on 5 Nov 2026 that its pin falls exactly on the official coordinates,
// and the name adds Google's own label and card, so Lauhata is identifiable at a glance. Zoom 15: the coast and the town.
const mapEmbed = () => `https://www.google.com/maps?q=${encodeURIComponent(site.mapQuery)}&z=15&output=embed`;
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
        <iframe title="${esc(t.location.mapTitle)}" src="${mapEmbed()}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
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

// One statement about what Lauhata is, set large across the page, with a tall real photograph hanging from the right edge
// and overlapping the statement's last lines (the photo carries its own caption).
function introSection(t) {
  return `<section class="section intro-ed" id="lauhata" aria-labelledby="intro-title">
  <div class="wrap intro-grid">
    <div class="intro-text">
      <h2 id="intro-title" class="intro-statement" data-split>${esc(t.home.statement)}</h2>
      <p class="intro-body"${rv(80)}>${esc(t.land.intro.body)}</p>
    </div>
    <div class="intro-photo">${figure(t, "sunsetPalmsHigh", { sizes: "(min-width: 900px) 30vw, 70vw", ratio: "4/5", credit: true, cls: "is-dusk" })}</div>
  </div>
</section>`;
}

// The coast at night-fall: a dark chapter with the beach line and three real photographs of different proportions
// (a wide sea, a square canoe, a tall garden sunset), each with its caption. Replaces the single full-screen scene.
function coastChapter(t) {
  // The client liked the dark frame of the beach with the palms and the mountain: it is the whole screen again, with the
  // line set low on it. Below, on the night, the words, the coordinates and two smaller real photographs that overlap
  // the bottom edge of the big one.
  const B = t.land.beach;
  return `<section class="coast-ch" aria-labelledby="coast-title">
  <div class="coast-stage">
    <div class="coast-bg">${figure(t, "beachFront", { sizes: "100vw" })}</div>
    <div class="coast-shade" aria-hidden="true"></div>
    <div class="wrap coast-over">
      <p class="coast-note">${esc(B.note)}</p>
      <h2 id="coast-title" class="coast-line" data-split>${esc(B.line)}</h2>
    </div>
    <p class="coast-cap"><span>${esc(images.beachFront.alt[t.lang])}</span><b>${esc(t.common.realPhoto)}</b></p>
  </div>
  <div class="wrap coast-grid">
    <div class="coast-text">
      <p class="coast-body"${rv()}>${esc(B.body)}</p>
      <p class="coast-coords"><span>${esc(B.place)}</span><span>${esc(t.common.coords)}</span></p>
    </div>
    <div class="coast-b">${figure(t, "seaCanoe", { sizes: "(min-width: 900px) 26vw, 60vw", ratio: "4/5", credit: true })}</div>
    <div class="coast-c">${figure(t, "sunsetSea", { sizes: "(min-width: 900px) 34vw, 80vw", ratio: "3/2", credit: true, cls: "is-dusk" })}</div>
  </div>
</section>`;
}

// Comer & Ficar: the two things Lauhata offers, as two photographic panels of different weight with an ampersand
// between them. Each whole panel is one link. The photos are keys here so the restaurant's and the rooms' own
// photographs can replace the illustrative ones in one place (they keep their "Illustrative image" tag until then).
const DUO_PHOTOS = { eat: "sunsetGarden", stay: "aerialCoast" };
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
  // Under each photograph, a band of verified details: when the restaurant serves and what is on the menu; which
  // suites there are and how a stay is requested. Two actions per side.
  const shownCats = categories.filter((c) => items.some((d) => d.category === c.id)).map((c) => c.name[L]);
  const hours = site.restaurantHours.map((h) => `<li><span>${esc(h.days[L])}</span><b>${esc(h.hours)}</b></li>`).join("");
  return `<section class="duo" aria-label="${esc(D.aria)}">
  <div class="duo-grid">
    ${panel("eat", "restaurant", D.eat)}
    <span class="duo-amp" aria-hidden="true">&amp;</span>
    ${panel("stay", "stay", D.stay)}
  </div>
  <div class="duo-notes">
    <div class="dn-col dn-eat">
      <h3 class="dn-head">${esc(D.eatHead)}</h3>
      ${hours ? `<p class="dn-label">${esc(D.hoursLabel)}</p><ul class="dn-hours">${hours}</ul>` : ""}
      <p class="dn-label">${esc(D.menuLabel)}</p>
      <p class="dn-text">${esc(shownCats.join(", "))}.</p>
      <p class="dn-small">${esc(D.dineIn)}</p>
      <div class="dn-actions"><a class="btn btn-cream" href="${href("restaurant", L, "#reservar")}" data-book-open="table">${esc(D.eatBook)}</a><a class="text-link" href="${href("restaurant", L, "#ementa")}">${esc(D.eat.link)}</a></div>
    </div>
    <div class="dn-col dn-stay">
      <h3 class="dn-head">${esc(D.stayHead)}</h3>
      <ul class="dn-suites">${rooms.map((r) => `<li><a href="${href("room:" + r.id, L)}">${esc(r.name[L])}</a><span>${esc(r.beds[L])}</span></li>`).join("")}</ul>
      <p class="dn-small">${esc(D.stayHow)}</p>
      <div class="dn-actions"><a class="btn btn-cream" href="${href("stay", L, "#reservar")}" data-book-open="room">${esc(D.stayBook)}</a><a class="text-link" href="${href("stay", L)}">${esc(D.stay.link)}</a></div>
    </div>
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
  // External reputation (phase 8): the verified scores of both platforms, set large, then our own summaries of a few
  // public reviews (never the reviews' own words), each with its author, date and a link to the platform.
  const P = site.reviews || {};
  const num = (n) => String(n).replace(".", L === "pt" ? "," : ".");
  const longDate = (iso) => new Date(iso + "T12:00:00Z").toLocaleDateString(L === "pt" ? "pt-PT" : "en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  const platforms = ["tripadvisor", "booking"].filter((k) => P[k] && P[k].url && P[k].rating && P[k].count);
  // Rating indicators, drawn from the verified numbers only: Tripadvisor's five bubbles (each filled by the share of the
  // score it covers) and Booking.com's bar out of 10. Decorative: the number beside them is the accessible text.
  const bubbles = (rating, scale = 5) => `<span class="rv-bubbles" aria-hidden="true">${Array.from({ length: scale }, (_, i) => `<i style="--f:${Math.round(Math.max(0, Math.min(1, rating - i)) * 100)}%"></i>`).join("")}</span>`;
  const meter = (k) => k === "booking"
    ? `<span class="rv-bar" aria-hidden="true"><i style="--p:${Math.round((P[k].rating / P[k].scale) * 100)}%"></i></span>`
    : bubbles(P[k].rating, P[k].scale);
  const scores = platforms.map((k) => `<a class="rv-score rv-${k}" href="${esc(P[k].url)}" target="_blank" rel="noopener">
        <span class="rv-plat">${esc(R.platforms[k])}</span>
        <span class="rv-num">${esc(num(P[k].rating))}<small>${esc(fmt(R.outOf, { scale: P[k].scale }))}</small></span>
        ${meter(k)}
        <span class="rv-word">${esc(R.scoreWord[k])} · ${esc(fmt(R.countLong, { count: P[k].count }))}</span>
        <span class="rv-go">${esc(R.readAll)}${icon("arrow-up-right")}</span>
      </a>`).join("");
  const checkedDates = [...new Set(platforms.map((k) => P[k].checked).filter(Boolean))];
  const ext = externalReviews.filter((r) => P[r.platform] && P[r.platform].url);
  // Refinement phase: the summaries as cards. The featured one runs across the full width, the others in a row beneath.
  // Each card shows the score that guest gave only when the platform publishes it (Tripadvisor); never an invented one.
  const RS = t.land.resort;
  const ordered = [ext.find((r) => r.featured) || ext[0], ...ext.filter((r) => !r.featured)].filter(Boolean);
  const card = (r, i) => `<li class="rv-card${i ? "" : " is-featured"}">
        <div class="rv-card-top">${r.rating ? `<span class="rv-given" role="img" aria-label="${esc(fmt(R.givenScore, { n: r.rating }))}">${bubbles(r.rating)}</span>` : ""}<span class="rv-card-plat">${esc(R.platforms[r.platform])}</span></div>
        <p class="rv-card-text" lang="${L}">${esc(r.summary[L])}</p>
        <div class="rv-card-by">
          <p><span class="rv-author">${esc(fmt(R.summaryOf, { author: r.author }))}</span>${r.date || r.origin ? `<span class="rv-meta">${[r.date && r.date[L], r.origin && r.origin[L]].filter(Boolean).map(esc).join(" · ")}</span>` : ""}</p>
          <a href="${esc(P[r.platform].url)}" target="_blank" rel="noopener">${esc(R.readFull)}${icon("arrow-up-right")}</a>
        </div>
      </li>`;
  return `<section class="section reviews-ed is-dark" id="opinioes" aria-labelledby="rv-title">
  <div class="wrap">
    <header class="rv-head">
      <div class="rv-head-text">
        <p class="eyebrow-rule">${esc(RS.reviewsEyebrow)}</p>
        <h2 id="rv-title" class="rv-title" data-split>${esc(R.title)}</h2>
      </div>
      ${scores ? `<div class="rv-scores-wrap"><div class="rv-scores">${scores}</div>${checkedDates.length ? `<p class="rv-checked">${esc(fmt(R.checked, { date: checkedDates.map(longDate).join(", ") }))}</p>` : ""}</div>` : `<div class="rv-badge">${tripadvisorBadge(t, "is-large")}</div>`}
    </header>
    ${ordered.length ? `<ul class="rv-cards">${ordered.map(card).join("")}</ul>
    <p class="rv-note">${esc(R.summaryNote)}</p>` : ""}
  </div>
  <div class="wrap">
    <div class="rv-own">
      ${list}
      <details class="rv-form">
        <summary><span>${esc(R.leaveTitle)}</span> ${esc(FB.title)}${icon("plus")}</summary>
        <p class="rv-form-lead">${esc(FB.lead)}</p>
        <form class="booking-form" data-booking="review" novalidate data-wa="${esc(FB.wa)}" data-err-name="${esc(FB.errors.name)}" data-err-rating="${esc(FB.errors.rating)}" data-err-text="${esc(FB.errors.text)}" data-err-consent="${esc(FB.errors.consent)}">
          <div class="form-grid">
            ${field({ id: "fb-name", name: "name", label: FB.name, attrs: 'autocomplete="given-name" required maxlength="40"' })}
            ${field({ id: "fb-exp", name: "experience", label: FB.experience, control: `<select data-pick="select" data-icon="star">${exp}</select>` })}
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

// Events, on the home page: an invitation, not a list of services.
function eventsTeaser(t) {
  const E = t.land.eventsTeaser;
  return `<section class="section ev-teaser" aria-labelledby="et-title">
  <div class="wrap et-grid">
    <div class="et-photos">${figure(t, "aerialDay2", { sizes: "(min-width: 900px) 58vw, 100vw", ratio: "3/2", credit: true })}</div>
    <div class="et-text">
      <h2 id="et-title" class="pv-title" data-split>${esc(E.title)}</h2>
      <p class="pv-body"${rv(80)}>${esc(E.body)}</p>
      <a class="text-link" href="${href("events", t.lang)}">${esc(E.link)}</a>
    </div>
  </div>
</section>`;
}

// Discover Liquiçá, on the home page: one photograph, one line and the way to the guide.
function discoverPreview(t) {
  const D = t.land.discoverPage;
  return `<section class="section dsc-preview" aria-labelledby="dp-title">
  <div class="wrap dp-grid">
    <div class="dp-text">
      <h2 id="dp-title" class="pv-title" data-split>${esc(D.title)}</h2>
      <p class="pv-body"${rv(80)}>${esc(D.lead)}</p>
      <div class="pv-links"${rv(120)}><a class="text-link" href="${href("discover", t.lang)}">${esc(t.nav.discover)}</a><a class="text-link" href="${href("about", t.lang)}">${esc(t.land.preview.about)}</a></div>
    </div>
    <div class="dp-a">${figure(t, "coastVillage", { sizes: "(min-width: 900px) 40vw, 100vw", ratio: "4/5", credit: true })}</div>
    <div class="dp-b">${figure(t, "ruinsAerial", { sizes: "(min-width: 900px) 26vw, 60vw", ratio: "3/4", credit: true })}</div>
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

<section class="section ab-what" aria-labelledby="ab-what-title">
  <div class="wrap ab-what-grid">
    <div>
      <h2 id="ab-what-title" class="ab-title">${esc(A.whatTitle)}</h2>
      <p class="ab-body"${rv(60)}>${esc(A.what)}</p>
      <p class="ab-who"${rv(80)}>${esc(A.who)}</p>
    </div>
    <div>
      <h3 class="h-small">${esc(A.factsTitle)}</h3>
      <dl class="room-sheet ab-facts"${rv(100)}>${A.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>
    </div>
  </div>
  <div class="wrap ab-strip">
    <div class="ab-strip-a">${figure(t, "beachFront", { sizes: "(min-width: 900px) 62vw, 100vw", ratio: "16/9" })}</div>
    <div class="ab-strip-b">${figure(t, "seaCanoe", { sizes: "(min-width: 900px) 34vw, 100vw", ratio: "4/5" })}</div>
  </div>
</section>

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

<section class="ab-chapters" aria-label="${esc(A.whatTitle)}">
  ${[
    ["eat", "sunsetGarden", href("restaurant", L), A.chapters.menu, "is-dusk"],
    ["stay", "aerialGarden", href("stay", L), A.chapters.suites, ""],
    ["coast", "coastVillage", href("discover", L), A.chapters.discover, ""],
    ["people", "beachFront", href("home", L, "#opinioes"), A.chapters.reviews, ""],
  ].map(([k, img, link, label, cls], i) => `<article class="abc abc-${k}${i % 2 ? " is-flip" : ""}" aria-labelledby="abc-${k}">
    <div class="abc-media">${figure(t, img, { sizes: "(min-width: 900px) 55vw, 100vw", ratio: i % 2 ? "4/5" : "3/2", credit: true, cls })}</div>
    <div class="abc-text">
      <h2 id="abc-${k}" class="abc-title">${esc(A.chapters[k + "Title"])}</h2>
      <p${rv(60)}>${esc(A.chapters[k + "Body"])}</p>
      <a class="text-link" href="${link}">${esc(label)}</a>
    </div>
  </article>`).join("")}
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
      ${eventForm(t)}
    </div>
  </div>
</section>`;
  return { page: "events", title: t.meta.events.title, description: t.meta.events.description, path: href("events", L), alt: href("events", other(L)), preload: "sunsetPalms", hero: true, ld: [bc.ld], body };
}

// A general message by WhatsApp, with the subject chosen first.
function contactForm(t) {
  const C = t.land.contactForm;
  const f = t.form;
  return `<form class="booking-form" data-booking="contact" novalidate data-wa="${esc(C.wa)}" data-err-message="${esc(C.errMessage)}">
    <div class="form-grid">
      ${field({ id: "cw-topic", name: "topic", label: C.topic, control: `<select data-pick="select" data-icon="mail">${C.topics.map((x) => `<option>${esc(x)}</option>`).join("")}</select>`, full: true })}
      ${field({ id: "cw-name", name: "name", label: f.name, attrs: 'autocomplete="name" required maxlength="80"', full: true })}
      ${field({ id: "cw-email", name: "email", type: "email", label: f.email, optional: f.optional, attrs: 'autocomplete="email" maxlength="120"' })}
      ${field({ id: "cw-phone", name: "phone", type: "tel", label: f.phone, optional: f.optional, attrs: 'autocomplete="tel" maxlength="40" inputmode="tel"' })}
      ${field({ id: "cw-message", name: "message", type: "textarea", label: C.message, attrs: 'required minlength="10" maxlength="1500" rows="5"', full: true })}
    </div>
    ${formFooter(t, C.submit)}
  </form>`;
}

// The event enquiry in five steps (event, guests, preferences, idea, contact). Without JavaScript every step shows at
// once as one long form; with it, one step at a time with a progress line, Back/Continue, and a review of the WhatsApp
// message before it opens. Only the date, the guest count and the name are required.
function eventForm(t) {
  const E = t.land.eventsPage;
  const f = t.form;
  const opts = (list) => list.map((o) => `<option>${esc(o)}</option>`).join("");
  // Each select gets the icon of what it asks (refinement phase: no single generic icon on every field).
  const sel = (id, name, label, list, ico, extra = {}) => field({ id, name, label, control: `<select data-pick="select" data-icon="${ico}">${opts(list)}</select>`, ...extra });
  const num = (id, name, label, attrs) => field({ id, name, type: "number", label, attrs: `${attrs} inputmode="numeric" data-pick="number" data-unit-one="${esc(t.home.quick.person)}" data-unit-many="${esc(t.home.quick.persons)}"` });
  const step = (i, body) => `<fieldset class="ev-step" data-step="${i}"><legend class="ev-step-title"><span class="ev-step-n">${esc(fmt(E.stepOf, { n: i + 1, total: 5 }))}</span>${esc(E.steps5[i])}</legend><div class="form-grid">${body}</div></fieldset>`;
  return `<form class="booking-form ev-wizard" data-booking="event" data-steps data-review-step novalidate data-wa="${esc(E.wa)}">
    <ol class="ev-progress" aria-hidden="true">${E.steps5.map((s, i) => `<li data-progress="${i}"><span>${i + 1}</span>${esc(s)}</li>`).join("")}</ol>
    ${step(0, `${sel("ev-kind", "kind", E.kind, E.kinds, "star", { full: true })}
      ${field({ id: "ev-date", name: "date", type: "date", label: f.date, attrs: 'required data-pick="date"' })}
      ${field({ id: "ev-alt", name: "altDate", type: "date", label: E.altDate, optional: f.optional, attrs: 'data-pick="date"' })}
      ${sel("ev-flex", "flex", E.flex, E.flexOptions, "calendar")}
      ${sel("ev-start", "start", E.start, E.startOptions, "clock")}
      ${sel("ev-duration", "duration", E.duration, E.durationOptions, "clock", { full: true })}`)}
    ${step(1, `${num("ev-people", "people", E.guests, 'required min="1" max="300" value="10"')}
      ${num("ev-adults", "adults", E.adults, 'min="0" max="300" value=""')}
      ${num("ev-children", "children", E.children, 'min="0" max="300" value=""')}`)}
    ${step(2, `${sel("ev-atmo", "atmosphere", E.atmosphere, E.atmosphereOptions, "sunset")}
      ${sel("ev-setting", "setting", E.setting, E.settingOptions, "pin")}
      <fieldset class="field is-full ev-topics"><legend>${esc(E.topics)}</legend><p class="hint">${esc(E.topicsHint)}</p><div class="ev-chips">${E.topicOptions.map((o) => `<label class="ev-chip"><input type="checkbox" name="topics" value="${esc(o)}"><span>${esc(o)}</span></label>`).join("")}</div></fieldset>`)}
    ${step(3, field({ id: "ev-vision", name: "vision", type: "textarea", label: E.vision, hint: E.visionHint, optional: f.optional, attrs: 'maxlength="1500" rows="7"', full: true }))}
    ${step(4, `${field({ id: "ev-name", name: "name", label: f.name, attrs: 'autocomplete="name" required maxlength="80"', full: true })}
      ${field({ id: "ev-email", name: "email", type: "email", label: E.email, optional: f.optional, attrs: 'autocomplete="email" maxlength="120"' })}
      ${field({ id: "ev-phone", name: "phone", type: "tel", label: E.phone, optional: f.optional, attrs: 'autocomplete="tel" maxlength="40" inputmode="tel"' })}
      ${sel("ev-prefer", "prefer", E.prefer, E.preferOptions, "phone", { full: true })}`)}
    <div class="ev-nav"><button type="button" class="btn btn-outline" data-step-back>${esc(E.back)}</button><button type="button" class="btn btn-dark" data-step-next>${esc(E.next)}${icon("arrow")}</button></div>
    ${formFooter(t, E.submit)}
  </form>`;
}

// ================= GALLERY: real photographs only, grouped by what they show =================
// A photo appears here only when it is marked real (placeholder: false) and has a `group` in images.mjs. Each group opens
// with one wide frame; every photo opens in the site's lightbox (keyboard: Enter, arrows, Escape).
export function gallery(t) {
  const L = t.lang;
  const G = t.land.galleryPage;
  const bc = breadcrumbs(t, [{ name: t.nav.gallery, path: href("gallery", L) }]);
  // One mosaic of every real photograph: tiles of different sizes in a 12-column grid that packs densely, so nothing is
  // left as a large gap; filter buttons show one theme at a time. The tile sizes repeat in a fixed rhythm.
  const SPANS = [[8, 5], [4, 5], [4, 3], [4, 3], [4, 3], [5, 4], [7, 4], [6, 4], [6, 4], [4, 4], [8, 4]];
  const all = Object.entries(G.groups).flatMap(([g]) => Object.keys(images).filter((k) => !images[k].placeholder && images[k].group === g));
  const mosaic = `<div class="gx-filters" role="group" aria-label="${esc(G.filterLabel)}"><button type="button" class="gx-filter" aria-pressed="true" data-filter="all">${esc(G.all)}</button>${Object.entries(G.groups)
    .filter(([g]) => all.some((k) => images[k].group === g))
    .map(([g, title]) => `<button type="button" class="gx-filter" aria-pressed="false" data-filter="${g}">${esc(title)}</button>`)
    .join("")}</div>
    <ul class="gx-mosaic" data-gallery data-mosaic>${all
      .map((k, i) => { const [c, r] = SPANS[i % SPANS.length]; return `<li class="gx-tile" data-group="${images[k].group}" style="--c:${c};--r:${r}"><a class="gr-link" href="${imgUrl(k, 1600)}" data-lb-src="${imgUrl(k, 1600)}" aria-label="${esc(fmt(t.land.gallery.open, { alt: images[k].alt[L] }))}">${figure(t, k, { sizes: c >= 7 ? "(min-width: 900px) 60vw, 100vw" : "(min-width: 900px) 34vw, 100vw" })}</a></li>`; })
      .join("")}</ul>`;
  const groups = mosaic;
  const body = `
${pageHero(t, { eyebrow: G.eyebrow, title: G.title, lead: G.lead, image: "aerialGarden", crumbs: bc.html })}

<section class="section gallery-real gx" aria-label="${esc(G.eyebrow)}">
  <div class="wrap">${groups}</div>
</section>`;
  return { page: "gallery", title: t.meta.gallery.title, description: t.meta.gallery.description, path: href("gallery", L), alt: href("gallery", other(L)), preload: "aerialGarden", hero: true, ld: [bc.ld], body };
}

// Photos for the Discover places, in the order of discoverPage.places: Maubara fort (Commons, illustrative), Aipelo
// (Lauhata's own drone photo), Liquiçá centre (Commons, illustrative), Maubara weaving (none yet), beaches (none yet),
// the sea (Lauhata's own drone photo), the salt lake (none yet). See docs/FOTOGRAFIAS.md for the shot list.
const PLACE_PHOTOS = ["placeMaubaraFort", "ruinsAerial", "placeLiquicaCentre", null, null, "seaCanoe", null];

// ================= DISCOVER LIQUIÇÁ: a short, sourced guide to the coast around Lauhata =================
// Every place and fact comes from the official tourism site (timorleste.tl, Liquiçá municipality page), which is credited
// on the page. No distances, travel times, prices or tours are given: none are confirmed. Lauhata does not run these visits.
export function discover(t) {
  const L = t.lang;
  const D = t.land.discoverPage;
  const bc = breadcrumbs(t, [{ name: t.nav.discover, path: href("discover", L) }]);
  const maps = (q) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
  // Straight-line distance from Lauhata's official coordinates, rounded: never presented as a road distance or a drive time.
  const km = (g) => {
    if (!g || !site.geo) return null;
    const R = 6371, rad = (x) => (x * Math.PI) / 180;
    const dLat = rad(g[0] - site.geo.lat), dLng = rad(g[1] - site.geo.lng);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(site.geo.lat)) * Math.cos(rad(g[0])) * Math.sin(dLng / 2) ** 2;
    return Math.round(2 * R * Math.asin(Math.sqrt(a)));
  };
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
  </div>
  ${(() => {
    // Places with a photograph get an editorial row each (alternating sides, varied proportions); the others are set as
    // a short typographic list until someone photographs them. Photo slots: PLACE_PHOTOS below, by place order; a new
    // photo goes in images.mjs and here.
    const body = (p) => `<p class="dsc-kind">${esc(p.kind)}</p><h3>${esc(p.name)}</h3><p>${esc(p.text)}</p>${km(p.geo) != null ? `<p class="dsc-km">${esc(fmt(D.distance, { km: km(p.geo) }))}</p>` : ""}${p.map ? `<a class="text-link" href="${p.geo ? maps(p.geo.join(",")) : maps(p.map)}" target="_blank" rel="noopener">${esc(D.mapLink)}</a>` : ""}`;
    const withPhoto = D.places.map((p, i) => [p, PLACE_PHOTOS[i]]).filter(([, k]) => k);
    const without = D.places.filter((p, i) => !PLACE_PHOTOS[i]);
    return `<div class="dsc-rows">${withPhoto.map(([p, k], i) => `<article class="dsc-row${i % 2 ? " is-flip" : ""}">
      <div class="dsc-row-media">${figure(t, k, { sizes: "(min-width: 900px) 46vw, 100vw", ratio: ["3/2", "4/3", "16/10", "4/3"][i % 4], credit: true })}</div>
      <div class="dsc-row-text"${rv(60)}>${body(p)}</div>
    </article>`).join("")}</div>
    ${without.length ? `<div class="wrap"><h3 class="dsc-also-title">${esc(D.alsoTitle)}</h3><ul class="dsc-also">${without.map((p) => `<li>${body(p)}</li>`).join("")}</ul></div>` : ""}`;
  })()}
</section>

<section class="section dsc-map" aria-label="${esc(D.mapLink)}">
  <div class="wrap">
    <div class="map-frame dsc-map-frame"><iframe title="${esc(t.location.mapTitle)}" src="${mapEmbed()}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>
    <p class="dsc-source">${esc(D.geoSource)}</p>
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
  // Final homepage design (LAUHATA-FINAL-HOMEPAGE-DESIGN.md): sunset hero with the two-mode enquiry panel, the Welcome
  // introduction with four photographic cards, Our Story, the two suites, guest reviews, Discover Liquiçá.
  // Photographs: real ones wherever they exist; the suites only have illustrative pictures, which keep their label.
  const RS = LD.resort;
  const card = (i, key, page, ic) => `<a class="wc-card" href="${href(page, L)}">
      <div class="wc-media">${figure(t, key, { sizes: "(min-width: 1100px) 17vw, (min-width: 700px) 45vw, 92vw", decorative: true })}</div>
      <span class="wc-icon" aria-hidden="true">${icon(ic)}</span>
      <span class="wc-text"><strong class="wc-title">${esc(RS.cards[i].title)}</strong><span class="wc-line">${esc(RS.cards[i].line)}</span><span class="wc-link">${esc(RS.cards[i].link)}${icon("arrow")}</span></span>
    </a>`;
  const suite = (r) => `<article class="st-panel">
      <a class="st-media" href="${href("room:" + r.id, L)}" aria-label="${esc(r.name[L])}">${figure(t, r.images[0], { sizes: "(min-width: 900px) 34vw, 92vw", decorative: true })}<span class="st-name">${esc(r.name[L])}</span></a>
      <p class="st-beds">${icon("bed")}${esc(r.beds[L])}</p>
      <div class="st-links"><a class="text-link" href="${href("room:" + r.id, L)}">${esc(RS.stayView)}</a><a class="text-link" href="${href("stay", L, "#reservar")}" data-room-link="${r.id}">${esc(RS.stayAsk)}</a></div>
    </article>`;
  const body = `
<section class="cine-hero hx rs-hero" aria-labelledby="hero-title">
  <div class="hx-bg">${figure(t, "sunsetPalmsHigh", { eager: true, sizes: "100vw" })}
    ${site.heroVideo ? `<video class="hx-video" muted loop playsinline autoplay preload="none" aria-hidden="true" tabindex="-1" data-hero-video data-src="${esc(site.heroVideo)}"></video>` : ""}</div>
  <div class="hx-shade" aria-hidden="true"></div>
  <div class="wrap cine-content hx-content rs-hero-grid">
    <div class="rs-hero-text">
      <p class="eyebrow-rule is-light" data-fade>${esc(RS.heroEyebrow)}</p>
      <h1 id="hero-title" class="cine-title hx-title" data-split><span class="line">${esc(RS.heroTitle)}</span> <em class="hx-accent">${esc(RS.heroAccent)}</em></h1>
      <p class="hx-line" data-fade style="--d:300ms">${esc(RS.heroLine)}</p>
    </div>
  </div>
  <div class="wrap rs-booking" data-fade style="--d:450ms">${bookingCard(t, { prefix: "hxb", hero: true })}</div>
  <p class="rs-hero-cap">${site.heroVideo ? `<span>${esc(RS.filmCaption)}</span><b>${esc(RS.filmReal)}</b>` : `<span>${esc(images.sunsetPalmsHigh.alt[L])}</span><b>${esc(t.common.realPhoto)}</b>`}</p>
</section>

<section class="section rs-welcome" aria-labelledby="wc-title">
  <div class="wrap wc-grid">
    <div class="wc-intro">
      <p class="eyebrow-rule">${esc(RS.welcomeEyebrow)}</p>
      <h2 id="wc-title" class="wc-heading" data-split>${esc(RS.welcomeTitle)}</h2>
      <p class="wc-body"${rv(60)}>${esc(RS.welcomeBody)}</p>
      <a class="btn btn-outline btn-pill" href="${href("about", L)}">${esc(RS.welcomeCta)}${icon("arrow")}</a>
    </div>
    <div class="wc-cards">
      ${card(0, "beachFront", "restaurant", "cutlery")}
      ${card(1, "roomBright", "stay", "bed")}
      ${card(2, "sunsetGarden", "events", "heart")}
      ${card(3, "coastVillage", "discover", "pin")}
    </div>
  </div>
</section>

<section class="rs-story" aria-labelledby="story-title">
  <div class="rs-story-media">${figure(t, "aerialCoast", { sizes: "(min-width: 861px) 60vw, 100vw" })}</div>
  <div class="rs-story-shade" aria-hidden="true"></div>
  <div class="wrap rs-story-text">
    <p class="eyebrow-rule is-light">${esc(RS.storyEyebrow)}</p>
    <h2 id="story-title" class="rs-story-title" data-split>${esc(RS.storyTitle)}</h2>
    <p class="rs-story-body"${rv(60)}>${esc(RS.storyBody)}</p>
    <a class="btn btn-ghost-light btn-pill" href="${href("about", L)}">${esc(RS.storyCta)}${icon("arrow")}</a>
  </div>
  <p class="rs-story-cap"><span>${esc(images.aerialCoast.alt[L])}</span><b>${esc(t.common.realPhoto)}</b></p>
</section>

<section class="section rs-stay" aria-labelledby="stay-title">
  <div class="wrap st-grid">
    <div class="st-intro">
      <p class="eyebrow-rule">${esc(RS.stayEyebrow)}</p>
      <h2 id="stay-title" class="wc-heading" data-split>${esc(RS.stayTitle)}</h2>
      <p class="wc-body">${esc(RS.stayBody)}</p>
      <a class="btn btn-outline btn-pill" href="${href("stay", L)}">${esc(RS.stayCta)}${icon("arrow")}</a>
    </div>
    <div class="st-panels">${rooms.map(suite).join("")}</div>
  </div>
</section>

${reviewsSection(t)}

<section class="rs-discover" aria-labelledby="rsd-title">
  <div class="rs-discover-media">${figure(t, "ruinsAerial", { sizes: "100vw" })}</div>
  <div class="rs-discover-shade" aria-hidden="true"></div>
  <div class="wrap rs-discover-text">
    <p class="eyebrow-rule is-light">${esc(RS.discoverEyebrow)}</p>
    <h2 id="rsd-title" class="rs-story-title" data-split>${esc(RS.discoverTitle)}</h2>
    <a class="btn btn-ghost-light btn-pill" href="${href("discover", L)}">${esc(RS.discoverCta)}${icon("arrow")}</a>
  </div>
  <p class="rs-story-cap"><span>${esc(images.ruinsAerial.alt[L])}</span><b>${esc(t.common.realPhoto)}</b></p>
</section>`;
  return {
    page: "home",
    title: t.meta.home.title,
    description: t.meta.home.description,
    path: href("home", L),
    alt: href("home", other(L)),
    preload: [
      { key: "sunsetPalmsHigh", sizes: "100vw" },
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
  // The room sheet shows only owner-confirmed facts (rooms.mjs: beds, amenities, suitability) and the price, "on request"
  // until it is set. Capacity, bathroom, air conditioning and the like appear only once Carlos confirms them.
  const row = (label, value) => `<div><dt>${esc(label)}</dt><dd>${value}</dd></div>`;
  const facts = [
    r.badge ? row(S.roomType, esc(r.badge[L])) : "",
    r.beds ? row(S.roomBeds, esc(r.beds[L])) : "",
    r.suitability ? row(S.roomSuits, esc(r.suitability[L])) : "",
    r.amenities && r.amenities.length ? row(S.roomFeatures, r.amenities.map((f) => esc(f[L])).join(", ")) : "",
    site.stayTimes ? row(S.roomCheck, `${esc(S.checkIn)} ${esc(site.stayTimes.checkIn)} · ${esc(S.checkOut)} ${esc(site.stayTimes.checkOut)}`) : "",
    row(S.roomPrice, r.price ? `${esc(r.price)} <small>${esc(H.night)}</small>` : esc(t.common.priceTbc)),
  ].join("");
  const anyTbc = true; // capacity is not confirmed yet: the note invites the guest to ask
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

<section class="section suite-intro" aria-labelledby="suite-intro-title">
  <div class="wrap si-grid">
    <h2 id="suite-intro-title" class="si-tagline" data-split>${esc(r.tagline[L])}</h2>
    <div class="si-body">
      <p${rv(60)}>${esc(r.description[L])}</p>
      <p class="si-names">${esc(S.namesNote)}</p>
      ${suiteAmenities(t, r)}
    </div>
  </div>
</section>

<section class="section room-photos" aria-label="${esc(fmt(t.carousel.label, { room: name }))}">
  <div class="wrap">${roomCarousel(t, r, { sizes: "(min-width: 900px) 78vw, 92vw", cls: "is-wide" })}</div>
</section>

<section class="section suite-spec" aria-labelledby="sheet-title">
  <div class="wrap ss-grid">
    <figure class="ss-plan"${rv()}>
      ${bedPlan(t, r)}
      <figcaption>${esc(S.bedPlan)}</figcaption>
    </figure>
    <div class="ss-sheet">
      <h2 id="sheet-title" class="ss-title">${esc(S.sheetTitle)}</h2>
      <dl class="room-sheet"${rv(80)}>${facts}${row(S.bookLabel, esc(S.bookValue))}${row(S.payLabel, esc(S.payValue))}</dl>
      <h3 class="ss-ask-title">${esc(S.askMoreTitle)}</h3>
      <ul class="ss-ask">${S.askMore.map((q) => `<li>${esc(q)}</li>`).join("")}</ul>
      <p class="ss-ask-note">${esc(S.askMoreNote)}</p>
    </div>
  </div>
</section>

<section class="section suite-request" aria-labelledby="ask-title">
  <div class="wrap sr-grid">
    <h2 id="ask-title" class="sr-title">${esc(S.askTitle)}</h2>
    <div class="sr-body">
      <p>${esc(S.askBody)}</p>
      <p class="pay-note">${esc(t.stay.payNote)}</p>
      <div class="sr-actions">
        <a class="btn btn-dark btn-lg" href="${href("stay", L, "#reservar")}" data-room-link="${r.id}">${esc(S.roomBook)}</a>
        <a class="text-link" href="${waLink(fmt(t.land.suites.wa, { room: name }))}" target="_blank" rel="noopener">${esc(t.common.whatsapp)}</a>
      </div>
      ${responseLine(t)}
    </div>
  </div>
</section>

<section class="suite-next" aria-labelledby="other-title">
  <h2 id="other-title" class="sr-only">${esc(S.otherRooms)}</h2>
  ${others.map((o) => `<a class="sn-link" href="${href("room:" + o.id, L)}">
    <div class="sn-media">${figure(t, o.images[0], { sizes: "100vw", decorative: true })}</div>
    <div class="wrap sn-copy"><span class="sn-kicker">${esc(S.otherRooms)}</span><strong class="sn-name">${esc(o.name[L])}</strong><span class="sn-sum">${esc(o.summary[L])}</span></div>
  </a>`).join("")}
  <div class="wrap sn-back"><a class="text-link" href="${href("stay", L, "#quartos")}">${esc(S.allRooms)}</a></div>
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
      <div class="get-there"${rv(180)}><h3>${esc(t.land.getThere.title)} ${esc(t.land.getThere.titleAccent)}</h3><p>${esc(t.land.getThere.body)}</p></div>
      <div class="contact-actions"${rv(200)}>
        <a class="btn btn-dark btn-lg" href="${waLink(t.form.waHello)}" target="_blank" rel="noopener">${icon("whatsapp")}${esc(t.common.whatsapp)}</a>
        <a class="text-link" href="${href("restaurant", L, "#reservar")}" data-book-open="table">${esc(t.home.quick.heroTable)}</a>
        <a class="text-link" href="${href("stay", L, "#reservar")}" data-book-open="room">${esc(t.footer.bookRoom)}</a>
        <a class="text-link" href="${mapsLink()}" target="_blank" rel="noopener">${esc(t.footer.directions)}</a>
      </div>
    </div>
    <div class="map-frame"${rv(120)}>
      <iframe title="${esc(t.location.mapTitle)}" src="${mapEmbed()}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
    </div>
  </div>
</section>

<section class="section booking contact-write" id="escrever" aria-labelledby="cw-title">
  <div class="wrap booking-grid">
    <div>
      ${heading({ eyebrow: t.contact.eyebrow, title: t.land.contactForm.title, id: "cw-title" })}
      <p class="body-text">${esc(t.land.contactForm.lead)}</p>
      <p class="cw-shortcuts-lead">${esc(t.land.contactForm.shortcuts)}</p>
      <ul class="cw-shortcuts">
        <li><a class="text-link" href="${href("stay", L, "#reservar")}">${esc(t.footer.bookRoom)}${icon("arrow")}</a></li>
        <li><a class="text-link" href="${href("restaurant", L, "#reservar")}">${esc(t.footer.bookTable)}${icon("arrow")}</a></li>
        <li><a class="text-link" href="${href("events", L, "#pedido")}">${esc(t.land.eventsPage.formTitle)}${icon("arrow")}</a></li>
      </ul>
    </div>
    <div class="form-card">${contactForm(t)}</div>
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
    <h1 class="title">${esc(t.privacy.title)}</h1>
    ${site.showPlaceholderNotes ? `<p class="tbc-block">${esc(t.privacy.reviewNote)}</p>` : ""}
    ${t.privacy.sections.map((s) => `<h2>${esc(s.h)}</h2><p>${esc(s.p)}</p>`).join("")}
    ${photoCredits(t)}
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

// Credits for the temporary, openly licensed photos (src/data/temp-photos.json): each one names its author, licence and
// source, as CC BY and CC BY-SA require. The list shrinks as Lauhata's own photos replace them.
function photoCredits(t) {
  const file = new URL("./data/temp-photos.json", import.meta.url);
  if (!existsSync(file)) return "";
  const credits = JSON.parse(readFileSync(file, "utf8"));
  // Dish and drink photos (pratos-temp/<id>) until the real dish photo exists; reference photos of places (`file`, in fotos/).
  const rows = Object.entries(credits).filter(([id, c]) => (c.file ? existsSync(new URL(`./assets/img/fotos/${c.file}-640.jpg`, import.meta.url)) : existsSync(tempPhotoFile(id)) && !existsSync(new URL(`./assets/img/pratos/${id}-640.jpg`, import.meta.url))));
  if (!rows.length) return "";
  const C = t.privacy.credits;
  return `<h2 id="creditos">${esc(C.title)}</h2><p>${esc(C.lead)}</p><ul class="credits">${rows
    .map(([, c]) => `<li><a href="${esc(c.page)}" target="_blank" rel="noopener">${esc(c.title)}</a> · ${esc(c.creator)} · ${c.licenseUrl ? `<a href="${esc(c.licenseUrl)}" target="_blank" rel="noopener">${esc(c.license)}</a>` : esc(c.license)}</li>`)
    .join("")}</ul>`;
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
