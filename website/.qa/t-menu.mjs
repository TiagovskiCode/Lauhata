export default async ({ open, eval: ev, shot, wait, send }) => {
  const out = {};
  await open("http://localhost:8080/restaurant/", 390, 844, true);
  out.before = await ev(`return {gsap:!!window.gsap, tog:document.querySelector("[data-nav-open]").getBoundingClientRect().toJSON()}`);
  await ev(`document.querySelector("[data-nav-open]").click();return 1`);
  out.frames = [];
  for (const t of [120, 300, 450, 800, 1300]) {
    await wait(t - (out.frames.length ? [120, 300, 450, 800, 1300][out.frames.length - 1] : 0));
    out.frames.push([t, await ev(`const p=document.querySelector(".sm-panel").getBoundingClientRect();const l=[...document.querySelectorAll(".sm-layers i")].map(i=>Math.round(i.getBoundingClientRect().left));const lab=[...document.querySelectorAll(".sm-label")].map(e=>e.style.transform.slice(0,26));return {panelLeft:Math.round(p.left),layers:l,label0:lab[0]}`)]);
    if (t === 300) await shot("C:/Users/tiago/Desktop/Lauhata/website/.qa/m3/menu-300.png");
  }
  await shot("C:/Users/tiago/Desktop/Lauhata/website/.qa/m3/menu-open.png");
  out.state = await ev(`const d=document.querySelector("[data-mobile-nav]");return {open:d.open,exp:document.querySelector("[data-nav-open]").getAttribute("aria-expanded"),lock:document.documentElement.classList.contains("nav-open"),active:document.activeElement.className,inertBehind:!!document.querySelector("main").closest("[inert]")||undefined}`);
  // close with Escape-style cancel, watch the exit
  await ev(`document.querySelector("[data-mobile-nav]").dispatchEvent(new Event("cancel",{cancelable:true}));return 1`);
  await wait(150);
  out.midClose = await ev(`return {open:document.querySelector("[data-mobile-nav]").open,panelLeft:Math.round(document.querySelector(".sm-panel").getBoundingClientRect().left)}`);
  await wait(600);
  out.closed = await ev(`return {open:document.querySelector("[data-mobile-nav]").open,lock:document.documentElement.classList.contains("nav-open"),exp:document.querySelector("[data-nav-open]").getAttribute("aria-expanded")}`);
  // outside click at a width where the panel is narrower than the screen
  await open("http://localhost:8080/", 768, 1024, true);
  await ev(`document.querySelector("[data-nav-open]").click();return 1`);
  await wait(1400);
  out.at768 = await ev(`const p=document.querySelector(".sm-panel").getBoundingClientRect();return {panelLeft:Math.round(p.left),panelW:Math.round(p.width)}`);
  await ev(`const d=document.querySelector("[data-mobile-nav]");d.dispatchEvent(new MouseEvent("click",{bubbles:true}));return 1`);
  await wait(900);
  out.outsideClosed = await ev(`return !document.querySelector("[data-mobile-nav]").open`);
  // reduced motion
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await open("http://localhost:8080/", 390, 844, true);
  await ev(`document.querySelector("[data-nav-open]").click();return 1`);
  await wait(200);
  out.reduced = await ev(`const p=document.querySelector(".sm-panel").getBoundingClientRect();return {open:document.querySelector("[data-mobile-nav]").open,panelLeft:Math.round(p.left),inlineTransform:document.querySelector(".sm-panel").style.transform||"none"}`);
  return out;
};
