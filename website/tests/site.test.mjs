// Automated checks for the Lauhata site. Run with `npm test` (builds first). Node's built-in test runner, no dependencies.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const dist = join(root, "dist");
const read = (p) => readFileSync(join(dist, p), "utf8");

function walk(dir, out = []) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    statSync(p).isDirectory() ? walk(p, out) : out.push(p);
  }
  return out;
}
// Real pages only: the redirect stubs (meta refresh) and the 404 are not pages to inspect.
const pages = () => walk(dist).filter((f) => f.endsWith(".html")).map((f) => ({ f, html: readFileSync(f, "utf8") })).filter(({ html }) => !/http-equiv="refresh"/.test(html) && /<nav class="nav-main"/.test(html));

const keysOf = (o, p = "") => Object.entries(o).flatMap(([k, v]) => (v && typeof v === "object" && !Array.isArray(v) ? keysOf(v, `${p}${k}.`) : [`${p}${k}`]));

test("EN and PT have exactly the same text keys", async () => {
  const en = (await import(pathToFileURL(join(root, "src/i18n/en.mjs")))).default;
  const pt = (await import(pathToFileURL(join(root, "src/i18n/pt.mjs")))).default;
  const a = new Set(keysOf(en)), b = new Set(keysOf(pt));
  assert.deepEqual([...a].filter((k) => !b.has(k)), [], "keys only in EN");
  assert.deepEqual([...b].filter((k) => !a.has(k)), [], "keys only in PT");
});

test("the room types are exactly Queen Room and Queen & Single Room: $90 a night, the stated capacity, the Queen & Single children's capacity flagged as pending", async () => {
  const rooms = (await import(pathToFileURL(join(root, "src/data/rooms.mjs")))).default;
  assert.deepEqual(rooms.map((r) => r.name.en), ["Queen Room", "Queen & Single Room"]);
  assert.deepEqual(rooms.map((r) => r.name.pt), ["Queen Room", "Queen & Single Room"]);
  assert.deepEqual(rooms.map((r) => r.bedPlan), [["queen"], ["queen", "single"]]);
  for (const r of rooms) {
    assert.equal(r.price, "$90", "the price is $90 per night (client brief of 22 Nov 2026)");
    assert.equal(r.suitability, null, "no extra occupancy claim is published");
    assert.ok(r.capacity.en && r.capacity.pt, "capacity in both languages");
  }
  assert.equal(rooms[0].capacity.en, "Up to 2 adults");
  assert.ok(!rooms[0].capacityPending, "the Queen Room capacity is firm");
  assert.equal(rooms[1].capacityPending, true, "two children in the Queen & Single Room await Lauhata's confirmation of ages and occupancy");
});

test("the nine shared amenities, and nothing else, are listed once on the home page, the stay page and each room page, in both languages", async () => {
  const { lodgingAmenities } = await import(pathToFileURL(join(root, "src/data/rooms.mjs")));
  assert.deepEqual(lodgingAmenities.map((a) => a.en), ["Airport transfer", "Non-smoking rooms", "Free parking", "On-site restaurant", "Beachfront location", "Bar", "Breakfast", "Wi-Fi", "Private bathroom"]);
  for (const f of ["index.html", "stay/index.html", "stay/queen-room/index.html", "stay/queen-and-single-room/index.html", "pt/index.html", "pt/alojamento/index.html", "pt/alojamento/queen-room/index.html"]) {
    const h = read(f);
    assert.equal([...h.matchAll(/<ul class="rp-amen">/g)].length, 1, f + ": the shared amenities block");
    const ul = h.match(/<ul class="rp-amen">[\s\S]*?<\/ul>/)[0];
    assert.equal([...ul.matchAll(/<li>/g)].length, 9, f + ": nine amenities");
    assert.ok(!/\bking\b/i.test(h.replace(/<script[\s\S]*?<\/script>/g, "")), f + ": a king bed is mentioned");
  }
});

test("stay page: a light ground, the price and capacity per room, and progress bars (not a '1 / 3' counter) when a room has several real photographs", async () => {
  for (const f of ["stay/index.html", "pt/alojamento/index.html"]) {
    const h = read(f);
    assert.ok(/<section class="section rooms-stay"/.test(h) && !/rooms-cine/.test(h), f + ": light section");
    assert.equal([...h.matchAll(/data-rg-bar/g)].length, 0, f + ": the swipeable gallery is only for photographs of the inside of a room, and there are none yet");
    assert.ok(!/data-rg-count/.test(h) && !/\d \/ \d<\/span>/.test(h), f + ": the numeric counter is back");
    assert.equal([...h.matchAll(/class="rs-price"/g)].length, 2, f + ": price on both rooms");
    assert.equal([...h.matchAll(/class="rp-pending"/g)].length, 1, f + ": the pending capacity is flagged once");
  }
});

