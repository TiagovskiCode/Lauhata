// Page bodies. Each function returns { title, description, path, alt, body, ... } for layout().
// The homepage follows the approved design mock-up section by section; inner pages reuse its parts.
import { esc, fmt, href, figure, icon, waLink, hoursList, responseLine, breadcrumbs, imgUrl, money, reservationSlots, slotPeriod, site, rooms, images } from "./lib.mjs";
import { lodgingAmenities } from "./data/rooms.mjs";
import { existsSync, readFileSync } from "node:fs";
import { tripadvisorBadge } from "./layout.mjs";
import { categories, items, menuNote } from "./data/menu.mjs";
import siteReviews from "./data/reviews.mjs";
import externalReviews from "./data/reviews-external.mjs";
import { sampleDrinks } from "./data/sample-drinks.mjs";

const fmtPhone = (d) => (/^670\d{8}$/.test(d) ? `+670 ${d.slice(3, 7)} ${d.slice(7)}` : `+${d}`);
const other = (L) => (L === "pt" ? "en" : "pt");
// A 16:9 photograph that covers a full-height frame is drawn wider than the screen on a phone: the browser must pick a larger file.
const COVER = "max(100vw, 92vh)";
const rv = (delay = 0) => ` data-reveal${delay ? ` style="--d:${delay}ms"` : ""}`;

// Section heading: the title (with an optional second line) and an optional lead. Phase 7 ("Diário da costa"): no
// label above every title; the `eyebrow` argument is kept for callers but no longer printed.
function heading({ eyebrow, title, accent = "", lead = "", id = "", center = false, tag = "h2", cls = "" }) {
  return `<header class="heading${center ? " is-center" : ""} ${cls}"${rv()}>
    <${tag}${id ? ` id="${id}"` : ""} class="title">${esc(title)}${accent ? `<br><span class="title-2">${esc(accent)}</span>` : ""}</${tag}>
    ${lead ? `<p class="lead">${esc(lead)}</p>` : ""}
  </header>`;
}

// The compact hero of the inner pages: one photograph, the title and (when the page has one) the action. `pos` sets the part of the
// photograph that stays in view when the frame crops it. `eyebrow` and `crumbs` are accepted but not printed.
function pageHero(t, { title, accent = "", lead, image, ctas = "", decorative = false, pos = "", cls = "" }) {
  return `<section class="cine-hero is-page ${cls}"${pos ? ` style="--pos:${pos}"` : ""}>
  <div class="cine-slides"><div class="slide is-active">${figure(t, image, { eager: true, sizes: COVER, credit: true, decorative })}</div></div>
  <div class="cine-shade" aria-hidden="true"></div>
  <div class="wrap cine-content">
    <h1 class="cine-title is-page" data-split>${esc(title)}${accent ? ` ${esc(accent)}` : ""}</h1>
    <p class="cine-lead" data-fade style="--d:260ms">${esc(lead)}</p>
    ${ctas ? `<div class="cine-ctas" data-fade style="--d:380ms">${ctas}</div>` : ""}
  </div>
</section>`;
}

// Everything the accommodation offers, once, for both room types (rooms.mjs `lodgingAmenities`), plus the price rule.
function lodgingBlock(t, { note = true } = {}) {
  const L = t.lang;
  return `<div class="rp-lodging">
    <h3 class="rp-lodging-title">${esc(t.stay.lodgingTitle)}</h3>
    <ul class="rp-amen">${lodgingAmenities.map((a) => `<li>${icon(a.icon)}<span>${esc(a[L])}</span></li>`).join("")}</ul>
    ${note ? `<p class="rp-note">${esc(t.stay.perNightNote)}</p>` : ""}
  </div>`;
}

// The suite's confirmed amenities with their icons: the beds (rooms.mjs `bedPlan`) and the owner-confirmed `amenities`.
// Nothing else is listed (Wi-Fi, breakfast, bathroom, air conditioning are not confirmed: docs/CHECKLISTS.md).
const AMEN_ICON = { Television: "tv" };
// The confirmed items of a suite as [icon, label] pairs: its beds, then its owner-confirmed amenities (never the pending ones).
function suiteAmenityItems(t, r) {
  const S = t.stay;
  const L = t.lang;
  const beds = (r.bedPlan || []).map((b) => (b === "queen" ? ["bed-queen", S.amenQueen] : b === "single" ? ["bed-single", S.amenSingle] : null)).filter(Boolean);
  const more = (r.amenities || []).map((a) => [a.icon || AMEN_ICON[a.en] || "check", a[L]]);
  return [...beds, ...more];
}

// The suite's beds drawn from above, each labelled. Only the beds the owner confirmed (rooms.mjs `bedPlan`); generic
// proportions, no measurements (the real bed sizes are not known), no walls or furniture (the room layout is not known).
function bedPlan(t, r) {
  const S = t.stay;
  const beds = r.bedPlan || [];
  const dims = { queen: [193, 203], single: [90, 190] };
  let x = 0;
  const parts = beds.map((b) => {
    const [w, h] = dims[b];
    const g = `<g transform="translate(${x} ${203 - h})">
      <rect class="bp-bed" x="0" y="0" width="${w}" height="${h}" rx="4"/>
      ${b === "queen" ? `<rect class="bp-pillow" x="14" y="12" width="76" height="34" rx="8"/><rect class="bp-pillow" x="103" y="12" width="76" height="34" rx="8"/>` : `<rect class="bp-pillow" x="12" y="12" width="66" height="30" rx="8"/>`}
      <line class="bp-fold" x1="0" y1="${Math.round(h * 0.62)}" x2="${w}" y2="${Math.round(h * 0.62)}"/>
      <text class="bp-label" x="${w / 2}" y="${h + 26}" text-anchor="middle">${esc(b === "queen" ? S.king : S.single)}</text>    </g>`;
    x += w + 40;
    return g;
  });
  const width = Math.max(0, x - 40);
  return `<svg class="bed-plan" viewBox="-6 -6 ${width + 12} 265" role="img" aria-label="${esc(S.bedPlan)}: ${esc(r.beds[t.lang])}">${parts.join("")}</svg>`;
}

// A room's photographs as a carousel: a scroll-snap strip (swipe on touch, arrow keys when focused), previous/next
// buttons, a position counter, and every photo opens in the site's lightbox (data-gallery). Without JavaScript it is a
// strip that scrolls sideways.
// The photographs of a room that may be shown: the real ones; while there are none, only the first picture (it renders as the branded placeholder).
// While there are none, the photographs of the outside of the rooms (rooms.mjs `outside`) stand in, always with a note that says so.
const interiors = (r) => r.images.filter((k) => images[k] && images[k].kind === "room" && !images[k].placeholder);
const hasInterior = (r) => interiors(r).length > 0;
const roomPhotos = (r, max = 99) => (hasInterior(r) ? interiors(r) : r.outside).slice(0, max);
// A room's photographs as a carousel: a scroll-snap strip (swipe on touch, arrow keys when focused), previous/next buttons, a position
// counter, and every photo opens in the lightbox (data-gallery). Without JavaScript it is a strip that scrolls sideways.
function roomCarousel(t, r, { sizes = "(min-width: 900px) 56vw, 92vw", cls = "" } = {}) {
  const L = t.lang;
  const C = t.carousel;
  const imgs = roomPhotos(r);
  const n = imgs.length;
  return `<div class="carousel ${cls}" data-carousel role="group" aria-roledescription="${esc(C.role)}" aria-label="${esc(fmt(C.label, { room: r.name[L] }))}">
    <div class="cr-track" data-cr-track data-gallery tabindex="0">${imgs
      .map((k, i) => `<div class="cr-slide" role="group" aria-roledescription="${esc(C.slide)}" aria-label="${esc(fmt(C.count, { n: i + 1, total: n }))}"><a class="cr-link" href="${imgUrl(k, 1600)}" data-lb-src="${imgUrl(k, 1600)}" aria-label="${esc(fmt(t.land.gallery.open, { alt: images[k].alt[L] }))}">${figure(t, k, { sizes, decorative: true, caption: images[k].alt[L] })}</a></div>`)
      .join("")}</div>
    ${n > 1 ? `<div class="cr-controls"><button class="cr-btn" type="button" data-cr-prev aria-label="${esc(C.prev)}">${icon("left")}</button><p class="cr-count" data-cr-count aria-live="polite">1 / ${n}</p><button class="cr-btn" type="button" data-cr-next aria-label="${esc(C.next)}">${icon("right")}</button></div>` : ""}
  </div>`;
}

// The two room types on the home page, as two facing pages of one spread: photograph, name and price, who it sleeps, the beds drawn from
// above, one action. The photographs are the outside of the rooms and the note under them says so.
function roomPair(t) {
  const L = t.lang;
  return `<div class="rm-duo">${rooms.map((r) => `<article class="rm">
      <a class="rm-media" data-tide href="${href("room:" + r.id, L)}" tabindex="-1" aria-hidden="true">${figure(t, roomPhotos(r)[0], { sizes: "(min-width: 900px) 46vw, 92vw" })}</a>
      <div class="rm-head">
        <h3 class="rm-name"><a href="${href("room:" + r.id, L)}">${esc(r.name[L])}</a></h3>
        <p class="rp-price"><strong>${esc(r.price || t.common.priceTbc)}</strong>${r.price ? `<span>${esc(t.home.rooms.night)}</span>` : ""}</p>
      </div>
      <p class="rm-facts">${esc(r.capacity[L])}. ${esc(r.beds[L])}${(r.amenities || []).map((a) => `, ${esc(a[L].toLowerCase())}`).join("")}.</p>
      ${r.capacityPending ? `<p class="rp-pending">${esc(t.stay.capacityPending)}</p>` : ""}
      <div class="rm-actions"><a class="btn btn-terra" href="${href("contact", L)}" data-book-open="room" data-room-link="${r.id}">${esc(t.home.hero.ctaRoom)}</a><a class="text-link" href="${href("room:" + r.id, L)}">${esc(t.stay.viewRoom)}</a></div>
    </article>`).join("")}</div>
  <p class="rm-inside">${esc(t.stay.insideNote)}</p>
  ${lodgingBlock(t)}`;
}

