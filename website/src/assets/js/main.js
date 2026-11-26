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
    new IntersectionObserver(([e]) => { formInView = e.isIntersecting; onScroll(); }, { rootMargin: "-20% 0px -20% 0px" }).observe(bookingSection);
  }
  // Header background. Transparent only while the page sits at the very top of a hero photograph; solid as soon as the page
  // moves (so no content ever scrolls under a see-through header, and white text never meets the cream sections). The
  // switch is driven by an IntersectionObserver on a 1px marker 40px down the hero, not by scroll events, which arrive
  // late or not at all with fast scrolling, restored scroll positions, anchor jumps and smooth scrolling.
  // Every page starts with a clear header (over the hero photograph, or over the page's own cream); it turns into the cream material
  // as soon as the page moves.
  const heroEl = document.body.classList.contains("has-hero") ? $(".cine-hero") : null;
  let atTop = window.scrollY < 40;
  if ("IntersectionObserver" in window) {
    const mark = document.createElement("span");
    mark.setAttribute("aria-hidden", "true");
    mark.style.cssText = "position:absolute;top:40px;left:0;width:1px;height:1px;pointer-events:none;visibility:hidden";
    (heroEl || document.body).prepend(mark);
    new IntersectionObserver(([e]) => { atTop = e.isIntersecting; paintHeader(); }).observe(mark);
  }
  function paintHeader() {
    if (!("IntersectionObserver" in window)) atTop = window.scrollY < 40;
    header?.classList.toggle("is-solid", !atTop);
  }
  let lastShown = null, lastBar = null;
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
    } else if (Math.abs(y - anchorY) > (hidden ? 3 : 14)) {
      // Only phones hide the header (they have the bottom bar). On a computer it stays, so "Reservar" is always in reach.
      header?.classList.toggle("is-hidden", y > anchorY && window.innerWidth <= 860);
      anchorY = y;
    }
    const barOn = y > window.innerHeight * 0.6 && !formInView;
    mobileBar?.classList.toggle("is-visible", barOn);
    // Read by CSS: the sticky menu bar moves up when the header hides; the cart button clears the mobile bar.
    const root = document.documentElement;
    const shown = header?.classList.contains("is-hidden") ? "0" : "1";
    if (shown !== lastShown) { root.style.setProperty("--header-shown", shown); lastShown = shown; }
    if (barOn !== lastBar) { root.classList.toggle("has-bar", barOn); lastBar = barOn; }
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
        const pre = a.dataset.roomLink && $("select[name=\"room\"]", bookDialog);
        if (pre) { pre.value = a.dataset.roomLink; pre.dispatchEvent(new Event("change", { bubbles: true })); }
        (tab ? $(`[data-bc-panel="${a.dataset.bookOpen}"] input, [data-bc-panel="${a.dataset.bookOpen}"] button`, bookDialog) : $("[data-bc-tab]", bookDialog))?.focus();
      })
    );
    $("[data-book-close]", bookDialog).addEventListener("click", () => bookDialog.close());
    bookDialog.addEventListener("click", (e) => { if (e.target === bookDialog) bookDialog.close(); });
    bookDialog.addEventListener("close", () => opener?.focus());
  }

  /* ---------- Reviews: the dark box opens the feedback dialog ----------
     A <dialog>: the browser traps focus, closes on Escape and makes the page behind inert. A click on the backdrop (the dialog element itself,
     never its content) closes it too; focus goes back to the box that opened it. The form is the same as before: it prepares a WhatsApp message. */
  const fb = $("[data-fb-dialog]");
  if (fb) {
    let opener = null;
    $$("[data-open-feedback]").forEach((btn) => btn.addEventListener("click", () => {
      opener = btn;
      if (!fb.open) fb.showModal();
      $("input[name='name']", fb)?.focus({ preventScroll: true });
    }));
    $("[data-fb-close]", fb).addEventListener("click", () => fb.close());
    fb.addEventListener("click", (e) => { if (e.target === fb) fb.close(); });
    fb.addEventListener("close", () => opener?.focus({ preventScroll: true }));
  }

  /* ---------- Room galleries: three progress bars, story-like ----------
     One photograph at a time on a scroll-snap strip (swipe, arrow keys, previous/next). Above it, one bar per photograph: the active
     bar fills over STORY_MS (a CSS animation), and when it ends the next photograph shows. The last photograph stays: it does not loop.
     Choosing a bar, the arrows or a swipe restarts the bar of the photograph then shown. The timer IS the animation, so there is no
     interval to clear; it pauses (animation-play-state) while the gallery is hovered, has keyboard focus or is touched, while the tab is hidden and
     while the gallery is off screen. With reduced motion nothing plays: the bars only show which photograph is in view. */
  const STORY_MS = 5000;
  $$("[data-rg]").forEach((root) => {
    const track = $("[data-rg-track]", root);
    const prev = $("[data-rg-prev]", root);
    const next = $("[data-rg-next]", root);
    const bars = $$("[data-rg-bar]", root);
    const slides = $$(".rs-slide", track);
    if (!track || !slides.length) return;
    root.style.setProperty("--story-ms", STORY_MS + "ms");
    let active = -1, hold = 0, target = -1, onScreen = !("IntersectionObserver" in window);
    const index = () => Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
    // `target`: while the strip glides to a photograph the code chose, the scroll positions on the way are not a new choice
    const go = (i) => { target = Math.max(0, Math.min(slides.length - 1, i)); track.scrollTo({ left: target * track.clientWidth, behavior: reduced ? "auto" : "smooth" }); };
    // the bars: done before the active one, filling at the active one, empty after; the animation restarts only when the photograph changes
    const show = (i) => {
      if (i === active) return;
      active = i;
      bars.forEach((b, k) => {
        b.classList.toggle("is-done", k < i);
        b.classList.toggle("is-active", k === i);
        if (k === i) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current");
      });
      const fill = bars[i] && $("i", bars[i]);
      if (fill) { fill.style.animation = "none"; void fill.offsetWidth; fill.style.animation = ""; }
      if (prev) prev.disabled = i <= 0;
      if (next) next.disabled = i >= slides.length - 1;
    };
    const sync = () => root.classList.toggle("is-held", hold > 0 || document.hidden || !onScreen);
    const press = (on) => { hold += on ? 1 : -1; sync(); };
    root.classList.toggle("is-story", !reduced);
    bars.forEach((b, k) => b.addEventListener("click", () => { show(k); go(k); }));
    if (prev) prev.addEventListener("click", () => go(index() - 1));
    if (next) next.addEventListener("click", () => go(index() + 1));
    // the fill ends: the next photograph (the last one stays)
    root.addEventListener("animationend", (e) => { if (e.target.matches(".rs-bar.is-active i") && active < slides.length - 1) { show(active + 1); go(active); } });
    let raf = 0;
    track.addEventListener("scroll", () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const i = index();
        if (target >= 0) { if (i === target && Math.abs(track.scrollLeft - target * track.clientWidth) < 2) target = -1; return; }
        show(i); // a swipe or a trackpad
      });
    }, { passive: true });
    track.addEventListener("pointerdown", () => { target = -1; }, { passive: true });
    track.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); go(index() + 1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); go(index() - 1); }
    });
    // pausing: pointer over, focus inside, finger down
    root.addEventListener("mouseenter", () => press(true));
    root.addEventListener("mouseleave", () => press(false));
    let kbFocus = false;
    root.addEventListener("focusin", (e) => { const k = e.target.matches(":focus-visible"); if (k !== kbFocus) { kbFocus = k; press(k); } });
    root.addEventListener("focusout", (e) => { if (kbFocus && !root.contains(e.relatedTarget)) { kbFocus = false; press(false); } });
    root.addEventListener("touchstart", () => press(true), { passive: true });
    ["touchend", "touchcancel"].forEach((n) => root.addEventListener(n, () => press(false), { passive: true }));
    document.addEventListener("visibilitychange", sync);
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(([en]) => { onScreen = en.isIntersecting; sync(); }, { threshold: 0.5 });
      io.observe(root);
      window.addEventListener("pagehide", () => io.disconnect(), { once: true });
    }
    window.addEventListener("resize", () => go(active));
    show(index());
    sync();
  });

  /* ---------- Hero scroll cue fades once the visitor scrolls; the footer signature rises into view once ---------- */
  const cue = $("[data-hx-scroll]");
  if (cue) {
    const onScroll = () => cue.classList.toggle("is-gone", window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
  const mark = $("[data-ft-mark]");
  if (mark && !reduced && "IntersectionObserver" in window) {
    mark.classList.add("is-armed");
    new IntersectionObserver((entries, io) => {
      if (entries.some((e) => e.isIntersecting)) { mark.classList.add("is-in"); io.disconnect(); }
    }, { threshold: 0.25 }).observe(mark);
  }

  /* ---------- Mobile navigation: a plain drawer ----------
     The <dialog> is the container, so the browser provides the focus trap, Escape and the inert page behind it. The panel slides in from the
     right (moving left) and back out with one short CSS transition; there is no timeline and no library. With reduced motion it simply appears. */
  const nav = $("[data-mobile-nav]");
  const navOpen = $("[data-nav-open]");
  if (nav && navOpen) {
    const root = document.documentElement;
    let closing = false;
    let timer = 0;
    const finish = () => {
      clearTimeout(timer);
      nav.classList.remove("is-open");
      if (nav.open) nav.close();
      root.classList.remove("nav-open");
      navOpen.setAttribute("aria-expanded", "false");
      closing = false;
    };
    const openMenu = () => {
      if (nav.open) return;
      closing = false;
      nav.showModal();
      root.classList.add("nav-open");
      navOpen.setAttribute("aria-expanded", "true");
      // Two frames: the panel is first painted off-screen, then the class moves it in (a transition needs a starting state).
      requestAnimationFrame(() => requestAnimationFrame(() => nav.classList.add("is-open")));
    };
    const closeMenu = (now) => {
      if (!nav.open || (closing && !now)) return;
      if (now || reduced) { finish(); return; }
      closing = true;
      nav.classList.remove("is-open");
      timer = setTimeout(finish, 360); // the transition lasts 300 ms; this also covers a browser that skips it
    };
    navOpen.addEventListener("click", openMenu);
    $("[data-nav-close]", nav).addEventListener("click", () => closeMenu());
    nav.addEventListener("cancel", (e) => { e.preventDefault(); closeMenu(); }); // Escape: close with the exit transition
    nav.addEventListener("click", (e) => { if (e.target === nav) closeMenu(); }); // a tap beside the panel
    nav.addEventListener("close", () => { clearTimeout(timer); nav.classList.remove("is-open"); root.classList.remove("nav-open"); navOpen.setAttribute("aria-expanded", "false"); closing = false; });
    // Same-page anchors and the booking buttons need the menu out of the way at once; page links simply leave the page.
    $$("a", nav).forEach((a) => a.addEventListener("click", () => {
      if (a.hasAttribute("data-book-open") || (a.getAttribute("href") || "").startsWith("#")) closeMenu(true);
    }));
    window.matchMedia("(min-width: 1280px)").addEventListener("change", (e) => { if (e.matches) closeMenu(true); }); // the desktop navigation takes over
    window.addEventListener("pageshow", (e) => { if (e.persisted) closeMenu(true); });
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

  /* ---------- Language menu (globe button + list): a disclosure, closed by Escape, a click outside or leaving it ---------- */
  $$("[data-lang-dd]").forEach((dd) => {
    const btn = $(".lang-dd-btn", dd);
    const menu = $(".lang-dd-menu", dd);
    const set = (open, focusBtn = false) => {
      menu.hidden = !open;
      btn.setAttribute("aria-expanded", String(open));
      if (!open && focusBtn) btn.focus();
    };
    btn.addEventListener("click", () => set(menu.hidden));
    btn.addEventListener("keydown", (e) => { if (e.key === "ArrowDown") { e.preventDefault(); set(true); $(".lang-dd-item[href]", menu)?.focus(); } });
    dd.addEventListener("keydown", (e) => { if (e.key === "Escape" && !menu.hidden) { e.stopPropagation(); set(false, true); } });
    dd.addEventListener("focusout", (e) => { if (!dd.contains(e.relatedTarget)) set(false); });
    document.addEventListener("pointerdown", (e) => { if (!dd.contains(e.target)) set(false); });
  });

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
    const lbCount = $("[data-lb-count]", lb);
    let list = [];
    let idx = 0;
    const warm = (i) => { const it = list[(i + list.length) % list.length]; if (it) { const im = new Image(); im.src = it.dataset.lbSrc; } };
    const show = (i) => {
      idx = (i + list.length) % list.length;
      const item = list[idx];
      const src = $("img", item);
      lbImg.classList.add("is-loading");
      lbImg.onload = () => lbImg.classList.remove("is-loading");
      lbImg.src = item.dataset.lbSrc;
      if (lbImg.complete) lbImg.classList.remove("is-loading");
      lbImg.alt = src.alt;
      lbCap.textContent = src.alt;
      if (lbCount) lbCount.textContent = list.length > 1 ? `${idx + 1} / ${list.length}` : "";
      warm(idx + 1); warm(idx - 1);
    };
    $$("[data-gallery]").forEach((g) => {
      const items = $$("[data-lb-src]", g).filter((el) => !el.closest("[hidden]"));
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
      if (e.key === "Home") { e.preventDefault(); show(0); }
      if (e.key === "End") { e.preventDefault(); show(list.length - 1); }
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

  /* ---------- Gallery film: fetched only when it comes into view; plays there by itself unless motion is reduced; one button pauses it ---------- */
  $$("[data-gx-film]").forEach((v) => {
    const btn = v.parentElement.querySelector("[data-gx-film-btn]");
    let wanted = !reduced;
    const sync = () => {
      const on = !v.paused;
      btn.setAttribute("aria-pressed", String(on));
      btn.classList.toggle("is-on", on);
      btn.querySelector("span").textContent = on ? btn.dataset.pause : btn.dataset.play;
    };
    v.addEventListener("play", sync); v.addEventListener("pause", sync);
    // the file ends in a dissolve back to its first shot (a double exposure): the tile loops on a clean cut before it
    v.addEventListener("timeupdate", () => { if (v.currentTime >= 13.25) v.currentTime = 0; });
    btn.addEventListener("click", () => { wanted = v.paused; if (v.paused) v.play().catch(() => {}); else v.pause(); });
    // the poster frame is fetched only as the film nears the screen (it is not part of the first view)
    new IntersectionObserver(([e], o) => { if (e.isIntersecting) { v.poster = v.dataset.poster; o.disconnect(); } }, { rootMargin: "600px 0px" }).observe(v);
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { if (wanted) v.play().catch(() => {}); }
      else if (!v.paused) v.pause();
    }, { threshold: 0.35 }).observe(v);
    sync();
  });

  /* ---------- Events: choosing an occasion fills the form's first field ---------- */
  $$("[data-event-kind]").forEach((link) => link.addEventListener("click", () => {
    const sel = $('[data-booking="event"] [name="kind"]');
    if (!sel) return;
    sel.value = link.dataset.eventKind;
    sel.dispatchEvent(new Event("change", { bubbles: true }));
  }));

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
    if (el.name && !val("name")) errors.name = F.errors.name;
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
      if (val("altDate") && (val("altDate") < today || val("altDate") === val("date"))) errors.altDate = F.errors.date;
      if (el.time && !val("time")) errors.time = F.errors.time;
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
    if (form.dataset.booking === "event" && form.hasAttribute("data-short")) {
      const alt = v("altDate") ? `\n${form.dataset.altLabel}: ${fmtDate(v("altDate"))}` : "";
      const kindSel = el.kind;
      const notes = v("notes") ? `\n${form.dataset.notesLabel}: ${v("notes")}` : "";
      return fmt(form.dataset.wa, { kind: kindSel.options[kindSel.selectedIndex].text, date: fmtDate(v("date")), altDate: alt, time: v("time"), guests: v("people"), notes });
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
    // Counted as a hand-off to WhatsApp (only with analytics consent); never as a confirmed booking or order.
    if (window.LauhataTrack) window.LauhataTrack("whatsapp_request_handoff", { request_type: kind });
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
    // The hero panel starts collapsed (only the two mode buttons). A second tap on the open mode folds it away again.
    if (card.classList.contains("is-hero")) {
      $(".bc-tabs", card).addEventListener("click", (e) => {
        const b = e.target.closest("[data-bc-tab]");
        if (!b || b.getAttribute("aria-selected") !== "true") return;
        e.stopImmediatePropagation();
        $$("[data-bc-tab]", card).forEach((x) => { x.setAttribute("aria-selected", "false"); });
        kind = null;
        card.classList.remove("is-open");
        panel("table").hidden = true; panel("room").hidden = true; errBox.hidden = true;
      }, true);
    }
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
      const unitText = (i) => { const n = i.value === "" ? 1 : Math.max(0, Number(i.value) || 0); return `${n} ${n === 1 ? i.dataset.unitOne : i.dataset.unitMany}`; };
      let text;
      if (kind === "table") {
        if (!el.date.value || el.date.value < today) return fail(el.date, F.errors.date);
        const who = el.tName && el.tName.value.trim() ? fmt(F.waName, { name: el.tName.value.trim() }) : "";
        const nt = el.tNotes && el.tNotes.value.trim() ? fmt(F.waNotes, { notes: el.tNotes.value.trim() }) : "";
        text = fmt(F.waQuickTable, { date: fmtDate(el.date.value), time: el.time.value, people: unitText(el.people), who, notes: nt });
      } else {
        if (!el.checkIn.value || el.checkIn.value < today) return fail(el.checkIn, F.errors.checkIn);
        if (!el.checkOut.value || el.checkOut.value <= el.checkIn.value) return fail(el.checkOut, F.errors.checkOut);
        text = fmt(F.waQuickRoom, {
          checkIn: fmtDate(el.checkIn.value),
          checkOut: fmtDate(el.checkOut.value),
          nights: nightsLabel(el.checkIn.value, el.checkOut.value),
          adults: el.adults ? unitText(el.adults) : "",
          children: el.children && +el.children.value > 0 ? fmt(F.waChildren, { children: unitText(el.children) }) : "", // only when there are children
          room: el.room && el.room.value ? fmt(F.waQuickRoomType, { room: opt(el.room) }) : "",
          who: el.rName && el.rName.value.trim() ? fmt(F.waName, { name: el.rName.value.trim() }) : "",
          notes: el.rNotes && el.rNotes.value.trim() ? fmt(F.waNotes, { notes: el.rNotes.value.trim() }) : "",
        });
      }
      card.classList.add("is-sending");
      sendToWhatsApp(waUrl(text), kind, () => card.classList.remove("is-sending"));
    });
    // A card opens on a mode straight away only when it asks for one (data-default); the hero panel and the dialog wait for the visitor's choice.
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
  // On the home page an opening may still be on screen: the hero entrance starts as it lifts (window.LAUHATA_INTRO, set inline).
  Promise.resolve(window.LAUHATA_INTRO).then(() => {
    if (reduced) revealHero();
    else requestAnimationFrame(() => requestAnimationFrame(revealHero));
  });

  // ---------- The home film ----------
  // The photograph is on screen from the first paint. The film (the same scene: its first frame IS that photograph) is fetched only after
  // the page has loaded and the loading screen has lifted, and shown only once a frame of it has really been painted; then it cross-fades
  // in from that very frame at its natural speed, so the picture seems to start moving. It plays once and rests on the wide view of the
  // coast: the last second and a half of the file is a dissolve back to the opening shot, which looked like a double exposure followed by
  // a jump, so it stops at FILM_END, before that. The control then offers to play it again. If anything fails (no autoplay, a slow or
  // broken connection) the photograph simply stays.
  // Laptops and desktops only (1024 px or more and a mouse or trackpad). It never starts by itself with reduced motion, data saver or a
  // 2G connection: there the control shows "play" and the film is fetched only if the visitor asks for it.
  const FILM_END = 13.25;
  const heroVideo = $("[data-hero-video]");
  if (heroVideo) {
    const hero = heroVideo.closest(".cine-hero");
    const toggle = $("[data-hero-toggle]", hero);
    const conn = navigator.connection || {};
    const desk = window.matchMedia("(min-width: 1024px) and (any-hover: hover) and (any-pointer: fine)");
    const drop = () => { heroVideo.remove(); toggle?.remove(); hero.classList.remove("is-film"); };
    if (!desk.matches) drop();
    else {
      heroVideo.loop = false;
      let onScreen = true, held = false, revealed = false, asked = false, done = false; // held: paused by the visitor; done: rested on the last frame
      const label = (playing) => {
        if (!toggle) return;
        const text = playing ? toggle.dataset.pause : toggle.dataset.play;
        toggle.classList.toggle("is-paused", !playing);
        toggle.setAttribute("aria-label", text);
        toggle.title = text;
      };
      const run = () => { if (revealed && onScreen && !held && !done && !document.hidden && heroVideo.paused) heroVideo.play().catch(() => {}); };
      // Stop on the last clean frame, before the dissolve in the file. Checked on every painted frame where the browser can say so.
      const rest = () => { if (done) return; done = true; heroVideo.pause(); label(false); };
      const watchEnd = () => {
        if ("requestVideoFrameCallback" in heroVideo) {
          const tick = (now, meta) => { if (meta.mediaTime >= FILM_END) rest(); else heroVideo.requestVideoFrameCallback(tick); };
          heroVideo.requestVideoFrameCallback(tick);
        }
        heroVideo.addEventListener("timeupdate", () => { if (heroVideo.currentTime >= FILM_END - 0.05) rest(); });
        heroVideo.addEventListener("ended", rest);
      };
      const reveal = () => {
        if (revealed) return;
        revealed = true;
        hero.classList.add("is-film");
        heroVideo.classList.add("is-on");
        toggle?.classList.remove("is-loading");
        label(true);
        watchEnd();
      };
      const start = () => {
        if (asked) return;
        asked = true;
        heroVideo.addEventListener("error", drop, { once: true });
        heroVideo.addEventListener("canplaythrough", () => {
          if (held) return; // paused before it ever showed: it starts when the visitor says so
          heroVideo.play().then(() => {
            if ("requestVideoFrameCallback" in heroVideo) heroVideo.requestVideoFrameCallback(reveal);
            else requestAnimationFrame(() => requestAnimationFrame(reveal));
          }).catch(() => { heroVideo.pause(); held = true; toggle?.classList.remove("is-loading"); label(false); }); // autoplay refused: the photograph stays, the control offers the film
        }, { once: true });
        heroVideo.preload = "auto";
        heroVideo.src = heroVideo.dataset.src;
        heroVideo.load();
      };
      // Play it again: the film fades back to the photograph (its first frame), returns to the start unseen, and comes back moving.
      const replay = () => {
        done = false;
        heroVideo.classList.remove("is-on");
        setTimeout(() => {
          heroVideo.currentTime = 0;
          heroVideo.play().then(() => {
            const show = () => heroVideo.classList.add("is-on");
            if ("requestVideoFrameCallback" in heroVideo) heroVideo.requestVideoFrameCallback(show); else show();
            watchEnd();
          }).catch(() => { held = true; label(false); });
        }, 1900); // the fade back to the photograph takes 1.8 s
      };
      const auto = !reduced && !conn.saveData && !/(^|-)2g$/.test(conn.effectiveType || "");
      if (auto) {
        // After the loading screen has lifted and the words have entered, and never while the page itself is still loading.
        const loaded = new Promise((r) => (document.readyState === "complete" ? r() : window.addEventListener("load", r, { once: true })));
        Promise.all([loaded, Promise.resolve(window.LAUHATA_INTRO)]).then(() => setTimeout(start, 900));
      } else held = true;
      if (toggle) { toggle.hidden = false; label(auto); }
      desk.addEventListener("change", () => { if (!desk.matches) drop(); });
      document.addEventListener("visibilitychange", run);
      window.addEventListener("pageshow", (e) => { if (e.persisted) run(); });
      toggle?.addEventListener("click", () => {
        if (done) { held = false; label(true); replay(); return; }
        held = !held;
        label(!held);
        if (held) { heroVideo.pause(); return; }
        if (!asked) { toggle.classList.add("is-loading"); start(); return; }
        if (revealed) { run(); return; }
        heroVideo.play().then(reveal).catch(() => { held = true; label(false); });
      });
      new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; if (!revealed) return; if (onScreen) run(); else heroVideo.pause(); }, { threshold: 0.05 }).observe(hero);
    }
  }

  // ---------- Liquiçá, now: the local time and today's sunset ----------
  // The sunset comes from the standard sunrise equation (NOAA) at the map pin, so it changes with the season like the real one. Timor-Leste
  // keeps UTC+9 all year (Asia/Dili). The minute is refreshed on the minute, only while the page is visible.
  const now = $("[data-now]");
  if (now && window.Intl) {
    const lat = +now.dataset.lat, lng = +now.dataset.lng, tz = now.dataset.tz;
    const hm = new Intl.DateTimeFormat(document.documentElement.lang, { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: tz });
    const sunset = (date) => {
      const r = Math.PI / 180, jd = date.getTime() / 864e5 + 2440587.5, n = Math.round(jd - 2451545.0 + 0.0008);
      const J = n - lng / 360, M = (357.5291 + 0.98560028 * J) % 360;
      const C = 1.9148 * Math.sin(M * r) + 0.02 * Math.sin(2 * M * r) + 0.0003 * Math.sin(3 * M * r);
      const L = (M + C + 180 + 102.9372) % 360, transit = 2451545.0 + J + 0.0053 * Math.sin(M * r) - 0.0069 * Math.sin(2 * L * r);
      const dec = Math.asin(Math.sin(L * r) * Math.sin(23.4397 * r));
      const w = Math.acos((Math.sin(-0.833 * r) - Math.sin(lat * r) * Math.sin(dec)) / (Math.cos(lat * r) * Math.cos(dec))) / r;
      return new Date((transit + w / 360 - 2440587.5) * 864e5);
    };
    const paint = () => {
      const d = new Date(), set = hm.format(sunset(d));
      $("[data-now-time]", now).textContent = now.dataset.nowLabel.replace("{time}", hm.format(d));
      $("[data-now-sun]", now).textContent = now.dataset.sunLabel.replace("{time}", set);
      now.hidden = false;
      $$("[data-sunset]").forEach((el) => { el.textContent = now.dataset.sunLabel.replace("{time}", set); el.hidden = false; });
    };
    let timer = 0;
    const tick = () => { paint(); clearTimeout(timer); if (!document.hidden) timer = setTimeout(tick, 60000 - (Date.now() % 60000) + 50); };
    // Time-zone formatting loads its data on first use: wait until a line that needs it is near the screen, and the browser is idle.
    let started = false;
    const begin = () => { if (started) return; started = true; document.addEventListener("visibilitychange", () => { if (!document.hidden) tick(); else clearTimeout(timer); }); tick(); };
    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 200));
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); idle(begin); } }, { rootMargin: "600px 0px" });
      [now, ...$$("[data-sunset]")].forEach((el) => io.observe(el.closest("li, footer, p") || el));
    } else idle(begin);
  }

  // ---------- Gallery: a small "View" label follows a real pointer over the photographs ----------
  // Decorative, so only with a mouse or trackpad and without reduced motion. It eases towards the pointer (a short lerp, then it stops:
  // no loop runs while nothing moves) and is moved by transform on the element itself.
  const gxList = $(".gx-list");
  if (gxList && !reduced && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const tag = document.createElement("div");
    tag.className = "gx-view"; tag.setAttribute("aria-hidden", "true"); tag.textContent = gxList.dataset.viewLabel || "View";
    document.body.append(tag);
    let x = 0, y = 0, tx = 0, ty = 0, raf = 0;
    const step = () => {
      x += (tx - x) * 0.22; y += (ty - y) * 0.22;
      tag.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.3 ? requestAnimationFrame(step) : 0;
    };
    gxList.addEventListener("pointermove", (e) => {
      const over = e.target.closest("a.gx-frame");
      tag.classList.toggle("is-on", !!over);
      tx = e.clientX; ty = e.clientY;
      if (!tag.dataset.placed) { x = tx; y = ty; tag.dataset.placed = "1"; tag.style.transform = `translate3d(${x}px, ${y}px, 0)`; }
      if (!raf) raf = requestAnimationFrame(step);
    });
    gxList.addEventListener("pointerleave", () => tag.classList.remove("is-on"));
  }

  // ---------- Back to top ----------
  // Shown once the first screen is behind (an observer on a marker, no scroll listener). It takes the focus back to the start of the page.
  const toTop = $("[data-to-top]");
  if (toTop && "IntersectionObserver" in window) {
    const mark = document.createElement("span");
    mark.setAttribute("aria-hidden", "true");
    mark.style.cssText = "position:absolute;top:0;left:0;width:1px;height:110vh;pointer-events:none;visibility:hidden";
    document.body.prepend(mark);
    new IntersectionObserver(([e]) => toTop.classList.toggle("is-on", !e.isIntersecting)).observe(mark);
    toTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
      $(".brand")?.focus({ preventScroll: true });
    });
  }

  // Everything else is revealed once, as it enters the viewport: a heading rises line by line (data-split), a photograph opens like a tide
  // (data-tide). The slow drift of photographs is CSS (animation-timeline), so nothing here runs while the page scrolls.
  const onEnter = (els, opts = {}) => {
    if (reduced || !("IntersectionObserver" in window)) return els.forEach((el) => el.classList.add("is-in"));
    const io2 = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (!e.isIntersecting && e.boundingClientRect.top > 0) return;
        e.target.classList.add("is-in"); // also when it was jumped over (an anchor, a restored scroll): it is above the screen
        io2.unobserve(e.target);
      }),
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08, ...opts }
    );
    els.forEach((el) => io2.observe(el));
  };
  onEnter($$("[data-split]").filter((el) => !el.closest(".cine-hero")));
  onEnter($$("[data-fade]").filter((el) => !el.closest(".cine-hero")));
  onEnter($$("[data-tide], [data-rise]"));
  onEnter($$("[data-stagger]"), { rootMargin: "0px 0px -12% 0px" });

  // ---------- A day at Lauhata ----------
  // Pinned (CSS: --pin is 1 only on a large enough screen with motion): while the section is on screen, a passive scroll listener reads how
  // far the page has travelled through it and shows the meal for that stretch; the hairline follows the same number. Off screen there is no
  // listener at all. The three labels take the page to a meal. Unpinned, everything is already on the page and nothing runs.
  const day = $("[data-day]");
  if (day && "IntersectionObserver" in window) {
    const steps = $$("[data-day-step]", day), frames = $$("[data-day-frame]", day), go = $$("[data-day-go]", day), fill = $("[data-day-fill]", day);
    const pinned = () => getComputedStyle(day).getPropertyValue("--pin").trim() === "1";
    let cur = 0, top = 0, span = 1, raf = 0, live = false;
    const show = (i) => {
      if (i === cur) return;
      cur = i;
      steps.forEach((s, n) => s.classList.toggle("is-on", n === i));
      frames.forEach((f, n) => f.classList.toggle("is-on", n === i));
      go.forEach((b, n) => (n === i ? b.setAttribute("aria-current", "step") : b.removeAttribute("aria-current")));
    };
    const measure = () => { top = day.getBoundingClientRect().top + window.scrollY; span = Math.max(1, day.offsetHeight - window.innerHeight); };
    const tick = () => {
      raf = 0;
      const p = Math.min(1, Math.max(0, (window.scrollY - top) / span));
      if (fill) fill.style.transform = `scaleX(${p.toFixed(4)})`;
      show(Math.min(steps.length - 1, Math.floor(p * steps.length * 0.9999)));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick); };
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && pinned()) {
        measure(); tick();
        if (!live) { window.addEventListener("scroll", onScroll, { passive: true }); live = true; }
        $$("img", day).forEach((im) => { im.loading = "eager"; });
      } else if (live) { window.removeEventListener("scroll", onScroll); live = false; }
    }).observe(day);
    window.addEventListener("resize", () => { if (live) { measure(); tick(); } }, { passive: true });
    go.forEach((b, i) => b.addEventListener("click", () => {
      measure();
      window.scrollTo({ top: top + span * ((i + 0.5) / steps.length), behavior: reduced ? "auto" : "smooth" });
    }));
  }

  // Reached the end without an error: the reveal states set by ".js" can all be resolved, so keep them.
  clearTimeout(failsafe);
})();
