// SAMPLE drinks with PROVISIONAL prices (brief of 22 Nov 2026: the client authorised estimated prices until Carlos confirms the real ones).
// Every `price` below (USD, per serving) is an ESTIMATE flagged `provisional: true`: it is not a confirmed price and must be validated
// with Carlos. The build writes the full list to docs/PRECOS-PROVISORIOS-BEBIDAS.md. The names are not confirmed products either, no
// brands, no ingredients. They cannot be added to an order. Replace them with the real drinks (in menu.mjs, category "drinks", with
// `group` and `price`) once Carlos supplies the list; set showSamples: false in site.mjs to hide these.
// `query` is only used by tools/fotos-temporarias.mjs to find an illustrative photo.
export const sampleDrinks = [
  { id: "sample-water", group: "water", price: 1, provisional: true, name: { pt: "Água", en: "Water" }, query: "bottle of water glass table" },
  { id: "sample-coconut", group: "coconut", price: 3, provisional: true, name: { pt: "Água de coco", en: "Coconut water" }, query: "fresh coconut drink straw" },
  { id: "sample-soft", group: "soft", price: 2, provisional: true, name: { pt: "Refrigerantes", en: "Soft drinks" }, query: "soda glass ice" },
  { id: "sample-orange-juice", group: "juice", price: 4, provisional: true, name: { pt: "Sumo natural de laranja", en: "Fresh orange juice" }, query: "fresh orange juice glass" },
  { id: "sample-mango-juice", group: "juice", price: 4, provisional: true, name: { pt: "Sumo natural de manga", en: "Fresh mango juice" }, query: "mango juice glass" },
  { id: "sample-coffee", group: "coffee", price: 2, provisional: true, name: { pt: "Café", en: "Coffee" }, query: "cup of coffee" },
  { id: "sample-tea", group: "coffee", price: 2, provisional: true, name: { pt: "Chá", en: "Tea" }, query: "cup of tea" },
  { id: "sample-mocktail-passion", group: "mocktail", price: 5, provisional: true, name: { pt: "Mocktail de maracujá", en: "Passion fruit mocktail" }, query: "passion fruit drink glass" },
  { id: "sample-virgin-mojito", group: "mocktail", price: 5, provisional: true, name: { pt: "Mojito sem álcool", en: "Virgin mojito" }, query: "virgin mojito" },
  { id: "sample-beer", group: "beer", price: 3, provisional: true, name: { pt: "Cerveja", en: "Beer" }, query: "cold beer glass" },
  { id: "sample-wine", group: "wine", price: 6, provisional: true, name: { pt: "Vinho (copo)", en: "Wine (glass)" }, query: "glass of wine" },
  { id: "sample-mojito", group: "cocktail", price: 7, provisional: true, name: { pt: "Mojito", en: "Mojito" }, query: "mojito cocktail" },
  { id: "sample-pina-colada", group: "cocktail", price: 7, provisional: true, name: { pt: "Piña colada", en: "Piña colada" }, query: "pina colada" },
  { id: "sample-spirits", group: "spirits", price: 5, provisional: true, name: { pt: "Bebidas espirituosas", en: "Spirits" }, query: "whisky glass" },
];
