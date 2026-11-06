/* Lauhata — analytics (Google Analytics 4), loaded ONLY when a measurement ID is set in src/data/site.mjs (gaId).
   Nothing is measured, and Google's script is not even requested, until the visitor accepts in the banner. The choice is kept
   in this browser (localStorage "lauhata-consent").

   What is counted, and what it means (none of these is a confirmed booking: confirmation happens manually, on WhatsApp):
     cta_book_room / cta_book_table   a click on a booking button
     request_start                    the visitor started filling a request or order form (once per form)
     order_start                      the first dish added to the restaurant order (once per visit)
     whatsapp_request_handoff         the request/order was handed over to WhatsApp (request_type: room, table, event, order…)
     whatsapp_click                   a click on a plain WhatsApp link
     directions_click                 a click on a Google Maps / directions link
     contact_click                    a click on a phone or email link
     language_switch                  a click on the EN/PT switch
     menu_item_add                    a dish added to the order
   Set up the matching "key events" in GA4 yourself; "whatsapp_request_handoff" is the closest thing to a lead, not a sale. */
(() => {
  "use strict";
  const ID = window.LAUHATA_GA;
  if (!ID) return;
  const KEY = "lauhata-consent";
  let choice = null;
  try { choice = localStorage.getItem(KEY); } catch (e) { /* storage unavailable: ask every time */ }

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  gtag("consent", "default", { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });

  let loaded = false;
  function load() {
    if (loaded) return;
    loaded = true;
    window.gtag = gtag;
    gtag("consent", "update", { analytics_storage: "granted" });
    gtag("js", new Date());
    gtag("config", ID, { anonymize_ip: true, allow_google_signals: false, allow_ad_personalization_signals: false });
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(ID);
    document.head.appendChild(s);
  }
  const track = (name, params) => { if (loaded) gtag("event", name, params || {}); };
  window.LauhataTrack = track;
  if (choice === "granted") load();

  /* ---- the banner ---- */
  const box = document.querySelector("[data-consent]");
  if (box && choice !== "granted" && choice !== "denied") box.hidden = false;
  const decide = (v) => {
    try { localStorage.setItem(KEY, v); } catch (e) { /* ignore */ }
    if (box) box.hidden = true;
    if (v === "granted") load();
  };
  box?.querySelector("[data-consent-yes]")?.addEventListener("click", () => decide("granted"));
  box?.querySelector("[data-consent-no]")?.addEventListener("click", () => decide("denied"));

  /* ---- events (delegated, so they cover every page without touching the markup) ---- */
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a, button");
    if (!a) return;
    const href = a.getAttribute("href") || "";
    if (a.matches("[data-book-open='room'], [data-room-link]")) track("cta_book_room", { place: a.closest(".mobile-bar") ? "mobile_bar" : a.closest("header") ? "header" : "page" });
    else if (a.matches("[data-book-open='table']")) track("cta_book_table", { place: a.closest(".mobile-bar") ? "mobile_bar" : "page" });
    if (/wa\.me|whatsapp\.com/.test(href) && !a.closest("[data-thanks-reopen]")) track("whatsapp_click", { place: a.closest(".wa-float") ? "float" : a.closest(".mobile-bar") ? "mobile_bar" : "page" });
    if (/google\.[a-z.]+\/maps/.test(href)) track("directions_click");
    if (/^(tel|mailto):/.test(href)) track("contact_click", { method: href.split(":")[0] });
    if (a.closest(".lang") && a.matches("a.lang-opt")) track("language_switch", { to: a.getAttribute("hreflang") });
    if (a.matches("[data-add]")) {
      track("menu_item_add");
      if (!window.__orderStarted) { window.__orderStarted = true; track("order_start"); }
    }
  });
  const started = new WeakSet();
  document.addEventListener("focusin", (e) => {
    const f = e.target.closest("form[data-booking], form[data-quick-wa], form[data-order-form]");
    if (f && !started.has(f)) { started.add(f); track("request_start", { form: f.dataset.booking || (f.hasAttribute("data-quick-wa") ? "quick" : "order") }); }
  });
})();
