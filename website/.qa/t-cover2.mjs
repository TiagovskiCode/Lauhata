export default async ({ open, eval: ev, shot, wait }) => {
  await open("http://localhost:8080/", 1440, 900);
  await ev(`const v=document.querySelector("[data-hero-video]");v.pause();v.currentTime=0;v.classList.remove("is-on");document.querySelector(".lh-intro")?.remove();document.documentElement.classList.remove("lh-intro-on");return 1`);
  await wait(900);
  await shot("C:/Users/tiago/Desktop/Lauhata/website/.qa/m3/cover-poster.png");
  await ev(`const v=document.querySelector("[data-hero-video]");v.classList.add("is-on");return 1`);
  await wait(1200);
  await shot("C:/Users/tiago/Desktop/Lauhata/website/.qa/m3/cover-video0.png");
  return "ok";
};
