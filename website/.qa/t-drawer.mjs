export default async ({ open, eval: ev, shot, wait }) => {
  await open("http://localhost:8080/", 390, 844, true);
  const out = await ev(`document.querySelector("[data-nav-open]").click();await new Promise(r=>setTimeout(r,900));const d=document.querySelector("[data-mobile-nav]");const o={open:d.open,links:[...d.querySelectorAll(".mobile-nav-links a")].map(a=>a.textContent.trim()+"→"+a.getAttribute("href")),exp:document.querySelector("[data-nav-open]").getAttribute("aria-expanded")};d.dispatchEvent(new Event("cancel",{cancelable:true}));await new Promise(r=>setTimeout(r,600));o.closedByEsc=!d.open;return o`);
  return out;
};
