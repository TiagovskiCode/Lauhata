// Pre-launch check: lists what is still missing before the site can go live. Printed after every
// build; `node build.mjs --strict` exits with an error while any blocker is left (useful in a deploy
// script). Nothing here changes the site: it only reads the data files and the built pages.
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import site from "./data/site.mjs";
import rooms, { pendingAmenities } from "./data/rooms.mjs";
import { sampleDrinks } from "./data/sample-drinks.mjs";
import { items } from "./data/menu.mjs";
import images from "./data/images.mjs";

async function builtHtml(dist) {
  const out = [];
  for (const e of await readdir(dist, { recursive: true, withFileTypes: true })) {
    if (e.isFile() && e.name.endsWith(".html")) out.push(await readFile(join(e.parentPath ?? e.path, e.name), "utf8"));
  }
  return out.join("\n");
}

export async function prelaunch(dist) {
  const blockers = [];
  const warnings = [];
  const html = await builtHtml(dist);

  if (/\.example\b/.test(site.siteUrl)) blockers.push("Domínio final por definir (`siteUrl` em site.mjs): canonical, sitemap, robots e Open Graph usam um endereço de exemplo.");
  if (!site.whatsapp) blockers.push("Número de WhatsApp por configurar (`whatsapp` em site.mjs): sem ele, os pedidos abrem o WhatsApp sem destinatário.");
  if (!site.phone) warnings.push("Telefone por preencher (`phone`).");
  if (!site.email) warnings.push("Email por preencher (`email`).");
  if (!site.restaurantHours.length) warnings.push("Horário do restaurante por preencher (`restaurantHours`).");
  if (!site.order.types.length) warnings.push("Tipos de pedido por confirmar (`order.types` em site.mjs): sem eles o pedido só pede o nome. Falta saber se há consumo no local, takeaway ou entrega.");
  if (!site.stayTimes) warnings.push("Horas de check-in/check-out por preencher (`stayTimes`).");
  if (!site.receptionHours) warnings.push("Horário da receção por confirmar (`receptionHours`).");
  if (!site.geo) warnings.push("Coordenadas exatas por preencher (`geo`): o mapa usa uma pesquisa por nome.");
  if (!site.driveFromDili) warnings.push("Tempo de viagem desde Díli por preencher (`driveFromDili`).");
  if (!Object.values(site.social).some(Boolean)) warnings.push("Redes sociais por preencher (`social`).");
  if (!site.reviewsUrl) warnings.push("Página de avaliações (Google/TripAdvisor) por preencher (`reviewsUrl`).");

  const noPriceRooms = rooms.filter((r) => !r.price).length;
  const orderable = (d) => d.price != null || d.options.some((g) => g.choices.some((c) => c.price != null));
  const noPriceDishes = items.filter((d) => !orderable(d)).length;
  if (noPriceRooms) warnings.push(`${noPriceRooms} quartos sem preço (\`price\` em rooms.mjs): mostram «Preço a confirmar».`);
  if (noPriceDishes) warnings.push(`${noPriceDishes} pratos sem preço (\`price\` em menu.mjs): mostram «Preço a confirmar».`);
  const noPhoto = items.filter((d) => !d.image).length;
  if (noPhoto) warnings.push(`${noPhoto} pratos sem fotografia própria (campo image em menu.mjs): aparecem sem imagem até haver fotos reais de cada prato.`);
  const unsure = items.filter((d) => d.confirm).length;
  if (unsure) warnings.push(`${unsure} preços das pizzas estão escritos à mão na ementa (campo confirm em menu.mjs): confirmar com o restaurante.`);
  const feat = items.filter((d) => d.featured).length;
  if (feat) warnings.push(`${feat} pratos em «Os mais escolhidos» foram escolhidos sem dados de vendas (campo featured em menu.mjs): confirmar quais são.`);
  if (pendingAmenities.length) warnings.push(`Comodidades por confirmar (\`pendingAmenities\` em rooms.mjs): ${pendingAmenities.map((a) => a.pt).join(", ")}.`);
  for (const r of rooms.filter((x) => x.capacityPending)) warnings.push(`Capacidade pendente do ${r.name.pt} (\`capacityPending\` em rooms.mjs): ${r.capacity.pt}, a confirmar idades das crianças e condições de ocupação.`);
  const provisional = sampleDrinks.filter((d) => d.provisional).length;
  if (provisional) warnings.push(`${provisional} bebidas com preço PROVISÓRIO estimado (\`provisional\` em sample-drinks.mjs): validar com o Carlos — lista em docs/PRECOS-PROVISORIOS-BEBIDAS.md.`);

  const illustrative = Object.entries(images).filter(([, im]) => im.placeholder).map(([k]) => k);
  if (illustrative.length) warnings.push(`${illustrative.length} fotografias ilustrativas em uso (${illustrative.join(", ")}): estão assinaladas, mas não são do Lauhata.`);
  const noInterior = rooms.filter((r) => !r.images.length).length;
  if (noInterior) warnings.push(`${noInterior} quartos sem fotografias do interior (\`images\` em rooms.mjs): mostram o exterior, com nota.`);
  warnings.push("Saudações em tétum na secção «Um dia no Lauhata» (Bondia, Botarde, Bonoite): pedir a um falante que confirme a grafia.");
  if (site.showPlaceholderNotes) warnings.push("`showPlaceholderNotes` ainda é true: o rodapé e a ementa mostram avisos de conteúdo provisório.");

  return { blockers, warnings };
}

export function printPrelaunch({ blockers, warnings }) {
  if (!blockers.length && !warnings.length) return console.log("Pré-lançamento: nada em falta.");
  console.log(`\nAntes de publicar: ${blockers.length} bloqueio(s), ${warnings.length} aviso(s).`);
  for (const b of blockers) console.log(`  [BLOQUEIO] ${b}`);
  for (const w of warnings) console.log(`  [aviso]    ${w}`);
}
