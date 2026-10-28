// Interactive menu, with the category tabs from the design ("Do mar", "Da terra", "Doces & café").
// The four sea dishes come from the approved mock-up and still need confirming; the other
// categories hold placeholders until the restaurant sends its real menu. `price` is shown only
// when set (e.g. "US$ 8"); otherwise the card shows "$ —" as in the design. `featured: true` puts a dish in
// the homepage's "most chosen" row (3 dishes); which ones are most ordered is for Lauhata to confirm.
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
    featured: true,
  },
  {
    category: "sea",
    tag: { pt: "Do mar", en: "From the sea" },
    name: { pt: "Peixe em folha de bananeira", en: "Fish in banana leaf" },
    description: { pt: "Cozinhado lentamente com gengibre, açafrão e coco.", en: "Slow-cooked with ginger, turmeric and coconut." },
    image: "dishLeaf",
    price: null,
    featured: true,
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
    featured: true,
  },
  // "Da terra" and "Doces & café": dishes chosen for the illustrative photos. Names and
  // descriptions are suggestions and stay marked as placeholders until the restaurant confirms.
  ...[
    ["land", "dishBatar", { pt: "Prato timorense", en: "Timorese classic" }, { pt: "Batar da'an", en: "Batar da'an" },
      { pt: "Milho, feijão e abóbora cozinhados devagar, como se faz em Timor.", en: "Corn, beans and pumpkin slow-cooked the Timorese way." }],
    ["land", "dishTukir", { pt: "Para partilhar", en: "To share" }, { pt: "Tukir", en: "Tukir" },
      { pt: "Carne temperada cozinhada dentro de bambu, servida com sambal.", en: "Spiced meat cooked inside bamboo, served with sambal." }],
    ["land", "dishChicken", { pt: "Da terra", en: "From the land" }, { pt: "Frango com ai-manas", en: "Chicken with ai-manas" },
      { pt: "Frango grelhado com arroz, lima e o picante ai-manas da casa.", en: "Grilled chicken with rice, lime and the house ai-manas chilli." }],
    ["land", "dishGreens", { pt: "Vegetariano", en: "Vegetarian" }, { pt: "Legumes da horta", en: "Garden vegetables" },
      { pt: "Legumes da época salteados, com arroz e sambal de tomate.", en: "Seasonal vegetables stir-fried, with rice and tomato sambal." }],
    ["sweet", "dishCoffee", { pt: "Café de Timor", en: "Timor coffee" }, { pt: "Café de Timor", en: "Timor coffee" },
      { pt: "Café das montanhas de Timor, servido simples.", en: "Coffee from the Timor mountains, served black." }],
    ["sweet", "dishBananaCake", { pt: "Doce da casa", en: "House sweet" }, { pt: "Bolo de banana", en: "Banana cake" },
      { pt: "Bolo húmido de banana com coco ralado e caramelo.", en: "Moist banana cake with grated coconut and caramel." }],
    ["sweet", "dishFruit", { pt: "Fresco", en: "Fresh" }, { pt: "Fruta tropical", en: "Tropical fruit" },
      { pt: "Papaia, manga e ananás com lima.", en: "Papaya, mango and pineapple with lime." }],
    ["sweet", "dishCoconut", { pt: "Bebida", en: "Drink" }, { pt: "Água de coco", en: "Coconut water" },
      { pt: "Coco fresco, aberto na hora.", en: "Fresh coconut, opened to order." }],
  ].map(([category, image, tag, name, description]) => ({ category, tag, name, description, image, price: null, placeholder: true })),
];
