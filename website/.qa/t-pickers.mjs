// Every custom picker (select, date, time, number) in every place it appears: the popup must open next to its button,
// inside the viewport, and nothing may gain a horizontal scrollbar. Sizes: wide desktop, laptop, tablet, phone.
export default async ({ open, eval: ev, shot, wait }) => {
  const out = [];
  const probe = `
    const rect = (e) => { const r = e.getBoundingClientRect(); return { l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom), w: Math.round(r.width), h: Math.round(r.height) }; };
    const pop = [...document.querySelectorAll(".pk-pop")].find((p) => !p.hidden && getComputedStyle(p).display !== "none");
    return pop ? { pop: rect(pop), vw: innerWidth, vh: innerHeight, inDialog: !!pop.closest("dialog") } : null;`;
  const check = async (label, btnSelector, scopeSelector) => {
    const res = await ev(`
      const scope = ${scopeSelector ? `document.querySelector(${JSON.stringify(scopeSelector)})` : "document"};
      const btns = [...scope.querySelectorAll(${JSON.stringify(btnSelector)})].filter((b) => b.offsetParent !== null);
      const list = [];
      for (let i = 0; i < btns.length; i++) {
        const b = btns[i];
        document.documentElement.style.scrollBehavior = "auto"; b.scrollIntoView({ block: "center", behavior: "instant" });
        await new Promise((r) => setTimeout(r, 120));
        b.click();
        await new Promise((r) => setTimeout(r, 350));
        const br = b.getBoundingClientRect();
        const info = (() => { ${probe} })();
        const host = b.closest("dialog") || document.documentElement;
        const scroller = host === document.documentElement ? { sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth } : { sw: host.scrollWidth, cw: host.clientWidth };
        list.push({ btn: { l: Math.round(br.left), t: Math.round(br.top), b: Math.round(br.bottom), w: Math.round(br.width) }, info, scroller, label: (b.textContent || "").trim().slice(0, 18) });
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
        document.body.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
        await new Promise((r) => setTimeout(r, 150));
      }
      return list;`);
    for (const r of res) {
      const p = r.info && r.info.pop;
      const bad = [];
      if (!r.info) bad.push("no popup");
      else {
        if (p.l < 0 || p.r > r.info.vw + 1 || p.t < 0 || p.b > r.info.vh + 1) bad.push("outside viewport");
        const nearX = p.l <= r.btn.l + r.btn.w && p.r >= r.btn.l;
        const nearY = Math.abs(p.t - r.btn.b) < 60 || Math.abs(p.b - r.btn.t) < 60;
        const sheet = p.w >= r.info.vw - 40 && p.b >= r.info.vh - 4; if (!sheet && (!nearX || !nearY)) bad.push("far from its button");
      }
      if (r.scroller.sw > r.scroller.cw + 1) bad.push(`horizontal overflow ${r.scroller.sw}>${r.scroller.cw}`);
      out.push({ label, btn: r.label, bad: bad.join("; ") || "ok" });
    }
  };
  for (const [w, h, mob] of [[1980, 1100, false], [1440, 900, false], [820, 1180, true], [390, 844, true]]) {
    const tag = `${w}x${h}`;
    await open("http://localhost:8080/", w, h, mob);
    await ev(`document.querySelector("[data-book-open]")?.click();return 1`);
    await wait(700);
    await ev(`document.querySelector('[data-bc-tab="table"]')?.click();return 1`);
    await wait(200);
    await check(`${tag} booking dialog / table`, '[data-bc-panel="table"] .pk-btn', "[data-book-dialog]");
    await ev(`document.querySelector('[data-bc-tab="room"]')?.click();return 1`);
    await wait(200);
    await check(`${tag} booking dialog / room`, '[data-bc-panel="room"] .pk-btn', "[data-book-dialog]");
    await ev(`document.querySelector("[data-book-dialog]").close();return 1`);
    await wait(200);
    await ev(`document.querySelector("[data-open-feedback]")?.click();return 1`);
    await wait(700);
    await check(`${tag} feedback dialog`, ".pk-btn", "[data-fb-dialog]");
    if (w === 1980) await shot("C:/Users/tiago/Desktop/Lauhata/website/.qa/m3/fb-after.png");
    await ev(`document.querySelector("[data-fb-dialog]")?.close();return 1`);
    await open("http://localhost:8080/contact/", w, h, mob);
    await check(`${tag} contact form`, ".pk-btn", ".contact-write");
    await open("http://localhost:8080/events/", w, h, mob);
    await check(`${tag} events form`, ".pk-btn", ".ev-form");
  }
  return out.filter((o) => o.bad !== "ok").concat([{ checked: out.length, ok: out.filter((o) => o.bad === "ok").length }]);
};
