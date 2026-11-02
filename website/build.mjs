// Static build: renders every page in PT and EN into dist/, copies assets and writes
// sitemap.xml and robots.txt. No dependencies: `node build.mjs`.
import { mkdir, writeFile, rm, cp } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pt from "./src/i18n/pt.mjs";
import en from "./src/i18n/en.mjs";
import { layout } from "./src/layout.mjs";
import * as P from "./src/pages.mjs";
import { rooms, absUrl, outFile, LANGS } from "./src/lib.mjs";
import { prelaunch, printPrelaunch } from "./src/prelaunch.mjs";

const root = dirname(fileURLToPath(import.meta.url));
const dist = join(root, "dist");
const T = { pt, en };

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(join(root, "src/assets"), join(dist, "assets"), { recursive: true });

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
  await emit(t, P.contact(t));
  await emit(t, P.privacy(t));
  await emit(t, P.thanks(t));
  await emit(t, P.notFound(t));
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

console.log(`Built ${count} pages into dist/`);

const report = await prelaunch(dist);
printPrelaunch(report);
if (process.argv.includes("--strict") && report.blockers.length) process.exit(1);
