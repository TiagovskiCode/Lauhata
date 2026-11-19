export default async ({ open, eval: ev, shot, wait }) => {
  const out = {};
  await open("http://localhost:8080/", 1440, 900);
  out.top = await ev(`const ls=document.querySelector("[data-ls]");return {on:ls.classList.contains("is-on"),disp:getComputedStyle(ls).display}`);
  await shot("C:/Users/tiago/Desktop/Lauhata/website/.qa/m3/ls-top.png");
  out.sections = [];
  for (const id of ["bem-vindo", "especial", "cozinha", "quartos", "experiencias", "arredores", "opinioes", "momento"]) {
    await ev(`const e=document.getElementById("${id}");window.scrollTo({top:e.getBoundingClientRect().top+scrollY+60,behavior:"instant"});return 1`);
    await wait(700);
    out.sections.push([id, await ev(`const a=[...document.querySelectorAll("[data-ls-link]")];const ls=document.querySelector("[data-ls]");return [a.findIndex(x=>x.getAttribute("aria-current"))+1, ls.classList.contains("is-on"), ls.classList.contains("is-dark")]`)]);
    if (id === "experiencias" || id === "especial") await shot(`C:/Users/tiago/Desktop/Lauhata/website/.qa/m3/ls-${id}.png`);
  }
  // hover proximity (real pointer events)
  await ev(`window.scrollTo({top:document.getElementById("especial").getBoundingClientRect().top+scrollY+60,behavior:"instant"});return 1`);
  await wait(600);
  out.hoverBefore = await ev(`return [...document.querySelectorAll("[data-ls-link]")].map(a=>a.style.getPropertyValue("--p")||"0")`);
  await ev(`const a=document.querySelectorAll("[data-ls-link]")[3].getBoundingClientRect();document.querySelector("[data-ls]").dispatchEvent(new PointerEvent("pointermove",{clientX:a.left+5,clientY:a.top+a.height/2,pointerType:"mouse",bubbles:true}));return 1`);
  await wait(500);
  out.hoverAfter = await ev(`return [...document.querySelectorAll("[data-ls-link]")].map(a=>a.style.getPropertyValue("--p"))`);
  await shot("C:/Users/tiago/Desktop/Lauhata/website/.qa/m3/ls-hover.png");
  await ev(`document.querySelector("[data-ls]").dispatchEvent(new PointerEvent("pointerleave"));return 1`);
  await wait(800);
  out.hoverEnd = await ev(`return [...document.querySelectorAll("[data-ls-link]")].map(a=>a.style.getPropertyValue("--p"))`);
  // narrow widths: hidden
  await open("http://localhost:8080/", 1280, 800);
  out.at1280 = await ev(`return getComputedStyle(document.querySelector("[data-ls]")).display`);
  return out;
};
