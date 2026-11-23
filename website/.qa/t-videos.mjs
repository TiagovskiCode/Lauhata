// Video inventory without ffmpeg: the browser reads each clip's metadata and draws three frames to a canvas (same origin, so it can be saved).
import { writeFileSync } from "node:fs";
export default async ({ open, eval: ev, wait }) => {
  await open("http://localhost:8091/", 1280, 800);
  const names = ["DJI_0826", "DJI_0827", "DJI_0831", "DJI_0835", "DJI_0837", "DJI_0841", "DJI_0844"];
  const out = [];
  for (const n of names) {
    const r = await ev(`
      const v = document.createElement("video"); v.muted = true; v.preload = "auto"; v.src = "/${n}.MP4";
      await new Promise((res, rej) => { v.onloadedmetadata = res; v.onerror = () => rej(new Error("cannot decode")); setTimeout(() => rej(new Error("timeout")), 20000); });
      const info = { w: v.videoWidth, h: v.videoHeight, d: Math.round(v.duration * 10) / 10 };
      const frames = [];
      for (const f of [0.1, 0.5, 0.9]) {
        v.currentTime = v.duration * f;
        await new Promise((res) => { v.onseeked = res; setTimeout(res, 8000); });
        const c = document.createElement("canvas"); c.width = 480; c.height = Math.round(480 * v.videoHeight / v.videoWidth);
        c.getContext("2d").drawImage(v, 0, 0, c.width, c.height);
        frames.push(c.toDataURL("image/jpeg", 0.8));
      }
      return { info, frames };`).catch((e) => ({ error: String(e.message || e) }));
    if (r.frames) r.frames.forEach((d, i) => writeFileSync(`C:/Users/tiago/Desktop/Lauhata/website/.qa/inv/${n}_v${i}.jpg`, Buffer.from(d.split(",")[1], "base64")));
    out.push({ n, ...(r.info || {}), error: r.error });
  }
  return out;
};
