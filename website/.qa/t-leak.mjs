export default async ({ open, eval: ev }) => {
  await open("http://localhost:8080/restaurant/", 1440, 900);
  return await ev(`document.querySelector("#ementa").scrollIntoView();window.scrollBy(0,320);await new Promise(r=>setTimeout(r,400));const e=document.elementFromPoint(1100,400);const cs=getComputedStyle(document.querySelector("[data-mobile-nav]"));return {tag:e.tagName,cls:e.className,parent:e.parentElement&&e.parentElement.className,dlgDisplay:cs.display,dlgOpen:document.querySelector("[data-mobile-nav]").open,inDialog:!!e.closest("dialog"),dlg:e.closest("dialog")&&e.closest("dialog").className}`);
};