const mapsLink = () => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.geo ? `${site.geo.lat},${site.geo.lng}` : site.mapQuery)}`;

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
      ${hero ? "" : fld(`${f.name} (${f.optional})`, `<input type="text" name="tName" autocomplete="name" maxlength="80">`)}
      ${hero ? "" : `<label class="bc-field bc-wide"><span>${esc(f.notes)} (${esc(f.optional)})</span><input type="text" name="tNotes" maxlength="200" placeholder="${esc(f.notesPlaceholder)}"></label>`}
      <button class="btn btn-terra btn-lg bc-submit" type="submit">${icon("whatsapp")}${esc(hero ? q.heroSubmitTable : q.submitTable)}</button>
    </div>
    <div class="bc-row" id="${prefix}-room" role="tabpanel" data-bc-panel="room" hidden>
      ${fld(q.checkIn, `<input type="date" name="checkIn" data-pick="in">`)}
      ${fld(q.checkOut, `<input type="date" name="checkOut" data-pick="out">`)}
      ${fld(f.adults, qty("adults", 20, { one: f.adultOne, many: f.adultMany }))}
      ${fld(f.children, qty("children", 10, { min: 0, value: 0, one: f.childOne, many: f.childMany }))}
      ${fld(q.room, `<select name="room" data-pick="select"><option value="">${esc(q.roomAny)}</option>${rooms.map((r) => `<option value="${r.id}">${esc(r.name[t.lang])}</option>`).join("")}</select>`)}
      ${hero ? "" : fld(`${f.name} (${f.optional})`, `<input type="text" name="rName" autocomplete="name" maxlength="80">`)}
      ${hero ? "" : `<label class="bc-field bc-wide"><span>${esc(f.notes)} (${esc(f.optional)})</span><input type="text" name="rNotes" maxlength="200" placeholder="${esc(f.notesPlaceholder)}"></label>`}
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



// ---------- Shared blocks ----------
// ---------- Menu: dish cards, category bar, search ----------
const normalize = (v) => v.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

// A dish can be ordered when it has a price: its own, or one per size (chips).
const sizePriced = (d) => d.options.find((g) => g.choices.some((c) => c.price != null));
const canOrder = (d) => d.available !== false && (d.price != null || Boolean(sizePriced(d)));

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
  // ILLUSTRATIVE (openly licensed photo of a similar dish, tools/fotos-temporarias.mjs): only when site.dishPhotos.showIllustrative is on.
  if (site.dishPhotos.showIllustrative && existsSync(tempPhotoFile(d.id))) return tempPhoto(t, d.id, typeof d.name === "string" ? d.name : d.name[t.lang]);
  // PLACEHOLDER: the branded tile, which never pretends to show the dish.
  return brandedPhoto(t, d.category);
}
// No photograph of the dish yet: nothing is drawn in its place (see dcard).
function brandedPhoto() { return ""; }
const tempPhotoFile = (id, w = 640) => new URL(`./assets/img/pratos-temp/${id}-${w}.jpg`, import.meta.url);
function tempPhoto(t, id, name) {
  const src = `/assets/img/pratos-temp/${id}-640.jpg`;
  const big = existsSync(tempPhotoFile(id, 1080));
  return `<figure class="media dish-photo is-placeholder" data-ph="${esc(t.common.placeholderImage)}"><img src="${src}"${big ? ` srcset="${src} 640w, /assets/img/pratos-temp/${id}-1080.jpg 1080w" sizes="(min-width: 1200px) 22vw, (min-width: 600px) 45vw, 30vw"` : ""} alt="${esc(fmt(t.order.tempAlt, { name }))}" width="640" height="480" loading="lazy" decoding="async"></figure>`;
}

// A menu dish as a visual card: photograph, name, price. Everything else (description, the order button) lives in the dish dialog, which
// assets/js/order.js fills from the <template> below when the card is opened. The name is the one real control (a button stretched
// over the whole card), so the card is a single focus stop. `opts.tag`/`opts.provisional` serve the drinks.
const cardPrice = (t, d) => {
  const sized = sizePriced(d);
  if (sized) {
    const prices = sized.choices.map((c) => c.price).filter((p) => p != null);
    const lo = Math.min(...prices), hi = Math.max(...prices);
    return lo === hi ? money(lo) : `${money(lo)}–${money(hi)}`;
  }
  return d.price != null ? money(d.price) : esc(t.common.priceTbc);
};
// One dish of the menu, set like a line of a printed menu: name, leader and price on one line, the description under them, the order
// button. A photograph appears only when it is the restaurant's own (dishPhoto); there is no stand-in and no empty frame.
function dcard(t, { name, search, photo, priceHtml, desc = "", tag = "", note = "", add = "", badges = [], off = false }) {
  return `<article class="dline${off ? " is-off" : ""}${photo ? " has-photo" : ""}" data-dish data-search="${esc(search)}">
      ${photo ? `<div class="dl-photo">${photo}</div>` : ""}
      <div class="dl-body">
        <div class="dl-head"><h3 class="dl-name">${esc(name)}</h3><i class="dl-leader" aria-hidden="true"></i><p class="dl-price">${priceHtml}</p></div>
        ${badges.length ? `<ul class="dl-badges">${badges.map((b) => `<li class="${esc(b[0])}">${esc(b[1])}</li>`).join("")}</ul>` : ""}
        ${tag ? `<p class="dl-tag">${esc(tag)}</p>` : ""}
        ${desc ? `<p class="dl-desc">${esc(desc)}</p>` : ""}
        ${note ? `<p class="dl-note">${esc(note)}</p>` : ""}
      </div>
      ${add}
    </article>`;
}

// One dish of the menu. \`image\` stays empty until the restaurant has a real photo of that dish: a card without a picture beats a
// picture of another dish. Descriptions are the ones in menu.mjs; a dish without one simply has none in its dialog.
function dishCard(t, d) {
  const L = t.lang;
  const O = t.order;
  const cat = categories.find((c) => c.id === d.category);
  const search = normalize([d.name, d.description?.en, d.description?.pt, cat.name.en, cat.name.pt].filter(Boolean).join(" "));
  const verb = d.options.length ? O.choose : O.add;
  // Verified labels only: "Vegetarian" comes from the menu's own Vegetarian section or an explicit `diet` entry; specials and unavailable
  // dishes are flags in menu.mjs. Nothing is inferred from a dish name, and allergens are only ever shown when listed in `allergens`.
  const diet = new Set([...(d.diet || []), ...(d.category === "vegetarian" ? ["vegetarian"] : [])]);
  const badges = [
    ...(d.special && d.available !== false ? [["is-special", O.special]] : []),
    ...(d.available === false ? [["is-off", O.unavailable]] : []),
    ...["vegetarian", "vegan", "spicy", "seafood"].filter((k) => diet.has(k)).map((k) => ["is-diet", O.diet[k]]),
    ...(d.allergens && d.allergens.length ? [["is-allergen", fmt(O.allergens, { list: d.allergens.map((a) => a[L] || a).join(", ") })]] : []),
  ];
  return dcard(t, {
    badges, off: d.available === false,
    id: d.id, name: d.name, search, photo: dishPhoto(t, d),
    priceHtml: `<b class="${canOrder(d) ? "" : "is-tbc"}">${cardPrice(t, d)}</b>`,
    priceFull: dishPrice(t, d),
    desc: d.description ? d.description[L] : "",
    add: canOrder(d) ? `<button class="d-add" type="button" data-add="${d.id}" aria-label="${esc(verb)}: ${esc(d.name)}"><span data-add-label>${icon("plus")}<span>${esc(verb)}</span></span></button>` : "",
  });
}

// The drinks (src/data/sample-drinks.mjs): photograph, name and a PROVISIONAL price. The restaurant has not sent its drinks list, so
// every name and price here is an estimate to be validated by Carlos (docs/PRECOS-PROVISORIOS-BEBIDAS.md is generated by the build and
// lists them all). They are labelled "provisional price" on the card's dialog and cannot be added to an order. Shown only while
// site.showSamples is true and the menu has no real drinks.
function sampleDrinksSection(t, cat) {
  const L = t.lang;
  const O = t.order;
  const order = Object.keys(cat.groups);
  const list = [...sampleDrinks].sort((a, b) => order.indexOf(a.group) - order.indexOf(b.group));
  const groups = `<div class="menu-grid is-samples">${list.map((d) => dcard(t, {
    id: d.id, name: d.name[L],
    search: normalize(d.name.pt + " " + d.name.en + " " + cat.name.pt + " " + cat.name.en),
    photo: site.dishPhotos.showIllustrative && existsSync(tempPhotoFile(d.id)) ? tempPhoto(t, d.id, d.name[L]) : brandedPhoto(t, "drinks"),
    priceHtml: `<b>${money(d.price)}</b>`,
    priceFull: money(d.price),
    tag: cat.groups[d.group] && cat.groups[d.group][L] !== d.name[L] ? cat.groups[d.group][L] : "",
    note: O.provisionalNote,
  })).join("")}</div>`;
  return `<section class="menu-cat" id="cat-${cat.id}" data-cat="${cat.id}" aria-labelledby="cat-${cat.id}-title">
      <header class="menu-cat-head"><h3 id="cat-${cat.id}-title">${esc(cat.name[L])}</h3><p>${esc(O.sampleNote)}</p></header>
      ${groups}
    </section>`;
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
  const count = (c) => items.filter((d) => d.category === c.id).length;
  const nav = `<li><button type="button" class="mf-opt" data-cat-filter="all" aria-pressed="true"><span>${esc(O.filterAll)}</span></button></li>` + shown.map((c) => `<li><button type="button" class="mf-opt" data-cat-filter="${c.id}" aria-pressed="false"><span>${esc(c.name[L])}</span>${count(c) ? `<small>${count(c)}</small>` : ""}</button></li>`).join("");
  const bar = shown.map((c) => `<li><a href="#cat-${c.id}" data-cat-link="${c.id}"><span>${esc(c.name[L])}</span>${count(c) ? `<small>${count(c)}</small>` : ""}</a></li>`).join("");
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
  <div class="wrap menu-intro">
    <div class="mi-head">
      <h2 id="menu-title" class="mi-title">${esc(t.restaurant.menuTitle)}</h2>
      <p class="mi-lead">${esc(t.restaurant.menuLead)}</p>
    </div>
    <div class="mi-notes">
      <p class="menu-note">${esc(menuNote[L])}</p>
      <p class="dine-in">${icon("cutlery")}<span>${esc(O.dineIn)}</span></p>
      <p class="menu-note is-allergy">${esc(O.allergyNote)}</p>
    </div>
  </div>
  <div class="wrap menu-layout">
    <aside class="menu-side">
      <div class="menu-tools">
        <div class="menu-search">
          <label for="menu-search"><span class="sr-only">${esc(O.searchLabel)}</span>${icon("search")}</label>
          <input id="menu-search" type="search" placeholder="${esc(O.searchPlaceholder)}" autocomplete="off" enterkeyhint="search" data-menu-search>
          <button class="icon-btn" type="button" hidden data-menu-clear aria-label="${esc(O.clearSearch)}">${icon("close")}</button>
        </div>
        <div class="menu-filter" data-mf>
          <button class="mf-clear" type="button" hidden data-mf-clear aria-label="${esc(O.filterClear)}"><span data-mf-current></span>${icon("close")}</button>
          <button class="mf-btn" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="mf-panel" data-mf-btn>${esc(O.filter)}${icon("down")}</button>
          <div class="mf-panel" id="mf-panel" role="group" aria-label="${esc(O.filterBy)}" data-mf-panel hidden><ul>${nav}</ul></div>
        </div>
      </div>
      <nav class="menu-nav" aria-label="${esc(O.categories)}" data-menu-nav><ul>${bar}</ul></nav>
    </aside>
    <div class="menu-body">
      <p class="sr-only" role="status" aria-live="polite" data-menu-status></p>
      ${sections}
      <p class="menu-empty" hidden data-menu-empty></p>
    </div>
  </div>
</section>`;
}

