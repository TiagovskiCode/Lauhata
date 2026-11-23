export default async ({ open, eval: ev, shot, wait }) => {
  await open("http://localhost:8080/stay/", 1440, 900);
  await wait(800);
  await shot("C:/Users/tiago/Desktop/Lauhata/website/.qa/m3/new-stay-hero.png");
  await ev(`document.documentElement.style.scrollBehavior="auto";document.querySelector(".rs-place").scrollIntoView({block:"center",behavior:"instant"});return 1`);
  await wait(800);
  await shot("C:/Users/tiago/Desktop/Lauhata/website/.qa/m3/new-stay-place.png");
  await open("http://localhost:8080/discover-liquica/", 1440, 900);
  await wait(800);
  await shot("C:/Users/tiago/Desktop/Lauhata/website/.qa/m3/new-disc.png");
  await open("http://localhost:8080/", 390, 844, true);
  await ev(`document.documentElement.style.scrollBehavior="auto";document.querySelector("#bem-vindo .wl-cards").scrollIntoView({block:"center",behavior:"instant"});return 1`);
  await wait(800);
  await shot("C:/Users/tiago/Desktop/Lauhata/website/.qa/m3/new-home-m.png");
  return await ev(`return {iw:innerWidth}`);
};
