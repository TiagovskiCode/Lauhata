export default async ({ open, eval: ev, shot, wait }) => {
  const out = {};
  await open("http://localhost:8080/stay/", 1440, 900);
  await ev(`document.documentElement.style.scrollBehavior="auto";document.querySelector(".rs-compare").scrollIntoView({behavior:"instant"});window.scrollBy(0,-200);return 1`);
  await wait(500);
  await shot("C:/Users/tiago/Desktop/Lauhata/website/.qa/m3/stay-compare.png");
  out.lb = await ev(`const z=document.querySelector(".rs-zoom");z.click();await new Promise(r=>setTimeout(r,500));const d=document.querySelector("[data-lightbox]");const o={open:d.open,src:d.querySelector("[data-lb-img]").src.slice(-40),cap:d.querySelector("[data-lb-cap]").textContent.slice(0,50)};document.querySelector("[data-lb-next]").click();await new Promise(r=>setTimeout(r,200));o.cap2=d.querySelector("[data-lb-cap]").textContent.slice(-8);d.close();return o`);
  out.ld = await ev(`return [...document.querySelectorAll('script[type="application/ld+json"]')].map(s=>{try{return JSON.parse(s.textContent)["@type"]}catch(e){return "ERR"}})`);
  await open("http://localhost:8080/", 1440, 900);
  out.homeLd = await ev(`return [...document.querySelectorAll('script[type="application/ld+json"]')].map(s=>{const j=JSON.parse(s.textContent);return [j["@type"],j.address&&j.address.addressLocality,!!j.telephone,!!j.geo]})`);
  return out;
};
