export default async ({ open, eval: ev }) => {
  const out = {};
  for (const p of ["/contact/", "/discover-liquica/"]) {
    await open("http://localhost:8080" + p, 390, 844, true);
    out[p] = await ev(`const W=390;const list=[];for(const e of document.querySelectorAll("main *")){const b=e.getBoundingClientRect();if(b.width>W+1&&getComputedStyle(e).position!=="fixed")list.push(e.tagName+"."+String(e.className).slice(0,40)+" w="+Math.round(b.width)+" pos="+getComputedStyle(e).position);}const f=document.querySelector(".mf-photo");return {iw:innerWidth,wide:list.slice(0,8),mf:f&&getComputedStyle(f).position}`);
  }
  return out;
};
