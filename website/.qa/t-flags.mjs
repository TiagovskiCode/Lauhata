// Temporarily flags two dishes in menu.mjs (a special and an unavailable one), builds, checks the rendered rows, restores the file.
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
const f = "C:/Users/tiago/Desktop/Lauhata/website/src/data/menu.mjs";
const orig = readFileSync(f, "utf8");
try {
  let s = orig;
  s = s.replace('id: "grilled-fish", category: "main", name: "Grilled Fish", price: 18, featured: true,', 'id: "grilled-fish", category: "main", name: "Grilled Fish", price: 18, featured: true, special: true,');
  s = s.replace('id: "steak-bitoque", category: "main", name: "Steak (Bitoque)", price: 19,', 'id: "steak-bitoque", category: "main", name: "Steak (Bitoque)", price: 19, available: false,');
  if (s === orig) throw new Error("flags not applied");
  writeFileSync(f, s);
  execSync("node build.mjs", { cwd: "C:/Users/tiago/Desktop/Lauhata/website", stdio: "ignore" });
  const h = readFileSync("C:/Users/tiago/Desktop/Lauhata/website/dist/restaurant/index.html", "utf8");
  const rows = [...h.matchAll(/<article class="dline[^"]*"[\s\S]*?<\/article>/g)].map((m) => m[0]);
  const g = rows.find((r) => r.includes("Grilled Fish"));
  const st = rows.find((r) => r.includes("Steak (Bitoque)"));
  console.log(JSON.stringify({
    specialBadge: /is-special">Today's special/.test(g), specialStillOrderable: /data-add=/.test(g),
    offBadge: /is-off">Not available today/.test(st), offRow: /class="dline is-off"/.test(st), offOrderable: /data-add=/.test(st),
  }));
} finally {
  writeFileSync(f, orig);
  execSync("node build.mjs", { cwd: "C:/Users/tiago/Desktop/Lauhata/website", stdio: "ignore" });
}
