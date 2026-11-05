/* Lauhata — site behaviour. Vanilla JS, no dependencies. */
(() => {
  "use strict";

  const CFG = window.LAUHATA || { i18n: { form: {}, common: {} } };
  const F = CFG.i18n.form;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  // Reduced motion is respected. To see the full effect on a computer that asks for reduced motion, open any page with
  // ?movimento=completo (it is remembered); ?movimento=reduzido undoes it.
  let forcedMotion = false;
  try {
    const q = new URLSearchParams(location.search).get("movimento");
    if (q === "completo") localStorage.setItem("lauhata-motion", "full");
    else if (q === "reduzido") localStorage.removeItem("lauhata-motion");
    forcedMotion = localStorage.getItem("lauhata-motion") === "full";
  } catch (e) { /* storage blocked: the system setting decides */ }
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches && !forcedMotion;
  document.documentElement.classList.toggle("cine-motion", !reduced);
  const fmt = (s, vars) => String(s).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
  const todayISO = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  };

  document.documentElement.classList.add("js");
  // Fail-safe: ".js" hides elements until their reveal runs. If this script throws before it reaches the end
  // (the last line clears the timer), take ".js" off again so every section stays readable.
  const failsafe = setTimeout(() => document.documentElement.classList.remove("js"), 3500);

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
  // Header background. Transparent only while the page sits at the very top of a hero photograph; solid as soon as the page
  // moves (so no content ever scrolls under a see-through header, and white text never meets the cream sections). The
  // switch is driven by an IntersectionObserver on a 1px marker 40px down the hero, not by scroll events, which arrive
  // late or not at all with fast scrolling, restored scroll positions, anchor jumps and smooth scrolling.
  const heroEl = document.body.classList.contains("has-hero") ? $(".cine-hero") : null;
  let atTop = !!heroEl && window.scrollY < 40;
  if (heroEl && "IntersectionObserver" in window) {
    const mark = document.createElement("span");
    mark.setAttribute("aria-hidden", "true");
    mark.style.cssText = "position:absolute;top:40px;left:0;width:1px;height:1px;pointer-events:none;visibility:hidden";
    heroEl.prepend(mark);
    new IntersectionObserver(([e]) => { atTop = e.isIntersecting; paintHeader(); }).observe(mark);
  }
  function paintHeader() {
    if (!("IntersectionObserver" in window)) atTop = !!heroEl && window.scrollY < 40;
    header?.classList.toggle("is-solid", !heroEl || !atTop);
  }
  function onScroll() {
    const y = window.scrollY;
    const threshold = window.innerHeight * 0.35;
    paintHeader();
    const hidden = header?.classList.contains("is-hidden");
    if (y < threshold || header?.contains(document.activeElement)) {
      header?.classList.remove("is-hidden");
      anchorY = y;
    } else if (hidden ? y > anchorY : y < anchorY) {
      anchorY = y; // still moving the same way: keep the turning point up to date
    } else if (Math.abs(y - anchorY) > 12) {
      // Only phones hide the header (they have the bottom bar). On a computer it stays, so "Reservar" is always in reach.
      header?.classList.toggle("is-hidden", y > anchorY && window.innerWidth <= 860);
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

  /* ---------- Booking dialog ----------
     "Reservar" in the header and the two hero buttons open one modal dialog with the table and room requests. Each
     opener is a real link to the full form, so without JavaScript (or without <dialog>) it still leads somewhere useful.
     data-book-open="table" or "room" opens the matching tab straight away; Escape and the close button shut it, and focus
     returns to the button that opened it (native <dialog> behaviour plus the close listener below). */
  const bookDialog = $("[data-book-dialog]");
  if (bookDialog && typeof bookDialog.showModal === "function") {
    let opener = null;
    $$("[data-book-open]").forEach((a) =>
      a.addEventListener("click", (e) => {
        e.preventDefault();
        opener = a;
        bookDialog.showModal();
        const tab = a.dataset.bookOpen && $(`[data-bc-tab="${a.dataset.bookOpen}"]`, bookDialog);
        if (tab) tab.click();
        (tab ? $(`[data-bc-panel="${a.dataset.bookOpen}"] input, [data-bc-panel="${a.dataset.bookOpen}"] button`, bookDialog) : $("[data-bc-tab]", bookDialog))?.focus();
      })
    );
    $("[data-book-close]", bookDialog).addEventListener("click", () => bookDialog.close());
    bookDialog.addEventListener("click", (e) => { if (e.target === bookDialog) bookDialog.close(); });
    bookDialog.addEventListener("close", () => opener?.focus());
  }

  /* ---------- Mobile navigation ---------- */
  const nav = $("[data-mobile-nav]");
  const navOpen = $("[data-nav-open]");
  if (nav && navOpen) {
    navOpen.addEventListener("click", () => { nav.showModal(); navOpen.setAttribute("aria-expanded", "true"); });
    $("[data-nav-close]", nav).addEventListener("click", () => nav.close());
    // The menu is a side drawer: a tap on the dimmed page beside it closes it.
    nav.addEventListener("click", (e) => {
      const r = nav.getBoundingClientRect();
      if (e.target === nav && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) nav.close();
    });
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
    const anySelected = btns.some((b) => b.getAttribute("aria-selected") === "true");
    btns.forEach((b) => { b.tabIndex = !anySelected || b.getAttribute("aria-selected") === "true" ? 0 : -1; });
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
      lbCap.textContent = list.length > 1 ? `${src.alt} · ${idx + 1} / ${list.length}` : src.alt;
    };
    $$("[data-gallery]").forEach((g) => {
      const items = $$("[data-lb-src]", g);
      items.forEach((item, i) =>
        item.addEventListener("click", (e) => {
          e.preventDefault(); // a thumbnail may be a link to the large photo (works without JavaScript)
          opener = item;
          list = items.filter((x) => !x.closest("[hidden]")); // a filtered gallery browses only the photos shown
          show(list.indexOf(item));
          lb.showModal();
        })
      );
    });
    let opener = null;
    lb.addEventListener("close", () => { if (opener) opener.focus(); });
    $("[data-lb-close]", lb).addEventListener("click", () => lb.close());
    $("[data-lb-prev]", lb).addEventListener("click", () => show(idx - 1));
    $("[data-lb-next]", lb).addEventListener("click", () => show(idx + 1));
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

  /* ---------- Gallery filters ---------- */
  $$("[data-mosaic]").forEach((grid) => {
    const buttons = $$(".gx-filter", grid.parentElement);
    buttons.forEach((b) => b.addEventListener("click", () => {
      buttons.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      $$(".gx-tile", grid).forEach((tile) => { tile.hidden = b.dataset.filter !== "all" && tile.dataset.group !== b.dataset.filter; });
      grid.classList.toggle("is-filtered", b.dataset.filter !== "all");
    }));
  });

  /* ---------- Room carousels ----------
     A scroll-snap strip does the swiping (touch, trackpad, Shift+wheel); the buttons and the arrow keys move one photo,
     the counter follows the photo in view, and the buttons are disabled at either end. */
  $$("[data-carousel]").forEach((c) => {
    const track = $("[data-cr-track]", c);
    const slides = $$(".cr-slide", track);
    const count = $("[data-cr-count]", c);
    const prev = $("[data-cr-prev]", c), next = $("[data-cr-next]", c);
    if (!count || slides.length < 2) return;
    const current = () => {
      const x = track.scrollLeft + 4;
      let i = 0;
      slides.forEach((s, k) => { if (s.offsetLeft - slides[0].offsetLeft <= x) i = k; });
      return i;
    };
    const go = (i) => {
      const k = Math.max(0, Math.min(slides.length - 1, i));
      track.scrollTo({ left: slides[k].offsetLeft - slides[0].offsetLeft, behavior: reduced ? "auto" : "smooth" });
    };
    const update = () => {
      const i = current();
      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
      const shown = atEnd ? slides.length - 1 : i;
      count.textContent = `${shown + 1} / ${slides.length}`;
      prev.disabled = track.scrollLeft <= 4;
      next.disabled = atEnd;
    };
    prev.addEventListener("click", () => go(current() - 1));
    next.addEventListener("click", () => go(current() + 1));
    track.addEventListener("keydown", (e) => {
      if (e.target !== track) return;
      if (e.key === "ArrowRight") { e.preventDefault(); go(current() + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(current() - 1); }
    });
    let raf = 0;
    track.addEventListener("scroll", () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); }, { passive: true });
    window.addEventListener("resize", update);
    update();
  });

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
      set("adults", q.get("n"));
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
    } else if (form.dataset.booking === "review") {
      // Feedback: the error texts travel on the form (data-err-*), the shared name check is replaced by its own.
      const d = form.dataset;
      delete errors.name;
      if (!val("name")) errors.name = d.errName;
      const r = Number((form.querySelector('input[name="rating"]:checked') || {}).value);
      if (!(r >= 1 && r <= 5)) errors.rating = d.errRating;
      if (val("text").length < 20) errors.text = d.errText;
      if (!el.consent.checked) errors.consent = d.errConsent;
    } else if (form.dataset.booking === "contact") {
      if (val("message").length < 10) errors.message = form.dataset.errMessage;
      if (val("email") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val("email"))) errors.email = F.errors.email;
      if (val("phone") && val("phone").replace(/[^\d]/g, "").length < 7) errors.phone = F.errors.phone;
    } else if (form.dataset.booking === "event") {
      if (val("email") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val("email"))) errors.email = F.errors.email;
      if (val("phone") && val("phone").replace(/[^\d]/g, "").length < 7) errors.phone = F.errors.phone;
      if (val("altDate") && val("altDate") < today) errors.altDate = F.errors.date;
      if (!val("date") || val("date") < today) errors.date = F.errors.date;
      const p = Number(val("people"));
      if (!Number.isInteger(p) || p < 1 || p > 300) errors.people = F.errors.people;
    } else {
      if (!val("checkIn") || val("checkIn") < today) errors.checkIn = F.errors.checkIn;
      if (!val("checkOut") || (val("checkIn") && val("checkOut") <= val("checkIn"))) errors.checkOut = F.errors.checkOut;
      if (el.adults) {
        const a = Number(val("adults")), c = Number(val("children") || 0);
        if (!Number.isInteger(a) || a < 1 || a > 20) errors.adults = F.errors.adults;
        if (!Number.isInteger(c) || c < 0 || c > 10) errors.children = F.errors.children;
      } else {
        const g = Number(val("guests"));
        if (!Number.isInteger(g) || g < 1 || g > 20) errors.guests = F.errors.guests;
      }
      if (val("email") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val("email"))) errors.email = F.errors.email;
      if (val("phone") && val("phone").replace(/[^\d]/g, "").length < 7) errors.phone = F.errors.phone;
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
    if (form.dataset.booking === "review") {
      const opt = el.experience;
      return fmt(form.dataset.wa, { name: v("name"), experience: opt ? opt.options[opt.selectedIndex].text : "", rating: (form.querySelector('input[name="rating"]:checked') || {}).value || "", text: v("text") });
    }
    if (form.dataset.booking === "contact") {
      const s = el.topic;
      return fmt(form.dataset.wa, { topic: s ? s.options[s.selectedIndex].text : "", name: v("name"), email: v("email") ? fmt(F.waEmail, { email: v("email") }) : "", phone: v("phone") ? fmt(F.waPhone, { phone: v("phone") }) : "", message: v("message") });
    }
    if (form.dataset.booking === "event" && form.dataset.wa) {
      const line = (label, val) => (val ? `\n${label}: ${val}` : "");
      const pick = (n) => (el[n] && el[n].tagName === "SELECT" ? el[n].options[el[n].selectedIndex].text : v(n));
      const topics = [...form.querySelectorAll('input[name="topics"]:checked')].map((c) => c.value).join(", ");
      const lbl = (id) => (form.querySelector(`label[for="${id}"]`)?.childNodes[0]?.textContent || "").trim();
      return fmt(form.dataset.wa, {
        kind: pick("kind"), date: fmtDate(v("date")), altDate: line(lbl("ev-alt"), fmtDate(v("altDate"))), flex: pick("flex"), start: pick("start"), duration: pick("duration"),
        guests: v("people"), adults: line(lbl("ev-adults"), v("adults")), children: line(lbl("ev-children"), v("children")),
        atmosphere: pick("atmosphere"), setting: pick("setting"), topics: topics || "—", vision: v("vision") || "—",
        name: v("name"), email: line("Email", v("email")), phone: line(lbl("ev-phone"), v("phone")), prefer: pick("prefer"),
      });
    }
    if (form.dataset.booking === "event") {
      return fmt(F.waEvent, { kind: v("kind"), name: v("name"), date: fmtDate(v("date")), people: v("people"), contact, notes });
    }
    const roomSel = el.room;
    return fmt(F.waRoom, {
      checkIn: fmtDate(v("checkIn")),
      checkOut: fmtDate(v("checkOut")),
      nights: nightsLabel(v("checkIn"), v("checkOut")),
      guests: v("guests"),
      adults: v("adults"),
      children: v("children") || "0",
      room: roomSel ? roomSel.options[roomSel.selectedIndex].text : "",
      name: v("name"),
      email: v("email") ? fmt(F.waEmail, { email: v("email") }) : "",
      phone: v("phone") ? fmt(F.waPhone, { phone: v("phone") }) : "",
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

  /* ---------- Forms in steps (the event enquiry) ----------
     One fieldset at a time; Continue checks the required fields of the step it leaves; the progress line marks the
     current step; an error found on submit jumps back to its step. */
  $$("[data-steps]").forEach((form) => {
    const steps = $$("[data-step]", form);
    const back = $("[data-step-back]", form), next = $("[data-step-next]", form);
    const actions = $(".form-actions", form);
    const dots = $$("[data-progress]", form);
    let at = 0;
    form.classList.add("is-stepped");
    const show = (i, focus = true) => {
      at = Math.max(0, Math.min(steps.length - 1, i));
      steps.forEach((s, k) => { s.hidden = k !== at; });
      dots.forEach((d, k) => { d.classList.toggle("is-on", k === at); d.classList.toggle("is-done", k < at); });
      back.hidden = at === 0;
      next.hidden = at === steps.length - 1;
      actions.hidden = at !== steps.length - 1;
      if (focus) $("legend", steps[at]).scrollIntoView({ block: "nearest", behavior: reduced ? "auto" : "smooth" }), (steps[at].querySelector("input, select, textarea, .pk-btn") || next).focus({ preventScroll: true });
    };
    const stepErrors = (i) => {
      const all = validate(form);
      const names = $$("input, select, textarea", steps[i]).map((x) => x.name);
      return Object.fromEntries(Object.entries(all).filter(([k]) => names.includes(k)));
    };
    next.addEventListener("click", () => { if (showErrors(form, stepErrors(at))) show(at + 1); });
    back.addEventListener("click", () => show(at - 1));
    form._goToError = () => {
      const bad = $(".field.has-error", form);
      const k = steps.findIndex((s) => s.contains(bad));
      if (k >= 0 && k !== at) { show(k, false); bad.querySelector("input, select, textarea, .pk-btn")?.focus(); }
    };
    show(0, false);
  });

  // The review step: the exact WhatsApp message, with "Open WhatsApp" and "Change". The panel is built once per form,
  // takes focus when it opens, and hides again if the guest edits a field.
  function showReview(form) {
    let panel = $(".wa-review", form);
    if (!panel) {
      panel = document.createElement("div");
      panel.className = "wa-review";
      panel.setAttribute("role", "region");
      panel.tabIndex = -1;
      panel.innerHTML = `<h3></h3><p class="wa-review-lead"></p><pre class="wa-review-msg"></pre><div class="wa-review-btns"><button type="button" class="btn btn-terra btn-lg" data-review-send></button><button type="button" class="btn btn-outline btn-lg" data-review-edit></button></div>`;
      $("h3", panel).textContent = F.reviewTitle;
      $(".wa-review-lead", panel).textContent = F.reviewLead;
      $("[data-review-send]", panel).textContent = F.reviewSend;
      $("[data-review-edit]", panel).textContent = F.reviewEdit;
      panel.setAttribute("aria-label", F.reviewTitle);
      $(".form-actions", form).after(panel);
      $("[data-review-send]", panel).addEventListener("click", () => { form._reviewed = true; form.requestSubmit(); });
      $("[data-review-edit]", panel).addEventListener("click", () => { panel.hidden = true; form.querySelector("input, select, textarea, .pk-btn")?.focus(); });
      form.addEventListener("input", () => { panel.hidden = true; });
    }
    $(".wa-review-msg", panel).textContent = buildMessage(form);
    panel.hidden = false;
    panel.focus();
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
      if (form.elements.website && form.elements.website.value) return; // a filled hidden field means a bot: send nothing
      if (!showErrors(form, validate(form))) { form._goToError?.(); return; }
      // Room requests show the message for review first; the guest opens WhatsApp from there.
      if (form.hasAttribute("data-review-step") && !form._reviewed) return showReview(form);
      form._reviewed = false;
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
  // Every quick card on the page (the home hero panel and the booking dialog each have one).
  $$("[data-quick-wa]").forEach((card) => {
    const errBox = $("[data-bc-error]", card);
    let kind = null; // nothing is chosen until the visitor picks Restaurant or Stay
    const panel = (k) => $(`[data-bc-panel="${k}"]`, card);
    tabs($(".bc-tabs", card), "data-bc-tab", (k) => {
      kind = k;
      card.classList.add("is-open");
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
      if (!kind) return;
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
          adults: el.adults ? unitText(el.adults) : "",
          children: el.children ? unitText(el.children) : "",
          room: el.room && el.room.value ? fmt(F.waQuickRoomType, { room: opt(el.room) }) : "",
        });
      }
      card.classList.add("is-sending");
      sendToWhatsApp(waUrl(text), kind, () => card.classList.remove("is-sending"));
    });
    // The hero panel opens on a mode straight away (data-default); the dialog waits for the visitor's choice.
    if (card.dataset.default) $(`[data-bc-tab="${card.dataset.default}"]`, card)?.click();
  });

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

  // Hero entrance: the title rises word by word and the rest fades in, all within ~1 s of the page being ready.
  const heroSection = $(".cine-hero");
  const revealHero = () => {
    heroSection?.classList.add("is-ready");
    $$("[data-split]", heroSection || document.createElement("div")).forEach((el) => el.classList.add("is-in"));
  };
  if (reduced) revealHero();
  else setTimeout(revealHero, 60);

  // Hero video (site.heroVideo; on the home page it sits in the side panel of the hero). Its poster, the video's own first
  // frame, is on screen from the start; once the page has loaded the video is fetched and fades in over it, then plays
  // muted in a loop. It is paused while off screen and it is not fetched with data saver, a 2G connection or
  // "reduced motion" (the poster stays). If it fails, the poster stays. The hero never waits for it.
  const heroVideo = $("[data-hero-video]");
  if (heroVideo) {
    const conn = navigator.connection || {};
    if (reduced || conn.saveData || /(^|-)2g$/.test(conn.effectiveType || "")) {
      heroVideo.remove();
    } else {
      let onScreen = true;
      const keepPlaying = () => {
        if (onScreen && !document.hidden && heroVideo.classList.contains("is-on") && heroVideo.paused) heroVideo.play().catch(() => {});
      };
      const start = () => {
        heroVideo.addEventListener("error", () => heroVideo.remove(), { once: true });
        // The cover (the video's own first frame) is already on screen. The video loads behind it and, as soon as it is
        // really playing, fades in over it: same frame, same framing, so the cover seems to start moving.
        heroVideo.addEventListener("playing", () => heroVideo.classList.add("is-on"), { once: true });
        heroVideo.addEventListener("canplay", () => {
          // The cover stays on its own for at least COVER_MS after the page started (a fast connection would otherwise
          // swap it for the video straight away). The video waits on its first frame until then, so the fade starts
          // from exactly the picture that is on screen.
          const COVER_MS = 1300;
          setTimeout(() => {
            // If the browser refuses to autoplay, it starts with the visitor's first touch, key press or scroll.
            heroVideo.play().catch(() => {
              heroVideo.classList.add("is-on"); // paused on its first frame, which is the cover: nothing visibly changes
              ["pointerdown", "touchstart", "keydown", "wheel", "scroll"].forEach((ev) => window.addEventListener(ev, keepPlaying, { once: true, passive: true }));
            });
          }, Math.max(0, COVER_MS - performance.now()));
        }, { once: true });
        heroVideo.preload = "auto";
        // Phones get the lighter 1280 px film when there is one.
        heroVideo.src = heroVideo.dataset.srcSmall && window.innerWidth < 900 ? heroVideo.dataset.srcSmall : heroVideo.dataset.src;
        heroVideo.load();
      };
      if (document.readyState === "complete") setTimeout(start, 150);
      else window.addEventListener("load", () => setTimeout(start, 150), { once: true });
      heroVideo.addEventListener("pause", () => setTimeout(keepPlaying, 0));
      document.addEventListener("visibilitychange", keepPlaying);
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(([e]) => {
          onScreen = e.isIntersecting;
          if (!heroVideo.classList.contains("is-on")) return;
          if (onScreen) keepPlaying(); else heroVideo.pause();
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

  // Parallax is for a mouse and a wide screen only: on a phone the image just sits in its frame. When GSAP is on the page, cinema.js does it.
  const parallaxImgs = !window.gsap && fine && window.matchMedia("(min-width: 861px)").matches ? $$("[data-parallax]") : []; // with GSAP (cinema.js) it does the parallax
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
    if (hx && !reduced && !window.gsap) hx.style.setProperty("--hp", Math.min(1, Math.max(0, window.scrollY / (hx.offsetHeight * 0.7))).toFixed(3));
  }
  let ticking = false;
  const requestFrame = () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; frame(); }); } };
  window.addEventListener("scroll", requestFrame, { passive: true });
  window.addEventListener("resize", requestFrame);
  window.addEventListener("load", requestFrame);
  frame();

  // Reached the end without an error: the reveal states set by ".js" can all be resolved, so keep them.
  clearTimeout(failsafe);
})();