function infoGrid(t) {
  const L = t.lang;
  const h = t.home.location;
  const hours = site.restaurantHours.length ? site.restaurantHours.map((x) => `${x.days[L]} ${x.hours}`).join(" · ") : null;
  return `<dl class="info-grid"${rv(160)}>
    <div>${icon("pin")}<dt>${esc(h.address)}</dt><dd>${site.address.street ? `${esc(site.address.street)}<br>${esc(site.address.district[L])}<br>` : `${esc(site.address.locality)}, `}${esc(site.address.region)}, ${esc(site.address.country)}</dd></div>
    ${hours ? `<div>${icon("clock")}<dt>${esc(h.hours)}</dt><dd>${esc(h.restaurant)}: ${esc(hours)}${site.receptionHours ? `<br>${esc(h.reception)}: ${esc(site.receptionHours[L])}` : ""}</dd></div>` : ""}
    ${site.whatsapp ? `<div>${icon("whatsapp")}<dt>${esc(t.common.whatsapp)}</dt><dd><a href="${waLink(t.form.waHello)}" target="_blank" rel="noopener">${esc(fmtPhone(site.whatsapp))}</a></dd></div>` : ""}
    ${site.email ? `<div>${icon("mail")}<dt>${esc(t.common.email)}</dt><dd><a href="mailto:${esc(site.email)}">${esc(site.email)}</a></dd></div>` : ""}
  </dl>`;
}

// FAQ: answers come only from what is confirmed on the site (hours and the phone number are read from site.mjs).
const faqFill = (t, a) => {
  const hours = site.restaurantHours.map((h) => `${h.days[t.lang]} ${h.hours}`).join(" · ");
  const price = [...new Set(rooms.map((r) => r.price).filter(Boolean))].join(" / ") || t.common.priceTbc;
  return a.replace("{hours}", hours || t.common.hoursTbc).replace("{price}", price).replace("{phone}", site.whatsapp ? fmtPhone(site.whatsapp) : "");
};
const faqAll = (t) => t.faq.cats.flatMap((c) => c.items);
function faqBlock(t) {
  return `<div class="faq">${t.faq.cats
    .map((c) => `<section class="faq-cat" aria-label="${esc(c.name)}"><h3 class="faq-cat-title">${esc(c.name)}</h3>${c.items
      .map((it) => `<details><summary><span>${esc(it.q)}</span>${icon("plus")}</summary><div class="faq-a"><p>${esc(faqFill(t, it.a))}</p></div></details>`)
      .join("")}</section>`)
    .join("")}</div>`;
}

const faqLd = (t) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqAll(t).map((it) => ({ "@type": "Question", name: it.q, acceptedAnswer: { "@type": "Answer", text: faqFill(t, it.a) } })),
});


// ================= HOME =================
// The homepage is one day at the coast, told in sections that each have their own composition:
// the hero, a diptych that sends people to eat or to sleep, the menu, a slow breakfast, rooms that open
// like an accordion, a day that changes colour as you scroll, culture on terracotta, and a real map.


const mapQuery = () => (site.geo ? `${site.geo.lat},${site.geo.lng}` : site.mapQuery);
// Embedded maps search the place name: checked on 5 Nov 2026 that its pin falls exactly on the official coordinates,
// and the name adds Google's own label and card, so Lauhata is identifiable at a glance. Zoom 15: the coast and the town.
// The Google map loads only when the visitor asks for it: no empty grey box while a third-party frame loads, no Google request on
// every visit, and the "open in Google Maps" link works straight away. Behaviour in assets/js/main.js ([data-map-facade]).
function mapFacade(t, cls = "") {
  return `<div class="map-frame map-facade ${cls}" data-map-facade data-src="${esc(mapEmbed())}" data-title="${esc(t.location.mapTitle)}">
      ${figure(t, "aerialTop", { sizes: "(min-width: 900px) 60vw, 100vw", decorative: true, cls: "mf-photo" })}
      <div class="mf-inner">
        <p class="mf-place">${icon("pin")}<span>Lauhata · ${esc(site.address.region)}, ${esc(site.address.country)}</span></p>
        <div class="mf-actions">
          <button class="btn btn-terra" type="button" data-map-load>${esc(t.location.mapLoad)}</button>
          <a class="text-link on-dark" href="${mapsLink()}" target="_blank" rel="noopener">${esc(t.common.openMaps)}${icon("arrow-up-right")}</a>
        </div>
        <p class="mf-note">${esc(t.location.mapNote)}</p>
      </div>
    </div>`;
}
const mapEmbed = () => `https://www.google.com/maps?q=${encodeURIComponent(site.mapQuery)}&z=15&output=embed`;
const directionsLink = () => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapQuery())}`;



// A day at Lauhata, as a cinema scene: one pinned full-screen stage; as the page scrolls the picture changes from morning to
// dusk (the five real aerial frames, the camera rising as the day goes on) while the colour grade warms and darkens.
// Without JavaScript, with a failed script or without GSAP it is a plain list of five pictures with their text.
// The five moments are suggestions, not opening hours or guaranteed activities, and the section says so.






// The last invitation before the footer: the real aerial view of the coast, one line and the two separate actions
// (a room request and a table request), so it is clear which one each button starts.
function finalSection(t, key = "aerialCoast", { panel = false } = {}) {
  const F = t.land.final;
  const L = t.lang;
  const RS = t.land.resort;
  if (panel) {
    return `<section class="scene final-cta has-panel" id="momento" aria-labelledby="final-title">
  <div class="scene-media">${figure(t, key, { sizes: COVER, decorative: true })}</div>
  <div class="wrap scene-text fp-grid">
    <div class="fp-copy">
      <h2 id="final-title" class="scene-line final-line">${esc(F.line)}</h2>
      <p class="final-lead">${esc(F.lead)}</p>
      <a class="text-link on-dark" href="${href("contact", L)}">${esc(RS.ctaContact)}${icon("arrow")}</a>
    </div>
    <div class="fp-panel">
      <a class="fp-row is-primary" href="${href("contact", L)}" data-book-open="table"><span class="fp-ic">${icon("cutlery")}</span><span class="fp-tx"><strong>${esc(RS.panelTable[0])}</strong><small>${esc(RS.panelTable[1])}</small></span>${icon("arrow")}</a>
      <a class="fp-row" href="${href("contact", L)}" data-book-open="room"><span class="fp-ic">${icon("bed")}</span><span class="fp-tx"><strong>${esc(RS.panelRoom[0])}</strong><small>${esc(RS.panelRoom[1])}</small></span>${icon("arrow")}</a>
      <p class="fp-note">${esc(RS.panelNote)}</p>
    </div>
  </div>
