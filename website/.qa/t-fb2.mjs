export default async ({ open, eval: ev, wait }) => {
  await open("http://localhost:8080/", 1440, 900);
  return await ev(`document.querySelector("[data-open-feedback]").click();await new Promise(r=>setTimeout(r,1200));const d=document.querySelector("[data-fb-dialog]");return [...d.querySelectorAll("button,a,input,select,textarea")].map(e=>({t:e.tagName+"."+e.className+"["+(e.name||"")+"]",r:Math.round(e.getBoundingClientRect().right),l:Math.round(e.getBoundingClientRect().left),off:e.offsetParent===null})).filter(x=>x.l<-1||x.r>1441)`);
};
