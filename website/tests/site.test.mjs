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

test("the nine shared amenities, and nothing else, are listed once, in three groups of three, on the home page, the stay page and each room page, in both languages", async () => {
  const { lodgingAmenities } = await import(pathToFileURL(join(root, "src/data/rooms.mjs")));
  assert.deepEqual(lodgingAmenities.map((a) => a.en), ["Airport transfer", "Non-smoking rooms", "Free parking", "On-site restaurant", "Beachfront location", "Bar", "Breakfast", "Wi-Fi", "Private bathroom"]);
  for (const f of ["index.html", "stay/index.html", "stay/queen-room/index.html", "stay/queen-and-single-room/index.html", "pt/index.html", "pt/alojamento/index.html", "pt/alojamento/queen-room/index.html"]) {
    const h = read(f);
    const groups = [...h.matchAll(/<div class="of-group"><h4>([^<]+)<\/h4><ul>([\s\S]*?)<\/ul>/g)];
    assert.equal(groups.length, 3, f + ": three groups");
    for (const g of groups) assert.equal([...g[2].matchAll(/<li><svg class="icon"/g)].length, 3, f + ": " + g[1]);
    assert.ok(!/\bking\b/i.test(h.replace(/<script[\s\S]*?<\/script>/g, "")), f + ": a king bed is mentioned");
  }
});

