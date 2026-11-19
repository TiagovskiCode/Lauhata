export default async ({ open, eval: ev, shot, wait }) => {
  const out = {};
  for (const [w, h] of [[1440, 900], [1024, 768], [820, 1180], [390, 844]]) {
    await open("http://localhost:8080/restaurant/", w, h, w < 700);
    out[w] = await ev(`const g=(s)=>{const e=document.querySelector(s);return e?getComputedStyle(e).display:"none"};const side=document.querySelector(".menu-side").getBoundingClientRect();const body=document.querySelector(".menu-body").getBoundingClientRect();return {filter:g(".menu-filter"),nav:g(".menu-nav"),sideLeft:Math.round(side.left),sideW:Math.round(side.width),bodyLeft:Math.round(body.left),over:document.documentElement.scrollWidth-innerWidth}`);
  }
  await open("http://localhost:8080/restaurant/", 1440, 900);
  await ev(`document.querySelector("#ementa").scrollIntoView();window.scrollBy(0,320);return 1`);
  await wait(500);
  out.sticky = await ev(`const s=document.querySelector(".menu-side").getBoundingClientRect();return {top:Math.round(s.top)}`);
  await shot("C:/Users/tiago/Desktop/Lauhata/website/.qa/m3/rest-left.png");
  // click a category: scrolls, becomes current
  await ev(`document.querySelector('[data-cat-link="main"]').click();return 1`);
  await wait(1500);
  out.afterClick = await ev(`return {cur:[...document.querySelectorAll("[data-cat-link]")].filter(a=>a.getAttribute("aria-current")).map(a=>a.dataset.catLink),y:Math.round(scrollY),mainTop:Math.round(document.getElementById("cat-main").getBoundingClientRect().top)}`);
  return out;
};
