export default async ({ open, eval: ev, shot, wait }) => {
  const out = {};
  await open("http://localhost:8080/", 1980, 1100);
  await ev(`document.querySelector("[data-open-feedback]").click();return 1`);
  await wait(1200);
  out.form = await ev(`const f=document.querySelector("#rv-form");const r=f.getBoundingClientRect();return {open:f.open,box:[Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)],sw:f.scrollWidth,cw:f.clientWidth,pw:document.documentElement.scrollWidth-innerWidth}`);
  await ev(`const b=document.querySelector("#rv-form .pk-btn");b&&b.click();return 1`);
  await wait(600);
  out.pop = await ev(`const p=document.querySelector(".pk-pop");if(!p)return null;const r=p.getBoundingClientRect();const cs=getComputedStyle(p);return {box:[Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)],pos:cs.position,parent:p.parentElement.tagName+"."+p.parentElement.className,inDialog:!!p.closest("dialog")}`);
  await shot("C:/Users/tiago/Desktop/Lauhata/website/.qa/m3/fb1.png");
  return out;
};
