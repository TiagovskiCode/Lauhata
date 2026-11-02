/* Lauhata — restaurant order: the cart, the options dialog, the checkout and the WhatsApp message,
   plus the menu's search and category bar. Vanilla JS, no dependencies. The cart is kept in
   localStorage (this browser only); there is no server and no payment: the order leaves as a
   WhatsApp message that Lauhata has to answer. Prices come from the menu data (src/data/menu.mjs). */
(() => {
  "use strict";

  const CFG = window.LAUHATA || {};
  const O = CFG.i18n && CFG.i18n.order;
  if (!O) return;
  const ORD = CFG.order || { currency: "$", types: [] };
  const LANG = CFG.lang === "en" ? "en" : "pt";
  const MENU = window.LAUHATA_MENU || {};
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fmt = (s, v) => String(s).replace(/\{(\w+)\}/g, (m, k) => (k in v ? v[k] : m));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const icon = (n) => `<svg class="icon" aria-hidden="true"><use href="#i-${n}"></use></svg>`;

  const KEY = "lauhata-cart-v1";
  const MAX_AGE = 24 * 3600 * 1000; // an old cart is dropped: prices may have changed since
  const MAX_QTY = 20;
  const MAX_URL = 6000; // a longer WhatsApp link may not open

  // Prices are handled in cents so sums never drift (0.1 + 0.2).
  const money = (c) => ORD.currency + (c % 100 === 0 ? String(c / 100) : (c / 100).toFixed(2));
  const countLabel = (n) => (n === 1 ? O.itemOne : fmt(O.itemMany, { n }));

  /* ---------- Cart state ---------- */
  let lines = [];

  const valid = (l) =>
    l && typeof l.key === "string" && typeof l.name === "string" && Number.isInteger(l.cents) && l.cents >= 0 &&
    Number.isInteger(l.qty) && l.qty >= 1 && l.qty <= MAX_QTY && Array.isArray(l.opts);

  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY));
      lines = raw && raw.v === 1 && Date.now() - raw.t < MAX_AGE && Array.isArray(raw.lines) ? raw.lines.filter(valid) : [];
    } catch (e) {
      lines = []; // storage blocked or corrupt: the cart works for this page only
    }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify({ v: 1, t: Date.now(), lines })); } catch (e) { /* in-memory only */ }
    render();
  }
  const count = () => lines.reduce((n, l) => n + l.qty, 0);
  const total = () => lines.reduce((n, l) => n + l.cents * l.qty, 0);

  // Unit price in cents for a dish and the chosen options, or null if it has no valid price yet
  // (a required option is missing, or the dish has no price): then it cannot be added.
  function priceFor(item, sel) {
    let base = item.price;
    for (const g of item.options) {
      const c = g.choices.find((x) => x.id === sel[g.id]);
      if (!c) return null;
      if (c.price != null) base = c.price;
    }
    return base == null ? null : Math.round(base * 100);
  }

  // The same dish with the same options is one line with a bigger quantity.
  function add(item, sel, qty = 1) {
    const cents = priceFor(item, sel);
    if (cents == null) return false;
    const key = [item.id, ...item.options.map((g) => `${g.id}:${sel[g.id]}`)].join("|");
    const opts = item.options.map((g) => g.choices.find((c) => c.id === sel[g.id]).label);
    const line = lines.find((l) => l.key === key);
    if (line) {
      line.qty = Math.min(MAX_QTY, line.qty + qty);
      line.cents = cents;
    } else {
      lines.push({ key, id: item.id, name: item.name, cents, qty: Math.min(MAX_QTY, qty), opts });
    }
    save();
    return true;
  }
  function setQty(key, q) {
    const line = lines.find((l) => l.key === key);
    if (!line) return;
    if (q < 1) lines = lines.filter((l) => l !== line); // zero removes the dish
    else line.qty = Math.min(MAX_QTY, q);
    save();
  }
  function remove(key) {
    lines = lines.filter((l) => l.key !== key);
    save();
  }
  function clear() {
    lines = [];
    save();
  }
  load(); // read the saved cart now: the code below (thank-you page, menu) already needs it

  /* ---------- Dialog helpers ---------- */
  const drawer = $("[data-cart]");
  const optDlg = $("[data-opt]");
  const live = $("[data-cart-live]");
  const root = document.documentElement;

  const announce = (msg) => {
    if (!live) return;
    live.textContent = "";
    setTimeout(() => { live.textContent = msg; }, 30);
  };
  const anyOpen = () => (drawer && drawer.open) || (optDlg && optDlg.open);

  function lock(on) {
    root.classList.toggle("has-modal", on);
    if (window.lenis) on ? window.lenis.stop() : window.lenis.start();
  }
  function openDialog(d) {
    if (!d || d.open) return;
    d.classList.remove("is-closing");
    d.showModal();
    lock(true);
    render();
  }
  // Runs once a dialog is shut: unlock the page and refresh the buttons. Called directly (not only from
  // the "close" event) so the page never stays locked if that event is late or missing.
  function afterClose() {
    if (!anyOpen()) lock(false);
    render();
  }
  function closeDialog(d) {
    if (!d || !d.open) return;
    const finish = () => { d.classList.remove("is-closing"); if (d.open) d.close(); afterClose(); };
    if (reduced) return finish();
    d.classList.add("is-closing");
    setTimeout(finish, 220);
  }
  [drawer, optDlg].forEach((d) => {
    if (!d) return;
    d.addEventListener("cancel", (e) => { e.preventDefault(); closeDialog(d); }); // Esc
    d.addEventListener("click", (e) => { if (e.target === d) closeDialog(d); }); // click on the backdrop
    d.addEventListener("close", afterClose);
  });

  /* ---------- Cart button, floating summary and drawer ---------- */
  const fab = $("[data-cart-fab]");
  const linesEl = $("[data-cart-lines]");
  const emptyEl = $("[data-cart-empty]");
  const footEl = $("[data-cart-foot]");
  const sumEl = $("[data-cart-sum]");
  const miniEl = $("[data-cart-mini]");
  const titleEl = $("[data-cart-title]");
  const form = $("[data-order-form]");
  const listStep = $('[data-step="list"]');
  let step = "list";

  function lineHtml(l) {
    const opts = l.opts.map((o) => o[LANG]).join(" · ");
    return `<li class="cart-line" data-key="${esc(l.key)}">
      <div class="cl-main">
        <p class="cl-name">${esc(l.name)}</p>
        ${opts ? `<p class="cl-opts">${esc(opts)}</p>` : ""}
        <p class="cl-unit">${money(l.cents)} ${esc(O.each)}</p>
      </div>
      <p class="cl-sub">${money(l.cents * l.qty)}</p>
      <div class="stepper" role="group" aria-label="${esc(O.qty)}: ${esc(l.name)}">
        <button type="button" data-act="dec" aria-label="${esc(fmt(O.decrease, { name: l.name }))}">${icon("minus")}</button>
        <output>${l.qty}</output>
        <button type="button" data-act="inc" aria-label="${esc(fmt(O.increase, { name: l.name }))}"${l.qty >= MAX_QTY ? " disabled" : ""}>${icon("plus")}</button>
      </div>
      <button class="cl-remove" type="button" data-act="rm" aria-label="${esc(fmt(O.remove, { name: l.name }))}">${icon("trash")}</button>
    </li>`;
  }

  function render() {
    const n = count();
    const sum = total();
    $$("[data-cart-count]").forEach((el) => { el.textContent = String(n); el.hidden = !n; });
    $$("[data-cart-open]:not([data-cart-fab])").forEach((b) =>
      b.setAttribute("aria-label", n ? `${O.open} (${countLabel(n)}, ${money(sum)})` : O.open)
    );
    if (fab) {
      fab.hidden = !n || anyOpen();
      $("[data-fab-count]", fab).textContent = countLabel(n);
      $("[data-fab-total]", fab).textContent = money(sum);
    }
    if (!drawer) return;
    linesEl.innerHTML = lines.map(lineHtml).join("");
    emptyEl.hidden = n > 0;
    footEl.hidden = n === 0;
    sumEl.textContent = money(sum);
    if (miniEl) miniEl.textContent = `${countLabel(n)} · ${O.total} ${money(sum)}`;
    if (!n && step === "checkout") showStep("list");
  }

  function bump() {
    $$(".cart-btn, .cart-fab").forEach((b) => {
      b.classList.remove("is-bump");
      void b.offsetWidth;
      b.classList.add("is-bump");
    });
  }

  function showStep(name) {
    step = name;
    listStep.hidden = name !== "list";
    form.hidden = name !== "checkout";
    titleEl.textContent = name === "list" ? O.cartTitle : O.detailsTitle;
    if (name === "checkout") {
      clearErrors();
      setTimeout(() => $("#ord-name", form)?.focus(), 30);
    }
  }

  $$("[data-cart-open]").forEach((b) => b.addEventListener("click", () => { showStep("list"); openDialog(drawer); }));
  $$("[data-cart-close]", drawer || document).forEach((b) => b.addEventListener("click", () => closeDialog(drawer)));
  $("[data-cart-checkout]")?.addEventListener("click", () => count() && showStep("checkout"));
  $("[data-cart-back]")?.addEventListener("click", () => showStep("list"));

  linesEl?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-act]");
    if (!btn) return;
    const li = btn.closest("li");
    const key = li.dataset.key;
    const line = lines.find((l) => l.key === key);
    if (!line) return;
    const act = btn.dataset.act;
    if (act === "inc") setQty(key, line.qty + 1);
    else if (act === "dec") setQty(key, line.qty - 1);
    else remove(key);
    // Keep the keyboard where it was; if the line is gone, move to the next control.
    const again = $$("li", linesEl).find((x) => x.dataset.key === key);
    (again ? $(`[data-act="${act}"]:not([disabled])`, again) || $("[data-act]", again) : $("[data-act]", linesEl) || $("[data-cart-close]", drawer))?.focus();
  });

  /* ---------- Adding dishes: straight to the cart, or through the options dialog ---------- */
  function flash(btn, item) {
    const label = btn && $("[data-add-label]", btn);
    if (label) {
      label._orig = label._orig || label.innerHTML;
      label.innerHTML = `${icon("check")}<span>${esc(O.added)}</span>`;
      btn.classList.add("is-added");
      clearTimeout(btn._t);
      btn._t = setTimeout(() => { label.innerHTML = label._orig; btn.classList.remove("is-added"); }, 1400);
    }
    announce(fmt(O.inOrder, { name: item.name }));
    bump();
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add]");
    if (!btn) return;
    const item = MENU[btn.dataset.add];
    if (!item) return;
    if (item.options.length) openOptions(item, btn);
    else if (add(item, {}, 1)) flash(btn, item);
  });

  const optForm = $("[data-opt-form]");
  const optGroups = $("[data-opt-groups]");
  const optError = $("[data-opt-error]");
  const optQtyEl = $("[data-opt-qty]");
  let optItem = null;
  let optBtn = null;
  let optQty = 1;

  const optSelection = () => {
    const sel = {};
    optItem.options.forEach((g) => {
      const r = $(`input[name="g-${g.id}"]:checked`, optForm);
      if (r) sel[g.id] = r.value;
    });
    return sel;
  };

  function optRefresh() {
    optQtyEl.textContent = String(optQty);
    const cents = priceFor(optItem, optSelection());
    $("[data-opt-submit]", optForm).textContent = cents == null ? O.addToOrder : `${O.addToOrder} · ${money(cents * optQty)}`;
    $("[data-opt-dec]", optForm).disabled = optQty <= 1;
    $("[data-opt-inc]", optForm).disabled = optQty >= MAX_QTY;
  }

  function openOptions(item, btn) {
    optItem = item;
    optBtn = btn;
    optQty = 1;
    $("[data-opt-title]").textContent = item.name;
    $("[data-opt-desc]").textContent = item.desc ? item.desc[LANG] : "";
    optGroups.innerHTML = item.options
      .map((g) => `<fieldset class="pick-group" data-group="${esc(g.id)}"><legend>${esc(g.label[LANG])}</legend><div class="pick-choices">${g.choices
        .map((c) => `<label class="choice"><input type="radio" name="g-${esc(g.id)}" value="${esc(c.id)}"><span class="oc-label">${esc(c.label[LANG])}</span>${c.price != null ? `<span class="oc-price">${money(Math.round(c.price * 100))}</span>` : ""}</label>`)
        .join("")}</div></fieldset>`)
      .join("");
    $("[data-opt-dec]", optForm).setAttribute("aria-label", fmt(O.decrease, { name: item.name }));
    $("[data-opt-inc]", optForm).setAttribute("aria-label", fmt(O.increase, { name: item.name }));
    optError.textContent = "";
    optRefresh();
    openDialog(optDlg);
  }

  optForm?.addEventListener("change", (e) => {
    if (e.target.type !== "radio") return;
    e.target.closest(".pick-group").classList.remove("has-error");
    optError.textContent = "";
    optRefresh();
  });
  $("[data-opt-dec]")?.addEventListener("click", () => { optQty = Math.max(1, optQty - 1); optRefresh(); });
  $("[data-opt-inc]")?.addEventListener("click", () => { optQty = Math.min(MAX_QTY, optQty + 1); optRefresh(); });
  $$("[data-opt-close]").forEach((b) => b.addEventListener("click", () => closeDialog(optDlg)));
  optForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const sel = optSelection();
    const missing = optItem.options.filter((g) => !sel[g.id]);
    $$(".pick-group", optForm).forEach((f) => f.classList.toggle("has-error", missing.some((g) => g.id === f.dataset.group)));
    if (missing.length) {
      optError.textContent = O.errors.choose;
      $(`input[name="g-${missing[0].id}"]`, optForm)?.focus();
      return;
    }
    if (add(optItem, sel, optQty)) {
      closeDialog(optDlg);
      flash(optBtn, optItem);
    }
  });

  /* ---------- Checkout → WhatsApp ---------- */
  const errBox = $("[data-order-errors]");
  function clearErrors() {
    if (!form) return;
    $$("[data-err]", form).forEach((p) => { p.textContent = ""; });
    $$(".has-error", form).forEach((f) => f.classList.remove("has-error"));
    errBox.hidden = true;
    errBox.textContent = O.errorsTitle;
  }
  function fieldError(name, msg) {
    const p = $(`[data-err="${name}"]`, form);
    if (p) p.textContent = msg;
    p?.closest(".field, fieldset")?.classList.add("has-error");
  }

  const chosenType = () => {
    const r = $('input[name="type"]:checked', form);
    return r ? ORD.types.find((t) => t.id === r.value) : null;
  };
  const tableField = $("[data-table-field]", form || document);
  form?.addEventListener("change", (e) => {
    if (e.target.name !== "type") return;
    const t = chosenType();
    if (tableField) tableField.hidden = !(t && t.askTable);
    fieldError("type", "");
    e.target.closest("fieldset").classList.remove("has-error");
  });
  form?.addEventListener("input", (e) => {
    const f = e.target.closest(".field");
    if (f && f.classList.contains("has-error")) { f.classList.remove("has-error"); $("[data-err]", f).textContent = ""; }
  });

  // The message Lauhata receives: every dish with its quantity and unit price, then the total and details.
  function message() {
    const M = O.msg;
    const v = (n) => (form.elements[n] ? form.elements[n].value.trim() : "");
    const type = chosenType();
    const out = [M.hello, M.intro, "", `*${M.title}*`, ""];
    lines.forEach((l) => {
      const opts = l.opts.map((o) => o[LANG]).join(", ");
      out.push(`• ${l.qty}x ${l.name}${opts ? ` (${opts})` : ""} — ${money(l.cents)}`);
    });
    out.push("", `${M.total}: ${money(total())}`, "", `${M.name}: ${v("name")}`);
    if (type) out.push(`${M.type}: ${type.label[LANG]}`);
    if (type && type.askTable && v("table")) out.push(`${M.table}: ${v("table")}`);
    if (v("notes")) out.push(`${M.notes}:`, v("notes"));
    out.push("", M.bye);
    return out.join("\n");
  }

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    clearErrors();
    const v = (n) => (form.elements[n] ? form.elements[n].value.trim() : "");
    const type = chosenType();
    let bad = 0;
    const fail = (name, msg) => { fieldError(name, msg); bad++; };
    if (v("name").length < 2) fail("name", O.errors.name);
    if (ORD.types.length && !type) fail("type", O.errors.type);
    if (type && type.askTable && !v("table")) fail("table", O.errors.table);
    if (!lines.length) bad++;
    if (bad) {
      errBox.hidden = false;
      $(".has-error input, .has-error textarea", form)?.focus();
      return;
    }
    const send = window.LauhataWA;
    const url = send ? send.url(message()) : `https://wa.me/${CFG.whatsapp || ""}?text=${encodeURIComponent(message())}`;
    if (url.length > MAX_URL) {
      errBox.textContent = O.errors.tooBig;
      errBox.hidden = false;
      return;
    }
    const label = $("[data-order-send]", form);
    const original = label.textContent;
    label.textContent = O.sending;
    form.classList.add("is-sending");
    const done = () => { form.classList.remove("is-sending"); label.textContent = original; };
    if (send) send.send(url, "order", done);
    else { window.open(url, "_blank"); done(); }
    // The cart is kept: an order is not confirmed just because WhatsApp opened. It is cleared on the thank-you page.
  });

  /* ---------- Thank-you page: let the guest clear the order once it was sent ---------- */
  const clearBtn = $("[data-thanks-clear]");
  if (clearBtn) {
    let kind = null;
    try { kind = sessionStorage.getItem("lauhata-kind"); } catch (e) { /* ignore */ }
    if (kind === "order") {
      $("[data-thanks-menu]").hidden = false;
      const sync = () => { clearBtn.hidden = !lines.length; };
      sync();
      clearBtn.addEventListener("click", () => { clear(); sync(); });
    }
  }

  /* ---------- Menu: search and category bar ---------- */
  const menu = $("[data-menu]");
  if (menu) {
    const input = $("[data-menu-search]", menu);
    const clearSearch = $("[data-menu-clear]", menu);
    const status = $("[data-menu-status]", menu);
    const empty = $("[data-menu-empty]", menu);
    const nav = $("[data-menu-nav]", menu);
    const cats = $$("[data-cat]", menu);
    const dishes = $$("[data-dish]", menu);
    const links = $$("[data-cat-link]", nav);
    const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

    function filter() {
      const raw = input.value.trim();
      const tokens = norm(raw).split(/\s+/).filter(Boolean);
      let n = 0;
      dishes.forEach((d) => {
        const hit = tokens.every((t) => d.dataset.search.includes(t));
        d.hidden = !hit;
        if (hit) n++;
      });
      cats.forEach((c) => { c.hidden = !$("[data-dish]:not([hidden])", c); });
      menu.classList.toggle("is-searching", tokens.length > 0);
      clearSearch.hidden = !raw;
      empty.hidden = n > 0;
      empty.textContent = n ? "" : fmt(O.noResults, { q: raw });
      status.textContent = tokens.length && n ? (n === 1 ? O.resultOne : fmt(O.results, { n })) : "";
      spy();
    }
    input.addEventListener("input", filter);
    input.addEventListener("keydown", (e) => { if (e.key === "Escape" && input.value) { input.value = ""; filter(); } });
    clearSearch.addEventListener("click", () => { input.value = ""; filter(); input.focus(); });

    // Jump to a category, leaving room for the sticky bar (and the header when it will be showing).
    function goTo(section) {
      const header = $("[data-header]");
      const top = section.getBoundingClientRect().top + window.scrollY;
      const down = top > window.scrollY;
      const y = Math.max(0, top - nav.offsetHeight - 12 - (down ? 0 : header ? header.offsetHeight : 0));
      if (window.lenis) window.lenis.scrollTo(y, { duration: 0.9 });
      else window.scrollTo({ top: y, behavior: reduced ? "auto" : "smooth" });
    }
    links.forEach((a) => a.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopImmediatePropagation(); // main.js also hooks in-page anchors; this one needs the bar offset
      if (input.value) { input.value = ""; filter(); }
      goTo($(`#cat-${a.dataset.catLink}`));
      history.replaceState(null, "", a.getAttribute("href"));
    }));

    // Highlight the category being read and keep its chip in view.
    let current = null;
    function spy() {
      const line = nav.getBoundingClientRect().bottom + 24;
      const inside = menu.getBoundingClientRect().top < line && menu.getBoundingClientRect().bottom > line;
      let cur = null;
      if (inside) cats.forEach((c) => { if (!c.hidden && c.getBoundingClientRect().top <= line) cur = c.dataset.cat; });
      links.forEach((a) => {
        const on = a.dataset.catLink === cur;
        if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
      });
      if (cur && cur !== current) {
        // Slide only the bar sideways. scrollIntoView would also move the page (it honours the page's scroll-padding).
        const chip = links.find((a) => a.dataset.catLink === cur);
        const bar = chip && chip.closest("ul");
        if (bar) bar.scrollTo({ left: chip.offsetLeft - (bar.clientWidth - chip.offsetWidth) / 2, behavior: reduced ? "auto" : "smooth" });
      }
      current = cur;
    }
    let ticking = false;
    let late = 0;
    window.addEventListener("scroll", () => {
      // The bar moves up and down with the header, so look again once it has settled.
      clearTimeout(late);
      late = setTimeout(spy, 450);
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { ticking = false; spy(); });
    }, { passive: true });
    nav.addEventListener("transitionend", spy);
    spy();
  }

  /* ---------- The floating order button steps aside while the hero is on screen (the header button stays) ---------- */
  const hero = $(".cine-hero");
  if (hero && "IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => root.classList.toggle("hero-bar", e.isIntersecting), { threshold: 0.4 }).observe(hero);
  }

  /* ---------- Keep everything in sync ---------- */
  window.addEventListener("storage", (e) => { if (e.key === KEY) { load(); render(); } }); // another tab changed the cart
  window.addEventListener("pageshow", (e) => { // back from WhatsApp: the page may come from the cache
    if (e.persisted) { load(); render(); form?.classList.remove("is-sending"); }
  });

  render();
})();