test("no king bed and no 'suite' wording anywhere in the published pages", () => {
  for (const { f, html } of pages()) {
    const visible = html.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<style[\s\S]*?<\/style>/g, "");
    assert.ok(!/\bking\b/i.test(visible.replace(/\bparking\b|\bworking\b/gi, "")), `${f}: mentions a king bed`);
  }
});

test("primary navigation: exactly Restaurant, Hotel, Experiences, Gallery, Contact on every page (no Home, no About, no Discover)", () => {
  for (const { f, html } of pages()) {
    const nav = html.match(/<nav class="nav-main"[^>]*>([\s\S]*?)<\/nav>/);
    assert.ok(nav, `${f}: no primary nav`);
    const labels = [...nav[1].matchAll(/<a [^>]*>([^<]+)<\/a>/g)].map((m) => m[1]);
    assert.ok(["Restaurant,Hotel,Experiences,Gallery,Contact", "Restaurante,Hotel,Experiências,Galeria,Contactos"].includes(labels.join(",")), `${f}: ${labels.join(", ")}`);
    assert.ok(!labels.some((l) => /^(Discover|Descobrir|Home|Início|About|Our Story|A Nossa)/.test(l)), `${f}: an extra page is in the nav`);
  }
  assert.ok(/<nav class="nav-main"[\s\S]*?\/gallery\/[\s\S]*?<\/nav>/.test(read("index.html")), "Gallery missing from the EN nav");
});

test("the header has a language dropdown with a globe, English and Português, and no raw EN/PT pair", () => {
  const h = read("index.html");
  assert.ok(/data-lang-dd/.test(h) && /i-globe/.test(h) && /English/.test(h) && /Português/.test(h));
  assert.ok(/lang-menu-en/.test(h) && /hidden/.test(h.match(/<ul class="lang-dd-menu"[^>]*>/)?.[0] || ""), "the list starts closed");
});

test("one WhatsApp number across the whole site", () => {
  const numbers = new Set();
  for (const { html } of pages()) for (const m of html.matchAll(/wa\.me\/(\d+)/g)) numbers.add(m[1]);
  assert.equal([...numbers].join(","), "67077401111");
});

