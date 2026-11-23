// The two accommodation types of Lauhata, each with its own page in both languages.
// OFFICIAL NAMES (owner, Nov 2026), used exactly like this in every language, form, message and metadata:
//   "Queen Room"            one queen-size bed
//   "Queen & Single Room"   one queen-size bed and one single bed
// Lauhata has roughly six to eight individual rooms but only these TWO types. The exact number of rooms is not confirmed, so
// the site never states a count: it talks about "two room types". There is no king-size bed anywhere.
// The ids ("sea", "family") are internal keys kept for the forms, links and tests; they are never shown.
// Owner-confirmed: the beds and the television below. Everything else a guest might ask about (capacity, bathroom, air
// conditioning, Wi-Fi, breakfast, view, terrace…) is NOT published until Carlos confirms it: see docs/CHECKLISTS.md.
// `price` is per night and per room (never per guest); shown only when set. Payment is in person.
//   capacity      who the room sleeps; `capacityPending: true` marks a capacity the establishment still has to confirm
//
//   beds          owner-confirmed beds, as text, and `bedPlan` for the drawing (queen / single)
//   amenities     owner-confirmed amenities only (shown as a list)
//   images        image keys (images.mjs); the first is the lead photo. While Lauhata's own photos are missing these are
//                 illustrative pictures, labelled as such on the page.
// What the accommodation offers as a whole (brief of 22 Nov 2026, confirmed by the client; the Booking.com listing says the same). It is
// the offer of Lauhata, NOT a feature of one room type, so it is shown once, beside both rooms. Nothing else may be added.
export const lodgingAmenities = [
  { id: "airport", icon: "plane", en: "Airport transfer", pt: "Transfer do aeroporto" },
  { id: "nosmoke", icon: "nosmoke", en: "Non-smoking rooms", pt: "Quartos para não fumadores" },
  { id: "parking", icon: "car", en: "Free parking", pt: "Estacionamento gratuito" },
  { id: "restaurant", icon: "cutlery", en: "On-site restaurant", pt: "Restaurante no local" },
  { id: "beach", icon: "waves", en: "Beachfront location", pt: "Em frente à praia" },
  { id: "bar", icon: "glass", en: "Bar", pt: "Bar" },
  { id: "breakfast", icon: "coffee", en: "Breakfast", pt: "Pequeno-almoço" },
  { id: "wifi", icon: "wifi", en: "Wi-Fi", pt: "Wi-Fi" },
  { id: "bathroom", icon: "shower", en: "Private bathroom", pt: "Casa de banho privativa" },
];
// Still NOT confirmed, so never shown: copy an entry into `lodgingAmenities` once Carlos confirms it.
export const pendingAmenities = [
  { id: "ac", icon: "snowflake", pt: "Ar condicionado", en: "Air conditioning" },
];

export default [
  {
    id: "sea",
    slug: { pt: "queen-room", en: "queen-room" },
    oldSlug: { pt: "suite-king", en: "suite-king" },
    name: { pt: "Queen Room", en: "Queen Room" },
    badge: { pt: "Quarto", en: "Room" },
    tagline: { pt: "Uma cama Queen Size, a poucos passos do restaurante e da praia.", en: "A queen-size bed, a few steps from the restaurant and the beach." },
    summary: {
      pt: "Uma cama Queen Size e televisão, a poucos passos do restaurante e da praia.",
      en: "A queen-size bed and a television, a few steps from the restaurant and the beach.",
    },
    description: {
      pt: "O Queen Room é o quarto com uma cama Queen Size e televisão. Fica no Lauhata, perto do restaurante e da praia, e o fim da tarde é para ver o sol pôr-se sobre a costa de Liquiçá.",
      en: "The Queen Room is the room with a queen-size bed and a television. It is at Lauhata, close to the restaurant and the beach, and the late afternoon is for watching the sun set over the Liquiçá coast.",
    },
    beds: { pt: "1 cama Queen Size", en: "1 queen-size bed" },
    bedPlan: ["queen"],
    amenities: [{ pt: "Televisão", en: "Television" }],
    suitability: null,
    price: "$90", // per night, per room (not per guest); client brief of 22 Nov 2026
    capacity: { pt: "Até 2 adultos", en: "Up to 2 adults" },
    images: ["roomWarm", "roomBright", "verandaBamboo", "sunsetSea"],
    featured: true,
    placeholder: true,
  },
  {
    id: "family",
    slug: { pt: "queen-and-single-room", en: "queen-and-single-room" },
    oldSlug: { pt: "suite-king-e-solteiro", en: "suite-king-and-single" },
    name: { pt: "Queen & Single Room", en: "Queen & Single Room" },
    badge: { pt: "Quarto", en: "Room" },
    tagline: { pt: "Uma cama Queen Size e uma cama de solteiro.", en: "A queen-size bed and a single bed." },
    summary: {
      pt: "Uma cama Queen Size e uma de solteiro, com televisão.",
      en: "A queen-size bed and a single bed, with a television.",
    },
    description: {
      pt: "O Queen & Single Room junta uma cama Queen Size e uma cama de solteiro no mesmo espaço, com televisão. Diga-nos no pedido quantas pessoas vêm e as idades das crianças: o Lauhata confirma pelo WhatsApp se o quarto é o indicado.",
      en: "The Queen & Single Room brings a queen-size bed and a single bed together in one space, with a television. Tell us in your request how many people are coming and the children's ages: Lauhata confirms on WhatsApp whether the room is right for you.",
    },
    beds: { pt: "1 cama Queen Size e 1 cama de solteiro", en: "1 queen-size bed and 1 single bed" },
    bedPlan: ["queen", "single"],
    amenities: [{ pt: "Televisão", en: "Television" }],
    suitability: null,
    price: "$90", // per night, per room (not per guest); client brief of 22 Nov 2026
    capacity: { pt: "Até 2 adultos e 2 crianças", en: "Up to 2 adults and 2 children" },
    // PENDING: two children are the intended maximum, subject to the children's ages and the occupancy conditions, which Lauhata
    // must confirm. It is shown with a line saying so (stay.capacityPending); do not turn it into a firm policy before then.
    capacityPending: true,
    images: ["roomFamily", "roomForest", "verandaWicker", "palmShadow"],
    placeholder: true,
  },
];
