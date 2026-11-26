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
    Number.isInteger(l.qty) && l.qty >= 1 && l.qty <= MAX_QTY && Array.isArray(l.opts) && (l.sel == null || typeof l.sel === "object");

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

  // Unit price in cents for a dish and the chosen options, or null if it has no valid price yet (a required choice is missing, or the
  // dish has no price): then it cannot be added. In menu.mjs a choice's `price` IS the dish's price with that choice (a size), and an
  // `extra` is added on top (an optional add-on). A group is required unless it says `required: false`.
  const isRequired = (g) => g.required !== false;
  function priceFor(item, sel) {
    let base = item.price, extra = 0;
    for (const g of item.options) {
      const c = g.choices.find((x) => x.id === sel[g.id]);
      if (!c) { if (isRequired(g)) return null; continue; }
      if (c.price != null) base = c.price;
      if (c.extra != null) extra += c.extra;
    }
    return base == null ? null : Math.round((base + extra) * 100);
  }
  // Each choice as "Size: Large", for the cart and the message.
  const optLabels = (item, sel) => item.options.map((g) => { const c = g.choices.find((x) => x.id === sel[g.id]); return c ? { g: g.label, c: c.label } : null; }).filter(Boolean);

  // The same dish with the same options is one line with a bigger quantity.
  function add(item, sel, qty = 1, replace = null) {
    const cents = priceFor(item, sel);
    if (cents == null) return false;
    const key = [item.id, ...item.options.map((g) => `${g.id}:${sel[g.id] || "-"}`)].join("|");
    const opts = optLabels(item, sel);
    let at = lines.length;
    if (replace) { at = lines.findIndex((l) => l.key === replace); lines = lines.filter((l) => l.key !== replace); if (at < 0) at = lines.length; }
    const line = lines.find((l) => l.key === key);
    if (line) {
      line.qty = Math.min(MAX_QTY, replace ? qty : line.qty + qty);
      line.cents = cents;
    } else {
      lines.splice(Math.min(at, lines.length), 0, { key, id: item.id, name: item.name, cents, qty: Math.min(MAX_QTY, qty), opts, sel: { ...sel } });
    }
    save();
    return true;
  }
  // "Size: Large · Sauce: Carbonara" (older carts kept only the choice names).
  const optText = (l, sep = " · ") => l.opts.map((o) => (o.g ? `${o.g[LANG]}: ${o.c[LANG]}` : o[LANG])).join(sep);
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
    setTimeout(finish, d === drawer ? 340 : 220); // the cart panel's exit lasts 0.34 s (refine.css)
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
    const opts = optText(l);
    // A small photo of the dish when the restaurant has one (menu.mjs / docs/FOTOS-PRATOS.md); none otherwise.
    const photo = MENU[l.id] && MENU[l.id].photo;
    const thumb = photo ? `<img class="cl-thumb" src="${esc(photo)}" alt="" width="64" height="64" loading="lazy">` : "";
    const editable = MENU[l.id] && MENU[l.id].options.length;
    return `<li class="cart-line${thumb ? " has-thumb" : ""}" data-key="${esc(l.key)}">
      ${thumb}
      <div class="cl-top"><p class="cl-name">${esc(l.name)}</p><p class="cl-sub">${money(l.cents * l.qty)}</p></div>
      ${opts || editable ? `<p class="cl-opts">${opts ? esc(opts) : ""}${editable ? ` <button class="cl-edit" type="button" data-act="edit" aria-label="${esc(fmt(O.edit, { name: l.name }))}">${esc(O.editShort)}</button>` : ""}</p>` : ""}
      <div class="cl-bottom">
        <div class="stepper" role="group" aria-label="${esc(O.qty)}: ${esc(l.name)}">
          <button type="button" data-act="dec" aria-label="${esc(fmt(O.decrease, { name: l.name }))}">${icon("minus")}</button>
          <output>${l.qty}</output>
          <button type="button" data-act="inc" aria-label="${esc(fmt(O.increase, { name: l.name }))}"${l.qty >= MAX_QTY ? " disabled" : ""}>${icon("plus")}</button>
        </div>
        <p class="cl-unit">${money(l.cents)} ${esc(O.each)}</p>
        <button class="cl-remove" type="button" data-act="rm" aria-label="${esc(fmt(O.remove, { name: l.name }))}">${icon("trash")}</button>
      </div>
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
    const goSum = $("[data-cart-go-sum]"), sub = $("[data-cart-sub]"), itemsEl = $("[data-cart-items]");
    if (goSum) goSum.textContent = money(sum);
    if (sub) sub.textContent = money(sum);
    if (itemsEl) itemsEl.textContent = countLabel(n);
    more(n);
    if (miniEl) miniEl.textContent = `${countLabel(n)} · ${O.total} ${money(sum)}`;
    if (!n && step === "checkout") showStep("list");
  }

  // Something sweet to finish: when the order has no dessert yet, up to three desserts from the menu, at their menu price, one tap each.
  // No discount, no urgency, nothing pre-selected; it disappears as soon as a dessert is in the order.
  const moreEl = $("[data-cart-more]"), moreList = $("[data-cart-more-list]");
  function more(n) {
    if (!moreEl) return;
    const inCart = new Set(lines.map((l) => l.id));
    const hasDessert = lines.some((l) => MENU[l.id] && MENU[l.id].cat === "dessert");
    const pick = Object.values(MENU).filter((d) => d.cat === "dessert" && !inCart.has(d.id) && d.price != null && !d.options.length).slice(0, 3);
    moreEl.hidden = !n || hasDessert || !pick.length;
    if (moreEl.hidden) return;
    moreList.innerHTML = pick.map((d) => `<li><span class="cm-name">${esc(d.name)}</span><span class="cm-price">${money(Math.round(d.price * 100))}</span><button class="cm-add" type="button" data-add="${esc(d.id)}" aria-label="${esc(O.add)}: ${esc(d.name)}">${icon("plus")}</button></li>`).join("");
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
    if (act === "edit") { const item = MENU[line.id]; if (item) openOptions(item, null, line); return; }
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
  let optEdit = null; // the cart line being changed, if any

  const optSelection = () => {
    const sel = {};
    optItem.options.forEach((g) => {
      const r = $(`input[name="g-${g.id}"]:checked`, optForm);
      if (r) sel[g.id] = r.value;
    });
    return sel;
  };

  // The sheet always says what the dish costs now: the total for the chosen size and quantity, or which choice is still missing.
  function optRefresh() {
    optQtyEl.textContent = String(optQty);
    const sel = optSelection();
    const cents = priceFor(optItem, sel);
    const missing = optItem.options.filter((g) => isRequired(g) && !sel[g.id]);
    $("[data-opt-total]", optForm).textContent = cents == null ? "" : money(cents * optQty);
    $("[data-opt-each]", optForm).textContent = cents == null ? fmt(O.chooseFirst, { what: missing.map((g) => g.label[LANG].toLowerCase()).join(", ") }) : optQty > 1 ? `${optQty} × ${money(cents)}` : "";
    $("[data-opt-submit-label]", optForm).textContent = optEdit ? O.update : O.add;
    $("[data-opt-submit-price]", optForm).textContent = cents == null ? "" : money(cents * optQty);
    $("[data-opt-submit]", optForm).setAttribute("aria-disabled", String(cents == null));
    $("[data-opt-dec]", optForm).disabled = optQty <= 1;
    $("[data-opt-inc]", optForm).disabled = optQty >= MAX_QTY;
  }

  function openOptions(item, btn, edit = null) {
    optItem = item;
    optBtn = btn;
    optEdit = edit;
    optQty = edit ? edit.qty : 1;
    const sel0 = (edit && edit.sel) || {};
    $("[data-opt-title]").textContent = item.name;
    $("[data-opt-desc]").textContent = item.desc ? item.desc[LANG] : "";
    const photo = $("[data-opt-photo]");
    if (photo) { photo.hidden = !item.photo; photo.innerHTML = item.photo ? `<img src="${esc(item.photo)}" alt="" width="640" height="480">` : ""; }
    // A sized dish starts from its smallest price; any other dish has one price, whatever is chosen.
    const sized = item.options.some((g) => g.choices.some((c) => c.price != null));
    const prices = item.options.flatMap((g) => g.choices.map((c) => c.price)).filter((p) => p != null);
    $("[data-opt-base]").textContent = sized ? fmt(O.fromPrice, { price: money(Math.round(Math.min(...prices) * 100)) }) : item.price != null ? money(Math.round(item.price * 100)) : "";
    optGroups.innerHTML = item.options
      .map((g) => {
        const req = isRequired(g);
        const priced = g.choices.some((c) => c.price != null);
        const note = req ? (priced ? O.reqPriced : O.reqSame) : O.optionalNote;
        return `<fieldset class="pick-group${req ? " is-required" : " is-optional"}" data-group="${esc(g.id)}"><legend><span>${esc(g.label[LANG])}</span><em>${esc(req ? O.required : O.optionalTag)}</em></legend><p class="pick-note">${esc(note)}</p><div class="pick-choices">${g.choices
          .map((c) => `<label class="choice"><input type="radio" name="g-${esc(g.id)}" value="${esc(c.id)}"${sel0[g.id] === c.id ? " checked" : ""}${req ? " required" : ""}><span class="oc-label">${esc(c.label[LANG])}</span>${c.price != null ? `<span class="oc-price">${money(Math.round(c.price * 100))}</span>` : c.extra != null ? `<span class="oc-price">+ ${money(Math.round(c.extra * 100))}</span>` : ""}</label>`)
          .join("")}</div></fieldset>`;
      })
      .join("");
    $("[data-opt-dec]", optForm).setAttribute("aria-label", fmt(O.decrease, { name: item.name }));
    $("[data-opt-inc]", optForm).setAttribute("aria-label", fmt(O.increase, { name: item.name }));
    optError.textContent = "";
    optRefresh();
    if (edit && drawer?.open) { drawer.close(); afterClose(); }
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
    const missing = optItem.options.filter((g) => isRequired(g) && !sel[g.id]);
    $$(".pick-group", optForm).forEach((f) => f.classList.toggle("has-error", missing.some((g) => g.id === f.dataset.group)));
    if (missing.length) {
      optError.textContent = O.errors.choose;
      $(`input[name="g-${missing[0].id}"]`, optForm)?.focus();
      return;
    }
    const editing = optEdit;
    if (add(optItem, sel, optQty, editing ? editing.key : null)) {
      closeDialog(optDlg);
      if (editing) { announce(fmt(O.updated, { name: optItem.name })); setTimeout(() => { showStep("list"); openDialog(drawer); }, reduced ? 0 : 240); }
      else flash(optBtn, optItem);
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
      const opts = optText(l, ", ");
      // more than one: show the unit price and the line total, so the message adds up at a glance
      out.push(l.qty > 1 ? `• ${l.qty}x ${l.name}${opts ? ` (${opts})` : ""} — ${money(l.cents)} ${O.each} = ${money(l.cents * l.qty)}` : `• ${l.qty}x ${l.name}${opts ? ` (${opts})` : ""} — ${money(l.cents)}`);
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

  /* ---------- Menu: one sticky bar with the categories and the search ----------
     The categories are links to their sections; the one being read is marked, its tab scrolls into view on a narrow screen, and a thin
     line slides under it (transform only). The search filters the dishes as you type; Escape or the cross clears it. */
  const menu = $("[data-menu]");
  if (menu) {
    const input = $("[data-menu-search]", menu);
    const clearSearch = $("[data-menu-clear]", menu);
    const status = $("[data-menu-status]", menu);
    const empty = $("[data-menu-empty]", menu);
    const cats = $$("[data-cat]", menu);
    const dishes = $$("[data-dish]", menu);
    const bar = $("[data-menu-bar]", menu);
    const nav = $("[data-menu-nav]", menu);
    const list = $("ul", nav);
    const links = $$("[data-cat-link]", nav);
    const ink = $("[data-mt-ink]", nav);
    const header = $("[data-header]");
    const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

    function apply() {
      const raw = input.value.trim();
      const tokens = norm(raw).split(/\s+/).filter(Boolean);
      let n = 0;
      dishes.forEach((d) => {
        const hit = tokens.every((t) => d.dataset.search.includes(t));
        d.hidden = !hit;
        if (hit) n++;
      });
      cats.forEach((c) => { c.hidden = !$("[data-dish]:not([hidden])", c); });
      links.forEach((a) => { a.closest("li").hidden = !!$("#cat-" + a.dataset.catLink)?.hidden; });
      menu.classList.toggle("is-searching", tokens.length > 0);
      clearSearch.hidden = !raw;
      empty.hidden = n > 0;
      empty.textContent = n ? "" : fmt(O.noResults, { q: raw });
      status.textContent = tokens.length && n ? (n === 1 ? O.resultOne : fmt(O.results, { n })) : "";
      spy(true);
    }
    input.addEventListener("input", apply);
    input.addEventListener("keydown", (e) => { if (e.key === "Escape" && input.value) { input.value = ""; apply(); } });
    clearSearch.addEventListener("click", () => { input.value = ""; apply(); input.focus(); });

    const side = window.matchMedia("(min-width: 1000px)");
    const offset = () => (header ? header.getBoundingClientRect().bottom : 0) + (side.matches ? 0 : bar.offsetHeight) + 16;
    function goTo(section) {
      const top = section.getBoundingClientRect().top + window.scrollY - offset();
      window.scrollTo({ top: Math.max(0, top), behavior: reduced ? "auto" : "smooth" });
    }
    links.forEach((a) => a.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopImmediatePropagation(); // main.js also hooks in-page anchors; this one needs the bar's offset
      goTo($("#cat-" + a.dataset.catLink));
      history.replaceState(null, "", a.getAttribute("href"));
    }));
    let current = null;
    function place(a) {
      if (!ink) return;
      if (!a) { ink.style.opacity = "0"; return; }
      ink.style.opacity = "1";
      ink.style.transform = `translateX(${a.offsetLeft - list.scrollLeft}px) scaleX(${a.offsetWidth / 100})`;
    }
    function spy(force) {
      const line = offset() + 8;
      let cur = null;
      cats.forEach((c) => { if (!c.hidden && c.getBoundingClientRect().top <= line) cur = c.dataset.cat; });
      if (!cur) cur = (cats.find((c) => !c.hidden) || {}).dataset?.cat || null;
      if (cur === current && !force) return;
      current = cur;
      let chip = null;
      kick();
      links.forEach((a) => { if (a.dataset.catLink === cur) { a.setAttribute("aria-current", "true"); chip = a; } else a.removeAttribute("aria-current"); });
      if (chip && list.scrollWidth > list.clientWidth + 2) list.scrollTo({ left: chip.offsetLeft - (list.clientWidth - chip.offsetWidth) / 2, behavior: reduced ? "auto" : "smooth" });
      place(chip);
    }
    let ticking = false;
    const onScroll = () => { if (ticking) return; ticking = true; requestAnimationFrame(() => { ticking = false; spy(); }); };
    // Only while the menu is on screen is there a scroll listener.
    new IntersectionObserver(([e]) => {
      window.removeEventListener("scroll", onScroll);
      if (e.isIntersecting) { window.addEventListener("scroll", onScroll, { passive: true }); spy(true); }
    }).observe(menu);
    list.addEventListener("scroll", () => place(links.find((a) => a.dataset.catLink === current)), { passive: true });
    window.addEventListener("resize", () => spy(true), { passive: true });
    // The bar is "stuck" when it meets the header: it gets its own ground then.
    const sentinel = document.createElement("i");
    sentinel.setAttribute("aria-hidden", "true");
    sentinel.className = "menu-bar-mark";
    bar.before(sentinel);
    new IntersectionObserver(([e]) => bar.classList.toggle("is-stuck", !e.isIntersecting && e.boundingClientRect.top < 200), { rootMargin: "-90px 0px 0px 0px" }).observe(sentinel);
    // ---------- LineSidebar (React Bits, ported): the categories lean toward the pointer ----------
    function kick() { if (lsOn()) requestAnimationFrame(() => startLs()); }
    var lsItems, lsTarget, lsCur, lsRaf = 0, lsLast = 0;
    function lsOn() { return side.matches && !reduced && window.matchMedia("(hover: hover) and (pointer: fine)").matches; }
    function lsInit() { lsItems = [...nav.querySelectorAll(".ls-item")]; lsTarget = lsItems.map(() => 0); lsCur = lsItems.map(() => 0); }
    function lsFrame(now) {
      const dt = Math.min((now - lsLast) / 1000, 0.05); lsLast = now;
      const k = 1 - Math.exp(-dt / 0.1); // 100 ms smoothing
      let moving = false;
      lsItems.forEach((li, i) => {
        const active = li.querySelector('[aria-current="true"]') ? 1 : 0;
        const target = Math.max(lsTarget[i] || 0, active);
        const next = lsCur[i] + (target - lsCur[i]) * k;
        const settled = Math.abs(target - next) < 0.0015;
        lsCur[i] = settled ? target : next;
        li.style.setProperty("--effect", lsCur[i].toFixed(4));
        if (!settled) moving = true;
      });
      lsRaf = moving ? requestAnimationFrame(lsFrame) : 0;
    }
    function startLs() { if (!lsItems) lsInit(); if (lsRaf) cancelAnimationFrame(lsRaf); lsLast = performance.now(); lsRaf = requestAnimationFrame(lsFrame); }
    const list2 = $("ul", nav);
    list2.addEventListener("pointermove", (e) => {
      if (!lsOn() || e.pointerType !== "mouse") return;
      if (!lsItems) lsInit();
      const top = list2.getBoundingClientRect().top, y = e.clientY - top;
      lsItems.forEach((li, i) => { const c = li.offsetTop + li.offsetHeight / 2; const p = Math.max(0, 1 - Math.abs(y - c) / 100); lsTarget[i] = p * p * (3 - 2 * p); });
      startLs();
    });
    list2.addEventListener("pointerleave", () => { if (!lsItems) return; lsTarget = lsTarget.map(() => 0); startLs(); });
    apply();
  }

  /* ---------- The floating order button steps aside while the hero is on screen (the header button stays) ---------- */
  const hero = $(".cine-hero");
  if (hero && "IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => root.classList.toggle("hero-bar", e.isIntersecting), { threshold: 0.4 }).observe(hero);
  }

  /* ---------- Dish dialog: a card opens its photograph, name, price and description ----------
     The card holds a <template> with the details; this fills the single dialog from it. The browser provides the focus trap, Escape and the
     inert page; the backdrop click, the close button and the return of focus are added here. An order button inside the dialog is the
     same [data-add] button as ever (handled above); a dish with options closes this dialog first so the options dialog is the only one open. */
  const dd = $("[data-dish-dialog]");
  if (dd) {
    const ddPhoto = $("[data-dd-photo]", dd);
    const ddName = $("[data-dd-name]", dd);
    const ddDetail = $("[data-dd-detail]", dd);
    let opener = null;
    document.addEventListener("click", (e) => {
      const b = e.target.closest("[data-dish-open]");
      if (!b) return;
      const card = b.closest("[data-dish]");
      const photo = $(".dc-photo", card);
      const tpl = $("template[data-dc-detail]", card);
      if (!card || !photo || !tpl) return;
      opener = b;
      ddName.textContent = b.textContent.trim();
      ddPhoto.replaceChildren(...photo.cloneNode(true).childNodes);
      $$("img", ddPhoto).forEach((img) => { img.loading = "eager"; img.sizes = "(min-width: 760px) 34rem, 92vw"; });
      ddDetail.replaceChildren(tpl.content.cloneNode(true));
      dd.scrollTop = 0;
      if (!dd.open) dd.showModal();
    });
    $("[data-dd-close]", dd).addEventListener("click", () => dd.close());
    dd.addEventListener("click", (e) => {
      if (e.target === dd) { dd.close(); return; }
      const add = e.target.closest("[data-add]");
      const item = add && MENU[add.dataset.add];
      if (item && item.options.length) dd.close();
    });
    dd.addEventListener("close", () => { if (opener && opener.isConnected) opener.focus({ preventScroll: true }); });
  }

  /* ---------- Keep everything in sync ---------- */
  window.addEventListener("storage", (e) => { if (e.key === KEY) { load(); render(); } }); // another tab changed the cart
  window.addEventListener("pageshow", (e) => { // back from WhatsApp: the page may come from the cache
    if (e.persisted) { load(); render(); form?.classList.remove("is-sending"); }
  });

  render();
})();
