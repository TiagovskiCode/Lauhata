export default async ({ open, eval: ev, shot, wait }) => {
  const out = {};
  await open("http://localhost:8080/", 1440, 900);
  await ev(`document.documentElement.style.scrollBehavior="auto";document.querySelector("#cozinha").scrollIntoView({behavior:"instant"});return 1`);
  await wait(500);
  await shot("C:/Users/tiago/Desktop/Lauhata/website/.qa/m3/ph-home.png");
  out.cart = await ev(`localStorage.clear();const b=[...document.querySelectorAll(".kc-add")][0];b.click();await new Promise(r=>setTimeout(r,200));document.querySelector('[data-cart-open]:not([data-cart-fab])').click();await new Promise(r=>setTimeout(r,500));const d=document.querySelector("[data-cart]");d.style.animation="none";return {thumb:document.querySelector(".cl-thumb").className,open:d.open}`);
  await shot("C:/Users/tiago/Desktop/Lauhata/website/.qa/m3/ph-cart.png");
  await ev(`localStorage.clear();return 1`);
  await open("http://localhost:8080/restaurant/", 1440, 900);
  await ev(`document.documentElement.style.scrollBehavior="auto";document.querySelector("#cat-vegetarian").scrollIntoView({behavior:"instant"});window.scrollBy(0,-120);return 1`);
  await wait(500);
  await shot("C:/Users/tiago/Desktop/Lauhata/website/.qa/m3/ph-menu.png");
  return out;
};