</section>`;
  }
  return `<section class="scene final-cta" aria-labelledby="final-title">
  <div class="scene-media">${figure(t, key, { sizes: COVER, decorative: true })}</div>
  <div class="wrap scene-text">
    <p class="scene-note" data-fade>${esc(F.note)}</p>
    <h2 id="final-title" class="scene-line final-line" data-split>${esc(F.line)}</h2>
    <p class="final-lead" data-fade>${esc(F.lead)}</p>
    <div class="btn-row" data-fade>
      <a class="btn btn-terra btn-lg" href="${href("contact", L)}" data-book-open="room">${esc(F.stay)}${icon("arrow")}</a>
      <a class="btn btn-ghost-light btn-lg" href="${href("contact", L)}" data-book-open="table">${esc(F.eat)}</a>
      <a class="text-link on-dark" href="${href("contact", L)}">${esc(t.land.resort.ctaContact)}${icon("arrow")}</a>
    </div>
  </div>
</section>`;
}

// ================= HOME: hero, a short introduction, Comer & Ficar, a look at who we are, the invitation =================



// Comer & Ficar: the two things Lauhata offers, as two photographic panels of different weight with an ampersand
// between them. Each whole panel is one link. The photos are keys here so the restaurant's and the rooms' own
// photographs can replace the illustrative ones in one place (they keep their "Illustrative image" tag until then).

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
  const scoreCards = platforms.map((k) => `<a class="rv-score rv-${k}" href="${esc(P[k].url)}" target="_blank" rel="noopener">
        <span class="rv-plat">${esc(R.platforms[k])}</span>
        <span class="rv-num">${esc(num(P[k].rating))}<small>${esc(fmt(R.outOf, { scale: P[k].scale }))}</small></span>
        ${meter(k)}
        <span class="rv-word">${esc(R.scoreWord[k])} · ${esc(fmt(R.countLong, { count: P[k].count }))}</span>
        <span class="rv-go">${esc(R.readAll)}${icon("arrow-up-right")}</span>
      </a>`).join("");
  const ownCard = `<button type="button" class="rv-score rv-own-card" data-open-feedback aria-haspopup="dialog" aria-controls="rv-form">
        <span class="rv-plat">${esc(t.land.resort.rvOwnTitle)}</span>
        <span class="rv-num rv-own-line">${esc(t.land.resort.rvOwnBody)}</span>
        <span class="rv-go">${esc(t.land.resort.rvOwnCta)}${icon("arrow")}</span>
      </button>`;
  const scores = scoreCards + ownCard;
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
  return `<section class="section reviews-ed" id="opinioes" aria-labelledby="rv-title">
  <div class="wrap">
    <header class="rv-head">
      <div class="rv-head-text">
        <h2 id="rv-title" class="rv-title" data-split>${esc(R.title)}</h2>
      </div>
      ${scores ? `<div class="rv-scores-wrap"><div class="rv-scores">${scores}</div>${checkedDates.length ? `<p class="rv-checked">${esc(fmt(R.checked, { date: checkedDates.map(longDate).join(", ") }))}</p>` : ""}</div>` : `<div class="rv-badge">${tripadvisorBadge(t, "is-large")}</div>`}
    </header>
  </div>
  ${list ? `<div class="wrap"><div class="rv-own">${list}</div></div>` : ""}
</section>
<dialog class="fb-dialog" id="rv-form" aria-labelledby="fb-title" data-fb-dialog>
  <header class="fb-head"><h2 id="fb-title">${esc(t.land.resort.rvOwnTitle)}</h2><button class="icon-btn" type="button" aria-label="${esc(t.common.close)}" data-fb-close>${icon("close")}</button></header>
  <p class="fb-lead">${esc(FB.lead)}</p>
  <form class="booking-form" data-booking="review" novalidate data-wa="${esc(FB.wa)}" data-err-name="${esc(FB.errors.name)}" data-err-rating="${esc(FB.errors.rating)}" data-err-text="${esc(FB.errors.text)}" data-err-consent="${esc(FB.errors.consent)}">
          <div class="form-grid">
            ${field({ id: "fb-name", name: "name", label: FB.name,  })}
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
</dialog>`;
}




export function about(t) {
  const L = t.lang;
  const A = t.land.aboutPage;
  const C = t.land.culture;
  const K = kitchenHours() || {};
  const bc = breadcrumbs(t, [{ name: t.nav.story, path: href("about", L) }]);
  const chapters = [
    ["eat", "restaurantBeach", href("restaurant", L), A.chapters.menu],
    ["stay", "stayWalkway", href("stay", L), A.chapters.suites],
    ["coast", "coastVillage", href("discover", L), A.chapters.discover],
  ];
  const body = `
${pageHero(t, { title: A.title, lead: t.home.statement, image: "beachFront", pos: "50% 62%", cls: "is-bright" })}

<section class="section st-what" aria-labelledby="ab-what-title">
  <div class="wrap st-what-grid">
    <div class="st-what-text">
      <h2 id="ab-what-title" class="ab-title">${esc(A.whatTitle)}</h2>
      <p class="st-lead">${esc(A.what)}</p>
      <p class="st-who">${esc(A.who)}</p>
    </div>
    <figure class="st-what-photo" data-tide>${figure(t, "seaCanoe", { sizes: "(min-width: 900px) 40vw, 92vw", credit: true })}</figure>
  </div>
</section>

<section class="section st-people" aria-labelledby="abc-people">
  <div class="wrap st-people-grid">
    <h2 id="abc-people" class="st-quote" data-split>${esc(C.title1)} ${esc(C.title2)} ${esc(C.titleAccent)}.</h2>
    <div>
      <p>${esc(C.body)}</p>
      <p>${esc(A.chapters.peopleBody)}</p>
      <a class="text-link on-dark" href="${href("home", L, "#opinioes")}">${esc(A.chapters.reviews)}</a>
    </div>
  </div>
</section>

<section class="st-chapters" aria-label="${esc(A.whatTitle)}">
  ${chapters.map(([k, img, link, label], i) => `<article class="stc stc-${k}${i % 2 ? " is-flip" : ""}" aria-labelledby="abc-${k}">
    <figure class="stc-media" data-tide>${figure(t, img, { sizes: "(min-width: 900px) 60vw, 100vw", cls: "drift" })}</figure>
    <div class="stc-text">
      <h2 id="abc-${k}" class="abc-title">${esc(A.chapters[k + "Title"])}</h2>
      <p>${esc(fmt(A.chapters[k + "Body"], K))}</p>
      <a class="text-link" href="${link}">${esc(label)}</a>
    </div>
  </article>`).join("")}
</section>

