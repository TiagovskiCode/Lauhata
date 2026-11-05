// Static build: renders every page in PT and EN into dist/, copies assets and writes
// sitemap.xml and robots.txt. No dependencies: `node build.mjs`.
import { mkdir, writeFile, rm, cp } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pt from "./src/i18n/pt.mjs";
import en from "./src/i18n/en.mjs";
import { layout } from "./src/layout.mjs";
import * as P from "./src/pages.mjs";
import { rooms, absUrl, outFile, LANGS, href } from "./src/lib.mjs";
import { prelaunch, printPrelaunch } from "./src/prelaunch.mjs";
import { items, categories } from "./src/data/menu.mjs";
import { existsSync } from "node:fs";

const root = dirname(fileURLToPath(import.meta.url));
const dist = join(root, "dist");
const T = { pt, en };

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
// Raw footage is never published: only the web version in src/assets/video/ (see README); the originals live in videos-originais/.
const isRawVideo = (p) => /[\\/]assets[\\/]img[\\/]video([\\/]|$)/.test(p);
await cp(join(root, "src/assets"), join(dist, "assets"), { recursive: true, filter: (p) => !isRawVideo(p) });

const sitemap = [];
let count = 0;

// Turns root paths ("/assets/…", "/en/stay/") into paths relative to the page, so the site works
// from any folder (e.g. a local server opened on the project root) and not only at a domain root.
// Absolute URLs (canonical, Open Graph, JSON-LD) are left alone; `"/>` closing tags are skipped.
// ", /" catches the later candidates of a srcset.
function relativize(html, pagePath) {
  const depth = pagePath.split("/").length - 2;
  const up = depth > 0 ? "../".repeat(depth) : "./";
  return html.replace(/(["'(]|, )\/(?=["'#?a-z0-9])/gi, `$1${up}`);
}

async function emit(t, page) {
  const html = layout(t, page);
  const file = join(dist, outFile(page.path));
  await mkdir(dirname(file), { recursive: true });
  // 404 pages are served at whatever URL was missing, so they keep root paths.
  await writeFile(file, page.page === "notFound" ? html : relativize(html, page.path));
  count++;
  if (!page.robots && t.lang === "pt") sitemap.push({ pt: page.path, en: page.alt });
}

for (const L of LANGS) {
  const t = T[L];
  await emit(t, P.home(t));
  await emit(t, P.restaurant(t));
  await emit(t, P.stay(t));
  for (const r of rooms) await emit(t, P.room(t, r));
  await emit(t, P.about(t));
  await emit(t, P.events(t));
  await emit(t, P.gallery(t));
  await emit(t, P.discover(t));
  await emit(t, P.contact(t));
  await emit(t, P.privacy(t));
  await emit(t, P.thanks(t));
  await emit(t, P.notFound(t));
  // The suites were renamed (phase 8): their old addresses forward to the new pages, so shared links keep working.
  for (const r of rooms) {
    if (!r.oldSlug) continue;
    const to = href("room:" + r.id, L);
    const from = href("stay", L) + r.oldSlug[L] + "/";
    const file = join(dist, outFile(from));
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, relativize(`<!doctype html><html lang="${t.htmlLang}"><head><meta charset="utf-8"><meta name="robots" content="noindex"><link rel="canonical" href="${absUrl(to)}"><meta http-equiv="refresh" content="0; url=${to}"><title>${r.name[L]}</title></head><body><p><a href="${to}">${r.name[L]}</a></p></body></html>`, from));
  }
}

const urls = sitemap
  .flatMap(({ pt: p, en: e }) =>
    [p, e].map(
      (loc) => `  <url>
    <loc>${absUrl(loc)}</loc>
    <xhtml:link rel="alternate" hreflang="pt-PT" href="${absUrl(p)}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${absUrl(e)}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${absUrl(p)}"/>
  </url>`
    )
  )
  .join("\n");
await writeFile(
  join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`
);

await writeFile(
  join(dist, "robots.txt"),
  `# Lauhata — search engines and AI crawlers may read the public pages.
User-agent: *
Allow: /
Disallow: /obrigado/
Disallow: /en/thank-you/

Sitemap: ${absUrl("/sitemap.xml")}
`
);

// One photo slot per dish: the list the restaurant works from (which file each dish needs, and which are still missing).
{
  const rows = items.map((d) => {
    const cat = categories.find((c) => c.id === d.category);
    const real = d.image || existsSync(P.dishPhotoFile(d));
    return `| ${cat.name.pt} | ${d.name} | ${d.price == null ? "—" : "$" + d.price} | \`src/assets/img/pratos/${d.id}-640.jpg\` | ${real ? "fotografia real" : "**em falta**"} |`;
  });
  const missing = rows.filter((r) => r.includes("em falta")).length;
  await writeFile(
    join(root, "FOTOS-PRATOS.md"),
    `# Fotografias dos pratos\n\nGerado por \`node build.mjs\`. Cada prato da ementa tem o seu espaço de fotografia. Basta guardar a foto real com o nome indicado (4:3, 640 px de largura; opcionalmente também \`-1080.jpg\`) e voltar a gerar o site.\n\n${items.length} pratos · ${items.length - missing} com fotografia real · ${missing} em falta.\n\n| Categoria | Prato | Preço | Ficheiro | Estado |\n|---|---|---|---|---|\n${rows.join("\n")}\n`
  );
}

console.log(`Built ${count} pages into dist/`);

const report = await prelaunch(dist);
printPrelaunch(report);
if (process.argv.includes("--strict") && report.blockers.length) process.exit(1);
