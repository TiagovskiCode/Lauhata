// Business data for Lauhata. Every empty value is a pending item: the site hides or flags it
// until the real data is filled in. Run `npm run build` after any change.
export default {
  name: "Lauhata Beach Escape",

  // Public address, without a trailing slash: canonical links, sitemap, robots.txt and Open Graph are built from it.
  // For now the GitHub Pages address (the repository root serves website/dist). Replace it with the final domain
  // once it is registered.
  siteUrl: "https://tiagovskicode.github.io/Lauhata/website/dist",

  // WhatsApp number in international format, digits only (e.g. "67077000000").
  // PENDING: while empty, forms open WhatsApp without a recipient so the flow can be tested.
  whatsapp: "",
  phone: "",
  email: "",

  address: {
    locality: "Lauhata",
    region: "Liquiçá",
    country: "Timor-Leste",
    countryCode: "TL",
  },
  // Map search used by the embedded map until exact coordinates are confirmed.
  mapQuery: "Lauhata Beach Escape, Liquiçá, Timor-Leste", // the place name as on Google Maps: the pin lands on Lauhata Beach Escape, not on the village
  // Exact coordinates, e.g. { lat: -8.6, lng: 125.4 }. PENDING.
  geo: null,

  // Opening hours of food and beverage, from the printed menu. The menu does not say which days, so
  // each line is labelled by meal (the field is called `days` but holds any label).
  restaurantHours: [
    { days: { pt: "Pequeno-almoço", en: "Breakfast" }, hours: "08:00–10:00" },
    { days: { pt: "Almoço e jantar", en: "Lunch & dinner" }, hours: "11:00–21:00" },
  ],
  // Room capacity, features and prices (rooms.mjs) come from the design mock-up, not from Lauhata. While this is
  // false the homepage panels show only the room name and a short line; set it to true once the owner has
  // confirmed the capacity and amenities of each room (prices still only appear when `price` is set).
  roomDetailsConfirmed: false,

  // Hotel check-in / check-out. PENDING. Example: { checkIn: "14:00", checkOut: "11:00" }
  stayTimes: null,

  // Hotel reception hours. PENDING: the mock-up said "24 hours" but Lauhata has not confirmed it, so
  // the site shows "to be confirmed" until it does. Example: { pt: "24 horas", en: "24 hours" }
  receptionHours: null,

  // Line shown next to the booking forms. Neutral on purpose: it promises no reply time. Once Lauhata
  // confirms how fast it usually answers, it can say so (e.g. "normalmente em poucos minutos").
  responseTime: {
    pt: "O Lauhata responde pelo WhatsApp para confirmar a disponibilidade.",
    en: "Lauhata replies on WhatsApp to confirm availability.",
  },

  // Drive time from Dili shown on the map, e.g. "25 min". PENDING.
  driveFromDili: "",

  // Social profiles, e.g. { facebook: "https://…", instagram: "https://…" }. PENDING.
  social: {},

  // Guest reviews: the official Tripadvisor listing. `rating` (e.g. 4.5) and `count` (e.g. 120) are shown only when filled
  // in; copy them by hand from the listing and set `checked` to that date ("2026-11-03"). No review text is copied onto
  // the site: reproducing guest reviews needs permission, so the site links to them instead.
  reviews: {
    tripadvisor: {
      url: "https://www.tripadvisor.com/Hotel_Review-g4578170-d10355320-Reviews-Lauhata_Beach_Escape-Liquica_Liquica_District.html",
      rating: null,
      count: null,
      checked: null,
    },
  },

  // Restaurant orders: the menu's cart sends the order to WhatsApp (nothing is paid or stored on the site).
  //   currency  symbol written before every price (the menu is priced in US dollars)
  //   types     which kinds of order the restaurant accepts. PENDING: Lauhata has not confirmed any, so the
  //             checkout asks only for a name until this is filled. One entry per kind, e.g.
  //               { id: "dine-in", label: { pt: "Comer no restaurante", en: "Dine in" }, askTable: true },
  //               { id: "takeaway", label: { pt: "Para levar", en: "Takeaway" } },
  //             `askTable: true` asks for the table number (required) when that type is chosen.
  order: {
    currency: "$",
    types: [],
  },

  // Hero video (optional). Leave empty and the hero shows its photo only. When Lauhata supplies real footage,
  // optimise it (short loop, no sound, ideally under 3 MB), put it in src/assets/video/ and set e.g.
  // "/assets/video/hero.mp4": the photo stays on screen and the video fades in over it once it can play.
  heroVideo: "/assets/video/hero.mp4",

  // Optional fields for search engines (Google). Each one is only written to the page once it is filled.
  // priceRange: e.g. "$$"; servesCuisine: e.g. ["Timorese", "Seafood"];
  // openingHoursSpec: [{ days: ["Monday", "Tuesday"], opens: "11:00", closes: "22:00" }] (English day names).
  priceRange: "",
  servesCuisine: [],
  openingHoursSpec: [],

  // Public review page (Google Maps / TripAdvisor). Only real reviews: none are written on the site.
  reviewsUrl: "",

  // Confirmed hotel amenities, bilingual. PENDING: the section stays hidden while empty.
  // Example: [{ pt: "Wi-Fi", en: "Wi-Fi" }]
  amenities: [],

  // Google Analytics 4 measurement ID (e.g. "G-XXXXXXX"). Analytics only loads when set.
  gaId: "",

  // Shows a small "illustrative image" tag on stock photos and the demo-menu notice.
  // Set to false only once every placeholder has been replaced with real content.
  showPlaceholderNotes: false,
};
