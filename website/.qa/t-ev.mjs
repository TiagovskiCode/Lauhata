export default async ({ open, eval: ev, shot, wait }) => {
  await open("http://localhost:8080/events/", 1440, 900);
  return await ev(`document.documentElement.style.scrollBehavior="auto";const b=document.querySelector(".ev-form .pk-btn");b.scrollIntoView({block:"center",behavior:"instant"});await new Promise(r=>setTimeout(r,200));b.click();await new Promise(r=>setTimeout(r,400));const br=b.getBoundingClientRect();const p=[...document.querySelectorAll(".pk-pop")].find(x=>!x.hidden);const pr=p.getBoundingClientRect();return {btn:[br.left,br.top,br.right,br.bottom].map(Math.round),pop:[pr.left,pr.top,pr.right,pr.bottom].map(Math.round),side:p.dataset.side,cls:p.className,vh:innerHeight,parent:p.parentElement.tagName}`);
};
