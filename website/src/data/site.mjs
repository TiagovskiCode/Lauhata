// Business data for Lauhata. Every empty value is a pending item: the site hides or flags it
// until the real data is filled in. Run `npm run build` after any change.
export default {
  name: "Lauhata",

  // Final domain, without a trailing slash. Placeholder until the domain is registered.
  siteUrl: "https://lauhata.example",

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
  mapQuery: "Lauhata, Liquiçá, Timor-Leste",
  // Exact coordinates, e.g. { lat: -8.6, lng: 125.4 }. PENDING.
  geo: null,

  // Opening hours. PENDING: while empty, pages show "to be confirmed".
  // Example: [{ days: { pt: "Segunda a domingo", en: "Monday to Sunday" }, hours: "11:00–22:00" }]
  restaurantHours: [],
  // Hotel check-in / check-out. PENDING. Example: { checkIn: "14:00", checkOut: "11:00" }
  stayTimes: null,

  // Hotel reception hours. Text from the design mock-up — to be confirmed.
  receptionHours: { pt: "24 horas", en: "24 hours" },

  // Typical reply time shown next to the booking forms. Text from the design mock-up — to be confirmed.
  responseTime: {
    pt: "Confirmamos a sua reserva pelo WhatsApp — normalmente em poucos minutos.",
    en: "We confirm your booking on WhatsApp — usually within minutes.",
  },

  // Drive time from Dili shown on the map, e.g. "25 min". PENDING.
  driveFromDili: "",

  // Social profiles, e.g. { facebook: "https://…", instagram: "https://…" }. PENDING.
  social: {},

  // Public review page (Google Maps / TripAdvisor). Only real reviews: none are written on the site.
  reviewsUrl: "",

  // Confirmed hotel amenities, bilingual. PENDING: the section stays hidden while empty.
  // Example: [{ pt: "Wi-Fi", en: "Wi-Fi" }]
  amenities: [],

  // Google Analytics 4 measurement ID (e.g. "G-XXXXXXX"). Analytics only loads when set.
  gaId: "",

  // Shows a small "illustrative image" tag on stock photos and the demo-menu notice.
  // Set to false only once every placeholder has been replaced with real content.
  showPlaceholderNotes: true,
};
