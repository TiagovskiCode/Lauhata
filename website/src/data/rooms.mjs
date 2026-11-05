// The two suites of Lauhata, each with its own page in both languages.
// NAMES ARE PROVISIONAL (client, 5 Nov 2026): the two suites differ by their beds, so they are called by their beds,
// "Suite King" and "Suite King & Single", until Carlos confirms the commercial names. The ids ("sea", "family") are
// internal keys kept for the forms, links and tests; they are never shown.
// Owner-confirmed (Carlos Soares, November 2026): the beds and the television below. Everything else a guest might ask
// about (capacity, bathroom, air conditioning, Wi-Fi, breakfast, view, terrace…) is NOT published until Carlos confirms it:
// see docs/CHECKLISTS.md (some of it is listed on Booking.com and in guest reviews, which is not the same as confirmed).
// `price` is shown only when set (e.g. "US$ 60"); until then the page says "price on request". Payment is in person.
//
//   beds          owner-confirmed beds, as text, and `bedPlan` for the drawing (king / single)
//   amenities     owner-confirmed amenities only (shown as a list). An entry may carry `icon` (a name from layout.mjs's sprite).
//                 To publish one of `pendingAmenities` once Carlos confirms it FOR THAT SUITE, copy it into that suite's list.
//   suitability   owner-confirmed note on who the suite suits (optional)
//   images        image keys (images.mjs); the first is the lead photo, all of them form the carousel. While Lauhata's own
//                 photos are missing these are illustrative pictures, labelled as such on the page.
// Amenities the site is READY to show (icon, label, both languages) but must not publish until the owner confirms each one for
// each suite. They appear on no page. Source of the doubt: Booking.com and guest reviews mention some of them; that is not
// confirmation. Tracked in docs/CHECKLISTS.md.
export const pendingAmenities = [
  { id: "wifi", icon: "wifi", pt: "Wi-Fi", en: "Wi-Fi" },
  { id: "breakfast", icon: "coffee", pt: "Pequeno-almoço", en: "Breakfast" },
  { id: "bathroom", icon: "shower", pt: "Casa de banho privativa", en: "Private bathroom" },
  { id: "ac", icon: "snowflake", pt: "Ar condicionado", en: "Air conditioning" },
];

export default [
  {
    id: "sea",
    slug: { pt: "suite-king", en: "suite-king" },
    oldSlug: { pt: "quarto-vista-mar", en: "sea-view-room" },
    name: { pt: "Suite King", en: "Suite King" },
    badge: { pt: "Suite", en: "Suite" },
    tagline: { pt: "Uma cama King Size, a poucos passos do restaurante e da praia.", en: "A king-size bed, a few steps from the restaurant and the beach." },
    summary: {
      pt: "Para dois, com uma cama King Size e televisão, a poucos passos do restaurante e da praia.",
      en: "For two, with a king-size bed and a television, a few steps from the restaurant and the beach.",
    },
    description: {
      pt: "A Suite King é a suite com uma cama King Size e televisão. Fica no Lauhata, perto do restaurante e da praia: o pequeno-almoço serve-se das 8:00 às 10:00, o almoço e o jantar das 11:00 às 21:00, e o fim da tarde é para ver o sol pôr-se sobre a costa de Liquiçá.",
      en: "The Suite King is the suite with a king-size bed and a television. It is at Lauhata, close to the restaurant and the beach: breakfast is served from 8:00 to 10:00, lunch and dinner from 11:00 to 21:00, and the late afternoon is for watching the sun set over the Liquiçá coast.",
    },
    beds: { pt: "1 cama King Size", en: "1 king-size bed" },
    bedPlan: ["king"],
    amenities: [{ pt: "Televisão", en: "Television" }],
    suitability: null,
    price: null,
    images: ["roomWarm", "roomBright", "verandaBamboo", "sunsetSea"],
    featured: true,
    placeholder: true,
  },
  {
    id: "family",
    slug: { pt: "suite-king-e-solteiro", en: "suite-king-and-single" },
    oldSlug: { pt: "suite-familia", en: "family-suite" },
    name: { pt: "Suite King & Single", en: "Suite King & Single" },
    badge: { pt: "Suite", en: "Suite" },
    tagline: { pt: "Uma cama para os pais, outra para a criança.", en: "One bed for the parents, one for the child." },
    summary: {
      pt: "Uma cama King Size e uma de solteiro, com televisão: pensada para um casal que viaja com uma criança.",
      en: "A king-size bed and a single bed, with a television: made for a couple travelling with a child.",
    },
    description: {
      pt: "A Suite King & Single junta uma cama King Size e uma cama de solteiro no mesmo espaço, com televisão. É a opção para um casal que viaja com uma criança e quer ficar perto da praia e do restaurante. Diga-nos no pedido quantas pessoas vêm e as idades das crianças: o Lauhata confirma pelo WhatsApp se a suite é a indicada.",
      en: "The Suite King & Single brings a king-size bed and a single bed together in one space, with a television. It is the choice for a couple travelling with a child who want to stay close to the beach and the restaurant. Tell us in your request how many people are coming and the children's ages: Lauhata confirms on WhatsApp whether the suite is right for you.",
    },
    beds: { pt: "1 cama King Size e 1 cama de solteiro", en: "1 king-size bed and 1 single bed" },
    bedPlan: ["king", "single"],
    amenities: [{ pt: "Televisão", en: "Television" }],
    suitability: { pt: "Um casal com uma criança", en: "A couple with a child" },
    price: null,
    images: ["roomFamily", "roomForest", "verandaWicker", "palmShadow"],
    placeholder: true,
  },
];
