export default async ({ open, eval: ev, shot, wait }) => {
  const out = {};
  await open("http://localhost:8080/restaurant/", 1440, 900);
  await ev(`document.documentElement.style.scrollBehavior="auto";document.querySelector("#cat-main").scrollIntoView({behavior:"instant"});window.scrollBy(0,-160);return 1`);
  await wait(500);
  await shot("C:/Users/tiago/Desktop/Lauhata/website/.qa/m3/menu-rows.png");
  out.add = await ev(`localStorage.clear();const b=document.querySelector(".dl-add");b.click();await new Promise(r=>setTimeout(r,200));return {cart:document.querySelector("[data-cart-count]").textContent,label:b.textContent.trim(),err:0}`);
  out.search = await ev(`const i=document.querySelector("[data-menu-search]");i.value="fish";i.dispatchEvent(new Event("input",{bubbles:true}));await new Promise(r=>setTimeout(r,200));return [...document.querySelectorAll(".dline")].filter(d=>!d.hidden).length`);
  await open("http://localhost:8080/restaurant/", 390, 844, true);
  await ev(`document.documentElement.style.scrollBehavior="auto";document.querySelector("#cat-main").scrollIntoView({behavior:"instant"});return 1`);
  await wait(400);
  await shot("C:/Users/tiago/Desktop/Lauhata/website/.qa/m3/menu-rows-m.png");
  out.over = await ev(`return document.documentElement.scrollWidth-innerWidth`);
  return out;
};
