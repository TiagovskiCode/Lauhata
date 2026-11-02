/* Lauhata — site behaviour. Vanilla JS, no dependencies (Lenis is optional and loaded separately). */
(() => {
  "use strict";

  const CFG = window.LAUHATA || { i18n: { form: {}, common: {} } };
  const F = CFG.i18n.form;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fmt = (s, vars) => String(s).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
  const todayISO = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  };

  document.documentElement.classList.add("js");

  /* ---------- Header: border once scrolled, hides on scroll down ---------- */
  const header = $("[data-header]");
  const mobileBar = $("[data-mobile-bar]");
  // Scroll position where the header last changed direction. Smooth scrolling moves a few
  // pixels per frame, so the direction is judged on the distance travelled since then, not
  // per event (per-event deltas made the header flicker in and out while scrolling down).
  let anchorY = window.scrollY;
  // The sticky booking bar is pointless while a booking form is already on screen.
  let formInView = false;
  const bookingSection = $("#reservar");
  if (bookingSection && "IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => { formInView = e.isIntersecting; onScroll(); }).observe(bookingSection);
  }
  function onScroll() {
    const y = window.scrollY;
    const threshold = window.innerHeight * 0.35;
    // Over a full-screen photo the header stays transparent until the photo has scrolled away.
    // On phones the hero also holds the booking card, so the header turns solid straight away.
    const heroEl = document.body.classList.contains("has-hero") && window.innerWidth > 860 ? $(".cine-hero") : null;
    header?.classList.toggle("is-solid", heroEl ? y > heroEl.offsetHeight - (header?.offsetHeight || 80) : y > 40);
    const hidden = header?.classList.contains("is-hidden");
    if (y < threshold || header?.contains(document.activeElement)) {
      header?.classList.remove("is-hidden");
      anchorY = y;
    } else if (hidden ? y > anchorY : y < anchorY) {
      anchorY = y; // still moving the same way: keep the turning point up to date
    } else if (Math.abs(y - anchorY) > 12) {
      header?.classList.toggle("is-hidden", y > anchorY);
      anchorY = y;
    }
    const barOn = y > window.innerHeight * 0.6 && !formInView;
    mobileBar?.classList.toggle("is-visible", barOn);
    // Read by CSS: the sticky menu bar moves up when the header hides; the cart button clears the mobile bar.
    const root = document.documentElement;
    root.style.setProperty("--header-shown", header?.classList.contains("is-hidden") ? "0" : "1");
    root.classList.toggle("has-bar", barOn);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Booking chooser in the header ---------- */
  $$("[data-book-menu]").forEach((menu) => {
    const btn = $("[data-book-toggle]", menu);
    const pop = $(".book-pop", menu);
    const set = (open) => {
      btn.setAttribute("aria-expanded", String(open));
      pop.hidden = !open;
    };
    btn.addEventListener("click", () => set(pop.hidden));
    document.addEventListener("click", (e) => { if (!menu.contains(e.target)) set(false); });
    menu.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { set(false); btn.focus(); }
    });
  });

  /* ---------- Mobile navigation ---------- */
  const nav = $("[data-mobile-nav]");
  const navOpen = $("[data-nav-open]");
  if (nav && navOpen) {
    navOpen.addEventListener("click", () => { nav.showModal(); navOpen.setAttribute("aria-expanded", "true"); });
    $("[data-nav-close]", nav).addEventListener("click", () => nav.close());
    nav.addEventListener("close", () => navOpen.setAttribute("aria-expanded", "false"));
    $$("a", nav).forEach((a) => a.addEventListener("click", () => nav.close()));
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$("[data-reveal]");
  if (reduced || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------- Tabs (tablist pattern: click + arrow keys) ---------- */
  function tabs(list, attr, onSelect) {
    const btns = $$(`[${attr}]`, list);
    const select = (b, focus = false) => {
      btns.forEach((x) => { x.setAttribute("aria-selected", String(x === b)); x.tabIndex = x === b ? 0 : -1; });
      if (focus) b.focus();
      onSelect(b.getAttribute(attr));
    };
    btns.forEach((b) => { b.tabIndex = b.getAttribute("aria-selected") === "true" ? 0 : -1; });
    list.addEventListener("click", (e) => { const b = e.target.closest(`[${attr}]`); if (b) select(b); });
    list.addEventListener("keydown", (e) => {
      if (!["ArrowLeft", "ArrowRight"].includes(e.key)) return;
      const i = btns.indexOf(document.activeElement);
      if (i < 0) return;
      e.preventDefault();
      select(btns[(i + (e.key === "ArrowRight" ? 1 : -1) + btns.length) % btns.length], true);
    });
  }

  /* ---------- Gallery lightbox ---------- */
  const lb = $("[data-lightbox]");
  if (lb) {
    const lbImg = $("[data-lb-img]", lb);
    const lbCap = $("[data-lb-cap]", lb);
    let list = [];
    let idx = 0;
    const show = (i) => {
      idx = (i + list.length) % list.length;
      const item = list[idx];
      const src = $("img", item);
      lbImg.src = item.dataset.lbSrc;
      lbImg.alt = src.alt;
      lbCap.textContent = src.alt;
    };
    $$("[data-gallery]").forEach((g) => {
      const items = $$("[data-lb-src]", g);
      items.forEach((item, i) =>
        item.addEventListener("click", () => {
          list = items;
          show(i);
          lb.showModal();
          window.lenis?.stop();
        })
      );
    });
    $("[data-lb-close]", lb).addEventListener("click", () => lb.close());
    $("[data-lb-prev]", lb).addEventListener("click", () => show(idx - 1));
    $("[data-lb-next]", lb).addEventListener("click", () => show(idx + 1));
    lb.addEventListener("close", () => window.lenis?.start());
    lb.addEventListener("click", (e) => { if (e.target === lb) lb.close(); });
    lb.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
    });
    let x0 = null;
    lb.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
      x0 = null;
    });
  }

  // "Request this room" on room pages preselects the room in the form.
  $$("[data-room-link]").forEach((a) => {
    const url = new URL(a.href);
    url.searchParams.set("room", a.dataset.roomLink);
    a.href = url.toString();
  });

  /* ---------- Booking forms → WhatsApp ---------- */
  const today = todayISO();
  $$('input[type="date"]').forEach((i) => (i.min = today));

  function prefill(form) {
    const q = new URLSearchParams(location.search);
    const set = (name, v) => { if (v && form.elements[name]) form.elements[name].value = v; };
    if (form.dataset.booking === "table") {
      set("date", q.get("date"));
      set("people", q.get("n"));
    } else {
      set("checkIn", q.get("date"));
      set("guests", q.get("n"));
      set("room", q.get("room"));
      if (q.get("date") && form.elements.checkOut) {
        const d = new Date(q.get("date") + "T12:00:00");
        d.setDate(d.getDate() + 1);
        form.elements.checkOut.value = d.toISOString().slice(0, 10);
      }
    }
  }

  const fmtDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso + "T12:00:00");
    return d.toLocaleDateString(CFG.lang === "pt" ? "pt-PT" : "en-GB", { weekday: "short", day: "numeric", month: "long", year: "numeric" });
  };
  const contactOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || v.replace(/[^\d]/g, "").length >= 7;

  function validate(form) {
    const el = form.elements;
    const errors = {};
    const val = (n) => (el[n] ? el[n].value.trim() : "");
    if (!val("name")) errors.name = F.errors.name;
    // Optional: WhatsApp already shows Lauhata the sender's number. If filled, it must look valid.
    if (val("contact") && !contactOk(val("contact"))) errors.contact = F.errors.contact;
    if (form.dataset.booking === "table") {
      if (!val("date") || val("date") < today) errors.date = F.errors.date;
      if (!val("time")) errors.time = F.errors.time;
      const p = Number(val("people"));
      if (!Number.isInteger(p) || p < 1 || p > 50) errors.people = F.errors.people;
    } else {
      if (!val("checkIn") || val("checkIn") < today) errors.checkIn = F.errors.checkIn;
      if (!val("checkOut") || (val("checkIn") && val("checkOut") <= val("checkIn"))) errors.checkOut = F.errors.checkOut;
      const g = Number(val("guests"));
      if (!Number.isInteger(g) || g < 1 || g > 20) errors.guests = F.errors.guests;
    }
    return errors;
  }

  function showErrors(form, errors) {
    $$(".field", form).forEach((f) => {
      const input = $("input, textarea, select", f);
      const err = $(".error", f);
      const msg = input && errors[input.name];
      f.classList.toggle("has-error", Boolean(msg));
      if (input) input.setAttribute("aria-invalid", msg ? "true" : "false");
      if (err) err.textContent = msg || "";
    });
    const summary = $("[data-form-errors]", form);
    const has = Object.keys(errors).length > 0;
    summary.hidden = !has;
    if (has) {
      const first = $$(".field.has-error input, .field.has-error textarea, .field.has-error select", form)[0];
      first?.focus();
    }
    return !has;
  }

  function buildMessage(form) {
    const el = form.elements;
    const v = (n) => (el[n] ? el[n].value.trim() : "");
    const notes = v("notes") ? fmt(F.waNotes, { notes: v("notes") }) : "";
    const contact = v("contact") ? fmt(F.waContact, { contact: v("contact") }) : "";
    if (form.dataset.booking === "table") {
      return fmt(F.waTable, { name: v("name"), date: fmtDate(v("date")), time: v("time"), people: v("people"), contact, notes });
    }
    const roomSel = el.room;
    return fmt(F.waRoom, {
      checkIn: fmtDate(v("checkIn")),
      checkOut: fmtDate(v("checkOut")),
      nights: nightsLabel(v("checkIn"), v("checkOut")),
      guests: v("guests"),
      room: roomSel ? roomSel.options[roomSel.selectedIndex].text : "",
      name: v("name"),
      contact,
      notes,
    });
  }

  const waUrl = (text) => (CFG.whatsapp ? `https://wa.me/${CFG.whatsapp}` : "https://wa.me/") + "?text=" + encodeURIComponent(text);
  const nightsLabel = (a, b) => {
    const n = Math.round((new Date(b) - new Date(a)) / 86400000);
    return n === 1 ? F.nightsOne : fmt(F.nightsMany, { n });
  };

  // Opens WhatsApp with the request and shows the thank-you page in this tab.
  function sendToWhatsApp(url, kind, done) {
    try {
      sessionStorage.setItem("lauhata-wa", url);
      sessionStorage.setItem("lauhata-kind", kind);
    } catch (err) { /* storage unavailable */ }
    if (window.gtag) window.gtag("event", "generate_lead", { method: "whatsapp", booking_type: kind });
    // No "noopener" feature here: with it window.open always returns null and we could not
    // tell a blocked popup apart. The opener link is cut by hand instead.
    const win = window.open(url, "_blank");
    if (win) win.opener = null;
    // Popup blocked: go to WhatsApp in this tab; otherwise show the thank-you page here.
    setTimeout(() => {
      done();
      location.href = win ? CFG.thanks : url;
    }, 400);
  }

  // Shared with order.js: the restaurant order uses the same hand-off to WhatsApp and the thank-you page.
  window.LauhataWA = { url: waUrl, send: sendToWhatsApp };

  $$("[data-booking]").forEach((form) => {
    prefill(form);
    const el = form.elements;
    // Keep check-out after check-in as the guest picks dates.
    if (el.checkIn && el.checkOut) {
      el.checkIn.addEventListener("change", () => {
        if (!el.checkIn.value) return;
        const next = new Date(el.checkIn.value + "T12:00:00");
        next.setDate(next.getDate() + 1);
        const min = next.toISOString().slice(0, 10);
        el.checkOut.min = min;
        if (!el.checkOut.value || el.checkOut.value <= el.checkIn.value) el.checkOut.value = min;
      });
    }
    // Clear a field's error as soon as it is corrected.
    form.addEventListener("input", (e) => {
      const f = e.target.closest(".field");
      if (f?.classList.contains("has-error")) {
        const errs = validate(form);
        if (!errs[e.target.name]) {
          f.classList.remove("has-error");
          e.target.setAttribute("aria-invalid", "false");
          $(".error", f).textContent = "";
        }
      }
    });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!showErrors(form, validate(form))) return;
      const label = $("[data-submit-label]", form);
      const original = label.textContent;
      form.classList.add("is-sending");
      label.textContent = F.sending;
      sendToWhatsApp(waUrl(buildMessage(form)), form.dataset.booking, () => {
        form.classList.remove("is-sending");
        label.textContent = original;
      });
    });
  });

  /* ---------- Hero booking card: date + time/guests straight to WhatsApp ---------- */
  const card = $("[data-quick-wa]");
  if (card) {
    const errBox = $("[data-bc-error]", card);
    let kind = "table";
    const panel = (k) => $(`[data-bc-panel="${k}"]`, card);
    tabs($(".bc-tabs", card), "data-bc-tab", (k) => {
      kind = k;
      panel("table").hidden = k !== "table";
      panel("room").hidden = k !== "room";
      errBox.hidden = true;
      $$(".bc-field", card).forEach((f) => f.classList.remove("has-error"));
    });
    const el = card.elements;
    el.checkIn.addEventListener("change", () => {
      if (!el.checkIn.value) return;
      const next = new Date(el.checkIn.value + "T12:00:00");
      next.setDate(next.getDate() + 1);
      const min = next.toISOString().slice(0, 10);
      el.checkOut.min = min;
      if (!el.checkOut.value || el.checkOut.value <= el.checkIn.value) el.checkOut.value = min;
    });
    const fail = (input, msg) => {
      input.closest(".bc-field").classList.add("has-error");
      errBox.textContent = msg;
      errBox.hidden = false;
      input.focus();
    };
    card.addEventListener("input", (e) => e.target.closest(".bc-field")?.classList.remove("has-error"));
    card.addEventListener("submit", (e) => {
      e.preventDefault();
      errBox.hidden = true;
      $$(".bc-field", card).forEach((f) => f.classList.remove("has-error"));
      const opt = (s) => s.options[s.selectedIndex].text;
      const unitText = (i) => { const n = Number(i.value) || 1; return `${n} ${n === 1 ? i.dataset.unitOne : i.dataset.unitMany}`; };
      let text;
      if (kind === "table") {
        if (!el.date.value || el.date.value < today) return fail(el.date, F.errors.date);
        text = fmt(F.waQuickTable, { date: fmtDate(el.date.value), time: opt(el.time), people: unitText(el.people) });
      } else {
        if (!el.checkIn.value || el.checkIn.value < today) return fail(el.checkIn, F.errors.checkIn);
        if (!el.checkOut.value || el.checkOut.value <= el.checkIn.value) return fail(el.checkOut, F.errors.checkOut);
        text = fmt(F.waQuickRoom, {
          checkIn: fmtDate(el.checkIn.value),
          checkOut: fmtDate(el.checkOut.value),
          nights: nightsLabel(el.checkIn.value, el.checkOut.value),
          guests: unitText(el.guests),
        });
      }
      card.classList.add("is-sending");
      sendToWhatsApp(waUrl(text), kind, () => card.classList.remove("is-sending"));
    });
  }

  /* ---------- Thank-you page ---------- */
  const thanksBody = $("[data-thanks-body]");
  if (thanksBody) {
    let kind = null;
    let url = null;
    try { kind = sessionStorage.getItem("lauhata-kind"); url = sessionStorage.getItem("lauhata-wa"); } catch (e) { /* ignore */ }
    if (kind && thanksBody.dataset[kind]) thanksBody.textContent = thanksBody.dataset[kind];
    const reopen = $("[data-thanks-reopen]");
    if (url && reopen) reopen.href = url;
  }

  /* =================== Cinematic motion =================== */
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // Split headings into words wrapped in a mask, so each word can rise into view.
  function splitWords(root, cls = "w", innerCls = "wi") {
    let n = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === 3) {
          const parts = child.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach((p) => {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
            const outer = document.createElement("span");
            outer.className = cls;
            const inner = document.createElement("span");
            inner.className = innerCls;
            inner.style.setProperty("--wd", String(n++ * 45));
            inner.textContent = p;
            if (cls) { outer.appendChild(inner); frag.appendChild(outer); } else frag.appendChild(inner);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1) walk(child);
      });
    };
    walk(root);
    return n;
  }
  $$("[data-split]").forEach((el) => splitWords(el));

  // Hero entrance: the title rises word by word and the rest fades in, all within ~1 s.
  // On the first visit the intro curtain covers the page while it loads, then lifts.
  const intro = $("[data-intro]");
  const introShown = intro && !document.documentElement.classList.contains("no-intro");
  const heroSection = $(".cine-hero");
  const revealHero = () => {
    heroSection?.classList.add("is-ready");
    $$("[data-split]", heroSection || document.createElement("div")).forEach((el) => el.classList.add("is-in"));
  };
  if (reduced) revealHero();
  else if (!introShown) setTimeout(revealHero, 60);
  else {
    // performance.now() counts from navigation start, so these are times since the click.
    let lifted = false;
    const lift = () => {
      if (lifted) return;
      lifted = true;
      intro.classList.add("is-out");
      setTimeout(revealHero, 350);
    };
    const afterLoad = () => setTimeout(lift, Math.max(0, 1600 - performance.now()));
    if (document.readyState === "complete") afterLoad();
    else window.addEventListener("load", afterLoad, { once: true });
    setTimeout(lift, Math.max(0, 4000 - performance.now()));
  }

  // Hero video (only if site.heroVideo is set): the photo is already on screen; once the page has loaded
  // the video is fetched and fades in over it. Skipped for reduced motion, data saver and slow
  // connections, paused while the hero is off screen, and removed if it fails (the photo stays).
  const heroVideo = $("[data-hero-video]");
  if (heroVideo) {
    const conn = navigator.connection || {};
    if (reduced || conn.saveData || /(^|-)2g$/.test(conn.effectiveType || "")) {
      heroVideo.remove();
    } else {
      const start = () => {
        heroVideo.addEventListener("error", () => heroVideo.remove(), { once: true });
        heroVideo.addEventListener("canplay", () => {
          heroVideo.play().then(() => heroVideo.classList.add("is-on")).catch(() => heroVideo.remove());
        }, { once: true });
        heroVideo.src = heroVideo.dataset.src;
        heroVideo.load();
      };
      if (document.readyState === "complete") setTimeout(start, 800);
      else window.addEventListener("load", () => setTimeout(start, 800), { once: true });
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(([e]) => {
          if (!heroVideo.classList.contains("is-on")) return;
          if (e.isIntersecting) heroVideo.play().catch(() => {}); else heroVideo.pause();
        }, { threshold: 0.1 }).observe(heroVideo);
      }
    }
  }

  // Everything else reveals when it enters the viewport.
  const onEnter = (els, opts = {}) => {
    if (reduced || !("IntersectionObserver" in window)) return els.forEach((el) => el.classList.add("is-in"));
    const io2 = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io2.unobserve(e.target); } }),
      { rootMargin: "0px 0px -12% 0px", threshold: 0.15, ...opts }
    );
    els.forEach((el) => io2.observe(el));
  };
  onEnter($$("[data-split]").filter((el) => !el.closest(".cine-hero")));
  onEnter($$("[data-fade]").filter((el) => !el.closest(".cine-hero")));
  onEnter($$("[data-clip]"), { threshold: 0.2 });

  // Rooms: the panel under the pointer (or with focus, or tapped) opens; the first is open to begin with.
  $$("[data-suites]").forEach((row) => {
    const panels = $$("[data-su]", row);
    const open = (p) => panels.forEach((x) => x.classList.toggle("is-on", x === p));
    panels.forEach((p) => {
      p.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") open(p); });
      p.addEventListener("focusin", () => open(p));
      p.addEventListener("click", (e) => { if (!e.target.closest("a, button")) open(p); });
    });
  });

  // A day at Lauhata: the step in the middle of the screen sets the photo, the dots and the colour of the section.
  const dayx = $("[data-dayx]");
  if (dayx && "IntersectionObserver" in window) {
    const dxSteps = $$("[data-dx-step]", dayx);
    const dxImgs = $$(".dx-img", dayx);
    const dxDots = $$(".dx-dots li", dayx);
    const setStep = (i) => {
      dayx.dataset.step = String(i);
      dxSteps.forEach((s, k) => s.classList.toggle("is-on", k === i));
      dxImgs.forEach((s, k) => s.classList.toggle("is-on", k === i));
      dxDots.forEach((s, k) => s.classList.toggle("is-on", k === i));
    };
    const dxObserver = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setStep(Number(e.target.dataset.dxStep)); }),
      { rootMargin: "-48% 0px -48% 0px" }
    );
    dxSteps.forEach((s) => dxObserver.observe(s));
  }

  // Hero slideshow: slow crossfade between photos.
  const slides = $$("[data-slides] .slide");
  if (slides.length > 1 && !reduced) {
    let s = 0;
    setInterval(() => {
      slides[s].classList.remove("is-active");
      s = (s + 1) % slides.length;
      slides[s].classList.add("is-active");
    }, 6500);
  }

  // Statement: words light up as the paragraph scrolls through the screen.
  const scrub = $("[data-scrub]");
  let scrubWords = [];
  if (scrub) {
    splitWords(scrub, "", "sw");
    scrubWords = $$(".sw", scrub);
    if (reduced) scrubWords.forEach((w) => w.classList.add("on"));
  }

  const parallaxImgs = $$("[data-parallax]");
  const day = $("[data-day]");
  const dayLine = $("[data-day-line]");
  const dusk = $("[data-dusk]"); // the panorama: 0 = dinner light, 1 = night
  const hx = $(".hx"); // the hero: its words drift up and fade as the page scrolls

  function frame() {
    const vh = window.innerHeight;
    // Parallax: images drift against the scroll inside their frame.
    if (!reduced) {
      parallaxImgs.forEach((img) => {
        const r = img.parentElement.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        const offset = (r.top + r.height / 2 - vh / 2) * Number(img.dataset.parallax);
        img.style.transform = `translate3d(0, ${(-offset).toFixed(1)}px, 0) scale(1.18)`;
      });
    }
    // Statement words.
    if (scrub && !reduced) {
      const r = scrub.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
      const lit = Math.round(p * scrubWords.length);
      scrubWords.forEach((w, i) => w.classList.toggle("on", i < lit));
    }
    if (hx && !reduced) hx.style.setProperty("--hp", Math.min(1, Math.max(0, window.scrollY / (hx.offsetHeight * 0.7))).toFixed(3));
    // Panorama: night falls as the section scrolls up through the screen (CSS reads --p).
    if (dusk && !reduced) {
      const r = dusk.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (vh - r.top) / (r.height + vh * 0.4)));
      dusk.style.setProperty("--p", p.toFixed(3));
    }
    // Timeline line is drawn as the section scrolls past.
    if (day && dayLine) {
      const r = day.getBoundingClientRect();
      const p = reduced ? 1 : Math.min(1, Math.max(0, (vh * 0.75 - r.top) / (r.height * 0.6)));
      dayLine.style.setProperty("--p", p.toFixed(3));
    }
  }
  let ticking = false;
  const requestFrame = () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; frame(); }); } };
  window.addEventListener("scroll", requestFrame, { passive: true });
  window.addEventListener("resize", requestFrame);
  window.addEventListener("load", requestFrame);
  frame();

  // Custom cursor with a label over links that carry data-cursor.
  const dot = $("[data-cursor-dot]");
  if (dot && fine && !reduced) {
    const label = $("[data-cursor-label]", dot);
    let x = -100, y = -100, cx = -100, cy = -100;
    window.addEventListener("pointermove", (e) => { x = e.clientX; y = e.clientY; dot.classList.add("is-on"); }, { passive: true });
    document.addEventListener("pointerleave", () => dot.classList.remove("is-on"));
    const loop = () => {
      cx += (x - cx) * 0.2;
      cy += (y - cy) * 0.2;
      dot.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      requestAnimationFrame(loop);
    };
    loop();
    $$("[data-cursor]").forEach((el) => {
      el.addEventListener("pointerenter", () => { label.textContent = el.dataset.cursor; dot.classList.add("is-big"); });
      el.addEventListener("pointerleave", () => dot.classList.remove("is-big"));
    });
  }

  // Magnetic buttons: they lean towards the pointer.
  if (fine && !reduced) {
    $$("[data-magnetic]").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${dx * 0.22}px, ${dy * 0.3}px)`;
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });
  }

  /* ---------- Smooth scroll (Lenis) — desktop pointer only, never with reduced motion ---------- */
  window.addEventListener("load", () => {
    if (reduced || !window.Lenis || !window.matchMedia("(pointer: fine)").matches) return;
    const lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true });
    window.lenis = lenis;
    const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    // In-page anchors go through Lenis so the offset for the fixed header is kept.
    $$('a[href*="#"]').forEach((a) => {
      const url = new URL(a.href);
      if (url.pathname !== location.pathname || !url.hash) return;
      a.addEventListener("click", (e) => {
        const target = document.getElementById(url.hash.slice(1));
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: -(header?.offsetHeight || 0) - 16 });
        history.pushState(null, "", url.hash);
      });
    });
    nav?.addEventListener("close", () => lenis.start());
    navOpen?.addEventListener("click", () => lenis.stop());
  });
})();
