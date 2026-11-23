export default async ({ open, eval: ev, shot, wait }) => {
  const out = {};
  await open("http://localhost:8080/restaurant/", 1440, 900);
  await ev(`document.documentElement.style.scrollBehavior="auto";document.querySelector("#cat-main").scrollIntoView({behavior:"instant"});window.scrollBy(0,-120);return 1`);
  await wait(400);
  await shot("C:/Users/tiago/Desktop/Lauhata/website/.qa/m3/menu-rows.png");
  out.add = await ev(`localStorage.clear();const rows=[...document.querySelectorAll(".dline")].filter(r=>r.querySelector(".d-add")&&!/Choose/.test(r.querySelector(".d-add").textContent));const b=rows[0].querySelector(".d-add");const name=rows[0].querySelector(".dl-name").textContent;b.click();await new Promise(r=>setTimeout(r,250));return {name,cart:document.querySelector("[data-cart-count]").textContent,label:b.textContent.trim(),stored:JSON.parse(localStorage.getItem("lauhata-cart-v1")).lines.map(l=>[l.name,l.qty,l.cents])}`);
  await open("http://localhost:8080/restaurant/", 390, 844, true);
  await ev(`document.documentElement.style.scrollBehavior="auto";document.querySelector("#cat-main").scrollIntoView({behavior:"instant"});return 1`);
  await wait(400);
  await shot("C:/Users/tiago/Desktop/Lauhata/website/.qa/m3/menu-rows-m.png");
  out.over = await ev(`return document.documentElement.scrollWidth-innerWidth`);
  return out;
};
