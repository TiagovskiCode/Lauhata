// Guest feedback left on the website and APPROVED by Lauhata. Nothing reaches this list automatically.
//
// How it works (the site is static, on GitHub Pages: there is no server or database to store submissions):
//   1. A guest fills in "Deixe a sua opinião" on the home page. The form opens WhatsApp with the feedback, the name to
//      publish, the rating and the guest's consent to publication. Lauhata receives it like any other message.
//   2. Lauhata reads it. To publish it, copy it here (exactly as written, or shortened with "…" without changing its
//      meaning) and rebuild the site (`node build.mjs`). To reject it, do nothing.
//   3. To remove a published one, delete its entry and rebuild.
// Only publish feedback whose author ticked the consent box. Text is always escaped when rendered, never read as HTML.
//
// Entry: { name: "Ana", experience: { pt: "Restaurante", en: "Restaurant" }, rating: 5, text: "…", lang: "pt", date: "2026-11" }
// `lang` is the language the guest wrote in; the review is shown as written on both language versions.
export default [];