<section class="section st-facts" aria-labelledby="st-facts-title">
  <div class="wrap st-facts-grid">
    <div>
      <h2 id="st-facts-title" class="ab-title">${esc(A.valuesTitle)}</h2>
      <ul class="st-values">${C.themes.map(([h, p]) => `<li><h3>${esc(h)}</h3><p>${esc(p)}</p></li>`).join("")}</ul>
    </div>
    <div>
      <h3 class="h-small">${esc(A.factsTitle)}</h3>
      <dl class="room-sheet ab-facts">${A.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>
    </div>
  </div>
</section>`;
  return { page: "about", title: t.meta.about.title, description: t.meta.about.description, path: href("about", L), alt: href("about", other(L)), preload: "beachFront", hero: true, ld: [bc.ld], body };
}

// No calendar, packages, capacities or prices are published: none have been confirmed. The page shows the setting, the occasions people can
// suggest and how an enquiry becomes an event; the request goes through the same WhatsApp hand-off as the other forms (data-booking="event").
export function events(t) {
  const L = t.lang;
  const E = t.land.eventsPage;
  const bc = breadcrumbs(t, [{ name: t.nav.events, path: href("events", L) }]);
  const body = `
${pageHero(t, { title: E.title, lead: E.lead, image: "sunsetPalms", pos: "50% 40%", ctas: `<div class="btn-row"><a class="btn btn-terra btn-lg" href="#pedido">${esc(t.land.resort.ctaEvent)}</a></div>` })}

<section class="section xe-kinds" aria-labelledby="ev-types-title">
  <div class="wrap xe-grid">
    <div class="xe-copy">
      <h2 id="ev-types-title" class="pv-title">${esc(E.typesTitle)}</h2>
      <p class="pv-body">${esc(E.typesLead)}</p>
    </div>
    <ul class="xe-list">${E.kinds.slice(0, -1).map((k) => `<li><a href="#pedido" data-event-kind="${esc(k)}"><span>${esc(k)}</span>${icon("arrow")}</a></li>`).join("")}</ul>
  </div>
</section>

<section class="xe-band" aria-hidden="true"><figure data-tide>${figure(t, "beachFront", { sizes: "100vw", decorative: true, cls: "drift" })}</figure></section>

<section class="section xe-how" aria-labelledby="ev-how-title">
  <div class="wrap">
    <h2 id="ev-how-title" class="pv-title">${esc(E.howTitle)}</h2>
    <ol class="xe-steps">${E.steps.map(([h, p]) => `<li><h3>${esc(h)}</h3><p>${esc(p)}</p></li>`).join("")}</ol>
  </div>
</section>

<section class="section booking ev-form" id="pedido" aria-labelledby="ev-form-title">
  <div class="wrap booking-grid">
    <div>
      ${heading({ title: E.formTitle, id: "ev-form-title" })}
      <p class="body-text">${esc(E.formLead)}</p>
      <p class="ev-expect">${esc(E.expect)}</p>
    </div>
    <div class="form-card">
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

// The event enquiry: one short form, five fields (occasion, preferred date, alternative date, preferred time, guests). Sending
// checks the fields, prepares the WhatsApp message and opens Lauhata's chat; the planning is done there, with Carlos.
function eventForm(t) {
  const E = t.land.eventsPage;
  const S = E.short;
  const kinds = E.kinds.map((o) => `<option>${esc(o)}</option>`).join("");
  return `<form class="booking-form ev-short" data-booking="event" data-short data-wa="${esc(S.wa)}" data-alt-label="${esc(S.altLabel)}" novalidate>
    <div class="form-grid">
      ${field({ id: "ev-kind", name: "kind", label: S.occasion, control: `<select data-pick="select" data-icon="star">${kinds}</select>`, full: true })}
      ${field({ id: "ev-date", name: "date", type: "date", label: S.date, attrs: 'required data-pick="date"' })}
      ${field({ id: "ev-alt", name: "altDate", type: "date", label: S.altDate, optional: t.form.optional, attrs: 'data-pick="date"' })}
      ${field({ id: "ev-time", name: "time", label: S.time, control: `<select data-pick="time" required>${timeOptions(t, { placeholder: t.pick.chooseTime })}</select>` })}
      ${field({ id: "ev-people", name: "people", type: "number", label: S.guests, attrs: `required min="1" max="300" value="10" inputmode="numeric" data-pick="number" data-unit-one="${esc(t.home.quick.person)}" data-unit-many="${esc(t.home.quick.persons)}"` })}
    </div>
    <div class="form-errors" role="alert" hidden data-form-errors>${esc(t.form.errorsTitle)}</div>
    <div class="form-actions"><button class="btn btn-terra btn-lg" type="submit">${icon("whatsapp")}<span data-submit-label>${esc(S.submit)}</span></button></div>
    <p class="form-note">${esc(S.note)}</p>
  </form>`;
}

// Real photographs only (placeholder: false, with a `group` in images.mjs), told as four short chapters. Near-identical aerial views are
// left out (`hide: true`). Each row of a chapter is a fixed composition, so nothing is left as an orphan; every photo opens in the lightbox.
export function gallery(t) {
  const L = t.lang;
  const G = t.land.galleryPage;
  const bc = breadcrumbs(t, [{ name: t.nav.gallery, path: href("gallery", L) }]);
  const inGroup = (g) => Object.keys(images).filter((k) => !images[k].placeholder && !images[k].hide && images[k].group === g);
  const groups = Object.entries(G.groups).map(([g, title]) => [g, title, inGroup(g)]).filter(([, , ks]) => ks.length);
  const filters = `<div class="gx-filters" role="group" aria-label="${esc(G.filterLabel)}"><button type="button" class="gx-filter" aria-pressed="true" data-filter="all">${esc(G.all)}</button>${groups
    .map(([g, title]) => `<button type="button" class="gx-filter" aria-pressed="false" data-filter="${g}">${esc(title)}</button>`)
    .join("")}</div>`;
  const body = `
${pageHero(t, { title: G.title, lead: G.lead, image: "seaCanoe", pos: "50% 50%", cls: "is-bright" })}

<section class="section gallery-real gx" aria-label="${esc(G.eyebrow)}" data-gallery data-mosaic>
  <div class="wrap">${filters}
  ${groups.map(([g, title, ks]) => `<section class="gc gc-${g} gc-n${ks.length}" aria-labelledby="gc-${g}">
    <header class="gc-head" data-group="${g}"><h2 id="gc-${g}" class="gc-title">${esc(title)}</h2><p>${esc(G.groupLeads[g])}</p></header>
    <ul class="gc-grid">${ks.map((k) => `<li class="gx-tile" data-group="${g}" data-tide><a class="gr-link" href="${imgUrl(k, 1600)}" data-lb-src="${imgUrl(k, 1600)}" aria-label="${esc(fmt(t.land.gallery.open, { alt: images[k].alt[L] }))}">${figure(t, k, { sizes: "(min-width: 900px) 58vw, 100vw" })}</a><p class="gx-cap">${esc(images[k].alt[L])}</p></li>`).join("")}</ul>
  </section>`).join("")}</div>
</section>`;
  return { page: "gallery", title: t.meta.gallery.title, description: t.meta.gallery.description, path: href("gallery", L), alt: href("gallery", other(L)), preload: "seaCanoe", hero: true, ld: [bc.ld], body };
}

// Discover shows three places (Nov 2026), each with a photo, in the order of discoverPage.places: Maubara Fort (Commons,
// illustrative), Aipelo prison ruins (Lauhata's own drone photo), Liquiçá town centre (Commons, illustrative).
const PLACE_PHOTOS = ["placeMaubaraFort", "ruinsAerial", "placeLiquicaCentre"];

// Every place and fact comes from the official tourism site (timorleste.tl, Liquiçá municipality page), credited on the page. The coast line
// is drawn from official coordinates and says its distances are straight lines. Lauhata does not run these visits.
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
  // The coast as a line, west on the left and east on the right: Lauhata and every place that has official coordinates, set by longitude.
  const stops = [...D.places.filter((p) => p.geo).map((p) => ({ name: p.name, lng: p.geo[1], km: km(p.geo) })), { name: "Lauhata", lng: site.geo.lng, here: true }].sort((a, b) => a.lng - b.lng);
  const lo = stops[0].lng, hi = stops[stops.length - 1].lng;
  const coast = `<figure class="dl-coast" aria-labelledby="coast-title">
      <h2 id="coast-title" class="dl-coast-title">${esc(D.coastTitle)}</h2>
      <ol>${[...stops].reverse().map((s) => `<li class="${s.here ? "is-here" : ""}" style="--x:${(((s.lng - lo) / (hi - lo)) * 100).toFixed(1)}%"><b>${esc(s.name)}</b><span>${s.here ? esc(D.here) : `${s.km} km`}</span></li>`).join("")}</ol>
      <figcaption>${esc(D.coastNote)}</figcaption>
    </figure>`;
  const body = `
${pageHero(t, { title: D.title, lead: D.lead, image: "coastMountains", pos: "50% 60%", cls: "is-bright" })}

<section class="section dsc-intro" aria-labelledby="dsc-intro-title">
  <div class="wrap">
    <div class="dsc-intro-grid">
      <h2 id="dsc-intro-title" class="ab-title">${esc(D.introTitle)}</h2>
      <p class="st-lead">${esc(D.intro)}</p>
    </div>
    ${coast}
  </div>
</section>

<section class="section dsc-places" aria-labelledby="dsc-places-title">
  <div class="wrap"><h2 id="dsc-places-title" class="ab-title">${esc(D.placesTitle)}</h2></div>
  <div class="dg">${D.places.map((p, i) => `<article class="dg-place dg-${i}" aria-labelledby="dg-${i}">
    <figure class="dg-media" data-tide>${figure(t, PLACE_PHOTOS[i], { sizes: "(min-width: 900px) 60vw, 100vw", credit: true })}</figure>
    <div class="dg-text">
      <h3 id="dg-${i}">${esc(p.name)}</h3>
      <p>${esc(p.text)}</p>
      ${km(p.geo) != null ? `<p class="dsc-km">${esc(fmt(D.distance, { km: km(p.geo) }))}</p>` : ""}
      <a class="text-link" href="${p.geo ? maps(p.geo.join(",")) : maps(p.map)}" target="_blank" rel="noopener" aria-label="${esc(D.mapLink)}: ${esc(p.name)}">${esc(D.mapLink)}</a>
    </div>
  </article>`).join("")}</div>
</section>

<section class="section dsc-advice" aria-labelledby="dsc-adv-title">
  <div class="wrap dsc-adv-grid">
    <div>
      <h2 id="dsc-adv-title" class="ab-title">${esc(D.adviceTitle)}</h2>
      <ul class="dsc-advice-list">${D.advice.map((a) => `<li>${esc(a)}</li>`).join("")}</ul>
      <p class="dsc-source"><a href="https://timorleste.tl/destinations/municipalities/liquica" target="_blank" rel="noopener">${esc(D.source)}</a></p>
      <a class="btn btn-terra btn-lg" href="${href("stay", L)}">${esc(D.cta)}</a>
    </div>
    <div>
      ${mapFacade(t, "dsc-map-frame")}
      <p class="dsc-source">${esc(D.geoSource)}</p>
    </div>
  </div>
</section>`;
  return { page: "discover", title: t.meta.discover.title, description: t.meta.discover.description, path: href("discover", L), alt: href("discover", other(L)), preload: "coastMountains", hero: true, ld: [bc.ld], body };
}