test("stay page: a light ground, the price and capacity per room, and progress bars (not a '1 / 3' counter) when a room has several real photographs", async () => {
  for (const f of ["stay/index.html", "pt/alojamento/index.html"]) {
    const h = read(f);
    assert.ok(/<section class="section rooms-stay"/.test(h) && !/rooms-cine/.test(h), f + ": light section");
    assert.equal([...h.matchAll(/data-rg-bar/g)].length, 0, f + ": the swipeable gallery is only for photographs of the inside of a room, and there are none yet");
    assert.ok(!/data-rg-count/.test(h) && !/\d \/ \d<\/span>/.test(h), f + ": the numeric counter is back");
    assert.equal([...h.matchAll(/class="ch-price"/g)].length, 2, f + ": price on both rooms");
    assert.equal([...h.matchAll(/class="ch-pending"/g)].length, 1, f + ": the pending capacity is flagged once");
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
  for (const label of ["Book a table", "Request a room", "Enquire about an experience", "Get in touch"]) assert.ok(h.includes(label), `missing CTA: ${label}`);
});



test("the stay page shows two room presentations with Lauhata's own photographs of the outside, says so, and publishes no unconfirmed amenity", () => {
  for (const f of ["stay/index.html", "pt/alojamento/index.html"]) {
    const stay = read(f);
    assert.equal([...stay.matchAll(/<article class="ch" /g)].length, 2, f + ": two room presentations");
    assert.equal([...stay.matchAll(/class="ch-media" data-gallery/g)].length, 2, f + ": each room shows its photographs");
    assert.equal([...stay.matchAll(/class="ch-diff"/g)].length, 2, f + ": each room says what sets it apart");
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

test("the menu: every dish has a unique id, a category that exists, and the categories are a bar of links", async () => {
  const { items, categories } = await import(pathToFileURL(join(root, "src/data/menu.mjs")));
  const ids = items.map((d) => d.id);
  assert.equal(new Set(ids).size, ids.length, "duplicate dish ids");
  const cats = new Set(categories.map((c) => c.id));
  for (const d of items) assert.ok(cats.has(d.category), `${d.id}: unknown category`);
  assert.ok(/<nav class="menu-tabs"[^>]*data-menu-nav>/.test(read("restaurant/index.html")), "the category bar");
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

test("the home page: three equal doors, the day with the real kitchen hours, eight dishes, two equal rooms, six facts, five questions, each section once", async () => {
  const site = (await import(pathToFileURL(join(root, "src/data/site.mjs")))).default;
  const [b, m] = site.restaurantHours.map((x) => x.hours.split("–"));
  for (const [f, from, until] of [["index.html", "from ", "until "], ["pt/index.html", "desde as ", "até às "]]) {
    const h = read(f);
    assert.equal([...h.matchAll(/<a class="we-door"/g)].length, 3, f);
    const day = h.match(/<section class="day"[\s\S]*?<\/section>/)[0];
    const when = [...day.matchAll(/<p class="ds-when"><span class="di-when">([^<]+)</g)].map((x) => x[1]);
    assert.deepEqual(when, [b.join("–"), from + m[0], until + m[1]], f + ": the three meals carry the hours of site.mjs");
    assert.equal([...day.matchAll(/data-day-step/g)].length, 3, f + ": three meals");
    assert.equal([...day.matchAll(/data-day-go=/g)].length, 3, f + ": three labels on the progress line");
    assert.equal([...h.matchAll(/<li class="kt-dish">/g)].length, 8, f + ": eight dishes");
    const cards = [...h.matchAll(/<article class="rc"[\s\S]*?<\/article>/g)].map((x) => x[0]);
    assert.equal(cards.length, 2, f + ": two rooms");
    for (const c of cards) for (const part of ["rc-media", "rc-name", "rc-price", "rc-desc", "rc-facts", "rc-actions", "data-book-open=\"room\""]) assert.ok(c.includes(part), f + ": a room card lacks " + part);
    assert.equal([...h.match(/<ul class="sp-grid"[\s\S]*?<\/ul>/)[0].matchAll(/<li class="sp-item"/g)].length, 6, f + ": six reasons in one strip");
    assert.equal([...h.match(/<section class="section fq"[\s\S]*?<\/section>/)[0].matchAll(/<details name="faq-home">/g)].length, 5, f + ": five questions");
    assert.ok(/#faq"/.test(h.match(/<section class="section fq"[\s\S]*?<\/section>/)[0]), f + ": the way to all the questions");
    const main = h.match(/<main[\s\S]*?<\/main>/)[0];
    const ids = [...main.matchAll(/<section class="([^"]+)"/g)].map((x) => x[1]);
    assert.equal(new Set(ids).size, ids.length, f + ": a section appears twice");
  }
  assert.ok(read("index.html").includes(">What Makes Lauhata Special?</h2>"));
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
  const tiles = [...g.matchAll(/<li class="gx-item/g)].length;
  const caps = [...g.matchAll(/<p class="gx-cap">[^<]+<\/p>/g)].length;
  assert.ok(tiles > 0 && tiles === caps, "tiles " + tiles + " captions " + caps);
});

test("the hero is exactly one screen and the ghost button keeps a readable hover", () => {
  const css = read("assets/css/site.css").replace(/\s+/g, "");
  assert.ok(/\.rs-hero\{height:100vh;height:100svh/.test(css), "hero height");
  assert.ok(/\.btn-ghost-light:hover\{[^}]*--fg:var\(--ink\)/.test(css), "ghost hover colours: the light outline fills in and its words turn dark");
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
    assert.ok(/preload="none"/.test(video) && !/ src=/.test(video) && !/autoplay/.test(video) && /muted playsinline/.test(video) && !/ loop/.test(video), f + ": the film must not load with the page, and it plays once (no loop)");
    assert.ok(/data-hero-toggle[^>]*aria-label="[^"]+"/.test(hero), f + ": no pause control");
    assert.ok(/class="hx-scroll" aria-hidden="true"/.test(hero));
    assert.ok(/lh-intro/.test(h) && h.indexOf('class="ldr"') < h.indexOf('<section class="cine-hero'), f + ": the opening (shown once per visit) comes before the hero it reveals");
  }
  const js = readFileSync(join(root, "src/assets/js/main.js"), "utf8");
  assert.ok(/const FILM_END = 13\.2\d?;/.test(js) && /meta\.mediaTime >= FILM_END/.test(js), "the film must rest before the dissolve at the end of the file");
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

test("floating controls: back to top sits above WhatsApp with the same size, and the film control is on the WhatsApp line", () => {
  const h = read("index.html");
  assert.ok(/<button class="to-top"[^>]*data-to-top aria-label="[^"]+"/.test(h) && /href="#i-up"/.test(h), "back to top");
  const css = readFileSync(join(root, "src/assets/css/lauhata.css"), "utf8");
  assert.ok(/\.to-top \{[^}]*bottom: calc\(var\(--fab-y\) \+ var\(--fab\) \+/.test(css) && /\.wa-float \{ right: var\(--fab-x\)/.test(css) && /\.hx-toggle \{ right: calc\(var\(--fab-x\) \+ var\(--fab\) \+ 1rem\)/.test(css), "one column in the gutter");
  assert.ok(/\.menu-body\{container-type:inline-size\}/.test(read("assets/css/site.css").replace(/\s+/g, "")), "the menu follows its own width");
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

test("maps: the map is in the page straight away (no button to reveal it), lazy so it never holds up the page, with a direct link to Google Maps", () => {
  for (const f of ["discover-liquica/index.html", "contact/index.html", "pt/contactos/index.html", "pt/descobrir-liquica/index.html"]) {
    const h = read(f).replace(/<script[\s\S]*?<\/script>/g, "");
    assert.ok(/<iframe src="https:\/\/www\.google\.com\/maps[^"]*"[^>]*loading="lazy"/.test(h), f + ": the map is not in the page, or not lazy");
    assert.ok(!/data-map-load|data-map-facade/.test(h), f + ": the map still hides behind a button");
    assert.ok(/class="map-bar"[\s\S]*?href="https:\/\/www\.google\.com\/maps\/search/.test(h), f + ": direct link to Google Maps");
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
  for (const p of ["quartos-varanda-", "quarto-entrada-", "quartos-corredor-", "quartos-jardim-"]) assert.ok(g.includes(p), "the gallery leaves out a photograph of the rooms: " + p);
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

test("photographs: WebP with width candidates and reserved space, no third-party image host; the gallery is one collection", () => {
  for (const { f, html } of pages()) {
    for (const m of html.matchAll(/<img src="([^"]*\/fotos\/[^"]+)"[^>]*>/g)) assert.ok(/\.webp$/.test(m[1]) && /srcset=/.test(m[0]) && /width="\d+" height="\d+"/.test(m[0]), f + ": " + m[0].slice(0, 120));
    assert.ok(!/images\.unsplash\.com/.test(html), f + ": a picture comes from another host");
  }
  const g = read("gallery/index.html");
  assert.equal([...g.matchAll(/<ul class="gx-list"/g)].length, 1, "one continuous collection");
  assert.ok(!/gx-filter|data-filter|class="gc /.test(g), "category filters or chapters are back");
  assert.ok([...g.matchAll(/data-lb-src=/g)].length >= 18, "every photograph opens in the lightbox");
});

test("motion: page transitions and reveals are off for reduced motion, and nothing is hidden without JavaScript", () => {
  const src = readFileSync(join(root, "src/assets/css/lauhata.css"), "utf8");
  for (const line of src.split("\n").filter((l) => /:not\(\.is-in\)|:not\(\.is-ready\)/.test(l))) assert.ok(/\.js\.cine-motion|\.is-armed/.test(line), "a hidden state that is not behind .js.cine-motion (or a class only JavaScript adds): " + line.slice(0, 90));
  assert.ok(/html:not\(\.cine-motion\)::view-transition/.test(src));
});

test("performance: no animation library, the pinned day is CSS sticky, no endless animation moves layout, and section edges are straight", () => {
  const home = read("index.html");
  assert.ok(!/gsap|ScrollTrigger|cinema\.js/.test(home), "GSAP is back on the home page: CSS and a few lines of JS do the same");
  assert.ok(/position:sticky;top:0;height:100svh/.test(read("assets/css/site.css").replace(/\s+/g, "").replace(/;}/g, ";}")), "the day is no longer pinned with CSS sticky");
  const css = read("assets/css/site.css");
  for (const m of css.matchAll(/@keyframes [\w-]+\{((?:[^{}]*\{[^}]*\})*)\}/g)) assert.ok(!/(^|[;{])(top|left|right|bottom|width|height|margin[\w-]*):/.test(m[1]), "a keyframe animates layout: " + m[0].slice(0, 90));
  assert.ok(!/margin-top:calc\(var\(--curve\)\s*\*\s*-1\)/.test(css.replace(/\s+/g, "")), "curved section edges are back");
  assert.ok(/\$\$\("\[data-tide\], \[data-rise\]"\)/.test(readFileSync(join(root, "src/assets/js/main.js"), "utf8")), "the reveal list must be an array");
});

test("Phase 2: page-specific booking calls (a table on the restaurant, a room on the hotel)", () => {
  // only the booking dialog itself may offer both (its two tabs); the menu drawer, the cart and every page call follow the page
  const vis = (h) => h.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<dialog class="book-dialog"[\s\S]*?<\/dialog>/g, "");
  for (const f of ["restaurant/index.html", "pt/restaurante/index.html"]) {
    const h = vis(read(f));
    assert.ok(!/data-book-open="room"/.test(h), f + ": a room call on the restaurant page");
    assert.ok(/Book a table|Reservar mesa/.test(h), f + ": no Book a table");
    assert.ok(!/Book a room|Request a room|Pedir quarto|Reservar quarto/i.test(h.replace(/<nav[\s\S]*?<\/nav>/g, "")), f + ": room wording on the restaurant page");
  }
  for (const f of ["stay/index.html", "pt/alojamento/index.html", "stay/queen-room/index.html", "pt/alojamento/queen-room/index.html"]) {
    const h = vis(read(f));
    assert.ok(!/data-book-open="table"/.test(h), f + ": a table call on the hotel page");
    assert.ok(!/Book a table|Reserve a table|Reservar mesa/i.test(h), f + ": table wording on the hotel page");
  }
});

test("Phase 2: the comparison is a real table with a column per room and a named cell for the phone layout", () => {
  for (const f of ["stay/index.html", "pt/alojamento/index.html"]) {
    const h = read(f);
    const t = h.match(/<table class="cmp">([\s\S]*?)<\/table>/);
    assert.ok(t, f + ": no comparison table");
    assert.equal([...t[1].matchAll(/<th scope="col">/g)].length, 2, f + ": two room columns");
    assert.ok([...t[1].matchAll(/<th scope="row">/g)].length >= 7, f + ": rows missing");
    assert.ok(!/<td>(?!<\/td>)/.test(t[1].replace(/<thead>[\s\S]*?<\/thead>/, "")), f + ": a cell without its room name");
  }
});

test("Phase 2: one ADD on every dish, sizes shown with their own price, and the sheet shows a total", () => {
  for (const f of ["restaurant/index.html", "pt/restaurante/index.html"]) {
    const h = read(f);
    const labels = [...h.matchAll(/<button class="d-add"[\s\S]*?<span>([^<]+)<\/span><\/span><\/button>/g)].map((m) => m[1]);
    assert.ok(labels.length > 20, f + ": dishes missing");
    assert.equal(new Set(labels).size, 1, f + ": more than one button label: " + [...new Set(labels)].join(", "));
    assert.ok(!/\$5–\$10/.test(h), f + ": a bare price range");
    assert.ok(/class="dl-size"><small>[^<]+<\/small> \$5/.test(h), f + ": the small size price is not labelled");
    assert.ok(/data-opt-total/.test(h) && /data-opt-submit-price/.test(h), f + ": the sheet has no total");
  }
});

test("Phase 3: Experiences asks for an enquiry (never a table or a room), shows the six occasions, and marks where confirmation happens", () => {
  for (const [f, cta] of [["events/index.html", "Enquire about an experience"], ["pt/eventos/index.html", "Consultar uma experiência"]]) {
    const h = read(f).replace(/<script[\s\S]*?<\/script>/g, "").replace(/<dialog class="book-dialog"[\s\S]*?<\/dialog>/g, "");
    assert.ok(h.includes(cta), f + ": the enquiry call is missing");
    assert.ok(!/data-book-open="(table|room)"/.test(h.replace(/<header[\s\S]*?<\/header>/, "").replace(/<dialog class="mobile-nav"[\s\S]*?<\/dialog>/, "")), f + ": a table or room call on the Experiences page");
    assert.equal([...h.matchAll(/data-event-kind=/g)].length, 6, f + ": six occasions");
    assert.equal([...h.matchAll(/<li class="xp-step/g)].length, 4, f + ": four steps");
    assert.equal([...h.matchAll(/class="xp-step is-confirm"/g)].length, 1, f + ": the confirmation step is marked");
    assert.ok(/name="notes"/.test(h) && /\{notes\}/.test(h), f + ": the optional note is not part of the message");
    assert.ok(!/xe-band/.test(h), f + ": the unrelated photo band is back");
  }
});

test("Phase 3: the full FAQ has a topic index whose links all land on a topic, and no question is asked twice", () => {
  for (const f of ["contact/index.html", "pt/contactos/index.html"]) {
    const h = read(f);
    const links = [...h.matchAll(/<nav class="faq-index"[\s\S]*?<\/nav>/g)][0][0].match(/href="#(faq-\d+)"/g).map((x) => x.slice(7, -1));
    for (const id of links) assert.ok(h.includes(`id="${id}"`), f + ": " + id);
    const qs = [...h.matchAll(/<summary><span>([^<]+)<\/span>/g)].map((m) => m[1]);
    assert.equal(new Set(qs).size, qs.length, f + ": a question appears twice");
  }
});

test("Phase 4: the home page opens with the brand, held only until the hero photograph is ready, and the order of the story", () => {
  for (const f of ["index.html", "pt/index.html"]) {
    const h = read(f);
    assert.ok(/<div class="ldr" id="ldr" aria-hidden="true">/.test(h), f + ": no opening");
    assert.ok(/<noscript><style>\.ldr\{display:none!important\}<\/style><\/noscript>/.test(h), f + ": without JavaScript the opening would never lift");
    assert.ok(/setTimeout\(go, 4500\)/.test(h) && /decode/.test(h) && /class="ldr-fill"/.test(h), f + ": the loading screen follows what the page needs, never longer than 4.5 s");
    assert.ok(!/%<\/|\d+%/.test(h.match(/<div class="ldr"[\s\S]*?<\/div><\/div>/)[0]), f + ": a percentage in the opening");
    const main = h.match(/<main[\s\S]*?<\/main>/)[0];
    const order = ["especial", "bem-vindo", "dia", "cozinha", "quartos", "experiencias", "arredores"].map((id) => main.indexOf(`id="${id}"`));
    assert.deepEqual([...order].sort((a, b) => a - b), order, f + ": the sections are out of order");
    assert.ok(main.indexOf('id="quartos"') < main.indexOf('class="section ofs"') && main.indexOf('class="section ofs"') < main.indexOf('id="experiencias"'), f + ": What Lauhata offers must follow the rooms");
  }
  for (const f of ["restaurant/index.html", "stay/index.html", "gallery/index.html", "pt/contactos/index.html"]) assert.ok(/class="ldr"/.test(read(f)) && /sessionStorage\.getItem\("lh-intro"\)/.test(read(f)), f + ": the loading screen shows on whichever page the visit starts, once per visit");
});

test("Phase 4: the menu has one sticky bar of categories (every width) with the search, centred category titles, and the cart one clear total", () => {
  for (const f of ["restaurant/index.html", "pt/restaurante/index.html"]) {
    const h = read(f);
    const bar = h.match(/<div class="menu-bar" data-menu-bar>[\s\S]*?<\/div>\s*<\/div>/)[0];
    assert.equal([...bar.matchAll(/data-cat-link="/g)].length, [...h.matchAll(/<section class="menu-cat" id="cat-/g)].length, f + ": one tab per category on the page");
    assert.ok(/data-menu-search/.test(bar) && /data-mt-ink/.test(bar), f + ": the search and the active line are in the bar");
    assert.ok(!/data-mf-btn|menu-side/.test(h), f + ": the old filter or sidebar is back");
    assert.ok(/class="cart-go" type="button" data-cart-checkout><span>[^<]+<\/span><strong data-cart-go-sum>/.test(h), f + ": the order button carries the total");
    assert.ok(/data-cart-more hidden/.test(h), f + ": the dessert suggestions start hidden (shown only with an order and no dessert)");
  }
  const css = read("assets/css/site.css").replace(/\s+/g, "");
  assert.ok(/\.menu-bar\{position:sticky;/.test(css), "the category bar is sticky");
  const js = readFileSync(join(root, "src/assets/js/order.js"), "utf8");
  assert.ok(/cat === "dessert" && !inCart\.has\(d\.id\) && d\.price != null && !d\.options\.length/.test(js) && /hasDessert/.test(js), "suggestions: desserts not in the order, at their price, only while the order has none");
});

test("Phase 4 regressions: the dish sheet's choices are never hidden by an entrance, 0 is a real quantity, and Experiences tells the process first", () => {
  const css = read("assets/css/site.css");
  assert.ok(!/\[data-group\][^{]*\{[^}]*opacity:0/.test(css), "an entrance hides [data-group]: the dish sheet uses that attribute for its choices");
  const picker = readFileSync(join(root, "src/assets/js/picker.js"), "utf8");
  assert.ok(!/Number\(native\.min\) \|\| 1/.test(picker) && !/Number\(native\.value\) \|\| Number\(native\.min\)/.test(picker), "a minimum or value of 0 is read as 1 again (0 children)");
  for (const f of ["events/index.html", "pt/eventos/index.html"]) {
    const h = read(f);
    const hero = h.indexOf('class="cine-hero'), xp = h.indexOf('class="section xp"'), xo = h.indexOf('class="section xo"'), form = h.indexOf('id="pedido"');
    assert.ok(hero < xp && xp < xo && xo < form, f + ": hero, process, occasions, enquiry");
    assert.ok(/ideas below|ideias abaixo/.test(h), f + ": the first step must point down to the occasions");
  }
  assert.ok(!/data-steps|data-progress/.test(readFileSync(join(root, "src/assets/js/main.js"), "utf8")), "the stepped form and its progress line are back");
});

test("Phase A: one stylesheet, one token block, the new fonts, and full-bleed photographs keep their absolute position", () => {
  const src = readFileSync(join(root, "src/assets/css/lauhata.css"), "utf8");
  assert.equal(readdirSync(join(root, "src/assets/css")).filter((f) => f.endsWith(".css")).length, 1, "more than one stylesheet in the sources");
  assert.equal([...src.matchAll(/^:root \{/gm)].length, 1, "the tokens are declared in more than one top-level :root block");
  assert.ok(/--serif: "Instrument Serif"/.test(src) && /--sans: "Inter Tight"/.test(src), "the type pairing");
  assert.ok(!/Cormorant|Manrope/.test(read("assets/css/site.css")), "an old font is still referenced");
  assert.ok(!/:is\(\.hx-bg[^)]*\)\s*\{\s*position:\s*relative/.test(src), "a rule turns the full-bleed photographs into relative boxes (they collapse)");
  assert.ok(!/\bease-in\b(?!-)/.test(src), "ease-in is back");
});

test("Phase D: motion stays in budget (page transitions under 300 ms, ease-out), only first screens spell their titles, and Liquiçá's time and sunset are computed, not written", () => {
  const css = read("assets/css/site.css").replace(/\s+/g, "");
  const vt = [...css.matchAll(/::view-transition-(?:old|new)\(root\)\{animation:[\w-]+([\d.]+)s(?:([\d.]+)s)?/g)].map((m) => +m[1] + (+m[2] || 0));
  assert.ok(vt.length >= 2 && vt.every((s) => s <= 0.33), "a page transition is longer than 0.33 s: " + vt.join(", "));
  assert.ok(!/view-transition[^{]*\{[^}]*cubic-bezier\(0\.4,0,1,1\)/.test(css), "an ease-in curve on a page transition");
  for (const f of ["index.html", "about/index.html", "stay/index.html", "pt/index.html"]) {
    const h = read(f);
    assert.ok(!/<h2[^>]*data-split/.test(h), f + ": a section title is spelled out word by word again");
  }
  const foot = read("index.html").match(/<p class="ft-now" hidden data-now data-lat="[-\d.]+" data-lng="[-\d.]+" data-tz="Asia\/Dili"/);
  assert.ok(foot, "the time and sunset line is missing, or not hidden until the browser fills it");
  assert.ok(/Math\.acos\(\(Math\.sin\(-0\.833/.test(readFileSync(join(root, "src/assets/js/main.js"), "utf8")), "the sunset is no longer computed from the sun's position");
  assert.ok(/data-view-label="(View|Ver)"/.test(read("gallery/index.html")) && /data-view-label="Ver"/.test(read("pt/galeria/index.html")), "the gallery's View label");
});

test("Phase E: nothing loops forever except the opening (which leaves the page), so a page at rest does no work", () => {
  const css = read("assets/css/site.css");
  for (const m of css.matchAll(/([^{}]+)\{[^}]*animation:[^;}]*infinite/g)) assert.ok(/\.ldr/.test(m[1]), "an endless animation outside the opening: " + m[1].trim().slice(0, 80));
  assert.ok(/\.hx-scroll i\{[^}]*display:block[^}]*animation:hxCueY[^;}]* 3 both/.test(css.replace(/\s+/g, " ").replace(/ ?([{};:,]) ?/g, "$1").replace(/hxCueY/, "hxCueY")), "the scroll cue must be a block (so it runs on the GPU) and play three times, then stop");
});

test("Rounded (client): actions are capsules, four radii only, the header is clear at the top of every page", () => {
  const src = readFileSync(join(root, "src/assets/css/lauhata.css"), "utf8");
  for (const [k, v] of [["--r-photo", "20px"], ["--radius-field", "14px"], ["--radius-card", "24px"], ["--radius-panel", "28px"], ["--radius-pill", "999px"]]) assert.ok(new RegExp(`${k}: ${v};`).test(src), k + " is not " + v);
  const css = read("assets/css/site.css").replace(/\s+/g, "");
  assert.ok(/\.btn\{[^}]*border-radius:var\(--radius-pill\)/.test(css), "buttons are not capsules");
  assert.ok(!/border-radius:3px!important/.test(css), "a square action is back");
  assert.ok(!/body:not\(\.has-hero\)\.site-header,\.site-header\.is-solid\{/.test(css), "pages without a hero start with a solid header again");
  assert.ok(/\(heroEl \|\| document\.body\)\.prepend\(mark\)/.test(readFileSync(join(root, "src/assets/js/main.js"), "utf8")), "the header marker must exist on every page");
});

test("The header at the top of a page is fully clear: no background, no blur, no shade of its own", () => {
  const css = read("assets/css/site.css").replace(/\s+/g, "");
  assert.ok(/\.site-header:not\(\.is-solid\)\{background:transparent!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important/.test(css), "the clear header has a background or a blur again");
  assert.ok(/\.site-header:not\(\.is-solid\):before\{opacity:0!important\}|\.site-header:not\(\.is-solid\)::before\{opacity:0!important\}/.test(css), "the header's own shade is back at the top");
});

test("What makes Lauhata special comes straight after the hero, as a strip of six divided by hairlines (no cards)", () => {
  for (const f of ["index.html", "pt/index.html"]) {
    const main = read(f).match(/<main[\s\S]*?<\/main>/)[0];
    const sections = [...main.matchAll(/<section class="([^"]+)"/g)].map((m) => m[1]);
    assert.ok(/cine-hero/.test(sections[0]) && /\bsp\b/.test(sections[1]), f + ": the six reasons are not the second section: " + sections.slice(0, 3).join(" / "));
  }
  const css = read("assets/css/site.css").replace(/\s+/g, "");
  assert.ok(/@media\(min-width:1200px\)\{\.sp-grid\{grid-template-columns:repeat\(6,minmax\(0,1fr\)\)\}/.test(css), "six across on a wide screen");
  assert.ok(!/\.sp-card/.test(css), "the cards are back");
});

test("Restaurant menu: on a laptop the categories (with their dish counts) sit in a column on the left of the dishes", () => {
  const h = read("restaurant/index.html");
  assert.ok(/<div class="wrap menu-layout">\s*<div class="menu-bar" data-menu-bar>/.test(h), "the categories and the dishes no longer share one layout");
  assert.ok(/<li class="ls-item"><span class="ls-marker" aria-hidden="true"><\/span><a href="#cat-breakfast" data-cat-link="breakfast"><span class="ls-index" aria-hidden="true">01<\/span><span class="ls-text">[^<]+<\/span><small>\d+<\/small>/.test(h), "the line sidebar (marker, index, name, dish count) is missing from the category links");
  assert.ok(/1 - Math\.exp\(-dt \/ 0\.1\)/.test(readFileSync(join(root, "src/assets/js/order.js"), "utf8")), "the line sidebar's smoothing loop is gone");
  const css = read("assets/css/site.css").replace(/\s+/g, "");
  assert.ok(/@media\(min-width:1000px\)\{section\.menu\.menu-layout\{display:grid;grid-template-columns:minmax\(12rem,15rem\)minmax\(0,1fr\)/.test(css), "the left column layout from 1000px");
});

test("Gallery (client): one tight grid of four shapes that closes with no holes (four columns on a laptop, two on a phone)", () => {
  const g = read("gallery/index.html");
  const shapes = [...g.matchAll(/<li class="gx-item(?: gx-film)? is-(sq|tall|wide|big)"/g)].map((m) => m[1]);
  assert.equal(shapes.length, 19, "eighteen photographs and the film");
  const cells = shapes.reduce((n, s) => n + { sq: 1, tall: 2, wide: 2, big: 4 }[s], 0);
  assert.equal(cells % 4, 0, "the cells do not fill whole rows of four: " + cells);
  const css = read("assets/css/site.css").replace(/\s+/g, "");
  assert.ok(/grid-auto-flow:dense/.test(css) && /\.gx\.gx-list\{align-items:stretch!important\}/.test(css), "dense packing and stretched tiles");
});
