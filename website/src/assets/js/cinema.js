/* Lauhata: the home page choreography that needs GSAP (self-hosted in ./vendor, GSAP 3.13, free licence). It runs after main.js, which has
   already set the motion level (html.cine-motion = full motion). Two jobs only:
     - the day: the sun glides along the line of the day to the meal in view, and the photograph follows;
     - groups: the six facts arrive one after another, once.
   Nothing is pinned and nothing is scrubbed. The browser's own observers say when a section is near; GSAP only moves things, and its clock
   stops by itself when nothing is moving. (Its scroll plugin was dropped: it kept that clock running on every frame of the whole visit.)
   Every word is on the page without this file. */
(() => {
  "use strict";
  const { gsap } = window;
  if (!gsap || !("IntersectionObserver" in window)) return;
  const full = document.documentElement.classList.contains("cine-motion");
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const once = (el, margin, fn) => new IntersectionObserver(([e], io) => { if (e.isIntersecting || e.boundingClientRect.top < 0) { io.disconnect(); fn(); } }, { rootMargin: margin }).observe(el);

  function initDay() {
    const day = $("[data-day]");
    if (!day) return;
    const items = $$("[data-day-item]", day), frames = $$("[data-day-frame]", day);
    const sun = $("[data-day-sun]", day), gone = $("[data-day-gone]", day), arc = $("[data-day-arc]", day);
    const len = gone.getTotalLength(); // pathLength="1" is for the dashes only: points are measured on the real length
    const pos = { p: 0 };
    let k = 1; // the drawing is 600 units wide; the sun is an element of its own, moved by transform alone
    const place = () => {
      const pt = gone.getPointAtLength(len * pos.p);
      gsap.set(sun, { x: pt.x * k, y: pt.y * k });
      gone.setAttribute("stroke-dasharray", `${pos.p.toFixed(4)} 2`);
    };
    new ResizeObserver(([e]) => { k = e.contentRect.width / 600; place(); }).observe(arc);

    let current = -1, held = false; // held: the visitor chose a meal, so scrolling no longer changes it until the section is left
    const show = (i) => {
      if (i === current || !items[i]) return;
      current = i;
      items.forEach((b, n) => { b.classList.toggle("is-on", n === i); b.setAttribute("aria-pressed", String(n === i)); });
      frames.forEach((f, n) => f.classList.toggle("is-on", n === i));
      gsap.to(pos, { p: Number(items[i].dataset.at), duration: full ? 1.1 : 0, ease: "power3.out", overwrite: true, onUpdate: place, onComplete: place });
    };
    items.forEach((b, i) => {
      const choose = () => { held = true; show(i); };
      b.addEventListener("click", choose);
      b.addEventListener("focus", () => { if (b.matches(":focus-visible")) choose(); });
      b.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") choose(); });
    });
    show(0);

    // Decode the photographs shortly before the section arrives, off the main thread, so a change never waits for a picture.
    once(day, "90% 0px", () => $$("img", day).forEach((im) => { im.loading = "eager"; im.decode?.().catch(() => {}); }));

    // Which meal is in view. The section's place on the page is measured once as it comes in (and on resize); while it is on screen a
    // passive scroll listener only compares numbers. Off screen there is no listener at all.
    let top = 0, height = 1;
    const measure = () => { const r = day.getBoundingClientRect(); top = r.top + window.scrollY; height = r.height; };
    const follow = () => {
      if (held) return;
      const vh = window.innerHeight, start = top - vh * 0.6, end = top + height - vh * 0.52;
      show(Math.max(0, Math.min(items.length - 1, Math.floor(((window.scrollY - start) / (end - start)) * items.length))));
    };
    new IntersectionObserver(([e]) => {
      window.removeEventListener("scroll", follow);
      if (e.isIntersecting) { measure(); follow(); window.addEventListener("scroll", follow, { passive: true }); }
      else held = false;
    }).observe(day);
    window.addEventListener("resize", measure, { passive: true });
  }

  // A list that appears as a list: its items rise in order, once. The total never passes 1.2 s.
  function initGroups() {
    if (!full) return;
    $$("[data-group]").forEach((g) => {
      const kids = [...g.children];
      gsap.set(kids, { autoAlpha: 0, y: 22 });
      once(g, "0px 0px -14% 0px", () => gsap.to(kids, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: { amount: 0.4 }, clearProps: "all" }));
    });
  }

  try {
    initDay();
    initGroups();
  } catch (err) {
    console.warn("cinema.js: the page stays as it is", err);
    gsap.set("[data-group] > *", { clearProps: "all" });
  }
})();
