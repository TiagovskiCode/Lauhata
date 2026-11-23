export default async ({ open, eval: ev, shot, wait, send }) => {
  const out = {};
  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await send("Page.navigate", { url: "http://localhost:8080/" });
  await wait(900);
  await shot("C:/Users/tiago/Desktop/Lauhata/website/.qa/m3/cover-a.png");
  out.early = await ev(`const v=document.querySelector("[data-hero-video]");return {on:v&&v.classList.contains("is-on"),t:v&&+v.currentTime.toFixed(2)}`);
  await wait(3200);
  out.later = await ev(`const v=document.querySelector("[data-hero-video]");return {on:v.classList.contains("is-on"),t:+v.currentTime.toFixed(2),paused:v.paused}`);
  await open("http://localhost:8080/", 390, 844, true);
  await wait(1200);
  await shot("C:/Users/tiago/Desktop/Lauhata/website/.qa/m3/cover-m.png");
  return out;
};