test("no scroll progress bar and no wheel hijack", () => {
  const js = walk(join(dist, "assets/js")).map((f) => readFileSync(f, "utf8")).join("\n");
  assert.ok(!/scroll-progress/.test(js) && !/scroll-progress/.test(read("assets/css/site.css")), "progress bar code is back");
  assert.ok(!/addEventListener\("wheel"/.test(js), "a wheel listener is back");
});

test("the home page: no Discover section, no individual review cards, exactly two platform boxes, Discover reachable from the footer", () => {
  const h = read("index.html");
  assert.ok(!/rs-discover/.test(h), "Discover section is on the home page");
  assert.ok(!/class="rv-cards"/.test(h), "individual review cards are back");
  assert.equal([...h.matchAll(/class="rv-score rv-(tripadvisor|booking)/g)].length, 2, "two platform boxes");
  assert.ok(/class="rv-score rv-own-card"[^>]*data-open-feedback/.test(h), "the third box is the feedback call to action");
  assert.ok(/descobrir-liquica/.test(read("pt/index.html")), "Discover must stay reachable in PT");
  assert.ok(/discover-liquica/.test(h), "Discover must stay reachable in EN");
});

test("the hero has two plain actions and no expanding booking widget", () => {
  const h = read("index.html");
  assert.ok(!/class="booking-card is-hero"/.test(h), "the hero still carries the expanding booking card");
  const hero = h.match(/<section class="cine-hero[\s\S]*?<\/section>/)[0];
  assert.equal([...hero.matchAll(/<a class="btn/g)].length, 2);
  for (const label of ["Reserve a table", "Request a room", "Plan your event", "Get in touch"]) assert.ok(h.includes(label), `missing CTA: ${label}`);
});



test("the stay page shows two large mirrored rooms with Lauhata's own photographs of the outside, says so, and publishes no unconfirmed amenity", () => {
  for (const f of ["stay/index.html", "pt/alojamento/index.html"]) {
    const stay = read(f);
    assert.equal([...stay.matchAll(/<article class="rs-room( is-flip)?"/g)].length, 2, f);
    assert.equal([...stay.matchAll(/class="rs-room is-flip"/g)].length, 1, f + ": second room is mirrored");
    assert.equal([...stay.matchAll(/class="rs-outside"/g)].length, 2, f + ": each room shows the outside of the rooms");
    assert.ok(/class="rm-inside"/.test(stay), f + ": the note about the outside photographs is missing");
    assert.ok(!/unsplash|is-branded|quarto-jardim|suite-familia/.test(stay), f + ": a stock picture or an empty placeholder stands in for a room");
    assert.ok(!/Air conditioning|Ar condicionado|Breakfast included|Pequeno-almoço incluído/i.test(stay.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<symbol[\s\S]*?<\/symbol>/g, "")), f + ": an unconfirmed amenity is published");
  }
});

test("the reviews section does not share the dark ground of the footer", () => {
  const h = read("index.html");
  assert.ok(/<section class="section reviews-ed" id="opinioes"/.test(h) && !/reviews-ed is-dark/.test(h));
});

test("Our Story: the title is sticky only inside the two-column grid", () => {
  const css = read("assets/css/site.css").replace(/\s+/g, "");
  assert.ok(/\.ab-title\{position:static;?\}/.test(css), "a plain .ab-title must not be sticky");
});

test("the events form is one compact form with the five fields", () => {
  const e = read("events/index.html");
  assert.ok(/data-booking="event"[^>]*data-short/.test(e));
  for (const name of ["kind", "date", "altDate", "time", "people"]) assert.ok(new RegExp(`name="${name}"`).test(e), `field ${name}`);
  const form = e.match(/<form[^>]*data-booking="event"[\s\S]*?<\/form>/)[0];
  assert.ok(!/data-step/.test(form), "the form is not stepped");
});

test("no emoji anywhere in the published pages", () => {
  const emoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
  for (const { f, html } of pages()) {
    const text = html.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<style[\s\S]*?<\/style>/g, "").replace(/<[^>]+>/g, " ");
    assert.ok(!emoji.test(text.replace(/[★☆]/g, "")), `${f}: emoji found`);
  }
});

test("EN and PT home pages have the same sections", () => {
  const sec = (h) => [...h.matchAll(/<section class="([^" ]+)/g)].map((m) => m[1]);
  assert.deepEqual(sec(read("pt/index.html")), sec(read("index.html")));
});

test("the order message states each line's total when the quantity is more than one", () => {
  const js = readFileSync(join(root, "src/assets/js/order.js"), "utf8");
  assert.ok(/O\.each\} = /.test(js));
});

test("the menu: every dish has a unique id, a category that exists, and categories are listed in a sidebar", async () => {
  const { items, categories } = await import(pathToFileURL(join(root, "src/data/menu.mjs")));
  const ids = items.map((d) => d.id);
  assert.equal(new Set(ids).size, ids.length, "duplicate dish ids");
  const cats = new Set(categories.map((c) => c.id));
  for (const d of items) assert.ok(cats.has(d.category), `${d.id}: unknown category`);
  assert.ok(/menu-side/.test(read("restaurant/index.html")));
});

test("the mobile menu lists the same five links as the header, each once", () => {
  for (const f of ["index.html", "pt/index.html", "stay/index.html"]) {
    const h = read(f);
    const m = h.match(/<nav class="mn-links"[^>]*>([\s\S]*?)<\/nav>/)[1];
    const labels = [...m.matchAll(/<a [^>]*>([^<]+)<\/a>/g)].map((x) => x[1]);
    assert.equal(labels.length, 5, `${f}: ${labels.join(", ")}`);
    assert.equal(new Set(labels).size, 5, `${f}: a link appears twice`);
    // the same five destinations as the desktop header, in the same order
    const header = [...h.match(/<nav class="nav-main"[^>]*>([\s\S]*?)<\/nav>/)[1].matchAll(/<a [^>]*>([^<]+)<\/a>/g)].map((x) => x[1]);
    assert.deepEqual(labels, header, `${f}: mobile and desktop navigation differ`);
  }
});

test("mobile menu: one header, a circular toggle that controls a plain drawer, no staggered-menu code left anywhere", () => {
  const h = read("index.html");
  assert.equal([...h.matchAll(/<header class="site-header"/g)].length, 1);
  assert.ok(/class="nav-toggle"[^>]*aria-expanded="false"[^>]*aria-controls="mobile-nav"/.test(h), "toggle");
  const dlg = h.match(/<dialog class="mobile-nav" id="mobile-nav"[\s\S]*?<\/dialog>/)[0];
  assert.ok(/class="mn-panel"/.test(dlg) && /data-nav-close/.test(dlg), "drawer panel and close button");
  assert.ok(!/class="brand/.test(dlg), "the drawer repeats the logo");
  for (const f of ["assets/js/main.js", "assets/css/site.css", "index.html"]) assert.ok(!/staggered|sm-layers|sm-toggle|data-sm-/i.test(read(f)), f + ": staggered-menu leftovers");
});

test("line index: only on the restaurant page (menu categories, 1000px and up); the home page and the other pages have no sidebar", () => {
  const r = read("restaurant/index.html");
  assert.ok(/<nav class="menu-nav"[^>]*data-menu-nav>/.test(r) && [...r.matchAll(/data-cat-link="/g)].length >= 9, "category index on the restaurant page");
  for (const f of ["index.html", "pt/index.html", "stay/index.html", "contact/index.html", "gallery/index.html", "events/index.html"]) assert.ok(!/data-ls\b/.test(read(f)) && !/class="ls"/.test(read(f)), f + " has a line sidebar");
});

test("restaurant categories sit in a left column from 1000px and the Filter takes over below", () => {
  const css = read("assets/css/site.css").replace(/\s+/g, "");
  assert.ok(/@media\(min-width:1000px\)\{section\.menu\.menu-layout\{display:grid!important;grid-template-columns:15rem/.test(css), "left column grid");
});

test("accessibility basics on every page: one h1, no skipped heading levels, every image has an alt attribute, lang is set", () => {
  for (const { f, html } of pages()) {
    const body = html.replace(/<script[\s\S]*?<\/script>/g, "");
    const hs = [...body.matchAll(/<h([1-6])[\s>]/g)].map((m) => +m[1]);
    assert.equal(hs.filter((x) => x === 1).length, 1, `${f}: h1 count`);
    for (let i = 1; i < hs.length; i++) assert.ok(hs[i] - hs[i - 1] <= 1, `${f}: heading jumps from h${hs[i - 1]} to h${hs[i]}`);
    for (const img of body.matchAll(/<img\b[^>]*>/g)) assert.ok(/\balt=/.test(img[0]), `${f}: image without alt`);
    assert.ok(/<html lang="(en|pt)/.test(html), `${f}: no lang`);
  }
});

test("the home page: three welcome doors, the day in three moments with the real kitchen hours, eight dishes, two rooms, no gallery link, each section once", async () => {
  const site = (await import(pathToFileURL(join(root, "src/data/site.mjs")))).default;
  for (const f of ["index.html", "pt/index.html"]) {
    const h = read(f);
    assert.equal([...h.matchAll(/<a class="we-door"/g)].length, 3, f);
    assert.equal([...h.matchAll(/data-day-step/g)].length, 3, f + ": the day");
    assert.ok(h.includes(site.restaurantHours[0].hours) && h.includes(site.restaurantHours[1].hours.split("–")[1]), f + ": the day uses the hours of site.mjs");
    assert.equal([...h.matchAll(/<li class="kt-dish">/g)].length, 8, f + ": eight dishes");
    assert.equal([...h.matchAll(/<article class="rm">/g)].length, 2, f + ": two rooms");
    const main = h.match(/<main[\s\S]*?<\/main>/)[0];
    assert.ok(!/href="[^"]*(gallery|galeria)\//.test(main), f + ": the homepage links to the gallery from a section");
    const ids = [...main.matchAll(/<section class="([^"]+)"/g)].map((m) => m[1]);
    assert.equal(new Set(ids).size, ids.length, f + ": a section appears twice");
  }
});

test("Restaurant and Stay no longer carry their own request section; the central dialog opens from every reservation link", () => {
  for (const f of ["restaurant/index.html", "stay/index.html"]) {
    const h = read(f);
    assert.ok(!/id="reservar"/.test(h), f + ": the old request section is still there");
    assert.ok(/data-book-open/.test(h), f + ": no link opens the booking dialog");
  }
  const h = read("index.html");
  assert.ok(/data-book-dialog/.test(h) && /data-bc-tab="table"/.test(h) && /data-bc-tab="room"/.test(h), "dialog with Restaurant and Stay tabs");
  assert.ok(/name="tName"/.test(h) && /name="rName"/.test(h), "the dialog asks for an optional name");
  assert.ok(!/href="[^"]*#reservar"/.test(h), "a link still points to a removed section");
});

test("gallery: every photograph has a visible description", () => {
  const g = read("gallery/index.html");
  const tiles = [...g.matchAll(/<li class="gx-tile"/g)].length;
  const caps = [...g.matchAll(/<p class="gx-cap">[^<]+<\/p>/g)].length;
  assert.ok(tiles > 0 && tiles === caps, "tiles " + tiles + " captions " + caps);
});

test("the hero is exactly one screen and the ghost button keeps a readable hover", () => {
  const css = read("assets/css/site.css").replace(/\s+/g, "");
  assert.ok(/\.rs-hero\{height:100vh;height:100svh/.test(css), "hero height");
  assert.ok(/\.btn-ghost-light:hover[^{]*\{background:var\(--cream\);color:var\(--ink\)/.test(css), "ghost hover colours");
});

test("the kitchen on the home page is a printed list: eight different dishes, each with its price", () => {
  for (const f of ["index.html", "pt/index.html"]) {
    const dishes = [...read(f).matchAll(/<li class="kt-dish">[\s\S]*?<\/li>/g)].map((m) => m[0]);
    assert.equal(new Set(dishes.map((d) => d.match(/<h3 class="dl-name">([^<]+)/)[1])).size, 8, f);
    for (const d of dishes) assert.ok(/class="dl-price"><b>\$\d/.test(d), f + ": a dish without a price");
  }
});

test("the footer carries the large LAUHATA signature above the legal line", () => {
  const h = read("index.html");
  assert.ok(h.indexOf('class="ft-mark"') > 0 && h.indexOf('class="ft-mark"') < h.indexOf('class="wrap footer-base"'));
});

test("restaurant menu: a category bar for wide screens and a Filter popover for tablets and phones, switched by CSS at 1000px", () => {
  const h = read("restaurant/index.html");
  assert.ok(/class="mf-btn"[^>]*aria-expanded="false"/.test(h) && /data-mf-panel[^>]*hidden/.test(h), "filter button and closed panel");
  assert.ok(/data-menu-nav/.test(h) && [...h.matchAll(/data-cat-link="/g)].length >= 9, "category bar");
  assert.ok([...h.matchAll(/data-cat-filter="/g)].length >= 9, "categories in the filter");
  const css = read("assets/css/site.css").replace(/\s+/g, "");
  assert.ok(/@media\(min-width:1000px\)\{\.menu-filter\{display:none!important\}/.test(css), "the Filter is hidden from 1000px up");
  assert.ok(/@media\(max-width:999px\)\{\.menu-nav,section\.menu\.menu-side\.menu-nav\{display:none!important\}/.test(css), "the bar is hidden below 1000px");
});

test("quick add: each dish on the home page has an order button wired to a dish that the cart script knows", () => {
  const h = read("index.html");
  const ids = [...h.matchAll(/class="d-add kt-add" type="button" data-add="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(ids.length, 8);
  const menu = JSON.parse(h.match(/window\.LAUHATA_MENU\s*=\s*(\{[\s\S]*?\});?\s*<\/script>/)[1]);
  for (const id of ids) assert.ok(menu[id], id + " is not in the cart's menu data");
});

test("home hero: the photograph is in the page and preloaded, the film is fetched only by script, can be paused, and the photograph is its first frame", () => {
  for (const f of ["index.html", "pt/index.html"]) {
    const h = read(f);
    const hero = h.match(/<section class="cine-hero[\s\S]*?<\/section>/)[0];
    assert.ok(/<img src="[^"]*hero-filme-\d+\.webp"[^>]*fetchpriority="high"/.test(hero), f + ": poster");
    assert.ok(/<link rel="preload" as="image"[^>]*hero-filme-/.test(h) && /<link rel="preload" as="image"[^>]*costa-retrato-/.test(h), f + ": poster preloads (desktop and upright phone)");
    const video = hero.match(/<video[^>]*>/)[0];
    assert.ok(/preload="none"/.test(video) && !/ src=/.test(video) && !/autoplay/.test(video) && /muted loop playsinline/.test(video), f + ": the film must not load with the page");
    assert.ok(/data-hero-toggle[^>]*aria-label="[^"]+"/.test(hero), f + ": no pause control");
    assert.ok(/class="hx-scroll" aria-hidden="true"/.test(hero));
    assert.ok(!/lh-intro/.test(h), f + ": an opaque intro covers the poster");
  }
  const js = readFileSync(join(root, "src/assets/js/main.js"), "utf8");
  assert.ok(/requestVideoFrameCallback\(reveal\)/.test(js) && /saveData/.test(js) && /prefers-reduced-motion/.test(js), "the film waits for a painted frame and respects data saver and reduced motion");
});

test("contact: phone and opening hours in the hero, the form before the map", () => {
  const c = read("contact/index.html");
  assert.ok(/class="hero-facts"/.test(c) && /href="tel:\+/.test(c));
  assert.ok(c.indexOf('id="escrever"') > 0 && c.indexOf('id="escrever"') < c.indexOf('class="section location"'));
});

test("FAQ: grouped questions in both languages, with the same number of questions, and no invented policy", async () => {
  const en = (await import(pathToFileURL(join(root, "src/i18n/en.mjs")))).default;
  const pt = (await import(pathToFileURL(join(root, "src/i18n/pt.mjs")))).default;
  const count = (d) => d.faq.cats.map((c) => c.items.length);
  assert.deepEqual(count(en), count(pt));
  const all = JSON.stringify(en.faq);
  assert.ok(!/cancel|refund|check-in|check-out|deposit/i.test(all), "an unconfirmed policy is stated");
  const c = read("contact/index.html");
  assert.ok(/id="faq"/.test(c) && /"@type":"FAQPage"/.test(c));
});

test("the cart drawer has its own keyframes and a closing time that matches them", () => {
  const css = read("assets/css/site.css").replace(/\s+/g, "");
  assert.ok(/@keyframescartIn\{/.test(css) && /dialog\.cart\[open\]\{animation:cartIn/.test(css), "cart keyframes");
  const js = readFileSync(join(root, "src/assets/js/order.js"), "utf8");
  assert.ok(/d === drawer \? 340 : 220/.test(js), "closing time matches the 0.34 s exit");
});

test("restaurant menu: each dish is a printed line (name, price, description, order button) with no empty photo frame; provisional drink prices are not public", () => {
  for (const [f, flag] of [["restaurant/index.html", "Provisional price"], ["pt/restaurante/index.html", "Preço provisório"]]) {
    const h = read(f);
    const rows = [...h.matchAll(/<article class="dline[ "][\s\S]*?<\/article>/g)].map((m) => m[0]);
    assert.ok(rows.length >= 50, f + ": dish rows");
    for (const r of rows) assert.ok(/class="dl-name"/.test(r) && /class="dl-price"/.test(r) && !/is-branded/.test(r), f + ": a row lacks a name or a price, or carries an empty frame");
    assert.ok(rows.filter((r) => /class="dl-desc"/.test(r)).length >= 40, f + ": descriptions");
    assert.ok(rows.filter((r) => /data-add="/.test(r)).length >= 40, f + ": order buttons");
    // The sample drinks carry provisional prices: they stay out of the public menu until the restaurant confirms them (site.showSamples).
    assert.ok(!/id="cat-drinks"/.test(h) && !h.replace(/<script[\s\S]*?<\/script>/g, "").includes(flag), f + ": a provisional drink price is public");
  }
});

test("the 'Share your experience' card opens a feedback dialog; the old inline 'Have you stayed with us?' toggle is gone", () => {
  for (const f of ["index.html", "pt/index.html"]) {
    const h = read(f);
    assert.ok(/<button type="button" class="rv-score rv-own-card" data-open-feedback/.test(h), f + ": the card is a button");
    assert.ok(/<dialog class="fb-dialog" id="rv-form"/.test(h) && /data-fb-close/.test(h), f + ": the dialog");
    assert.ok(!/<details class="rv-form"/.test(h) && !/Have you stayed with us|Já ficou connosco/.test(h), f + ": the old toggle");
  }
});

test("lightbox, bottom bar and page lock: 100dvh with a fallback, contained image, solid anchored bar, no scrollbar jump under a modal", () => {
  const css = read("assets/css/site.css").replace(/\s+/g, "");
  assert.ok(/\.lightbox\[open\]\{[^}]*height:100dvh/.test(css) || /\.lightbox[^{]*\{[^}]*height:100dvh/.test(css), "lightbox 100dvh");
  assert.ok(/\.lb-figureimg\{[^}]*object-fit:contain/.test(css), "lightbox image is contained");
  assert.ok(/html\{scrollbar-gutter:stable\}/.test(css) && /html:has\(dialog\[open\]\)\{overflow:hidden\}/.test(css), "no sideways jump when a dialog opens");
  assert.ok(/\.mobile-bar\{[^}]*position:fixed;[^}]*bottom:0/.test(css), "bar anchored to the bottom");
  assert.ok(/viewport-fit=cover/.test(read("index.html")), "safe areas available");
});

test("nothing floats over content: no back-to-top button, a link in the footer instead; the room gallery code still pauses on keyboard focus", () => {
  const h = read("index.html");
  assert.ok(!/data-to-top/.test(h) && /href="#top"/.test(h) && /<body id="top"/.test(h), "back to top");
  const css = read("assets/css/site.css").replace(/\s+/g, "");
  assert.ok(/\.menu-body\{container-type:inline-size\}/.test(css), "the menu follows its own width");
  const js = readFileSync(join(root, "src/assets/js/main.js"), "utf8");
  assert.ok(/:focus-visible/.test(js) && /target = -1/.test(js));
});

test("dialogs that host pickers do not keep a fill-forwards transform animation (it made popups land far from their field and scroll the dialog sideways)", () => {
  const css = read("assets/css/site.css").replace(/\s+/g, "");
  for (const d of ["book-dialog", "fb-dialog", "dish-dialog"]) {
    const m = css.match(new RegExp(`\.${d}\[open\]\{animation:[^}]*\}`));
    if (m) assert.ok(!/(both|forwards)/.test(m[0]), `${d}: ${m[0]}`);
  }
  const js = readFileSync(join(root, "src/assets/js/picker.js"), "utf8");
  assert.ok(/containing block/.test(js) && /maxHeight/.test(js), "picker safety net and height cap");
});

test("dish photography policy: no illustrative dish photograph is shown or even published by default; Vegetarian labels come from the menu's own section", () => {
  for (const f of ["index.html", "restaurant/index.html", "pt/index.html", "pt/restaurante/index.html"]) {
    const h = read(f);
    assert.ok(!/pratos-temp\//.test(h), f + ": an illustrative dish photograph is in the page");
    assert.ok(!/Illustrative image|Imagem ilustrativa/.test(h.replace(/<script[\s\S]*?<\/script>/g, "")) || !/class="media dish-photo/.test(h), f + ": an illustrative label on a dish");
  }
  const r = read("restaurant/index.html");
  assert.ok(!walk(dist).some((f) => /pratos-temp/.test(f)), "illustrative dish pictures are published");
  const veg = r.match(/<section class="menu-cat" id="cat-vegetarian"[\s\S]*?<\/section>/)[0];
  assert.ok([...veg.matchAll(/<li class="is-diet">Vegetarian<\/li>/g)].length >= 5, "Vegetarian labels in the vegetarian section");
  const main = r.match(/<section class="menu-cat" id="cat-main"[\s\S]*?<\/section>/)[0];
  assert.ok(!/is-diet/.test(main), "a diet label was inferred outside the verified section");
  assert.ok(!/pratos-temp/.test(read("assets/js/order.js")) && !/LAUHATA_MENU[^;]*pratos-temp/.test(read("index.html")), "cart data points at illustrative photos");
});

test("maps: no Google frame loads on page view; a facade with a real photograph offers to load it and links to Google Maps", () => {
  for (const f of ["discover-liquica/index.html", "contact/index.html", "pt/descobrir-liquica/index.html"]) {
    const h = read(f).replace(/<script[\s\S]*?<\/script>/g, "");
    assert.ok(!/<iframe[^>]*google\.com\/maps/.test(h), f + ": a Google map loads with the page");
    assert.ok(/data-map-facade[^>]*data-src="https:\/\/www\.google\.com\/maps/.test(h) && /data-map-load/.test(h), f + ": facade");
    assert.ok(/class="mf-actions"[\s\S]*?href="https:\/\/www\.google\.com\/maps\/search/.test(h), f + ": direct link to Google Maps");
  }
});

test("original media never reaches the build; Lauhata's own photographs of the rooms and garden are used where they belong", () => {
  const all = walk(dist).map((f) => f.replace(/\\/g, "/"));
  assert.ok(!all.some((f) => /DJI_|media-source|\.dng$|\.mov$/i.test(f)), "an original file is in dist");
  assert.ok(!all.some((f) => statSync(f).size > 8 * 1024 * 1024), "a file over 8 MB is in dist");
  const stay = read("stay/index.html");
  assert.ok(/quartos-varanda-/.test(stay) && /vista-de-cima-/.test(stay), "stay hero and the place seen from above");
  assert.ok(/quarto-entrada-/.test(read("index.html")), "welcome stay card uses the real entrance photograph");
  const g = read("gallery/index.html");
  assert.ok(/data-filter="stay"/.test(g) && [...g.matchAll(/<li class="gx-tile" data-group="stay"/g)].length === 4, "gallery group for the rooms and garden");
});

test("one vocabulary: the same names in the header, the drawer and the footer, and no claim the business has not confirmed", () => {
  for (const { f, html } of pages()) {
    const text = html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ").replace(/<nav\b[\s\S]*?<\/nav>/g, " ").replace(/<[^>]+>/g, " "); // "Hotel" is the navigation label (client, 25 Nov 2026), not a claim in the text
    assert.ok(!/\b(resort|hotel|paradise|paraíso|luxury|luxo|exceptional|unforgettable|inesquecível|like family|como família)\b/i.test(text), `${f}: ${text.match(/.{20}\b(resort|hotel|paradise|paraíso|luxury|luxo|exceptional|unforgettable|inesquecível|like family|como família)\b.{20}/i)}`);
    assert.ok(!/Reserve a Table|Request a Room|Add to Cart|About us|Sobre nós/.test(text), f + ": an old label is back");
  }
  const foot = read("index.html").match(/<nav class="ft-col"[\s\S]*?<\/nav>/)[0];
  const labels = [...foot.matchAll(/<a [^>]*>([^<]+)<\/a>/g)].map((m) => m[1]);
  assert.deepEqual(labels, ["Restaurant", "Hotel", "Experiences", "Gallery", "Contact", "Our Story", "Discover Liquiçá", "FAQ"].map((x, i) => (i === 7 ? labels[7] : x)));
  assert.ok(/<title>Our Story/.test(read("about/index.html")) && /<title>A Nossa História/.test(read("pt/sobre-nos/index.html")) && /<title>Experiences/.test(read("events/index.html")) && /<title>Stay/.test(read("stay/index.html")));
});

test("the FAQ agrees with the published price and amenities, and reads the price and the hours from the data", async () => {
  const rooms = (await import(pathToFileURL(join(root, "src/data/rooms.mjs")))).default;
  const site = (await import(pathToFileURL(join(root, "src/data/site.mjs")))).default;
  for (const f of ["contact/index.html", "pt/contactos/index.html"]) {
    const faq = read(f).match(/<div class="faq">[\s\S]*?<\/section>\s*<\/div>/)[0];
    assert.ok(faq.includes(rooms[0].price), f + ": price");
    assert.ok(faq.includes(site.restaurantHours[0].hours), f + ": hours");
    assert.ok(!/not published|não estão publicados/.test(faq), f + ": the FAQ still says the price is not published");
  }
});

test("photographs: WebP with width candidates and reserved space, no third-party image host, each gallery chapter labelled", () => {
  for (const { f, html } of pages()) {
    for (const m of html.matchAll(/<img src="([^"]*\/fotos\/[^"]+)"[^>]*>/g)) assert.ok(/\.webp$/.test(m[1]) && /srcset=/.test(m[0]) && /width="\d+" height="\d+"/.test(m[0]), f + ": " + m[0].slice(0, 120));
    assert.ok(!/images\.unsplash\.com/.test(html), f + ": a picture comes from another host");
  }
  assert.equal([...read("gallery/index.html").matchAll(/<section class="gc /g)].length, 4);
});

test("motion: page transitions and reveals are off for reduced motion, and nothing is hidden without JavaScript", () => {
  const src = readFileSync(join(root, "src/assets/css/signature.css"), "utf8");
  for (const line of src.split("\n").filter((l) => /:not\(\.is-in\)|:not\(\.is-ready\)/.test(l))) assert.ok(/\.js\.cine-motion/.test(line), "a hidden state that is not behind .js.cine-motion: " + line.slice(0, 90));
  assert.ok(/html:not\(\.cine-motion\)::view-transition/.test(src));
});
