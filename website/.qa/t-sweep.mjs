// Sweep: document overflow on every page, then every dialog opened on its own (width, sideways scroll, controls inside the viewport).
export default async ({ open, eval: ev, wait }) => {
  const bad = [];
  let checks = 0;
  const pages = ["/", "/pt/", "/restaurant/", "/pt/restaurante/", "/stay/", "/events/", "/gallery/", "/contact/", "/about/", "/discover-liquica/", "/privacy/"];
  const sizes = [[1980, 1100, false], [1440, 900, false], [1024, 768, false], [820, 1180, true], [430, 932, true], [390, 844, true], [375, 667, true], [667, 375, true]];
  for (const [w, h, m] of sizes) {
    for (const p of pages) {
      await open("http://localhost:8080" + p, w, h, m);
      const r = await ev(`document.documentElement.style.scrollBehavior="auto";const o=document.documentElement.scrollWidth-document.documentElement.clientWidth;const culprits=[];if(o>0){for(const e of document.querySelectorAll("body *")){const b=e.getBoundingClientRect();if(b.right>innerWidth+1&&b.width>0&&getComputedStyle(e).position!=="fixed"&&!e.closest("dialog,.kc-track,.rs-track,.menu-nav ul,[hidden]"))culprits.push(e.tagName+"."+String(e.className).slice(0,30));}}return {o,culprits:culprits.slice(0,4)}`);
      checks++;
      if (r.o > 0) bad.push({ page: p, size: `${w}x${h}`, overflow: r.o, culprits: r.culprits });
    }
    // dialogs, opened one at a time on the home page and the restaurant page
    const dialogs = [
      ["/", "booking", `document.querySelector("[data-book-open]").click()`, "[data-book-dialog]"],
      ["/", "feedback", `document.querySelector("[data-open-feedback]").click()`, "[data-fb-dialog]"],
      ["/", "cart", `document.querySelector("[data-cart-open]:not([data-cart-fab])").click()`, "[data-cart]"],
      ["/restaurant/", "dish", `document.querySelector("[data-dish-open], .dish a, .dish-media, .dc-open")?.click()`, ".dish-dialog"],
      ["/", "menu", `document.querySelector("[data-nav-open]").click()`, "[data-mobile-nav]"],
    ];
    for (const [page, name, action, sel] of dialogs) {
      if (name === "menu" && w >= 1280) continue;
      await open("http://localhost:8080" + page, w, h, m);
      const r = await ev(`${action};await new Promise(r=>setTimeout(r,1300));const d=document.querySelector(${JSON.stringify(sel)});if(!d||!d.open)return {skipped:true};const b=d.getBoundingClientRect();const inner=[...d.querySelectorAll("button,a,input,select,textarea")].filter(e=>e.offsetParent!==null||getComputedStyle(e).position==="fixed").map(e=>e.getBoundingClientRect()).filter(r=>r.width>0&&(r.left<-1||r.right>innerWidth+1));return {sw:d.scrollWidth-d.clientWidth,left:Math.round(b.left),right:Math.round(b.right),vw:innerWidth,outside:inner.length,sh:d.scrollHeight>d.clientHeight+2}`);
      if (r.skipped) continue;
      checks++;
      if (r.sw > 1 || r.outside || r.left < -1 || r.right > r.vw + 1) bad.push({ dialog: name, size: `${w}x${h}`, ...r });
    }
  }
  return { checks, bad };
};