export function home(t) {
  const L = t.lang;
  const LD = t.land;
  const RS = LD.resort;
  const K = kitchenHours() || {};
  // From the kitchen: a PROVISIONAL editorial selection for variety (NOT best-sellers: there are no sales data; confirm with Carlos).
  // Names, texts and prices come from menu.mjs only.
  const fdIds = ["grilled-fish", "saute-prawns", "lauhata-special-fried-rice", "steak-bitoque", "satay-main", "chicken-curry", "tom-yum-prawns", "grilled-chicken"];
  const fd = fdIds.map((id) => items.find((d) => d.id === id)).filter(Boolean);
  const fdDish = (d) => `<li class="kt-dish">
      <div class="dl-head"><h3 class="dl-name">${esc(d.name)}</h3><i class="dl-leader" aria-hidden="true"></i><p class="dl-price"><b>${cardPrice(t, d)}</b></p></div>
      ${d.description ? `<p class="dl-desc">${esc(d.description[L])}</p>` : ""}
      ${canOrder(d) ? `<button class="d-add kt-add" type="button" data-add="${d.id}" aria-label="${esc(d.options.length ? t.order.choose : RS.fdAdd)}: ${esc(d.name)}"><span data-add-label>${icon("plus")}<span>${esc(d.options.length ? t.order.choose : RS.fdAdd)}</span></span></button>` : ""}
    </li>`;
  const door = (page, key, i) => `<a class="we-door" href="${href(page, L)}">
      <span class="we-media" data-tide>${figure(t, key, { sizes: "(min-width: 1100px) 26vw, (min-width: 700px) 30vw, 38vw", decorative: true, cls: "drift" })}</span>
      <span class="we-body"><strong>${esc(RS.wlCards[i][0])}</strong><span>${esc(RS.wlCards[i][1])}</span><span class="we-go">${esc(RS.wlCards[i][2])}</span></span>
    </a>`;
  const hoursLine = site.restaurantHours.map((h) => `${esc(h.days[L])} <b>${esc(h.hours)}</b>`).join('<i aria-hidden="true">, </i>');
  const kinds = LD.eventsPage.kinds.slice(0, 4);
  const body = `
<section class="cine-hero hx rs-hero" aria-labelledby="hero-title" data-hero>
  <div class="hx-bg">${figure(t, "heroFilmCover", { eager: true, sizes: "100vw", decorative: false, art: [{ key: "heroPortrait", media: "(max-width: 860px) and (orientation: portrait)" }] })}
    ${site.heroVideo ? `<video class="hx-video" muted loop playsinline preload="none" disablepictureinpicture aria-hidden="true" tabindex="-1" data-hero-video data-src="${esc(site.heroVideo)}"></video>` : ""}</div>
  <div class="hx-shade" aria-hidden="true"></div>
  <div class="wrap cine-content hx-content rs-hero-grid">
    <div class="rs-hero-text">
      <h1 id="hero-title" class="cine-title hx-title" data-split><span class="line">${esc(RS.heroTitle)}</span> <span class="line">${esc(RS.heroAccent)}</span></h1>
      <p class="hx-line" data-fade style="--d:420ms">${esc(RS.heroLine)}</p>
      <div class="hx-cta" data-fade style="--d:560ms"><a class="btn btn-terra btn-lg" href="${href("contact", L)}" data-book-open="table">${esc(t.home.hero.ctaTable)}</a><a class="btn btn-ghost-light btn-lg" href="${href("contact", L)}" data-book-open="room">${esc(t.home.hero.ctaRoom)}</a></div>
    </div>
  </div>
  <div class="hx-scroll" aria-hidden="true" data-hx-scroll><i></i></div>
  ${site.heroVideo ? `<button class="hx-toggle" type="button" hidden data-hero-toggle data-pause="${esc(RS.filmPause)}" data-play="${esc(RS.filmPlay)}" aria-label="${esc(RS.filmPause)}">${icon("pause")}${icon("play")}</button>` : ""}
</section>

<section class="section we" id="bem-vindo" aria-labelledby="wl-title">
  <div class="wrap we-grid">
    <div class="we-intro">
      <h2 id="wl-title" class="we-title" data-split>${esc(RS.wlTitle)}</h2>
      <p class="we-lead">${esc(RS.wlBody)}</p>
      <a class="text-link" href="${href("about", L)}">${esc(RS.wlCta)}</a>
      <p class="wl-meta"><span class="wm">${icon("pin")}<span>${esc(t.land.beach.place)}</span></span>${hoursLine ? `<span class="wm">${icon("clock")}<span>${hoursLine}</span></span>` : ""}</p>
    </div>
    ${door("restaurant", "restaurantBeach", 0)}${door("stay", "stayGarden", 1)}${door("events", "sunsetGarden", 2)}
  </div>
</section>

${daySection(t)}

<section class="section kt" id="cozinha" aria-labelledby="fd-title">
  <div class="wrap kt-grid">
    <div class="kt-intro">
      <h2 id="fd-title" class="pv-title">${esc(RS.fdTitle)}</h2>
      <p class="pv-body">${esc(RS.fdLead)}</p>
      ${hoursLine ? `<p class="tt-hours">${icon("clock")}<span>${hoursLine}</span></p>` : ""}
      <div class="pv-actions"><a class="btn btn-terra" href="${href("restaurant", L, "#ementa")}">${esc(RS.fdCta)}</a><a class="text-link" href="${href("contact", L)}" data-book-open="table">${esc(t.home.hero.ctaTable)}</a></div>
    </div>
    <ul class="kt-list">${fd.map(fdDish).join("")}</ul>
  </div>
</section>

<section class="section rq" id="quartos" aria-labelledby="stay-title">
  <div class="wrap">
    <div class="rq-head">
      <h2 id="stay-title" class="pv-title" data-split>${esc(RS.roomsTitle)}</h2>
      <p class="pv-body">${esc(RS.roomsLead)}</p>
    </div>
    ${roomPair(t)}
    <p class="rp-all"><a class="text-link" href="${href("stay", L)}">${esc(RS.roomsAll)}</a></p>
  </div>
</section>

<section class="xs" id="experiencias" aria-labelledby="ex-title">
  <figure class="xs-media">${figure(t, "sunsetSea", { sizes: COVER, cls: "drift" })}</figure>
  <div class="wrap xs-copy">
    <h2 id="ex-title" class="xs-title" data-split>${esc(RS.expTitle)}</h2>
    <p class="xs-lead">${esc(RS.expLead)}</p>
    <p class="xs-body">${esc(RS.xCards[1][1])}</p>
    <ul class="xs-kinds">${kinds.map((k) => `<li>${esc(k)}</li>`).join("")}</ul>
    <a class="btn btn-terra" href="${href("events", L, "#pedido")}">${esc(RS.ctaEvent)}</a>
  </div>
</section>

<section class="section ar" id="arredores" aria-labelledby="sx-title">
  <div class="wrap ar-grid">
    <div class="ar-copy">
      <h2 id="sx-title" class="pv-title" data-split>${esc(RS.dsTitle)}</h2>
      <p class="pv-body">${esc(LD.aboutPage.chapters.coastBody)}</p>
      <div class="pv-actions"><a class="btn btn-sea" href="${href("discover", L)}">${esc(t.nav.discover)}</a></div>
    </div>
    <figure class="ar-a" data-tide>${figure(t, "coastVillage", { sizes: "(min-width: 900px) 58vw, 100vw", credit: true, cls: "drift" })}</figure>
    <figure class="ar-b" data-tide>${figure(t, "seaCanoe", { sizes: "(min-width: 900px) 30vw, 60vw", credit: true })}</figure>
    <figure class="ar-c" data-tide>${figure(t, "ruinsAerial", { sizes: "(min-width: 900px) 40vw, 92vw", credit: true })}</figure>
  </div>
</section>

${reviewsSection(t)}

${finalSection(t, "coastMountains", { panel: true })}`;
  return {
    page: "home",
    title: t.meta.home.title,
    description: t.meta.home.description,
    path: href("home", L),
    alt: href("home", other(L)),
    preload: [
      { key: "heroFilmCover", sizes: "100vw", media: "not all and (max-width: 860px) and (orientation: portrait)" },
      { key: "heroPortrait", sizes: "100vw", media: "(max-width: 860px) and (orientation: portrait)" },
    ],
    hero: true,
    ld: [], // no FAQPage here: the questions are only visible on the contact page, and structured data must match what is shown
    menu: items,
    body,
  };
}

export function restaurant(t) {
  const L = t.lang;
  const bc = breadcrumbs(t, [{ name: t.nav.restaurant, path: href("restaurant", L) }]);
  const body = `
${pageHero(t, {
  title: t.home.two.restTitle,
  lead: t.home.two.restBody,
  image: "restaurantBeach",
  pos: "50% 42%",
  ctas: `<div class="btn-row"><a class="btn btn-terra btn-lg" href="${href("contact", L)}" data-book-open="table">${esc(t.home.hero.ctaTable)}</a><a class="btn btn-ghost-light btn-lg" href="#ementa">${esc(t.common.viewMenu)}</a></div>
  <p class="hero-hours">${icon("clock")}<span>${site.restaurantHours.length ? site.restaurantHours.map((h) => `${esc(h.days[L])} <b>${esc(h.hours)}</b>`).join('<i aria-hidden="true">, </i>') : esc(t.common.hoursTbc)}</span></p>`,
})}

${menuSection(t)}

${finalSection(t, "beachFront")}`;
  return {
    page: "restaurant",
    title: t.meta.restaurant.title,
    description: t.meta.restaurant.description,
    path: href("restaurant", L),
    alt: href("restaurant", other(L)),
    preload: "restaurantBeach",
    hero: true,
    menu: items,
    ld: [bc.ld],
    body,
  };
}

