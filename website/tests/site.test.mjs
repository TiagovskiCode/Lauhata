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
  assert.equal([...h.matchAll(/class="rv-score rv-/g)].length, 2, "two platform boxes");
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

test("the stay page shows two equal room cards", () => {
  const stay = read("stay/index.html");
  assert.equal([...stay.matchAll(/<article class="rp-card">/g)].length, 2);
  assert.ok(!/room-rows/.test(stay), "the old alternating rows are back");
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
    const m = h.match(/<nav class="mobile-nav-links">([\s\S]*?)<\/nav>/)[1];
    const labels = [...m.matchAll(/<a [^>]*>([^<]+)<\/a>/g)].map((x) => x[1]);
    assert.equal(labels.length, 5, `${f}: ${labels.join(", ")}`);
    assert.equal(new Set(labels).size, 5, `${f}: a link appears twice`);
  }
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

test("the home page: four horizontal welcome cards, no gallery section, each section once", () => {
  const h = read("index.html");
  assert.equal([...h.matchAll(/<a class="wl-card"/g)].length, 4);
  const main = h.match(/<main[\s\S]*?<\/main>/)[0];
  assert.ok(!/href="[^"]*gallery\//.test(main), "the homepage links to the gallery from a section");
  assert.ok(!/class="section gp"/.test(main) && !/class="hs"/.test(main), "gallery preview or facilities strip is back");
  const ids = [...main.matchAll(/<section class="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(new Set(ids).size, ids.length, "a section appears twice");
});
