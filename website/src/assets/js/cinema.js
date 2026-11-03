/* Lauhata — the cinema layer, built on GSAP + ScrollTrigger (self-hosted in ./vendor, GSAP 3.13, free licence).
   It adds: the pinned "a day at Lauhata" scene, the shutter and drift of the full-screen scenes, parallax, and the slow
   push-in of the home hero. It runs after main.js, which has already decided the motion level:
     - tier A (always): the pinned day scene with its cross-fades, colour grade and progress rail (fades only);
     - tier B (html.cine-motion, i.e. no "reduced motion" or ?movimento=completo): zoom, parallax, shutter, hero push-in.
   If GSAP is missing or anything here throws, the site falls back to the plain layout (see cleanup()). */
(() => {
  "use strict";
  const root = document.documentElement;
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  const full = root.classList.contains("cine-motion"); // tier B
  const wide = window.matchMedia("(min-width: 861px)").matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const created = []; // every ScrollTrigger we make, so a failure can take them all down

  // Back to the plain layout: no pin, no inline styles, and the day scene as a simple list.
  function cleanup() {
    created.forEach((st) => st.kill());
    ScrollTrigger.getAll().forEach((st) => st.kill());
    root.classList.remove("day-cine", "gsap-ready");
    gsap.set("[data-day-step], .day-frame, .day-frame img, .day-copy, .day-grade, .day-dim, .day-rail-fill, .scene-media, .scene-media img, .hx-bg, .hx-content, .hx-title .line, .cine-hero.is-page .slide img, .cine-hero.is-page .cine-content", { clearProps: "all" });
  }
  const track = (anim) => { if (anim && anim.scrollTrigger) created.push(anim.scrollTrigger); return anim; };

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
      $$(".day-frame img", stage).forEach((img) => { if (img.loading === "lazy") img.loading = "eager"; });
    }
  }

  /* ---------- Scenes: shutter opens, slow drift (tier B) ---------- */
  function initScenes() {
    if (!full) return;
    $$(".scene").forEach((scene) => {
      const media = $(".scene-media", scene), img = $(".scene-media img", scene);
      if (!media || !img) return;
      track(gsap.fromTo(media, { clipPath: "inset(24% 0% 24% 0%)" }, {
        clipPath: "inset(0% 0% 0% 0%)", ease: "none",
        scrollTrigger: { trigger: scene, start: "top 92%", end: "top 28%", scrub: 0.6 },
      }));
      track(gsap.fromTo(img, { scale: 1.22, yPercent: -4 }, {
        scale: 1.06, yPercent: 4, ease: "none",
        scrollTrigger: { trigger: scene, start: "top bottom", end: "bottom top", scrub: true },
      }));
    });
  }

  /* ---------- Parallax for any picture that asks for it (tier B, computer only) ---------- */
  function initParallax() {
    if (!full || !wide) return;
    $$("[data-parallax]").forEach((img) => {
      const speed = Number(img.dataset.parallax) || 0.1;
      const frame = img.parentElement;
      track(gsap.fromTo(img, { yPercent: -speed * 70 }, {
        yPercent: speed * 70, ease: "none",
        scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: true },
      }));
    });
  }

  /* ---------- The home hero slowly pushes in as you leave it (tier B) ---------- */
  function initPageHeroes() { // inner pages: same push-in and lift-away, on the single hero photo
    if (!full) return;
    $$(".cine-hero.is-page").forEach((hero) => {
      const img = $(".slide img", hero), content = $(".cine-content", hero);
      const st = { trigger: hero, start: "top top", end: "bottom top", scrub: true };
      if (img) track(gsap.to(img, { scale: 1.12, yPercent: 4, ease: "none", scrollTrigger: st }));
      if (content) track(gsap.to(content, { yPercent: -10, opacity: 0.1, ease: "none", scrollTrigger: { ...st, end: "75% top", scrub: 0.6 } }));
    });
  }

  function initHero() {
    const hero = $(".hx");
    if (!full || !hero) return;
    const bg = $(".hx-bg", hero);
    if (bg) track(gsap.to(bg, { scale: 1.14, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } }));
    // The copy lifts away and the two title lines part in opposite directions as the page moves on, like a title card.
    const sc = { trigger: hero, start: "top top", end: "70% top", scrub: 0.6 };
    const content = $(".hx-content", hero);
    if (content) track(gsap.to(content, { yPercent: -12, opacity: 0.1, ease: "none", scrollTrigger: sc }));
    const l1 = $(".hx-title .line", hero), l2 = $(".hx-title .l2", hero);
    if (l1 && wide) track(gsap.to(l1, { xPercent: -5, ease: "none", scrollTrigger: sc }));
    if (l2 && wide) track(gsap.to(l2, { xPercent: 5, ease: "none", scrollTrigger: sc }));
  }

  try {
    initDay();
    initScenes();
    initParallax();
    initHero();
    initPageHeroes();
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
