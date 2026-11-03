// The two room types of Lauhata (confirmed by the owner, Nov 2026: Sea View Room and Family Suite; the Garden Room was removed).
// The Hotel & Lodging package includes one page per room type; each entry here
// generates its own page in both languages. Names, descriptions and features come from the
// approved design mock-up and still need to be confirmed by Lauhata. `price` is shown only when
// set (e.g. "US$ 60"); until then the card shows "Preço a confirmar". `featured: true` puts a room in the
// homepage's "most chosen" pair; which rooms are most booked is for Lauhata to confirm.
export default [
  {
    id: "sea",
    slug: { pt: "quarto-vista-mar", en: "sea-view-room" },
    name: { pt: "Quarto Vista Mar", en: "Sea View Room" },
    badge: { pt: "Mar", en: "Sea" },
    tagline: { pt: "A costa à sua janela.", en: "The coast at your window." },
    summary: {
      pt: "Acorde com o mar à janela e o nascer do sol sobre a costa.",
      en: "Wake up with the sea at your window and sunrise over the coast.",
    },
    description: {
      pt: "Acorde com o mar à janela e o nascer do sol sobre a costa.",
      en: "Wake up with the sea at your window and sunrise over the coast.",
    },
    capacity: { pt: "2 hóspedes", en: "2 guests" },
    beds: null,
    features: [
      { pt: "2 hóspedes", en: "2 guests" },
      { pt: "Vista mar", en: "Sea view" },
      { pt: "Pequeno-almoço", en: "Breakfast" },
    ],
    price: null,
    images: ["roomWarm", "coastSunset"],
    featured: true,
    placeholder: true,
  },
  {
    id: "family",
    slug: { pt: "suite-familia", en: "family-suite" },
    name: { pt: "Suite Família", en: "Family Suite" },
    badge: { pt: "Família", en: "Family" },
    tagline: { pt: "Mais espaço para ficar.", en: "More room to stay." },
    summary: {
      pt: "Mais espaço para famílias e pequenos grupos de amigos.",
      en: "More room for families and small groups of friends.",
    },
    description: {
      pt: "Mais espaço para famílias e pequenos grupos de amigos.",
      en: "More room for families and small groups of friends.",
    },
    capacity: { pt: "Até 4 hóspedes", en: "Up to 4 guests" },
    beds: null,
    features: [
      { pt: "Até 4 hóspedes", en: "Up to 4 guests" },
      { pt: "Sala de estar", en: "Living area" },
      { pt: "Varanda", en: "Balcony" },
    ],
    price: null,
    images: ["roomFamily"],
    placeholder: true,
  },
];
