// Room types. The Hotel & Lodging package includes one page per room type; each entry here
// generates its own page in both languages. Names, descriptions and features come from the
// approved design mock-up and still need to be confirmed by Lauhata. `price` is shown only when
// set (e.g. "US$ 60"); until then the card shows "Preço a confirmar". `featured: true` puts a room in the
// homepage's "most chosen" pair; which rooms are most booked is for Lauhata to confirm.
export default [
  {
    id: "garden",
    slug: { pt: "quarto-jardim", en: "garden-room" },
    name: { pt: "Quarto Jardim", en: "Garden Room" },
    badge: { pt: "Jardim", en: "Garden" },
    summary: {
      pt: "Sossegado e fresco, com acesso direto ao jardim tropical.",
      en: "Quiet and cool, with direct access to the tropical garden.",
    },
    description: {
      pt: "Um quarto sossegado e fresco, com acesso direto ao jardim tropical. Descrição completa a confirmar pelo Lauhata.",
      en: "A quiet, cool room with direct access to the tropical garden. Full description to be confirmed by Lauhata.",
    },
    capacity: { pt: "2 hóspedes", en: "2 guests" },
    beds: null,
    features: [
      { pt: "2 hóspedes", en: "2 guests" },
      { pt: "Ar condicionado", en: "Air conditioning" },
      { pt: "Wi-Fi", en: "Wi-Fi" },
    ],
    price: null,
    images: ["roomGarden", "verandaWicker", "palmShadow"],
    featured: true,
    placeholder: true,
  },
  {
    id: "sea",
    slug: { pt: "quarto-vista-mar", en: "sea-view-room" },
    name: { pt: "Quarto Vista Mar", en: "Sea View Room" },
    badge: { pt: "Mar", en: "Sea" },
    summary: {
      pt: "Acorde com o mar à janela e o nascer do sol sobre a costa.",
      en: "Wake up with the sea at your window and sunrise over the coast.",
    },
    description: {
      pt: "Acorde com o mar à janela e o nascer do sol sobre a costa. Descrição completa a confirmar pelo Lauhata.",
      en: "Wake up with the sea at your window and sunrise over the coast. Full description to be confirmed by Lauhata.",
    },
    capacity: { pt: "2 hóspedes", en: "2 guests" },
    beds: null,
    features: [
      { pt: "2 hóspedes", en: "2 guests" },
      { pt: "Vista mar", en: "Sea view" },
      { pt: "Pequeno-almoço", en: "Breakfast" },
    ],
    price: null,
    images: ["roomWarm", "terrace", "coastSunset"],
    featured: true,
    placeholder: true,
  },
  {
    id: "family",
    slug: { pt: "suite-familia", en: "family-suite" },
    name: { pt: "Suite Família", en: "Family Suite" },
    badge: { pt: "Família", en: "Family" },
    summary: {
      pt: "Mais espaço para famílias e pequenos grupos de amigos.",
      en: "More room for families and small groups of friends.",
    },
    description: {
      pt: "Mais espaço para famílias e pequenos grupos de amigos. Descrição completa a confirmar pelo Lauhata.",
      en: "More room for families and small groups of friends. Full description to be confirmed by Lauhata.",
    },
    capacity: { pt: "Até 4 hóspedes", en: "Up to 4 guests" },
    beds: null,
    features: [
      { pt: "Até 4 hóspedes", en: "Up to 4 guests" },
      { pt: "Sala de estar", en: "Living area" },
      { pt: "Varanda", en: "Balcony" },
    ],
    price: null,
    images: ["roomFamily", "verandaBamboo", "roomBright"],
    placeholder: true,
  },
];
