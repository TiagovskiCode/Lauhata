/* Lauhata: the "day" scene of the home page, the one sequence that needs a timeline (GSAP + ScrollTrigger, self-hosted in ./vendor, GSAP 3.13,
   free licence). Everything else that moves on the site is CSS or a one-off reveal in main.js. It runs after main.js, which has already set
   the motion level: cross-fades, colour grade and rail always; the slow push-in and the rising words only with html.cine-motion (no
   "reduced motion", or ?movimento=completo). If GSAP is missing or anything throws, the scene falls back to a plain list (cleanup()). */
(() => {
  "use strict";
  const root = document.documentElement;
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  const full = root.classList.contains("cine-motion"); // tier B
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const created = []; // every ScrollTrigger we make, so a failure can take them all down

  // Back to the plain layout: no pin, no inline styles, and the day scene as a simple list.
  function cleanup() {
    created.forEach((st) => st.kill());
    ScrollTrigger.getAll().forEach((st) => st.kill());
    root.classList.remove("day-cine", "gsap-ready");
    gsap.set("[data-day-step], .day-frame, .day-frame img, .day-copy, .day-grade, .day-dim, .day-rail-fill", { clearProps: "all" });
  }

  /* ---------- The day: one pinned stage, five moments ---------- */
  function initDay() {
    const stage = $("[data-day-stage]");
    const steps = $$("[data-day-step]");
    if (!stage || steps.length < 2) return;
    root.classList.add("day-cine");
    const grade = $(".day-grade", stage), dim = $(".day-dim", stage), fill = $(".day-rail-fill", stage);
    const ticks = $$(".day-rail li", stage);
    const n = steps.length;

    // Start state: the first moment on screen, the rest waiting.
    steps.forEach((s, i) => gsap.set(s, { opacity: i === 0 ? 1 : 0 }));
    const copies = steps.map((s) => $(".day-copy", s));
    copies.forEach((c, i) => gsap.set(c, { opacity: i === 0 ? 1 : 0 })); // the words change faster than the picture, so two moments never overlap as text
    gsap.set(grade, { backgroundColor: steps[0].dataset.grade });
    gsap.set(dim, { opacity: Number(steps[0].dataset.dim) });
    gsap.set(fill, { scaleX: 0, transformOrigin: "0 50%" });
    ticks.forEach((t, i) => t.classList.toggle("is-on", i === 0));

    // The stage is not pinned by script: it is `position: sticky` inside a tall track (height set in design.css from
    // --day-n), which the browser scrolls natively. GSAP only scrubs the timeline over the length of that track.
    const track_ = stage.parentElement;
    track_.style.setProperty("--day-n", n);
    created.push(ScrollTrigger.create({ trigger: track_, start: "top 160%", once: true, onEnter: preload }));
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: track_, start: "top top", end: "bottom bottom", scrub: 0.8, invalidateOnRefresh: true,
        onUpdate: (self) => { // tick marks follow the moment that is showing
          const i = Math.min(n - 1, Math.round(self.progress * self.animation.duration()));
          ticks.forEach((t, k) => t.classList.toggle("is-on", k <= i));
        },
      },
    });
    created.push(tl.scrollTrigger);
    // Timeline units: moment i is "centred" at time i; the cross-fade between i-1 and i happens around i - 0.5.
    tl.to(fill, { scaleX: 1, duration: n - 1 }, 0);
    for (let i = 1; i < n; i++) {
      const at = i - 0.62;
      tl.to(steps[i - 1], { opacity: 0, duration: 0.5, ease: "power1.inOut" }, at);
      tl.to(steps[i], { opacity: 1, duration: 0.5, ease: "power1.inOut" }, at);
      tl.to(copies[i - 1], { opacity: 0, duration: 0.2, ease: "power1.in" }, at - 0.12);
      tl.to(copies[i], { opacity: 1, duration: 0.25, ease: "power1.out" }, at + 0.25);
      tl.to(grade, { backgroundColor: steps[i].dataset.grade, duration: 0.9, ease: "power1.inOut" }, at - 0.15);
      tl.to(dim, { opacity: Number(steps[i].dataset.dim), duration: 0.9, ease: "power1.inOut" }, at - 0.15);
    }
    if (full) { // tier B: each frame is pushed in slowly while it is on screen, and the text rises into place
      steps.forEach((s, i) => {
        const img = $(".day-frame img", s), copy = $(".day-copy", s);
        const from = Math.max(0, i - 1.0);
        tl.fromTo(img, { scale: 1.16 }, { scale: 1.0, duration: Math.min(1.7, n - 1 + 0.25 - from) }, from); // never longer than the scene itself
        if (i > 0) tl.fromTo(copy, { yPercent: 10 }, { yPercent: 0, duration: 0.5, ease: "power2.out" }, i - 0.62);
      });
    }
    tl.to({}, { duration: 0.25 }, n - 1); // a short hold on the last moment before the page moves on
    created.push(tl);

    function preload() { // the frames below the fold are lazy images: fetch them before the first fade needs them
      stage.classList.add("is-near"); // until then the second and third frames are not even requested (signature.css)
      $$(".day-frame img", stage).forEach((img) => { if (img.loading === "lazy") img.loading = "eager"; });
    }
  }

  try {
    initDay();
    root.classList.add("gsap-ready");
    window.__cinemaReady = true;
    // Images and fonts change heights after load: re-measure the pins once everything has settled.
    window.addEventListener("load", () => ScrollTrigger.refresh());
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
  } catch (err) {
    console.warn("cinema.js: falling back to the plain layout", err);
    cleanup();
  }
})();
