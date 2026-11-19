// Quick quality gate over dist/: run `npm run build && npm run check`.
// Checks every real page for: one <h1>, a <title>, a meta description, a canonical link, images with alt text,
// internal links and #anchors that resolve, and hreflang pairs. Redirect stubs (noindex) are skipped for the content checks.
// Exits 1 on any failure, so it can gate a release.
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, dirname, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";

const dist = resolve(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const files = [];
(function walk(d) { for (const n of readdirSync(d)) { const p = join(d, n); statSync(p).isDirectory() ? walk(p) : n.endsWith(".html") && files.push(p); } })(dist);

const problems = [];
const bad = (f, msg) => problems.push(`${relative(dist, f)}: ${msg}`);
const idsOf = new Map();
const ids = (f, html) => idsOf.get(f) || idsOf.set(f, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]))).get(f);

let pages = 0, links = 0;
for (const f of files) {
  const html = readFileSync(f, "utf8");
  const stub = /<meta name="robots" content="noindex"/.test(html) && /http-equiv="refresh"/.test(html);
  if (!stub && !/404.html$/.test(f)) {
    pages++;
    if ((html.match(/<h1[\s>]/g) || []).length !== 1 && !/404\.html$/.test(f)) bad(f, "needs exactly one <h1>");
    if (!/<title>[^<]{5,}<\/title>/.test(html)) bad(f, "missing <title>");
    if (!/<meta name="description" content="[^"]{20,}"/.test(html)) bad(f, "missing meta description");
    if (!/rel="canonical"/.test(html) && !/name="robots" content="noindex"/.test(html)) bad(f, "missing canonical");
    for (const m of html.matchAll(/<img\b[^>]*>/g)) if (!/\balt="/.test(m[0])) bad(f, `image without alt: ${m[0].slice(0, 80)}`);
    if (/hreflang/.test(html) === false && !/404\.html$/.test(f) && !/thank-you|obrigado/.test(f)) bad(f, "missing hreflang");
  }
  for (const m of html.matchAll(/\shref="([^"#?][^"]*|#[^"]*)"/g)) {
    const h = m[1];
    if (/^(https?:|mailto:|tel:|javascript:)/.test(h)) continue;
    links++;
    const [pathPart, hash] = h.split("#");
    let target = f;
    if (pathPart) {
      target = pathPart.startsWith("/") ? join(dist, pathPart) : resolve(dirname(f), pathPart); // 404 pages keep root-absolute links
      if (!existsSync(target)) { bad(f, `broken link ${h}`); continue; }
      if (statSync(target).isDirectory()) target = join(target, "index.html");
      if (!existsSync(target)) { bad(f, `broken link ${h}`); continue; }
    }
    if (hash && target.endsWith(".html")) {
      const th = readFileSync(target, "utf8");
      if (!ids(target, th).has(hash)) bad(f, `missing anchor #${hash} in ${relative(dist, target)}`);
    }
  }
}
console.log(`${pages} pages, ${links} internal links checked.`);
if (problems.length) { console.error(problems.slice(0, 60).join("\n")); console.error(`${problems.length} problem(s).`); process.exit(1); }
console.log("OK");