// ================= STAY: two large horizontal rooms, mirrored, each with its own photo gallery =================
// Photographs: the first three of each room (rooms.mjs); today they are illustrative pictures and say so on the picture. Each gallery
// is a scroll-snap strip with three progress bars on top (story-like: the active bar fills, then the next photograph shows; main.js).
// Facts: the price per night (rooms.mjs, $90), who it sleeps (the Queen & Single Room's children's ages are PENDING, flagged on the card)
// and the beds. What the whole accommodation offers is listed once below the two rooms (lodgingBlock).
function roomCompare(t) {
  const L = t.lang;
  const S = t.stay;
  const has = (r, en) => (r.amenities || []).some((a) => a.en === en);
  const cell = (v) => `<td>${v}</td>`;
  return `<div class="rs-compare-wrap">
    <table class="rs-compare">
      <caption>${esc(S.cmpTitle)}</caption>
      <thead><tr><td></td>${rooms.map((r) => `<th scope="col">${esc(r.name[L])}</th>`).join("")}</tr></thead>
      <tbody>
        <tr><th scope="row">${esc(S.cmpBeds)}</th>${rooms.map((r) => cell(esc(r.beds[L]))).join("")}</tr>
        <tr><th scope="row">${esc(S.cmpCapacity)}</th>${rooms.map((r) => cell(r.capacity ? esc(r.capacity[L]) : esc(S.cmpAsk))).join("")}</tr>
        <tr><th scope="row">${esc(S.cmpTv)}</th>${rooms.map((r) => cell(has(r, "Television") ? esc(S.cmpYes) : esc(S.cmpAsk))).join("")}</tr>
        <tr><th scope="row">${esc(S.cmpPrice)}</th>${rooms.map((r) => cell(r.price ? esc(r.price) : esc(t.common.priceTbc))).join("")}</tr>
      </tbody>
    </table>
    <p class="rs-compare-note">${esc(S.cmpNote)}</p>
  </div>`;
}

function roomShowcase(t) {
  const L = t.lang;
  const S = t.stay;
  return `<div class="rs-list">${rooms
    .map((r, i) => {
      const imgs = roomPhotos(r, 3);
      const real = hasInterior(r);
      const specs = [["users", r.capacity[L]], ...suiteAmenityItems(t, r)];
      const shot = (k, extra = "") => `<a class="rs-zoom ${extra}" href="${imgUrl(k, 1600)}" data-lb-src="${imgUrl(k, 1600)}" aria-label="${esc(fmt(t.land.gallery.open, { alt: images[k].alt[L] }))}">${figure(t, k, { sizes: extra ? "(min-width: 900px) 24vw, 50vw" : "(min-width: 900px) 56vw, 100vw" })}</a>`;
      // Interior photographs (images.mjs kind: "room", placeholder: false) bring the swipeable gallery; until then, the outside of the rooms.
      const media = real
        ? `<div class="rs-gallery" data-rg>
        <ul class="rs-track" data-gallery data-rg-track tabindex="0" aria-roledescription="carousel" aria-label="${esc(r.name[L])}">${imgs.map((k) => `<li class="rs-slide">${shot(k)}</li>`).join("")}</ul>
        ${imgs.length > 1 ? `<div class="rs-bars" role="group" aria-label="${esc(fmt(t.carousel.label, { room: r.name[L] }))}">${imgs.map((k, j) => `<button class="rs-bar" type="button" data-rg-bar aria-label="${esc(fmt(t.carousel.goTo, { n: j + 1, total: imgs.length }))}"><i></i></button>`).join("")}</div>
        <div class="rs-ctrl"><button class="kc-btn" type="button" data-rg-prev aria-label="${esc(t.carousel.prev)}">${icon("left")}</button><button class="kc-btn" type="button" data-rg-next aria-label="${esc(t.carousel.next)}">${icon("right")}</button></div>` : ""}
      </div>`
        : `<div class="rs-outside" data-gallery data-tide>${imgs.slice(0, 2).map((k, j) => shot(k, j ? "is-second" : "")).join("")}</div>`;
      return `<article class="rs-room${i % 2 ? " is-flip" : ""}" id="room-${r.id}" aria-labelledby="rs-${r.id}">
      ${media}
      <div class="rs-info">
        <h3 id="rs-${r.id}" class="rs-name">${esc(r.name[L])}</h3>
        <p class="rs-price"><strong>${esc(r.price || t.common.priceTbc)}</strong>${r.price ? `<span>${esc(t.home.rooms.night)}</span>` : ""}</p>
        <p class="rs-desc">${esc(r.description[L])}</p>
        <ul class="rs-feats">${specs.map(([ic, label]) => `<li>${icon(ic)}<span>${esc(label)}</span></li>`).join("")}</ul>
        ${r.capacityPending ? `<p class="rp-pending">${esc(S.capacityPending)}</p>` : ""}
        <div class="rs-actions"><a class="btn btn-terra" href="${href("contact", L)}" data-book-open="room" data-room-link="${r.id}">${esc(t.home.hero.ctaRoom)}</a><a class="text-link" href="${href("room:" + r.id, L)}">${esc(S.viewRoom)}</a></div>
      </div>
    </article>`;
    })
    .join("")}</div>
  ${rooms.every(hasInterior) ? "" : `<p class="rm-inside">${esc(S.insideNote)}</p>`}
  ${lodgingBlock(t)}`;
}

export function stay(t) {
  const L = t.lang;
  const bc = breadcrumbs(t, [{ name: t.nav.stay, path: href("stay", L) }]);
  const H = t.home.rooms;
  const body = `
${pageHero(t, {
  title: t.home.two.stayTitle,
  lead: t.home.two.stayBody,
  image: "stayVeranda",
  pos: "62% 55%",
  ctas: `<div class="btn-row"><a class="btn btn-terra btn-lg" href="${href("contact", L)}" data-book-open="room">${esc(t.home.hero.ctaRoom)}</a><a class="btn btn-ghost-light btn-lg" href="#quartos">${esc(t.home.two.stayLink)}</a></div>`,
})}

<section class="section rooms-stay" id="quartos" aria-labelledby="rooms-title">
  <div class="wrap">
    <div class="split-head">
      ${heading({ title: H.title, accent: H.titleAccent, id: "rooms-title" })}
      <p class="body-text">${esc(H.body)}</p>
    </div>
    ${roomShowcase(t)}
    ${roomCompare(t)}
  </div>
</section>

<section class="rs-place" aria-labelledby="rs-place-title">
  <figure class="rs-place-media">${figure(t, "aerialTop", { sizes: COVER, cls: "drift" })}</figure>
  <div class="wrap rs-place-text">
    <h2 id="rs-place-title" class="rs-place-title" data-split>${esc(t.stay.placeTitle)}</h2>
    <p>${esc(t.stay.placeLead)}</p>
    <a class="btn btn-terra" href="${href("contact", L)}" data-book-open="room">${esc(t.home.hero.ctaRoom)}</a>
  </div>
</section>`;
  return {
    page: "stay",
    title: t.meta.stay.title,
    description: t.meta.stay.description,
    path: href("stay", L),
    alt: href("stay", other(L)),
    preload: "stayVeranda",
    hero: true,
    ld: [bc.ld],
    body,
  };
}

export function room(t, r) {
  const L = t.lang;
  const name = r.name[L];
  const bc = breadcrumbs(t, [
    { name: t.nav.stay, path: href("stay", L) },
    { name, path: href("room:" + r.id, L) },
  ]);
  const H = t.home.rooms;
  const S = t.stay;
  // The room sheet shows only confirmed facts (rooms.mjs); the pending capacity is flagged where it appears.
  const row = (label, value) => `<div><dt>${esc(label)}</dt><dd>${value}</dd></div>`;
  const facts = [
    r.capacity ? row(S.roomCapacity, esc(r.capacity[L]) + (r.capacityPending ? ` <small class="rp-pending">${esc(S.capacityPending)}</small>` : "")) : "",
    r.beds ? row(S.roomBeds, esc(r.beds[L])) : "",
    r.suitability ? row(S.roomSuits, esc(r.suitability[L])) : "",
    r.amenities && r.amenities.length ? row(S.roomFeatures, r.amenities.map((f) => esc(f[L])).join(", ")) : "",
    site.stayTimes ? row(S.roomCheck, `${esc(S.checkIn)} ${esc(site.stayTimes.checkIn)}, ${esc(S.checkOut)} ${esc(site.stayTimes.checkOut)}`) : "",
    row(S.roomPrice, r.price ? `${esc(r.price)} <small>${esc(H.night)}</small>` : esc(t.common.priceTbc)),
  ].join("");
  const o = rooms[(rooms.findIndex((x) => x.id === r.id) + 1) % rooms.length];
  const ask = `<a class="btn btn-terra btn-lg" href="${href("contact", L)}" data-book-open="room" data-room-link="${r.id}">${esc(S.roomBook)}</a>`;
  const body = `
${pageHero(t, {
  title: name,
  lead: r.summary[L],
  image: roomPhotos(r)[0],
  decorative: true, // the same photo is the first slide of the carousel below, where it is described
  pos: "50% 34%",
  ctas: `<div class="btn-row">${ask}<a class="btn btn-ghost-light btn-lg" href="${waLink(fmt(t.land.suites.wa, { room: name }))}" target="_blank" rel="noopener">${icon("whatsapp")}${esc(t.common.whatsapp)}</a></div>`,
})}

<section class="section rv-sheet" aria-labelledby="sheet-title">
  <div class="wrap rv-sheet-grid">
    <div class="rv-sheet-main">
      <h2 id="sheet-title" class="ab-title">${esc(S.sheetTitle)}</h2>
      <p class="st-lead">${esc(r.description[L])}</p>
      <dl class="room-sheet">${facts}${row(S.bookLabel, esc(S.bookValue))}${row(S.payLabel, esc(S.payValue))}</dl>
    </div>
    <figure class="ss-plan">
      ${bedPlan(t, r)}
      <figcaption>${esc(S.bedPlan)}</figcaption>
    </figure>
  </div>
</section>

<section class="section room-photos" aria-label="${esc(fmt(t.carousel.label, { room: name }))}">
  <div class="wrap">${roomCarousel(t, r, { sizes: "(min-width: 900px) 78vw, 92vw", cls: "is-wide" })}
  ${hasInterior(r) ? "" : `<p class="rm-inside">${esc(S.insideNote)}</p>`}</div>
</section>

<section class="section rv-offer" aria-label="${esc(S.lodgingTitle)}">
  <div class="wrap">${lodgingBlock(t)}</div>
</section>

<section class="section suite-request" aria-labelledby="ask-title">
  <div class="wrap sr-grid">
    <div>
      <h2 id="ask-title" class="sr-title">${esc(S.askTitle)}</h2>
      <p>${esc(S.askBody)}</p>
      <p class="pay-note">${esc(t.stay.payNote)}</p>
      <div class="sr-actions">${ask}<a class="text-link" href="${waLink(fmt(t.land.suites.wa, { room: name }))}" target="_blank" rel="noopener">${esc(t.common.whatsapp)}</a></div>
    </div>
    <div class="sr-ask">
      <h3 class="ss-ask-title">${esc(S.askMoreTitle)}</h3>
      <ul class="ss-ask">${S.askMore.map((q) => `<li>${esc(q)}</li>`).join("")}</ul>
      <p class="ss-ask-note">${esc(S.askMoreNote)}</p>
    </div>
  </div>
</section>

<section class="rv-next" aria-labelledby="other-title">
  <a class="rv-next-link" href="${href("room:" + o.id, L)}">
    <figure class="rv-next-media">${figure(t, roomPhotos(o)[0], { sizes: "100vw", decorative: true })}</figure>
    <div class="wrap rv-next-copy"><h2 id="other-title">${esc(o.name[L])}</h2><p>${esc(o.summary[L])}</p><span class="rv-next-go">${esc(S.otherRooms)}</span></div>
  </a>
</section>`;
  return {
    page: "stay",
    title: fmt(t.meta.room.title, { room: name }),
    description: fmt(t.meta.room.description, { room: name }),
    path: href("room:" + r.id, L),
    alt: href("room:" + r.id, other(L)),
    preload: roomPhotos(r)[0],
    hero: true,
    ld: [bc.ld],
    body,
  };
}

