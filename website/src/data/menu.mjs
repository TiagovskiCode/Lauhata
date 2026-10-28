// Interactive menu, with the category tabs from the design ("Do mar", "Da terra", "Doces & café").
// The four sea dishes come from the approved mock-up and still need confirming; the other
// categories hold placeholders until the restaurant sends its real menu. `price` is shown only
// when set (e.g. "US$ 8"); otherwise the card shows "$ —" as in the design.
export const categories = [
  { id: "sea", name: { pt: "Do mar", en: "From the sea" } },
  { id: "land", name: { pt: "Da terra", en: "From the land" } },
  { id: "sweet", name: { pt: "Doces & café", en: "Sweets & coffee" } },
];

export const items = [
  {
    category: "sea",
    tag: { pt: "Assinatura", en: "Signature" },
    name: { pt: "Ikan sabuko na brasa", en: "Charcoal-grilled ikan sabuko" },
    description: { pt: "Peixe do dia grelhado em carvão, com budu de tomate e lima.", en: "Catch of the day grilled over charcoal, with tomato and lime budu." },
    image: "dishIkan",
    price: null,
  },
  {
    category: "sea",
    tag: { pt: "Do mar", en: "From the sea" },
    name: { pt: "Peixe em folha de bananeira", en: "Fish in banana leaf" },
    description: { pt: "Cozinhado lentamente com gengibre, açafrão e coco.", en: "Slow-cooked with ginger, turmeric and coconut." },
    image: "dishLeaf",
    price: null,
  },
  {
    category: "sea",
    tag: { pt: "Do mar", en: "From the sea" },
    name: { pt: "Lulas grelhadas", en: "Grilled squid" },
    description: { pt: "Com malagueta da casa, alho e arroz branco.", en: "With house chilli, garlic and white rice." },
    image: "dishSquid",
    price: null,
  },
  {
    category: "sea",
    tag: { pt: "Para partilhar", en: "To share" },
    name: { pt: "Caril de camarão", en: "Prawn curry" },
    description: { pt: "Camarão em caril suave de coco, servido com pão.", en: "Prawns in a mild coconut curry, served with bread." },
    image: "dishCurry",
    price: null,
  },
  {
    category: "land",
    tag: { pt: "Da terra", en: "From the land" },
    name: { pt: "Prato da terra (a confirmar)", en: "Land dish (to be confirmed)" },
    description: { pt: "Descrição a fornecer pelo restaurante.", en: "Description to be provided by the restaurant." },
    image: "dishTable",
    price: null,
    placeholder: true,
  },
  {
    category: "sweet",
    tag: { pt: "Café de Timor", en: "Timor coffee" },
    name: { pt: "Doce ou café (a confirmar)", en: "Sweet or coffee (to be confirmed)" },
    description: { pt: "Descrição a fornecer pelo restaurante.", en: "Description to be provided by the restaurant." },
    image: "dishBreakfast",
    price: null,
    placeholder: true,
  },
];
