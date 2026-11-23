export default async ({ open, eval: ev, shot, wait, send }) => {
  const out = {};
  await open("http://localhost:8080/", 1440, 900);
  await wait(6000);
  out.laptop = await ev(`const v=document.querySelector("[data-hero-video]");if(!v)return null;const t0=v.currentTime;await new Promise(r=>setTimeout(r,1500));return {on:v.classList.contains("is-on"),paused:v.paused,t0:+t0.toFixed(2),t1:+v.currentTime.toFixed(2),w:v.videoWidth,h:v.videoHeight,err:!!v.error,film:!!v.closest(".is-film")}`);
  await shot("C:/Users/tiago/Desktop/Lauhata/website/.qa/m3/hero-new.png");
  await open("http://localhost:8080/", 390, 844, true);
  await wait(2500);
  out.mobile = await ev(`return {video:!!document.querySelector("[data-hero-video]")}`);
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await open("http://localhost:8080/", 1440, 900);
  await wait(3000);
  out.reduced = await ev(`return {video:!!document.querySelector("[data-hero-video]")}`);
  return out;
};
