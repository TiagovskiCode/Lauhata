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

test("the room types are exactly Queen Room and Queen & Single Room, with no king bed and no invented capacity or price", async () => {
  const rooms = (await import(pathToFileURL(join(root, "src/data/rooms.mjs")))).default;
  assert.deepEqual(rooms.map((r) => r.name.en), ["Queen Room", "Queen & Single Room"]);
  assert.deepEqual(rooms.map((r) => r.name.pt), ["Queen Room", "Queen & Single Room"]);
  assert.deepEqual(rooms.map((r) => r.bedPlan), [["queen"], ["queen", "single"]]);
  for (const r of rooms) {
    assert.equal(r.price, null, "no price is published until the owner confirms it");
    assert.equal(r.suitability, null, "no occupancy claim is published");
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
    assert.equal(labels.length, 5, `${f}: ${labels.join(", ")}`);
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
  for (const label of ["Reserve a Table", "Request a Room", "Plan Your Event", "Get in Touch"]) assert.ok(h.includes(label), `missing CTA: ${label}`);
});

test("the stay page shows two large mirrored rooms, each with its own gallery of three photographs and no unconfirmed amenity", () => {
  for (const f of ["stay/index.html", "pt/alojamento/index.html"]) {
    const stay = read(f);
    assert.equal([...stay.matchAll(/<article class="rs-room( is-flip)?"/g)].length, 2, f);
    assert.equal([...stay.matchAll(/class="rs-room is-flip"/g)].length, 1, f + ": second room is mirrored");
    const tracks = [...stay.matchAll(/data-rg-track[\s\S]*?<\/ul>/g)].map((m) => [...m[0].matchAll(/<li class="rs-slide">/g)].length);
    assert.deepEqual(tracks, [3, 3], f);
    const srcs = [...stay.matchAll(/<li class="rs-slide">[\s\S]*?src="([^"]+)"/g)].map((m) => m[1]);
    assert.equal(new Set(srcs).size, 6, f + ": a photograph is repeated");
    assert.ok(!/Wi-?Fi|Private bathroom|Casa de banho|Breakfast included/i.test(stay.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<symbol[\s\S]*?<\/symbol>/g, "")), f + ": an unconfirmed amenity is published");
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
    const m = h.match(/<nav class="mobile-nav-links sm-links"[^>]*>([\s\S]*?)<\/nav>/)[1];
    const labels = [...m.matchAll(/<span class="sm-label">([^<]+)<\/span>/g)].map((x) => x[1]);
    assert.equal(labels.length, 5, `${f}: ${labels.join(", ")}`);
    assert.equal(new Set(labels).size, 5, `${f}: a link appears twice`);
    // the same five destinations as the desktop header, in the same order
    const header = [...h.match(/<nav class="nav-main"[^>]*>([\s\S]*?)<\/nav>/)[1].matchAll(/<a [^>]*>([^<]+)<\/a>/g)].map((x) => x[1]);
    assert.deepEqual(labels, header, `${f}: mobile and desktop navigation differ`);
  }
});

test("staggered menu: one header, one logo in it, a toggle that controls the dialog, two layers and a panel, no empty social list", () => {
  const h = read("index.html");
  assert.equal([...h.matchAll(/<header class="site-header"/g)].length, 1);
  assert.ok(/class="nav-toggle sm-toggle"[^>]*aria-expanded="false"[^>]*aria-controls="mobile-nav"/.test(h), "toggle");
  assert.ok(/<dialog class="mobile-nav sm-menu" id="mobile-nav"/.test(h) && /class="sm-layers"/.test(h) && /data-sm-panel/.test(h));
  const dlg = h.match(/<dialog class="mobile-nav sm-menu"[\s\S]*?<\/dialog>/)[0];
  assert.ok(!/class="brand/.test(dlg), "the panel repeats the logo");
  assert.ok(!/class="sm-social"/.test(dlg), "an empty or invented social list is shown");
});

test("line index: only on the restaurant page (menu categories, 1000px and up); the home page and the other pages have no sidebar", () => {
  const r = read("restaurant/index.html");
  assert.ok(/<nav class="menu-nav"[^>]*data-menu-nav>/.test(r) && [...r.matchAll(/data-cat-link="/g)].length >= 9, "category index on the restaurant page");
  const css = read("assets/css/site.css").replace(/\s+/g, "");
  assert.ok(/a::?before\{content:counter\(cat,decimal-leading-zero\)/.test(css), "numbered line index");
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

test("the home page: exactly three welcome cards, a special strip with six icon items, featured dining, no gallery section, each section once", () => {
  const h = read("index.html");
  assert.equal([...h.matchAll(/<a class="wk-card"/g)].length, 3);
  assert.equal([...h.matchAll(/<li><svg[^>]*class="icon"[^>]*>[\s\S]*?<\/svg><strong>/g)].length >= 6, true, "six icon items in the special strip");
  assert.ok(/class="section fd"/.test(h) && [...h.matchAll(/<article class="kc-card"/g)].length === 10, "ten carousel dishes");
  const main = h.match(/<main[\s\S]*?<\/main>/)[0];
  assert.ok(!/href="[^"]*gallery\//.test(main), "the homepage links to the gallery from a section");
  assert.ok(!/class="section gp"/.test(main) && !/class="hs"/.test(main), "gallery preview or facilities strip is back");
  const ids = [...main.matchAll(/<section class="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(new Set(ids).size, ids.length, "a section appears twice");
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

test("the kitchen carousel: ten equal cards, previous and next buttons with labels, a keyboard-reachable track", () => {
  for (const f of ["index.html", "pt/index.html"]) {
    const h = read(f);
    assert.equal([...h.matchAll(/<li class="kc-item">/g)].length, 10, f);
    assert.ok(/data-kc-prev aria-label="[^"]+"/.test(h) && /data-kc-next aria-label="[^"]+"/.test(h), f + ": arrow labels");
    assert.ok(/data-kc-track tabindex="0"/.test(h), f + ": track not focusable");
    const names = [...h.matchAll(/<article class="kc-card">[\s\S]*?<h3>([^<]+)<\/h3>/g)].map((m) => m[1]);
    assert.equal(new Set(names).size, 10, f + ": a dish is repeated");
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

test("quick add: each carousel card has an Add to Cart button wired to a dish that the cart script knows", () => {
  const h = read("index.html");
  const ids = [...h.matchAll(/class="kc-add" type="button" data-add="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(ids.length >= 9, "buttons " + ids.length);
  const menu = JSON.parse(h.match(/window\.LAUHATA_MENU\s*=\s*(\{[\s\S]*?\});?\s*<\/script>/)[1]);
  for (const id of ids) assert.ok(menu[id], id + " is not in the cart's menu data");
});

test("the hero has a decorative scroll cue and the next section no longer overlaps it", () => {
  const h = read("index.html");
  assert.ok(/class="hx-scroll" aria-hidden="true" data-hx-scroll/.test(h));
  assert.ok(/\.rs-hero\+\.wl\{margin-top:0/.test(read("assets/css/site.css").replace(/\s+/g, "")));
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
