// Fetches TEMPORARY, illustrative photos for every dish (and the sample drinks) from Wikimedia Commons (openly licensed:
// public domain, CC0, CC BY or CC BY-SA), so the menu can be judged visually before Lauhata's own photos exist.
//   node tools/fotos-temporarias.mjs            fetch what is missing
//   node tools/fotos-temporarias.mjs --refresh  fetch again for every dish
//   node tools/fotos-temporarias.mjs --only=id1,id2   reject the current photo of these dishes and fetch another
//                                                     (the rejected file is added to `skip`, so it never comes back)
// Writes the originals to fotos-originais/temporarias/<id>.jpg and the credits to src/data/temp-photos.json; then run
// `powershell -File tools/otimizar-temporarias.ps1` to make the web sizes. On the site each photo carries an
// "Illustrative image" label and is credited on the privacy page. A real photo in src/assets/img/pratos/<id>-640.jpg
// always replaces it. `skip` lists Commons files already rejected for a dish (wrong food), so a re-run picks another.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { items } from "../src/data/menu.mjs";
import { sampleDrinks } from "../src/data/sample-drinks.mjs";

const root = new URL("../", import.meta.url);
const outDir = new URL("fotos-originais/temporarias/", root);
const credFile = new URL("src/data/temp-photos.json", root);
const refresh = process.argv.includes("--refresh");
const only = (process.argv.find((a) => a.startsWith("--only=")) || "").slice(7).split(",").filter(Boolean);
await mkdir(outDir, { recursive: true });
const credits = existsSync(credFile) && !refresh ? JSON.parse(await readFile(credFile, "utf8")) : {};

// Search words per dish: the printed name alone is sometimes too vague for an image search.
const Q = {
  "choice-of-eggs": "fried eggs toast", "egg-chicken-sausage-toast": "sausage egg toast breakfast", omelette: "omelette",
  "baked-beans-toast": "baked beans on toast", "french-toast": "french toast", pancakes: "pancakes banana", "cereal-choices": "cornflakes bowl milk",
  "seasonal-fruit-salad": "fruit salad bowl", "caesar-salad": "caesar salad", "greek-salad": "greek salad", "tuna-salad": "tuna salad",
  "clams-garlic-bread": "clams white wine", "calamari-rings": "fried calamari", "satay-starter": "sate ayam", "spring-rolls-samosa": "spring rolls",
  "chips-starter": "french fries ketchup", "potato-soup": "potato soup", "tom-yum-prawns": "tom yum goong", "grilled-fish": "grilled fish fillet",
  "steak-bitoque": "bitoque", "grilled-chicken": "grilled chicken plate", "grilled-pork-belly": "grilled pork belly", "saute-prawns": "garlic prawns",
  "satay-main": "satay rice", "chicken-curry": "chicken curry", spaghetti: "spaghetti bolognese", "mie-goreng": "mie goreng", "lauhata-special-fried-rice": "nasi goreng",
  "grilled-burger": "hamburger fries", "club-sandwich": "club sandwich", "vegetarian-fried-rice": "vegetable fried rice", "spaghetti-pesto": "pasta pesto",
  "vegetable-curry": "vegetable curry", "vegetarian-dhal-fry": "dal fry", "stir-fry-vegetables": "stir fried vegetables", "sauteed-vegetables": "sauteed vegetables",
  "green-salad": "green salad", "chips-side": "french fries", "spicy-potato-wedges": "potato wedges", "garlic-bread": "garlic bread", "steam-rice": "steamed rice",
  cheesecake: "cheesecake", "orange-cake": "orange cake", "chocolate-mud-cake": "chocolate cake", "red-velvet-cake": "red velvet cake",
  "mixed-ice-cream": "ice cream scoops", "fruit-platter": "fruit platter", "pizza-margarita": "pizza margherita", "pizza-pepperoni": "pepperoni pizza",
  "pizza-hawaiian": "hawaiian pizza", "pizza-spicy-chicken": "chicken pizza", "pizza-lauhata-seafood": "seafood pizza", "pizza-meat-lover": "meat pizza",
  // Tighter words after a first run picked the wrong food (or people, brands or paintings) for these:
  "grilled-fish": "grilled fish", "steak-bitoque": "steak egg", "grilled-burger": "burger fries", "chips-side": "fries",
  "stir-fry-vegetables": "stir fry vegetables", "steam-rice": "white rice", "fruit-platter": "fruit plate", "tuna-salad": "nicoise salad",
  "sample-water": "glass of water", "sample-coconut": "coconut drink", "sample-soft": "lemonade glass", "sample-pina-colada": "pina colada cocktail", "sample-mocktail-passion": "passion fruit juice",
  "sample-beer": "beer glass", "sample-wine": "red wine glass",
};
const targets = [...items.map((d) => ({ id: d.id, q: Q[d.id] || d.name })), ...sampleDrinks.map((d) => ({ id: d.id, q: Q[d.id] || d.query }))];
const used = new Set(Object.values(credits).map((c) => c.page));
const skip = new Set(Object.values(credits).flatMap((c) => c.skip || []));
const UA = { "User-Agent": "LauhataSiteBuild/1.0 (temporary menu photos; static website build)" };
const strip = (h = "") => h.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
const rank = (lic) => (/^(cc0|public domain|pd)/i.test(lic) ? 0 : /^cc by \d/i.test(lic) ? 1 : /^cc by-sa/i.test(lic) ? 2 : 9);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

