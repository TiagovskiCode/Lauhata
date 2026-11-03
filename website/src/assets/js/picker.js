/* Lauhata — pickers. Draws a calendar, a date-range calendar, a time grid, a quantity stepper and a list
   over the native controls marked data-pick="date|in|out|time|number|select". The native <input>/<select> stays
   in the form as the source of truth (so every existing read of form.elements keeps working); without
   JavaScript the browser's own control is what people get. */
(() => {
  "use strict";
  const natives = Array.from(document.querySelectorAll("[data-pick]"));
  if (!natives.length) return;

  const cfg = window.LAUHATA || {};
  const P = (cfg.i18n && cfg.i18n.pick) || {};
  const locale = cfg.lang === "en" ? "en-GB" : "pt-PT";
  const sheet = window.matchMedia("(max-width: 640px)");

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const svg = (n) => `<svg class="icon" aria-hidden="true"><use href="#i-${n}"></use></svg>`;
  const pad = (n) => String(n).padStart(2, "0");
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parse = (s) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ""); return m ? new Date(+m[1], +m[2] - 1, +m[3], 12) : null; };
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const monthOf = (d) => ({ y: d.getFullYear(), m: d.getMonth() });
  const shiftMonth = ({ y, m }, n) => { const t = y * 12 + m + n; return { y: Math.floor(t / 12), m: ((t % 12) + 12) % 12 }; };
  const monthIdx = ({ y, m }) => y * 12 + m;
  const nightsBetween = (a, b) => Math.round((parse(b) - parse(a)) / 864e5);
  const todayISO = () => iso(new Date());
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const tpl = (s, v) => String(s || "").replace(/\{(\w+)\}/g, (_, k) => v[k]);

  const fMonth = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" });
  const fLong = new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const fMon = new Intl.DateTimeFormat(locale, { month: "short" });
  const shortDate = (d) => `${fWd.format(d).replace(/\./g, "").slice(0, 3)}, ${d.getDate()} ${fMon.format(d).replace(/\./g, "")}`;
  const fWd = new Intl.DateTimeFormat(locale, { weekday: "short" });
  const weekdays = Array.from({ length: 7 }, (_, i) => fWd.format(new Date(2024, 0, 1 + i, 12)).replace(/\./g, "").slice(0, 3));

  /* ---------- One popover, reused by every picker ---------- */
  const back = document.createElement("div");
  back.className = "pk-back";
  back.hidden = true;
  const pop = document.createElement("div");
  pop.className = "pk-pop";
  pop.hidden = true;
  pop.setAttribute("role", "dialog");
  document.body.append(back, pop);

  let cur = null; // { trigger }

  const head = (title) =>
    `<div class="pk-head"><strong>${esc(title)}</strong><button type="button" class="pk-x" data-act="close" aria-label="${esc(P.close)}">${svg("close")}</button></div>`;

  function place() {
    if (!cur) return;
    if (sheet.matches) { pop.style.left = pop.style.top = ""; return; }
    const r = cur.trigger.getBoundingClientRect();
    const vw = document.documentElement.clientWidth, vh = window.innerHeight;
    if (r.bottom < 0 || r.top > vh) return close();
    const w = pop.offsetWidth, h = pop.offsetHeight, gap = 10;
    const left = Math.min(Math.max(12, r.left), Math.max(12, vw - w - 12));
    let top = r.bottom + gap, side = "down";
    if (top + h > vh - 12) {
      if (r.top - gap - h >= 12) { top = r.top - gap - h; side = "up"; }
      else top = Math.max(12, vh - h - 12);
    }
    pop.style.left = `${left}px`;
    pop.style.top = `${top}px`;
    pop.dataset.side = side;
  }

  function show(trigger, label, build) {
    close();
    cur = { trigger };
    pop.setAttribute("aria-label", label);
    pop.hidden = false;
    back.hidden = false;
    build();
    trigger.setAttribute("aria-expanded", "true");
    place();
  }

  function close(refocus) {
    if (!cur) return;
    const t = cur.trigger;
    cur = null;
    pop.hidden = true;
    back.hidden = true;
    pop.innerHTML = "";
    pop.onclick = pop.onkeydown = pop.onmouseover = null;
    t.setAttribute("aria-expanded", "false");
    if (refocus) t.focus();
  }

  document.addEventListener("pointerdown", (e) => {
    if (!cur || pop.contains(e.target)) return;
    if (cur.trigger.closest(".bc-field, .field")?.contains(e.target)) return; // the trigger and its label toggle it
    close();
  });
  document.addEventListener("focusin", (e) => {
    if (cur && !pop.contains(e.target) && e.target !== cur.trigger) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && cur) { e.preventDefault(); close(true); }
  });
  let raf = 0;
  const queuePlace = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(place); };
  window.addEventListener("resize", queuePlace);
  window.addEventListener("scroll", queuePlace, { capture: true, passive: true });
  pop.addEventListener("click", (e) => { if (e.target.closest('[data-act="close"]')) close(true); });
  back.addEventListener("click", () => close());

  /* ---------- Writing back to the native control ---------- */
  function write(native, value) {
    native.value = value;
    native.dispatchEvent(new Event("input", { bubbles: true }));
    native.dispatchEvent(new Event("change", { bubbles: true }));
  }

  /* ---------- Calendar (one date, or a check-in / check-out range) ---------- */
  function openCalendar(trigger, native, kind) {
    const range = kind === "in" || kind === "out";
    const form = native.form || document;
    const inEl = range ? form.querySelector('[data-pick="in"]') : native;
    const outEl = range ? form.querySelector('[data-pick="out"]') : null;
    const min = (range ? inEl.min : native.min) || todayISO();
    let start = range ? inEl.value || null : null;
    let end = range ? outEl.value || null : null;
    let step = kind === "out" && start ? "out" : "in";
    const sel = range ? null : native.value || null;
    let hover = null;
    const months = range && !sheet.matches && document.documentElement.clientWidth >= 760 ? 2 : 1;
    let fd = (range ? (step === "out" && end ? end : start) : sel) || (min > todayISO() ? min : todayISO());
    if (fd < min) fd = min;
    let view = monthOf(parse(fd));
    const minMonth = monthOf(parse(min));

    const title = range ? P.rangeDialog : P.dateDialog;

    function monthHtml(mo) {
      const first = new Date(mo.y, mo.m, 1, 12);
      const lead = (first.getDay() + 6) % 7;
      const count = new Date(mo.y, mo.m + 1, 0).getDate();
      let cells = "<i></i>".repeat(lead);
      for (let n = 1; n <= count; n++) {
        const d = new Date(mo.y, mo.m, n, 12), s = iso(d);
        const dis = s < min;
        const isStart = range ? s === start : false, isEnd = range ? s === end : false;
        const between = range && start && end && s > start && s < end;
        const cls = ["pk-cell"];
        if (isStart && end) cls.push("is-start", "has-end");
        if (isEnd && start) cls.push("is-end");
        if (between) cls.push("in-range");
        const dayCls = ["pk-day"];
        if (s === todayISO()) dayCls.push("is-today");
        if (isStart || isEnd || s === sel) dayCls.push("is-sel");
        cells += `<div class="${cls.join(" ")}" data-cell="${s}"><button type="button" class="${dayCls.join(" ")}" data-d="${s}" tabindex="${s === fd ? 0 : -1}" aria-label="${esc(fLong.format(d))}"${dis ? " disabled" : ""}${isStart || isEnd || s === sel ? ' aria-pressed="true"' : ""}>${n}</button></div>`;
      }
      return `<div class="pk-month"><h3 class="pk-mt">${esc(cap(fMonth.format(first)))}</h3><div class="pk-wd" aria-hidden="true">${weekdays.map((w) => `<span>${esc(w)}</span>`).join("")}</div><div class="pk-days">${cells}</div></div>`;
    }

    function hint() {
      if (!range) return "";
      if (start && end) { const n = nightsBetween(start, end); return n === 1 ? P.nightOne : tpl(P.nightMany, { n }); }
      return start ? P.stepOut : P.stepIn;
    }

    function render(focusIt) {
      const prevOff = monthIdx(view) <= monthIdx(minMonth);
      const list = Array.from({ length: months }, (_, i) => monthHtml(shiftMonth(view, i))).join("");
      pop.className = `pk-pop is-cal${months === 2 ? " is-two" : ""}`;
      pop.innerHTML = `${head(title)}
        <div class="pk-cal">
          <button type="button" class="pk-nav pk-prev" data-nav="-1" aria-label="${esc(P.prev)}"${prevOff ? " disabled" : ""}>${svg("left")}</button>
          <button type="button" class="pk-nav pk-next" data-nav="1" aria-label="${esc(P.next)}">${svg("right")}</button>
          <div class="pk-months">${list}</div>
        </div>
        <div class="pk-foot"><span class="pk-hint" aria-live="polite">${esc(hint())}</span>
          <span class="pk-acts">${range ? "" : `<button type="button" class="pk-link" data-act="today">${esc(P.today)}</button>`}<button type="button" class="pk-link" data-act="clear">${esc(P.clear)}</button></span></div>`;
      if (focusIt) pop.querySelector(`[data-d="${fd}"]`)?.focus();
      place();
    }

    function moveFocus(to) {
      if (to < min) to = min;
      fd = to;
      const mo = monthOf(parse(fd));
      if (monthIdx(mo) < monthIdx(view)) view = mo;
      else if (monthIdx(mo) > monthIdx(view) + months - 1) view = shiftMonth(mo, -(months - 1));
      render(true);
    }

    function pick(s) {
      if (!range) { write(native, s); close(true); return; }
      if (step === "in" || !start || s <= start) {
        start = s; end = null; step = "out"; fd = s;
        write(inEl, s); // the page's own handler may give the check-out a default; the picker still asks for it
        render(true);
      } else {
        end = s;
        write(outEl, s);
        if (cur && outEl.previousElementSibling?.classList.contains("pk-btn")) {
          cur.trigger.setAttribute("aria-expanded", "false"); // the trigger that opened it, not the one that gets the focus back
          cur.trigger = outEl.previousElementSibling;
        }
        close(true);
      }
    }

    show(trigger, title, () => {
      pop.onclick = (e) => {
        const day = e.target.closest(".pk-day");
        if (day) return pick(day.dataset.d);
        const nav = e.target.closest("[data-nav]");
        if (nav) {
          view = shiftMonth(view, +nav.dataset.nav);
          const first = iso(new Date(view.y, view.m, 1, 12));
          fd = first < min ? min : first;
          render(false);
          pop.querySelector(`[data-nav="${nav.dataset.nav}"]:not([disabled])`)?.focus();
          return;
        }
        const act = e.target.closest("[data-act]")?.dataset.act;
        if (act === "today") pick(todayISO() < min ? min : todayISO());
        if (act === "clear") {
          if (range) {
            start = end = null; step = "in";
            inEl.value = ""; outEl.value = "";
            inEl.dispatchEvent(new Event("input", { bubbles: true }));
            render(false);
          } else { write(native, ""); close(true); }
        }
      };
      pop.onkeydown = (e) => {
        const day = e.target.closest(".pk-day");
        if (!day) return;
        const d = parse(day.dataset.d);
        const keys = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
        let to = null;
        if (e.key in keys) to = addDays(d, keys[e.key]);
        else if (e.key === "Home") to = addDays(d, -((d.getDay() + 6) % 7));
        else if (e.key === "End") to = addDays(d, 6 - ((d.getDay() + 6) % 7));
        else if (e.key === "PageUp" || e.key === "PageDown") {
          const t = shiftMonth(monthOf(d), (e.key === "PageUp" ? -1 : 1) * (e.shiftKey ? 12 : 1));
          to = new Date(t.y, t.m, Math.min(d.getDate(), new Date(t.y, t.m + 1, 0).getDate()), 12);
        }
        if (!to) return;
        e.preventDefault();
        moveFocus(iso(to));
      };
      pop.onmouseover = (e) => {
        if (!range || step !== "out" || !start || end) return;
        const day = e.target.closest(".pk-day");
        const h = day && !day.disabled ? day.dataset.d : null;
        if (h === hover) return;
        hover = h;
        pop.querySelectorAll(".pk-cell").forEach((c) => c.classList.toggle("in-hover", Boolean(hover) && c.dataset.cell > start && c.dataset.cell <= hover));
      };
      render(true);
    });
  }

  /* ---------- Time: a grid of chips grouped by part of the day ---------- */
  function openTime(trigger, native) {
    const groups = [];
    Array.from(native.options).forEach((o) => {
      if (!o.value) return;
      const g = o.dataset.group || "";
      let grp = groups.find((x) => x.name === g);
      if (!grp) groups.push((grp = { name: g, items: [] }));
      grp.items.push(o);
    });
    show(trigger, P.timeDialog, () => {
      pop.className = "pk-pop is-time";
      pop.innerHTML = `${head(P.timeDialog)}<div class="pk-times">${groups
        .map((g) => `<div class="pk-group">${g.name ? `<h4>${esc(g.name)}</h4>` : ""}<div class="pk-chips">${g.items
          .map((o) => `<button type="button" class="pk-chip" data-v="${esc(o.value)}"${o.value === native.value ? ' aria-pressed="true"' : ""}>${esc(o.dataset.label || o.text)}</button>`)
          .join("")}</div></div>`)
        .join("")}</div>`;
      pop.onclick = (e) => {
        const c = e.target.closest(".pk-chip");
        if (c) { write(native, c.dataset.v); close(true); }
      };
      (pop.querySelector('.pk-chip[aria-pressed="true"]') || pop.querySelector(".pk-chip"))?.focus();
    });
  }

  /* ---------- Quantity: minus / plus ---------- */
  function openNumber(trigger, native) {
    const min = Number(native.min) || 1, max = Number(native.max) || 99;
    let n = Math.min(max, Math.max(min, Number(native.value) || min));
    const unit = (v) => (v === 1 ? native.dataset.unitOne : native.dataset.unitMany) || "";
    show(trigger, P.numberDialog, () => {
      pop.className = "pk-pop is-num";
      pop.innerHTML = `${head(P.numberDialog)}
        <div class="pk-num">
          <button type="button" class="pk-step" data-s="-1" aria-label="${esc(P.less)}">${svg("minus")}</button>
          <div class="pk-big" role="status" aria-live="polite"><b></b><span></span></div>
          <button type="button" class="pk-step" data-s="1" aria-label="${esc(P.more)}">${svg("plus")}</button>
        </div>
        <div class="pk-foot"><span class="pk-hint">${esc(tpl(P.max, { n: max }))}</span><button type="button" class="pk-link" data-act="close">${esc(P.done)}</button></div>`;
      const b = pop.querySelector(".pk-big b"), u = pop.querySelector(".pk-big span");
      const paint = () => {
        b.textContent = n;
        u.textContent = unit(n);
        pop.querySelector('[data-s="-1"]').classList.toggle("is-off", n <= min);
        pop.querySelector('[data-s="1"]').classList.toggle("is-off", n >= max);
      };
      const bump = (s) => {
        const v = Math.min(max, Math.max(min, n + s));
        if (v === n) return;
        n = v;
        write(native, String(n));
        paint();
      };
      pop.onclick = (e) => { const s = e.target.closest("[data-s]"); if (s) bump(+s.dataset.s); };
      pop.onkeydown = (e) => {
        if (e.key === "ArrowUp" || e.key === "ArrowRight") { e.preventDefault(); bump(1); }
        if (e.key === "ArrowDown" || e.key === "ArrowLeft") { e.preventDefault(); bump(-1); }
      };
      paint();
      pop.querySelector('[data-s="1"]').focus();
    });
  }

  /* ---------- List (room type) ---------- */
  function openList(trigger, native) {
    show(trigger, P.selectDialog, () => {
      pop.className = "pk-pop is-list";
      pop.innerHTML = `${head(P.selectDialog)}<ul class="pk-list" role="listbox">${Array.from(native.options)
        .map((o, i) => `<li><button type="button" role="option" class="pk-opt" data-i="${i}" aria-selected="${o.selected}">${esc(o.text)}${svg("check")}</button></li>`)
        .join("")}</ul>`;
      pop.onclick = (e) => {
        const o = e.target.closest(".pk-opt");
        if (o) { write(native, native.options[+o.dataset.i].value); close(true); }
      };
      pop.onkeydown = (e) => {
        if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
        e.preventDefault();
        const all = Array.from(pop.querySelectorAll(".pk-opt")), i = all.indexOf(document.activeElement);
        all[Math.min(all.length - 1, Math.max(0, i + (e.key === "ArrowDown" ? 1 : -1)))]?.focus();
      };
      (pop.querySelector('[aria-selected="true"]') || pop.querySelector(".pk-opt"))?.focus();
    });
  }

  /* ---------- Triggers that replace the native controls ---------- */
  const ICON = { date: "calendar", in: "calendar", out: "calendar", time: "clock", number: "users", select: "bed" };

  function mount(native) {
    const kind = native.dataset.pick;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pk-btn";
    btn.dataset.kind = kind;
    btn.setAttribute("aria-haspopup", "dialog");
    btn.setAttribute("aria-expanded", "false");
    if (native.id) { btn.id = native.id; native.removeAttribute("id"); }
    ["aria-describedby", "aria-invalid"].forEach((a) => { if (native.hasAttribute(a)) btn.setAttribute(a, native.getAttribute(a)); });
    if (native.required) btn.setAttribute("aria-required", "true");
    btn.innerHTML = `<span class="pk-ico">${svg((native.dataset.icon || ICON[kind]) || "calendar")}</span><span class="pk-val"></span><span class="pk-caret">${svg("down")}</span>`;
    const val = btn.querySelector(".pk-val");

    native.classList.add("pk-native");
    native.tabIndex = -1;
    native.setAttribute("aria-hidden", "true");
    native.before(btn);
    native.focus = () => btn.focus();

    function refresh() {
      let t = "", empty = false;
      if (kind === "date" || kind === "in" || kind === "out") {
        const d = parse(native.value);
        t = d ? shortDate(d) : P.chooseDate;
        empty = !d;
      } else if (kind === "time") {
        const o = native.options[native.selectedIndex];
        empty = !native.value;
        t = empty ? P.chooseTime : o.dataset.label || o.text;
      } else if (kind === "number") {
        const n = Number(native.value) || Number(native.min) || 1;
        t = `${n} ${n === 1 ? native.dataset.unitOne : native.dataset.unitMany}`;
      } else {
        const o = native.options[native.selectedIndex];
        t = o ? o.text : "";
      }
      val.textContent = t;
      btn.classList.toggle("is-empty", empty);
    }

    // Other scripts set .value directly (prefill, the check-out default); keep the trigger in step with them.
    const proto = native instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
    const desc = Object.getOwnPropertyDescriptor(proto, "value");
    Object.defineProperty(native, "value", { configurable: true, get() { return desc.get.call(this); }, set(v) { desc.set.call(this, v); refresh(); } });
    native.addEventListener("change", refresh);
    native.form?.addEventListener("reset", () => setTimeout(refresh));
    window.addEventListener("pageshow", refresh);
    new MutationObserver(() => {
      const v = native.getAttribute("aria-invalid");
      if (v === null) btn.removeAttribute("aria-invalid"); else btn.setAttribute("aria-invalid", v);
    }).observe(native, { attributes: true, attributeFilter: ["aria-invalid"] });

    btn.addEventListener("click", () => {
      if (cur && cur.trigger === btn) return close();
      if (kind === "time") openTime(btn, native);
      else if (kind === "number") openNumber(btn, native);
      else if (kind === "select") openList(btn, native);
      else openCalendar(btn, native, kind);
    });
    refresh();
  }

  natives.forEach(mount);
})();