export function contact(t) {
  const L = t.lang;
  const bc = breadcrumbs(t, [{ name: t.nav.contact, path: href("contact", L) }]);
  const phone = site.phone || site.whatsapp;
  const body = `
${pageHero(t, {
  title: t.home.location.title,
  accent: t.home.location.titleAccent,
  lead: t.home.location.body,
  image: "coastVillage",
  pos: "60% 50%",
  ctas: `<div class="btn-row"><a class="btn btn-terra btn-lg" href="${waLink(t.form.waHello)}" target="_blank" rel="noopener">${icon("whatsapp")}${esc(t.home.cta.wa)}</a><a class="btn btn-ghost-light btn-lg" href="${mapsLink()}" target="_blank" rel="noopener">${esc(t.common.openMaps)}</a></div>
  <ul class="hero-facts">${phone ? `<li>${icon("phone")}<a href="tel:+${esc(phone)}">${esc(fmtPhone(phone))}</a></li>` : ""}${site.restaurantHours.length ? `<li>${icon("clock")}<span>${site.restaurantHours.map((h) => `${esc(h.days[L])} <b>${esc(h.hours)}</b>`).join('<i aria-hidden="true">, </i>')}</span></li>` : ""}</ul>`,
})}

<section class="section booking contact-write" id="escrever" aria-labelledby="cw-title">
  <div class="wrap booking-grid">
    <div>
      ${heading({ title: t.land.contactForm.title, id: "cw-title" })}
      <p class="body-text">${esc(t.land.contactForm.lead)}</p>
      <p class="cw-shortcuts-lead">${esc(t.land.contactForm.shortcuts)}</p>
      <ul class="cw-shortcuts">
        <li><a href="${href("contact", L)}" data-book-open="table">${icon("cutlery")}<span>${esc(t.home.hero.ctaTable)}</span>${icon("arrow")}</a></li>
        <li><a href="${href("contact", L)}" data-book-open="room">${icon("bed")}<span>${esc(t.home.hero.ctaRoom)}</span>${icon("arrow")}</a></li>
        <li><a href="${href("events", L, "#pedido")}">${icon("users")}<span>${esc(t.land.eventsPage.formTitle)}</span>${icon("arrow")}</a></li>
      </ul>
    </div>
    <div class="form-card">${contactForm(t)}</div>
  </div>
</section>

<section class="section location" aria-labelledby="loc2-title">
  <div class="wrap location-grid">
    <div>
      ${heading({ title: t.location.title, id: "loc2-title" })}
      ${infoGrid(t)}
      <a class="text-link" href="${directionsLink()}" target="_blank" rel="noopener">${esc(t.footer.directions)}</a>
    </div>
    ${mapFacade(t)}
  </div>
</section>

<section class="section faq-section" id="faq" aria-labelledby="faq-title">
  <div class="wrap faq-grid">
    ${heading({ title: t.faq.title, id: "faq-title" })}
    ${faqBlock(t)}
  </div>
</section>
`;
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
    ${t.privacy.sections.map((s) => `<h2>${esc(s.h)}</h2><p>${esc(s.key === "stats" && site.gaId ? t.privacy.statsOn : s.p)}</p>`).join("")}
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
  const rows = Object.entries(credits).filter(([id, c]) => (c.file || site.dishPhotos.showIllustrative) && (c.file ? existsSync(new URL(`./assets/img/fotos/${c.file}-640.webp`, import.meta.url)) : existsSync(tempPhotoFile(id)) && !existsSync(new URL(`./assets/img/pratos/${id}-640.jpg`, import.meta.url))));
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
      <a class="btn btn-terra btn-lg" href="${href("home", L)}">${esc(t.notFound.home)}${icon("arrow")}</a>
      <a class="btn btn-outline btn-lg" href="${href("restaurant", L)}">${icon("cutlery")}${esc(t.notFound.restaurant)}</a>
      <a class="btn btn-outline btn-lg" href="${href("stay", L)}">${icon("bed")}${esc(t.notFound.stay)}</a>
    </div>
    <p class="nf-help">${esc(t.notFound.help)} <a class="text-link" href="${href("contact", L)}">${esc(t.nav.contact)}</a></p>
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

// A day at Lauhata, as a cinema scene: one pinned full-screen stage; as the page scrolls the picture changes from morning to night while
// the colour grade warms and darkens (cinema.js). Without JavaScript, with a failed script or without GSAP it is a plain list of three
// photographs with their text. The hours come from site.mjs; the Tetum greetings are lang="tet" and await a native reader.
const DAY_FRAMES = [
  { key: "stayWalkway", grade: "rgba(70, 120, 150, 0.12)", dim: 0 },
  { key: "beachFront", grade: "rgba(255, 246, 226, 0.08)", dim: 0 },
  { key: "sunsetPalmsHigh", grade: "rgba(232, 120, 42, 0.16)", dim: 0 },
];
// Opening and closing times of the kitchen, from site.restaurantHours ("08:00–10:00").
function kitchenHours() {
  const span = (h) => (h && String(h.hours).match(/(\d{1,2}:\d{2})\D+(\d{1,2}:\d{2})/)) || [];
  const [b, m] = site.restaurantHours.map(span);
  return b && m ? { breakfast: `${b[1]}–${b[2]}`, lunch: m[1], dinner: m[2], open: b[1], close: m[2] } : null;
}
function daySection(t) {
  const D = t.land.day;
  const K = kitchenHours();
  if (!K) return "";
  const steps = D.steps;
  const when = (s) => s.hours === "breakfast" ? K.breakfast : s.hours === "lunch" ? K.lunch : s.hours === "dinner" ? fmt(D.until, { t: K.dinner }) : s.time;
  return `<section class="day" id="dia" aria-labelledby="day-title" data-day>
  <div class="day-track"><div class="day-stage" data-day-stage>
    <header class="day-head">
      <h2 id="day-title" class="day-title">${esc(D.title)}</h2>
      <p class="day-lead">${esc(fmt(D.lead, K))}</p>
    </header>
    <ol class="day-steps">${steps
      .map((s, i) => `<li class="day-step" data-day-step data-grade="${DAY_FRAMES[i].grade}" data-dim="${DAY_FRAMES[i].dim}">
      ${figure(t, DAY_FRAMES[i].key, { sizes: COVER, cls: "day-frame", decorative: true })}
      <div class="day-copy">
        <p class="day-meta"><span class="day-time">${esc(when(s))}</span>${s.hello ? `<span class="day-hello" lang="tet">${esc(s.hello)}</span>` : ""}</p>
        <h3>${esc(s.t)}</h3>
        <p class="day-text">${esc(fmt(s.d, K))}</p>
      </div>
    </li>`)
      .join("")}</ol>
    <div class="day-grade" aria-hidden="true"></div>
    <div class="day-dim" aria-hidden="true"></div>
    <ol class="day-rail" aria-hidden="true">${steps.map((s) => `<li>${esc(when(s))}</li>`).join("")}<i class="day-rail-fill"></i></ol>
  </div></div>
</section>`;
}
