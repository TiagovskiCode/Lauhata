export default async ({ open, eval: ev, shot }) => {
  const out = {};
  for (const [w, h, m] of [[320, 568, true], [375, 667, true], [390, 844, true], [430, 932, true], [667, 375, true], [768, 1024, true], [1100, 800, false], [1279, 800, false], [1280, 800, false]]) {
    await open("http://localhost:8080/", w, h, m);
    out[w + "x" + h] = await ev(`const r=(s)=>{const e=document.querySelector(s);if(!e||!e.offsetParent&&getComputedStyle(e).position!=="fixed")return null;const b=e.getBoundingClientRect();return [Math.round(b.left),Math.round(b.width),Math.round(b.height)]};const lang=document.querySelector(".lang-dd");return {over:document.documentElement.scrollWidth-innerWidth,hdr:Math.round(document.querySelector(".site-header").getBoundingClientRect().height),logo:r(".site-header .brand"),tog:r("[data-nav-open]"),navMain:getComputedStyle(document.querySelector(".nav-main")).display,toggleShown:getComputedStyle(document.querySelector("[data-nav-open]")).display,lang:lang&&r(".lang-dd"),cart:r(".site-header .cart-btn")}`);
  }
  await open("http://localhost:8080/", 375, 667, true);
  await shot("C:/Users/tiago/Desktop/Lauhata/website/.qa/m3/hdr-375.png");
  return out;
};
