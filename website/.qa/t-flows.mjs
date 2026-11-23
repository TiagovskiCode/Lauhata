export default async ({ open, eval: ev, wait }) => {
  const out = {};
  await open("http://localhost:8080/stay/", 1440, 900);
  out.lang = await ev(`const a=document.querySelector('.lang-dd-item[hreflang="pt"], a.lang-opt[hreflang="pt"]');return a?a.getAttribute("href"):null`);
  await open("http://localhost:8080/pt/alojamento/", 1440, 900);
  out.ptTitle = await ev(`return {lang:document.documentElement.lang,h1:document.querySelector("h1").textContent.trim().slice(0,40),alt:document.querySelector('link[hreflang="en"]')?.getAttribute("href")}`);
  // reservation: room request message
  await open("http://localhost:8080/stay/", 1440, 900);
  out.room = await ev(`window.open=()=>({closed:false,focus(){}});let url="";window.open=(u)=>{url=String(u);return {closed:false,focus(){}}};document.querySelector('a[data-book-open="room"][data-room-link]').click();await new Promise(r=>setTimeout(r,500));const f=document.querySelector("[data-book-dialog] form");const d=n=>{const x=new Date();x.setDate(x.getDate()+n);return x.toISOString().slice(0,10)};f.elements.checkIn.value=d(8);f.elements.checkIn.dispatchEvent(new Event("change",{bubbles:true}));f.elements.checkOut.value=d(10);f.elements.rName.value="Teste";f.requestSubmit();await new Promise(r=>setTimeout(r,400));const m=decodeURIComponent(url);return {room:f.elements.room.value,msg:m.slice(m.indexOf("text=")+5,m.indexOf("text=")+140),confirmedWording:/confirmed|confirmad/i.test(m)&&!/confirm availability|confirme|confirmar|confirma/i.test(m)}`);
  // cart from the home carousel and from the menu
  await open("http://localhost:8080/", 390, 844, true);
  out.cart = await ev(`localStorage.clear();const b=[...document.querySelectorAll(".kc-add")].find(x=>!/Choose|Escolher/.test(x.textContent));b.click();b.click();await new Promise(r=>setTimeout(r,250));const s=JSON.parse(localStorage.getItem("lauhata-cart-v1")).lines.map(l=>[l.name,l.qty,l.cents]);localStorage.clear();return s`);
  out.menu = await ev(`document.querySelector("[data-nav-open]").click();await new Promise(r=>setTimeout(r,1500));return {open:document.querySelector("[data-mobile-nav]").open,links:document.querySelectorAll(".sm-link").length}`);
  return out;
};
