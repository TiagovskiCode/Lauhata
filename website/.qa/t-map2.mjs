export default async ({ open, eval: ev, shot, wait }) => {
  await open("http://localhost:8080/discover-liquica/", 390, 844, true);
  const r = await ev(`const e=document.querySelector("[data-map-facade]");window.scrollTo({top:e.getBoundingClientRect().top+scrollY-200,left:0,behavior:"instant"});await new Promise(r=>setTimeout(r,400));const b=e.getBoundingClientRect();return {sx:scrollX,left:Math.round(b.left),right:Math.round(b.right),vw:innerWidth,sw:document.documentElement.scrollWidth}`);
  await shot("C:/Users/tiago/Desktop/Lauhata/website/.qa/m3/map-390b.png");
  return r;
};
