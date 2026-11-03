import fs from "node:fs";
const files = fs.readdirSync(".").filter((f) => f.endsWith(".css"));
const MARK = "(prefers-reduced-motion: reduce)";
const scope = (sel) => {
  sel = sel.trim();
  if (!sel) return sel;
  if (sel === "html" || sel === ":root") return "html:not(.cine-motion)";
  if (sel.startsWith(".js ")) return "html.js:not(.cine-motion) " + sel.slice(4);
  return "html:not(.cine-motion) " + sel;
};
let total = 0;
for (const f of files) {
  let css = fs.readFileSync(f, "utf8"); let out = "", i = 0, blocks = 0;
  while (true) {
    const at = css.indexOf("@media " + MARK, i);
    if (at < 0) { out += css.slice(i); break; }
    out += css.slice(i, at);
    const open = css.indexOf("{", at); let depth = 1, j = open + 1;
    while (depth && j < css.length) { if (css[j] === "{") depth++; else if (css[j] === "}") depth--; j++; }
    const inner = css.slice(open + 1, j - 1);
    // rewrite every rule's selector list inside the block ("sel, sel { decls }")
    const rewritten = inner.replace(/([^{}]+)\{([^{}]*)\}/g, (m, sels, decls) => {
      const lead = sels.match(/^\s*/)[0];
      const list = sels.trim().split(",").map(scope).join(", ");
      return lead + list + " {" + decls + "}";
    });
    out += css.slice(at, open + 1) + rewritten + "}"; i = j; blocks++;
  }
  if (blocks) { fs.writeFileSync(f, out); console.log(f + ": " + blocks + " block(s) scoped"); total += blocks; }
}
console.log("total blocks:", total);
