// The two room types of Lauhata, each with its own page in both languages.
// Owner-confirmed (Carlos Soares, November 2026): the two types are the Sea View Room and the Family Suite; the beds and the
// television below. Everything else a guest might ask about (capacity, bathroom, air conditioning, Wi-Fi, terrace…) is NOT
// published until Carlos confirms it: see CHECKLISTS.md. `price` is shown only when set (e.g. "US$ 60"); until then the
// page says "price on request". Payment is made in person at Lauhata.
//
//   beds          owner-confirmed bed configuration
//   amenities     owner-confirmed amenities only (shown as a list)
//   suitability   owner-confirmed note on who the room suits (optional)
//   images        image keys (images.mjs); the first is the lead photo, all of them form the room's carousel. While Lauhata's
//                 own room photos are missing these are illustrative pictures, labelled as such on the page.
export default [
  {
    id: "sea",
    slug: { pt: "quarto-vista-mar", en: "sea-view-room" },
    name: { pt: "Quarto Vista Mar", en: "Sea View Room" },
    badge: { pt: "Quarto", en: "Room" },
    tagline: { pt: "O mar à frente, uma cama larga, o resto do dia lá fora.", en: "The sea in front, a wide bed, the rest of the day outside." },
    summary: {
      pt: "Para dois, com uma cama King Size, a poucos passos do restaurante e da praia.",
      en: "For two, with a king-size bed, a few steps from the restaurant and the beach.",
    },
    description: {
      pt: "O Quarto Vista Mar é o quarto para quem vem a dois: uma cama King Size, televisão e o mar como horizonte. O restaurante e a praia ficam a poucos passos, para começar o dia com o pequeno-almoço e acabá-lo a ver o sol pôr-se sobre a costa de Liquiçá.",
      en: "The Sea View Room is the room for two: a king-size bed, a television and the sea as the horizon. The restaurant and the beach are a few steps away, to start the day with breakfast and end it watching the sun set over the Liquiçá coast.",
    },
    beds: { pt: "1 cama King Size", en: "1 king-size bed" },
    amenities: [{ pt: "Televisão", en: "Television" }],
    suitability: null,
    price: null,
    images: ["roomWarm", "roomBright", "sunsetSea"],
    featured: true,
    placeholder: true,
  },
  {
    id: "family",
    slug: { pt: "suite-familia", en: "family-suite" },
    name: { pt: "Suite Família", en: "Family Suite" },
    badge: { pt: "Suite", en: "Suite" },
    tagline: { pt: "Uma cama para os pais, outra para a criança.", en: "One bed for the parents, one for the child." },
    summary: {
      pt: "Uma cama King Size e uma de solteiro: pensada para um casal que viaja com uma criança.",
      en: "A king-size bed and a single bed: made for a couple travelling with a child.",
    },
    description: {
      pt: "A Suite Família junta uma cama King Size e uma cama de solteiro no mesmo espaço, com televisão. É a escolha natural para um casal que viaja com uma criança e quer ficar perto da praia e do restaurante, sem ter de reservar dois quartos.",
      en: "The Family Suite brings a king-size bed and a single bed together in one space, with a television. It is the natural choice for a couple travelling with a child who want to stay close to the beach and the restaurant without booking two rooms.",
    },
    beds: { pt: "1 cama King Size e 1 cama de solteiro", en: "1 king-size bed and 1 single bed" },
    amenities: [{ pt: "Televisão", en: "Television" }],
    suitability: { pt: "Um casal com uma criança", en: "A couple with a child" },
    price: null,
    images: ["roomFamily", "roomForest", "verandaWicker"],
    placeholder: true,
  },
];
