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

// Everything the accommodation offers, once, for both room types (rooms.mjs `lodgingAmenities`), in three short groups a guest can scan:
// the rooms, the table, the place. Plus the price rule.
function lodgingBlock(t, { note = true } = {}) {
  const L = t.lang;
  const groups = Object.entries(t.stay.offerGroups);
  return `<div class="of" role="group" aria-label="${esc(t.stay.lodgingTitle)}">
    <div class="of-head">
      <h3 class="of-title">${esc(t.stay.lodgingTitle)}</h3>
      ${note ? `<p class="of-note">${esc(t.stay.perNightNote)}</p>` : ""}
    </div>
    ${groups.map(([g, label]) => `<div class="of-group"><h4>${esc(label)}</h4><ul>${lodgingAmenities.filter((a) => a.group === g).map((a) => `<li>${icon(a.icon)}<span>${esc(a[L])}</span></li>`).join("")}</ul></div>`).join("")}
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

// The two room types on the home page: two identical cards. The rows of both cards share one grid (subgrid), so the photograph, the name,
// the description, the facts and the actions sit on the same lines whatever the text. The photographs are the outside of the rooms and the
// note under the cards says so.
function roomPair(t) {
  const L = t.lang;
  return `<div class="rc-grid">${rooms.map((r) => {
    const facts = [["users", r.capacity[L]], ["bed", r.beds[L]], ...(r.amenities || []).map((a) => [a.icon || AMEN_ICON[a.en] || "check", a[L]])];
    return `<article class="rc" aria-labelledby="rc-${r.id}">
      <a class="rc-media" href="${href("room:" + r.id, L)}" tabindex="-1" aria-hidden="true">${figure(t, roomPhotos(r)[0], { sizes: "(min-width: 720px) 46vw, 92vw" })}</a>
      <div class="rc-head">
        <h3 class="rc-name" id="rc-${r.id}">${esc(r.name[L])}</h3>
        <p class="rc-price"><strong>${esc(r.price || t.common.priceTbc)}</strong>${r.price ? `<span>${esc(t.home.rooms.night)}</span>` : ""}</p>
      </div>
      <p class="rc-desc">${esc(r.card[L])}</p>
      <ul class="rc-facts">${facts.map(([ic, label]) => `<li>${icon(ic)}<span>${esc(label)}</span></li>`).join("")}${r.capacityPending ? `<li class="rc-pending"><span>${esc(t.stay.capacityPending)}</span></li>` : ""}</ul>
      <div class="rc-actions"><a class="btn btn-terra" href="${href("contact", L)}" data-book-open="room" data-room-link="${r.id}" aria-label="${esc(t.home.hero.ctaRoom)}: ${esc(r.name[L])}">${esc(t.home.hero.ctaRoom)}</a><a class="btn btn-outline" href="${href("room:" + r.id, L)}" aria-label="${esc(t.stay.viewRoom)}: ${esc(r.name[L])}">${esc(t.stay.viewRoom)}</a></div>
    </article>`;
  }).join("")}</div>
  <div class="rc-foot"><p>${esc(t.stay.insideNote)}</p><a class="btn btn-outline" href="${href("stay", L, "#comparar")}">${esc(t.land.resort.roomsAll)}</a></div>`;
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
  if (sized) return sized.choices.filter((c) => c.price != null).map((c) => `<span class="dl-size"><small>${esc(c.label[t.lang])}</small> ${money(c.price)}</span>`).join("");
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
  const verb = O.add;
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
    add: canOrder(d) ? `<button class="d-add" type="button" data-add="${d.id}" aria-label="${esc(verb)}: ${esc(d.name)}${d.options.length ? ` (${esc(O.withChoices)})` : ""}"${d.options.length ? ' aria-haspopup="dialog"' : ""}><span data-add-label>${icon("plus")}<span>${esc(verb)}</span></span></button>` : "",
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
const faqIndex = (t) => `<nav class="faq-index" aria-label="${esc(t.faq.indexLabel)}"><ul>${t.faq.cats.map((c, i) => `<li><a href="#faq-${i}">${esc(c.name)}</a></li>`).join("")}</ul></nav>`;
function faqBlock(t) {
  const id = (i) => `faq-${i}`;
  return `<div class="faq">${t.faq.cats
    .map((c, i) => `<section class="faq-cat" id="${id(i)}" aria-labelledby="${id(i)}-h"><h3 class="faq-cat-title" id="${id(i)}-h">${esc(c.name)}</h3>${c.items
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
// The Google map, shown straight away: the frame is lazy, so it loads only as it nears the screen and never holds up the page.
// The address stays beside it in plain text, and directions open in Google Maps.
function mapFacade(t, cls = "") {
  return `<figure class="map-frame map-live ${cls}">
      <iframe src="${esc(mapEmbed())}" title="${esc(t.location.mapTitle)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
      <figcaption class="map-bar"><span>${icon("pin")}Lauhata · ${esc(site.address.region)}, ${esc(site.address.country)}</span><a class="text-link" href="${mapsLink()}" target="_blank" rel="noopener">${esc(t.common.openMaps)}${icon("arrow-up-right")}</a></figcaption>
    </figure>`;
}
const mapEmbed = () => `https://www.google.com/maps?q=${encodeURIComponent(site.mapQuery)}&z=15&output=embed`;
const directionsLink = () => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapQuery())}`;









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
      <h2 id="rv-title" class="display" data-split>${esc(R.title)}</h2>
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

// Experiences: no calendar, packages, capacities or prices are published (none are confirmed). The page shows where a gathering takes place
// (two real photographs, said as such), the occasions a guest can suggest (each one fills the form), how an enquiry becomes an agreed day
// (the line is dashed until the team confirms, then solid), and the enquiry itself, which goes to WhatsApp like every other request.
export function events(t) {
  const L = t.lang;
  const E = t.land.eventsPage;
  const bc = breadcrumbs(t, [{ name: t.nav.events, path: href("events", L) }]);
  const occ = E.kinds.slice(0, -1).map((k, i) => [k, E.kindLines[i]]);
  const body = `
${pageHero(t, { title: E.title, lead: E.lead, image: "sunsetPalms", pos: "50% 40%", ctas: `<div class="btn-row"><a class="btn btn-terra btn-lg" href="#pedido">${esc(E.cta)}</a><a class="btn btn-ghost-light btn-lg" href="#como">${esc(E.howLink)}</a></div>` })}

<section class="section xo" aria-labelledby="ev-types-title">
  <div class="wrap xo-grid">
    <figure class="xo-media">
      <div class="xo-main" data-tide>${figure(t, "beachFront", { sizes: "(min-width: 900px) 44vw, 92vw" })}</div>
      <div class="xo-inset" data-tide>${figure(t, "sunsetGarden", { sizes: "(min-width: 900px) 22vw, 46vw" })}</div>
      <figcaption>${esc(E.photoCap)}</figcaption>
    </figure>
    <div class="xo-copy">
      <h2 id="ev-types-title" class="display">${esc(E.typesTitle)}</h2>
      <p class="xo-lead">${esc(E.typesLead)}</p>
      <ul class="xo-list">${occ.map(([k, line]) => `<li><a href="#pedido" data-event-kind="${esc(k)}"><span class="xo-name">${esc(k)}</span><span class="xo-line">${esc(line)}</span><span class="xo-go">${esc(E.suggest)}${icon("arrow")}</span></a></li>`).join("")}</ul>
      <p class="xo-other">${esc(E.other)}</p>
    </div>
  </div>
</section>

<section class="section xp" id="como" aria-labelledby="ev-how-title">
  <div class="wrap">
    <div class="xp-head">
      <h2 id="ev-how-title" class="display">${esc(E.howTitle)}</h2>
      <p>${esc(E.howLead)}</p>
    </div>
    <ol class="xp-steps">${E.steps.map(([h, p], i) => `<li class="xp-step${i === 2 ? " is-confirm" : ""}${i === 3 ? " is-day" : ""}"><span class="xp-node" aria-hidden="true"></span><span class="xp-num" aria-hidden="true">${i + 1}</span><h3>${esc(h)}</h3><p>${esc(p)}</p></li>`).join("")}</ol>
    <ul class="xp-key">
      <li class="is-ask"><span aria-hidden="true"></span>${esc(E.keyAsk)}</li>
      <li class="is-ok"><span aria-hidden="true"></span>${esc(E.keyOk)}</li>
    </ul>
  </div>
</section>

<section class="section booking ev-form" id="pedido" aria-labelledby="ev-form-title">
  <div class="wrap booking-grid">
    <div class="ev-side">
      <h2 id="ev-form-title" class="display">${esc(E.formTitle)}</h2>
      <p class="body-text">${esc(E.formLead)}</p>
      <h3 class="ev-next-title">${esc(E.nextTitle)}</h3>
      <ol class="ev-next">${E.next.map((x) => `<li>${esc(x)}</li>`).join("")}</ol>
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

// The event enquiry: one short form (occasion, preferred date, alternative date, preferred time, guests and an optional note). Sending
// checks the fields, prepares the WhatsApp message and opens Lauhata's chat; the planning is done there, with the team.
function eventForm(t) {
  const E = t.land.eventsPage;
  const S = E.short;
  const kinds = E.kinds.map((o) => `<option>${esc(o)}</option>`).join("");
  return `<form class="booking-form ev-short" data-booking="event" data-short data-wa="${esc(S.wa)}" data-alt-label="${esc(S.altLabel)}" data-notes-label="${esc(S.notes)}" novalidate>
    <div class="form-grid">
      ${field({ id: "ev-kind", name: "kind", label: S.occasion, control: `<select data-pick="select" data-icon="star">${kinds}</select>`, full: true })}
      ${field({ id: "ev-date", name: "date", type: "date", label: S.date, attrs: 'required data-pick="date"' })}
      ${field({ id: "ev-alt", name: "altDate", type: "date", label: S.altDate, optional: t.form.optional, attrs: 'data-pick="date"' })}
      ${field({ id: "ev-time", name: "time", label: S.time, control: `<select data-pick="time" required>${timeOptions(t, { placeholder: t.pick.chooseTime })}</select>` })}
      ${field({ id: "ev-people", name: "people", type: "number", label: S.guests, attrs: `required min="1" max="300" value="10" inputmode="numeric" data-pick="number" data-unit-one="${esc(t.home.quick.person)}" data-unit-many="${esc(t.home.quick.persons)}"` })}
      ${field({ id: "ev-notes", name: "notes", type: "textarea", label: S.notes, optional: t.form.optional, attrs: `maxlength="600" rows="3" placeholder="${esc(S.notesHint)}"`, full: true })}
    </div>
    <div class="form-errors" role="alert" hidden data-form-errors>${esc(t.form.errorsTitle)}</div>
    <div class="form-actions"><button class="btn btn-terra btn-lg" type="submit">${icon("whatsapp")}<span data-submit-label>${esc(S.submit)}</span></button></div>
    <p class="form-note">${esc(S.note)}</p>
  </form>`;
}

// One continuous collection, set like a magazine's picture pages: every real photograph (placeholder: false, with a `group`) in an
// order that walks from the sea to the beach, the restaurant, the rooms, the evening and the coast around, plus the drone film.
// Each tile names its column span, its crop (chosen per photograph, never cutting the subject) and how far it sits below the row's
// top. On a phone the same order becomes pairs and full-width plates. The lightbox always shows the whole, uncropped photograph.
const GALLERY = [
  // [key, desktop columns, crop, focal point, offset (rem), phone: f = full width, h = half]
  ["beachFront", "1 / span 8", "16 / 10", "50% 55%", 0, "f"],
  ["heroPortrait", "9 / span 4", "3 / 5", "50% 50%", 7, "h"],
  ["restaurantBeach", "2 / span 5", "4 / 5", "46% 50%", 0, "h"],
  ["aerialGarden", "7 / span 6", "1 / 1", "50% 50%", 9, "f"],
  ["coastMountains", "1 / span 12", "21 / 9", "50% 58%", 0, "f"],
  ["stayVeranda", "1 / span 4", "4 / 5", "40% 50%", 0, "h"],
  ["stayEntrance", "5 / span 4", "4 / 5", "50% 50%", 6, "h"],
  ["stayWalkway", "9 / span 4", "4 / 5", "45% 50%", 3, "f"],
  ["stayGarden", "1 / span 7", "3 / 2", "50% 50%", 0, "h"],
  ["aerialTop", "9 / span 4", "1 / 1", "50% 50%", 7, "h"],
  ["@film", "1 / span 8", "16 / 9", "50% 50%", 0, "f"],
  ["sunsetPalmsHigh", "9 / span 4", "4 / 5", "50% 50%", 5, "h"],
  ["sunsetSea", "1 / span 12", "21 / 9", "50% 50%", 0, "h"],
  ["sunsetPalms", "2 / span 5", "4 / 5", "55% 50%", 0, "h"],
  ["sunsetGarden", "7 / span 6", "3 / 2", "50% 50%", 8, "h"],
  ["coastVillage", "1 / span 7", "16 / 10", "50% 50%", 0, "f"],
  ["seaCanoe", "8 / span 5", "1 / 1", "50% 50%", 6, "h"],
  ["ruinsAerial", "1 / span 6", "4 / 3", "50% 50%", 0, "h"],
  ["ruinsTop", "7 / span 6", "4 / 3", "50% 50%", 7, "f"],
];
export function gallery(t) {
  const L = t.lang;
  const G = t.land.galleryPage;
  const bc = breadcrumbs(t, [{ name: t.nav.gallery, path: href("gallery", L) }]);
  const photos = GALLERY.filter(([k]) => k[0] !== "@").length;
  const tile = ([k, col, ratio, pos, y, m]) => {
    const style = `--c:${col};--r:${ratio};--p:${pos};--y:${y}rem`;
    if (k === "@film") {
      return `<li class="gx-item gx-film" data-m="${m}" style="${style}">
      <div class="gx-frame"><video muted loop playsinline preload="none" data-poster="${imgUrl("heroFilmCover", 1080)}" aria-label="${esc(G.filmLabel)}" data-gx-film><source src="${site.heroVideo}" type="video/mp4"></video>
      <button class="gx-film-btn" type="button" data-gx-film-btn aria-pressed="false" data-play="${esc(G.filmPlay)}" data-pause="${esc(G.filmPause)}">${icon("play")}${icon("pause")}<span>${esc(G.filmPlay)}</span></button></div>
      <p class="gx-cap">${esc(G.filmCap)}</p>
    </li>`;
    }
    return `<li class="gx-item" data-m="${m}" style="${style}">
      <a class="gx-frame" href="${imgUrl(k, 1600)}" data-lb-src="${imgUrl(k, 1600)}" aria-label="${esc(fmt(t.land.gallery.open, { alt: images[k].alt[L] }))}">${figure(t, k, { sizes: `(min-width: 900px) ${Math.round((+col.split("span ")[1] / 12) * 92)}vw, ${m === "f" ? 92 : 46}vw` })}</a>
      <p class="gx-cap">${esc(images[k].alt[L])}</p>
    </li>`;
  };
  const body = `
${pageHero(t, { title: G.title, lead: G.lead, image: "seaCanoe", pos: "50% 50%", cls: "is-bright" })}

<section class="section gx" aria-labelledby="gx-title" data-gallery>
  <div class="wrap">
    <div class="gx-head">
      <h2 id="gx-title" class="display">${esc(G.collection)}</h2>
      <p>${esc(fmt(G.count, { n: photos }))}</p>
    </div>
    <ul class="gx-list">${GALLERY.map(tile).join("")}</ul>
  </div>
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



// What makes Lauhata special: six facts that are confirmed or can be seen in the photographs (PRODUCT.md), three by two.
const SPECIAL_ICONS = ["palm", "cutlery", "sunset", "leaf", "users", "heart"];
function specialSection(t) {
  const R = t.land.resort;
  return `<section class="section sp" id="especial" aria-labelledby="sp-title">
  <div class="wrap">
    <h2 id="sp-title" class="display" data-split>${esc(R.spTitle)}</h2>
    <ul class="sp-grid" data-group>${R.spItems.map(([h, p], i) => `<li>${icon(SPECIAL_ICONS[i])}<h3>${esc(h)}</h3><p>${esc(p)}</p></li>`).join("")}</ul>
  </div>
</section>`;
}

// Five of the questions of the contact page, with the same answers (same data), and the way to all of them.
const FAQ_HOME = [[0, 0], [1, 2], [0, 1], [2, 0], [2, 1]]; // [category, question]
function faqTeaser(t) {
  const list = FAQ_HOME.map(([c, i]) => t.faq.cats[c].items[i]);
  return `<section class="section fq" id="perguntas" aria-labelledby="fq-title">
  <div class="wrap fq-grid">
    <div class="fq-head">
      <h2 id="fq-title" class="display" data-split>${esc(t.faq.title)}</h2>
      <a class="btn btn-outline" href="${href("contact", t.lang, "#faq")}">${esc(t.land.resort.faqAll)}</a>
    </div>
    <div class="faq">${list.map((it) => `<details name="faq-home"><summary><span>${esc(it.q)}</span>${icon("plus")}</summary><div class="faq-a"><p>${esc(faqFill(t, it.a))}</p></div></details>`).join("")}</div>
  </div>
</section>`;
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
  const fdDish = (d) => {
    const verb = t.order.add;
    return `<li class="kt-dish">
      <div class="dl-head"><h3 class="dl-name">${esc(d.name)}</h3><i class="dl-leader" aria-hidden="true"></i><p class="dl-price"><b>${cardPrice(t, d)}</b></p></div>
      ${canOrder(d) ? `<button class="d-add kt-add" type="button" data-add="${d.id}" aria-label="${esc(verb)}: ${esc(d.name)}" title="${esc(verb)}"><span data-add-label>${icon("plus")}</span></button>` : ""}
    </li>`;
  };
  const door = (page, key, i) => `<a class="we-door" href="${href(page, L)}">
      <span class="we-media">${figure(t, key, { sizes: "(min-width: 1100px) 24vw, (min-width: 700px) 30vw, 38vw", decorative: true })}</span>
      <strong>${esc(RS.wlCards[i][0])}</strong>
      <span class="we-line">${esc(RS.wlCards[i][1])}</span>
      <span class="we-go">${esc(RS.wlCards[i][2])}</span>
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
  ${site.heroVideo ? `<button class="hx-toggle" type="button" hidden data-hero-toggle data-pause="${esc(RS.filmPause)}" data-play="${esc(RS.filmPlay)}" aria-label="${esc(RS.filmPause)}" title="${esc(RS.filmPause)}">${icon("pause")}${icon("play")}</button>` : ""}
</section>

<section class="section we" id="bem-vindo" aria-labelledby="wl-title">
  <div class="wrap we-grid">
    <div class="we-intro">
      <h2 id="wl-title" class="display" data-split>${esc(RS.wlTitle)}</h2>
      <p class="we-lead">${esc(RS.wlBody)}</p>
      <a class="text-link" href="${href("about", L)}">${esc(RS.wlCta)}</a>
      <p class="wl-meta"><span class="wm">${icon("pin")}<span>${esc(t.land.beach.place)}</span></span>${hoursLine ? `<span class="wm">${icon("clock")}<span>${hoursLine}</span></span>` : ""}</p>
    </div>
    <div class="we-doors">${door("restaurant", "restaurantBeach", 0)}${door("stay", "stayGarden", 1)}${door("events", "sunsetGarden", 2)}</div>
  </div>
</section>

${daySection(t)}

<section class="section kt" id="cozinha" aria-labelledby="fd-title">
  <div class="wrap">
    <div class="kt-top">
      <div class="kt-intro">
        <h2 id="fd-title" class="display" data-split>${esc(RS.fdTitle)}</h2>
        <p class="kt-lead">${esc(RS.fdLead)}</p>
        <div class="kt-actions"><a class="btn btn-terra" href="${href("restaurant", L, "#ementa")}">${esc(RS.fdCta)}</a><a class="text-link" href="${href("contact", L)}" data-book-open="table">${esc(t.home.hero.ctaTable)}</a></div>
      </div>
      <dl class="kt-meals">
        <div><dt>${esc(RS.meals[0][0])}</dt><dd><b>${esc(K.breakfast)}</b>${esc(RS.meals[0][1])}</dd></div>
        <div><dt>${esc(RS.meals[1][0])}</dt><dd><b>${esc(K.lunch)}–${esc(K.dinner)}</b>${esc(RS.meals[1][1])}</dd></div>
      </dl>
    </div>
    <ul class="kt-list">${fd.map(fdDish).join("")}</ul>
  </div>
</section>

<section class="section rq" id="quartos" aria-labelledby="stay-title">
  <div class="wrap">
    <div class="rq-head">
      <h2 id="stay-title" class="display" data-split>${esc(RS.roomsTitle)}</h2>
      <p>${esc(RS.roomsLead)}</p>
    </div>
    ${roomPair(t)}
  </div>
</section>

${specialSection(t)}

<section class="section ofs" aria-labelledby="ofs-title">
  <div class="wrap">
    <h2 id="ofs-title" class="sr-only">${esc(RS.offersTitle)}</h2>
    ${lodgingBlock(t)}
  </div>
</section>

<section class="cl" id="experiencias" aria-labelledby="ex-title">
  <figure class="cl-photo">${figure(t, "sunsetSea", { sizes: "(min-width: 900px) 100vw, 100vw", cls: "drift" })}</figure>
  <div class="wrap">
    <div class="cl-card" data-rise>
      <h2 id="ex-title" class="cl-title">${esc(RS.expTitle)}</h2>
      <p class="cl-lead">${esc(RS.expLead)}</p>
      <ul class="cl-kinds">${kinds.map((k) => `<li>${esc(k)}</li>`).join("")}</ul>
      <a class="btn btn-terra" href="${href("events", L, "#pedido")}">${esc(RS.ctaEvent)}</a>
      <p class="cl-note">${esc(RS.expNote)}</p>
    </div>
  </div>
</section>

<section class="section ar" id="arredores" aria-labelledby="sx-title">
  <div class="wrap ar-grid">
    <div class="ar-copy">
      <h2 id="sx-title" class="display" data-split>${esc(RS.dsTitle)}</h2>
      <p>${esc(LD.aboutPage.chapters.coastBody)}</p>
      <a class="btn btn-sea" href="${href("discover", L)}">${esc(RS.dsCta)}</a>
    </div>
    <figure class="ar-b" data-tide>${figure(t, "seaCanoe", { sizes: "(min-width: 900px) 32vw, 60vw", credit: true })}</figure>
    <figure class="ar-a" data-tide>${figure(t, "coastVillage", { sizes: "(min-width: 900px) 58vw, 100vw", credit: true })}</figure>
    <figure class="ar-c" data-tide>${figure(t, "ruinsAerial", { sizes: "(min-width: 900px) 34vw, 72vw", credit: true })}</figure>
  </div>
</section>

${reviewsSection(t)}

${finalSection(t, "coastMountains", { panel: true })}

${faqTeaser(t)}`;
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
    ld: [], // no FAQPage here: the contact page carries it, for the complete list
    menu: items,
    body,
  };
}

export function restaurant(t) {
  const L = t.lang;
  const bc = breadcrumbs(t, [{ name: t.nav.restaurant, path: href("restaurant", L) }]);
  const F = t.land.final;
  const body = `
${pageHero(t, {
  title: t.home.two.restTitle,
  lead: t.home.two.restBody,
  image: "restaurantBeach",
  pos: "50% 42%",
  ctas: `<div class="btn-row"><a class="btn btn-terra btn-lg" href="${href("contact", L)}" data-book-open="table">${esc(F.bookTable)}</a><a class="btn btn-ghost-light btn-lg" href="#ementa">${esc(t.common.viewMenu)}</a></div>
  <p class="hero-hours">${icon("clock")}<span>${site.restaurantHours.length ? site.restaurantHours.map((h) => `${esc(h.days[L])} <b>${esc(h.hours)}</b>`).join('<i aria-hidden="true">, </i>') : esc(t.common.hoursTbc)}</span></p>`,
})}

${menuSection(t)}

<section class="scene final-cta is-table" aria-labelledby="final-title">
  <div class="scene-media">${figure(t, "beachFront", { sizes: COVER, decorative: true })}</div>
  <div class="wrap scene-text">
    <h2 id="final-title" class="scene-line final-line" data-split>${esc(F.tableLine)}</h2>
    <p class="final-lead">${esc(F.tableLead)}</p>
    <div class="btn-row"><a class="btn btn-terra btn-lg" href="${href("contact", L)}" data-book-open="table">${esc(F.bookTable)}</a><a class="text-link on-dark" href="${waLink(t.form.waHello)}" target="_blank" rel="noopener">${esc(t.common.whatsapp)}</a></div>
  </div>
</section>`;
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

// The two room types side by side: one row per question a guest asks, the same order as the room cards. Every value comes from rooms.mjs
// (per room) or `lodgingAmenities` (the same for both); nothing is added. On a phone each row becomes a small block: the question, then the
// two answers side by side, each named (signature.css).
function roomCompare(t) {
  const L = t.lang;
  const S = t.stay;
  const has = (r, en) => (r.amenities || []).some((a) => a.en === en);
  const shared = (id) => lodgingAmenities.find((a) => a.id === id);
  const yes = (txt = S.cmpYes) => `<span class="cmp-yes">${icon("check")}${esc(txt)}</span>`;
  const row = (label, cells, cls = "") => `<tr${cls ? ` class="${cls}"` : ""}><th scope="row">${esc(label)}</th>${cells.map((c, i) => `<td data-room="${esc(rooms[i].name[L])}">${c}</td>`).join("")}</tr>`;
  const sharedRows = ["bathroom", "wifi"].map((id) => row(shared(id)[L], rooms.map(() => yes())));
  sharedRows.push(row(shared("breakfast")[L], rooms.map(() => `${esc(S.cmpBreakfast)}<small>${esc(S.cmpBreakfastAsk)}</small>`)));
  return `<div class="cmp-wrap" id="comparar">
    <h2 class="display cmp-title">${esc(S.cmpTitle)}</h2>
    <table class="cmp">
      <caption class="sr-only">${esc(S.cmpTitle)}</caption>
      <thead><tr><td></td>${rooms.map((r) => `<th scope="col"><a href="${href("room:" + r.id, L)}">${esc(r.name[L])}</a><span>${esc(r.diff[L])}</span></th>`).join("")}</tr></thead>
      <tbody>
        ${row(S.cmpCapacity, rooms.map((r) => esc(r.capacity[L]) + (r.capacityPending ? `<small>${esc(S.cmpPending)}</small>` : "")))}
        ${row(S.cmpBeds, rooms.map((r) => esc(r.beds[L])), "is-diff")}
        ${row(S.cmpTv, rooms.map((r) => (has(r, "Television") ? yes() : esc(S.cmpAsk))))}
        ${sharedRows.join("")}
        ${row(S.cmpPrice, rooms.map((r) => (r.price ? `<strong class="cmp-price">${esc(r.price)}</strong> <small>${esc(t.home.rooms.night)}</small>` : esc(t.common.priceTbc))))}
        <tr class="cmp-actions"><th scope="row"><span class="sr-only">${esc(S.cmpAction)}</span></th>${rooms.map((r) => `<td data-room="${esc(r.name[L])}"><a class="btn btn-terra" href="${href("contact", L)}" data-book-open="room" data-room-link="${r.id}" aria-label="${esc(t.home.hero.ctaRoom)}: ${esc(r.name[L])}">${esc(t.home.hero.ctaRoom)}</a></td>`).join("")}</tr>
      </tbody>
    </table>
    <p class="cmp-note">${esc(S.cmpNote)}</p>
  </div>`;
}

// Choose a room: the two room types as two facing presentations, each with its photographs (interior ones when they exist, otherwise the
// outside of the rooms, said under the cards), the one thing that sets it apart, who it sleeps, its beds, what is in the room, the price
// and the two actions. The rows line up across both (subgrid), so the eye compares them without a table.
function roomShowcase(t) {
  const L = t.lang;
  const S = t.stay;
  return `<div class="ch-grid">${rooms.map((r) => {
    const imgs = roomPhotos(r, 3);
    const shot = (k, i) => `<a class="ch-shot${i ? "" : " is-main"}" href="${imgUrl(k, 1600)}" data-lb-src="${imgUrl(k, 1600)}" aria-label="${esc(fmt(t.land.gallery.open, { alt: images[k].alt[L] }))}">${figure(t, k, { sizes: i ? "(min-width: 900px) 15vw, 30vw" : "(min-width: 900px) 46vw, 92vw" })}</a>`;
    const facts = [["users", S.cmpCapacity, r.capacity[L]], ["bed", S.cmpBeds, r.beds[L]], ...(r.amenities || []).map((a) => [a.icon || AMEN_ICON[a.en] || "check", S.roomFeatures, a[L]])];
    return `<article class="ch" id="room-${r.id}" aria-labelledby="ch-${r.id}">
      <div class="ch-media" data-gallery>${imgs.map(shot).join("")}</div>
      <div class="ch-head"><h3 class="ch-name" id="ch-${r.id}">${esc(r.name[L])}</h3><p class="ch-diff">${esc(r.diff[L])}</p></div>
      <p class="ch-desc">${esc(r.card[L])}</p>
      <div class="ch-spec"><dl class="ch-facts">${facts.map(([ic, k, v]) => `<div><dt>${icon(ic)}${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>${r.capacityPending ? `<p class="ch-pending">${esc(S.capacityPending)}</p>` : ""}</div>
      <div class="ch-foot">
        <p class="ch-price"><strong>${esc(r.price || t.common.priceTbc)}</strong>${r.price ? `<span>${esc(t.home.rooms.night)}</span>` : ""}</p>
        <div class="ch-actions"><a class="btn btn-terra" href="${href("contact", L)}" data-book-open="room" data-room-link="${r.id}" aria-label="${esc(t.home.hero.ctaRoom)}: ${esc(r.name[L])}">${esc(t.home.hero.ctaRoom)}</a><a class="btn btn-outline" href="${href("room:" + r.id, L)}" aria-label="${esc(S.viewRoom)}: ${esc(r.name[L])}">${esc(S.viewRoom)}</a></div>
      </div>
    </article>`;
  }).join("")}</div>
  ${rooms.every(hasInterior) ? "" : `<p class="rm-inside">${esc(S.insideNote)}</p>`}
  <p class="ch-request">${esc(S.requestNote)}</p>`;
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
    <div class="rq-head">
      <h2 id="rooms-title" class="display">${esc(H.title)}</h2>
      <p>${esc(H.body)}</p>
    </div>
    ${roomShowcase(t)}
  </div>
</section>

<section class="section cmp-section" aria-labelledby="cmp-heading">
  <div class="wrap">${roomCompare(t).replace('<h2 class="display cmp-title">', '<h2 class="display cmp-title" id="cmp-heading">')}</div>
</section>

<section class="section ofs" aria-label="${esc(t.stay.lodgingTitle)}">
  <div class="wrap">${lodgingBlock(t)}</div>
</section>

<section class="rs-place" aria-labelledby="rs-place-title">
  <figure class="rs-place-media">${figure(t, "aerialTop", { sizes: COVER, cls: "drift" })}</figure>
  <div class="wrap rs-place-text">
    <h2 id="rs-place-title" class="rs-place-title" data-split>${esc(t.stay.placeTitle)}</h2>
    <p>${esc(t.stay.placeLead)}</p>
    <a class="btn btn-terra" href="${href("contact", L)}" data-book-open="room">${esc(t.home.hero.ctaRoom)}</a>
    <p class="rs-place-note">${esc(t.stay.requestNote)}</p>
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
    r.diff ? row(S.roomDiff, esc(r.diff[L])) : "",
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
      <p class="rv-compare"><a class="text-link" href="${href("stay", L)}#comparar">${esc(S.cmpTitle)}</a></p>
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
    <div class="faq-side">${heading({ title: t.faq.title, id: "faq-title" })}${faqIndex(t)}</div>
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

const DAY_FRAMES = ["stayWalkway", "beachFront", "sunsetPalmsHigh"];
// Opening and closing times of the kitchen, from site.restaurantHours ("08:00–10:00").
function kitchenHours() {
  const span = (h) => (h && String(h.hours).match(/(\d{1,2}:\d{2})\D+(\d{1,2}:\d{2})/)) || [];
  const [b, m] = site.restaurantHours.map(span);
  return b && m ? { breakfast: `${b[1]}–${b[2]}`, lunch: m[1], dinner: m[2], open: b[1], close: m[2] } : null;
}
// A day at Lauhata: one photograph and, beside it, the three meals as one list under the line of the day. The line is drawn to scale from the
// kitchen's hours (08:00 to 21:00, with the hour it is closed left open); a small sun travels along it to the meal in view. Choosing a meal
// (pointer, keyboard or touch), or simply scrolling past, changes the photograph. Nothing is pinned and nothing is scrubbed: cinema.js moves
// the sun and swaps a class, and every word is on the page with or without it. The Tetum greetings are lang="tet" and await a native reader.
function daySection(t) {
  const D = t.land.day;
  const K = kitchenHours();
  if (!K) return "";
  const when = (s) => (s.hours === "breakfast" ? K.breakfast : s.hours === "lunch" ? fmt(D.from, { t: K.lunch }) : fmt(D.until, { t: K.dinner }));
  const mins = (h) => { const [a, b] = h.split(":"); return +a * 60 + +b; };
  const open = mins(K.open), close = mins(K.close);
  const at = (h) => (mins(h) - open) / (close - open); // position on the line, 0 to 1
  const bEnd = K.breakfast.split("–")[1];
  const spots = { breakfast: at(bEnd) / 2, lunch: at(K.lunch), dinner: at(K.dinner) };
  const seg = (a, b) => `stroke-dasharray="${(b - a).toFixed(4)} 1" stroke-dashoffset="${(-a).toFixed(4)}"`;
  const PATH = "M 14 92 Q 300 -48 586 92"; // the arc of the day, in a 600 x 110 box
  return `<section class="day" id="dia" aria-labelledby="day-title" data-day>
  <div class="wrap day-grid">
    <div class="day-stage" data-day-stage>${D.steps.map((s, i) => `<div class="day-frame${i ? "" : " is-on"}" data-day-frame>${figure(t, DAY_FRAMES[i], { sizes: "(min-width: 960px) 56vw, 100vw" })}</div>`).join("")}</div>
    <div class="day-panel">
      <h2 id="day-title" class="day-title" data-split>${esc(D.title)}</h2>
      <p class="day-lead">${esc(fmt(D.lead, K))}</p>
      <div class="day-line"><svg class="day-arc" viewBox="0 0 600 124" role="img" aria-label="${esc(fmt(D.line, { a: K.breakfast, b: `${K.lunch}–${K.dinner}` }))}" data-day-arc>
        <path class="da-base" d="${PATH}" pathLength="1" ${seg(0, at(bEnd))}/>
        <path class="da-base" d="${PATH}" pathLength="1" ${seg(at(K.lunch), 1)}/>
        <path class="da-closed" d="${PATH}" pathLength="1" ${seg(at(bEnd), at(K.lunch))}/>
        <path class="da-gone" d="${PATH}" pathLength="1" stroke-dasharray="0 2" data-day-gone/>
        <text x="4" y="120">${esc(K.open)}</text><text x="596" y="120" text-anchor="end">${esc(K.close)}</text>
      </svg><i class="day-sun" aria-hidden="true" data-day-sun></i></div>
      <ol class="day-list">${D.steps.map((s, i) => `<li><button class="day-item${i ? "" : " is-on"}" type="button" aria-pressed="${i ? "false" : "true"}" data-day-item data-at="${spots[s.hours].toFixed(4)}">
        <span class="di-when">${esc(when(s))}</span>
        <span class="di-what"><strong>${esc(s.t)}</strong><em lang="tet">${esc(s.hello)}</em></span>
        <span class="di-text">${esc(s.d)}</span>
      </button></li>`).join("")}</ol>
    </div>
  </div>
</section>`;
}
