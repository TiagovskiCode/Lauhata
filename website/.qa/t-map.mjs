export default async ({ open, eval: ev, shot, wait }) => {
  const out = {};
  for (const [w, h, m] of [[1440, 900, false], [390, 844, true]]) {
    await open("http://localhost:8080/discover-liquica/", w, h, m);
    await ev(`document.documentElement.style.scrollBehavior="auto";document.querySelector("[data-map-facade]").scrollIntoView({block:"center",behavior:"instant"});return 1`);
    await wait(500);
    await shot(`C:/Users/tiago/Desktop/Lauhata/website/.qa/m3/map-${w}.png`);
    out[w] = await ev(`document.querySelector("[data-map-load]").click();await new Promise(r=>setTimeout(r,300));const f=document.querySelector(".map-facade.is-live iframe");return {iframe:!!f,src:f&&f.src.slice(0,40),focused:document.activeElement===f,over:document.documentElement.scrollWidth-innerWidth}`);
  }
  return out;
};