for (const { id, q } of targets) {
  if (only.length ? !only.includes(id) : credits[id] && existsSync(new URL(`${id}.jpg`, outDir))) continue;
  const api = `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=25&gsrsearch=${encodeURIComponent("filetype:bitmap " + q)}&prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=1280`;
  let data = null;
  for (let attempt = 0; attempt < 6 && !data; attempt++) { // Commons answers "too many requests" in plain text: wait and retry
    const res = await fetch(api, { headers: UA });
    const text = await res.text();
    try { data = JSON.parse(text); } catch { await sleep(15000 * (attempt + 1)); }
  }
  if (!data) { console.log(id, "search kept failing"); continue; }
  const words = q.toLowerCase().split(/\s+/);
  const prev = credits[id];
  // Asking again for a dish with --only means its current photo was rejected: remember it so it is never picked again.
  if (only.includes(id) && prev?.title) prev.skip = [...new Set([...(prev.skip || []), prev.title])];
  const name = (t) => t.replace(/^File:/, "").replace(/\.[a-z]+$/i, "");
  const rejected = new Set([...skip, ...(prev?.skip || [])].map(name));
  // Paintings, artworks and photos of people are never a menu illustration.
  const offTopic = /(painting|vermeer|art project|museum|portrait|\bman\b|\bwoman\b|girls?\b|people|sausage|marshmallow|beach|praia|big mac|mcdonald|coca|fanta|pepsi|sprite|welch|freshippo|starbucks|heineken|droplets|\bbee\b|trees?\b|canada|can\b|cans\b|in canada|ingredients)/i;
  const cands = Object.values(data.query?.pages || {})
    .map((p) => ({ p, ii: p.imageinfo?.[0] }))
    .filter(({ p, ii }) => ii && ii.width >= 1000 && ii.width > ii.height * 1.15 && ii.width < ii.height * 2 && !used.has(ii.descriptionurl) && !rejected.has(name(p.title)) && !offTopic.test(p.title))
    .map(({ p, ii }) => {
      const lic = ii.extmetadata?.LicenseShortName?.value || "";
      const title = p.title.toLowerCase();
      const hits = words.filter((w) => title.includes(w)).length;
      return { p, ii, lic, score: hits * 10 - rank(lic) * 3 - (p.index || 0) * 0.2 };
    })
    .filter((c) => rank(c.lic) < 9 && c.score >= Math.ceil(words.length / 2) * 10 - 12) // most of the search words must be in the file name
    .sort((a, b) => b.score - a.score);
  const pick = cands[0];
  if (!pick) { console.log(id, "no suitable photo for", q); continue; }
  let img = await fetch(pick.ii.thumburl, { headers: UA });
  for (let attempt = 0; attempt < 5 && img.status === 429; attempt++) { await sleep(15000 * (attempt + 1)); img = await fetch(pick.ii.thumburl, { headers: UA }); }
  if (!img.ok) { console.log(id, "download HTTP", img.status); continue; }
  await writeFile(new URL(`${id}.jpg`, outDir), Buffer.from(await img.arrayBuffer()));
  if (prev?.page) used.delete(prev.page);
  used.add(pick.ii.descriptionurl);
  const m = pick.ii.extmetadata || {};
  credits[id] = {
    query: q,
    title: pick.p.title.replace(/^File:/, "").replace(/\.[a-z]+$/i, ""),
    creator: strip(m.Artist?.value) || "Unknown",
    license: pick.lic,
    licenseUrl: m.LicenseUrl?.value || "",
    page: pick.ii.descriptionurl,
    skip: prev?.skip || [],
  };
  console.log(id, "<-", pick.lic, "|", credits[id].title.slice(0, 60));
  await writeFile(credFile, JSON.stringify(credits, null, 2));
  await sleep(3000);
}
await writeFile(credFile, JSON.stringify(credits, null, 2));
console.log("done:", Object.keys(credits).length, "photos");
