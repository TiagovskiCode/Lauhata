// SAMPLE drinks for the development preview ONLY. The printed menu has no drinks list, so nothing here is a product
// Lauhata has confirmed: no prices, no brands, no ingredients beyond the drink's plain name. They are shown with a visible
// "Exemplo" tag, cannot be added to an order, and disappear when site.showSamples is false. Replace them with the real
// drinks (in menu.mjs, category "drinks", with `group` and `price`) once Carlos supplies the list.
// `query` is only used by tools/fotos-temporarias.mjs to find an illustrative photo.
export const sampleDrinks = [
  { id: "sample-water", group: "water", name: { pt: "Água", en: "Water" }, query: "bottle of water glass table" },
  { id: "sample-coconut", group: "coconut", name: { pt: "Água de coco", en: "Coconut water" }, query: "fresh coconut drink straw" },
  { id: "sample-soft", group: "soft", name: { pt: "Refrigerantes", en: "Soft drinks" }, query: "soda glass ice" },
  { id: "sample-orange-juice", group: "juice", name: { pt: "Sumo natural de laranja", en: "Fresh orange juice" }, query: "fresh orange juice glass" },
  { id: "sample-mango-juice", group: "juice", name: { pt: "Sumo natural de manga", en: "Fresh mango juice" }, query: "mango juice glass" },
  { id: "sample-coffee", group: "coffee", name: { pt: "Café", en: "Coffee" }, query: "cup of coffee" },
  { id: "sample-tea", group: "coffee", name: { pt: "Chá", en: "Tea" }, query: "cup of tea" },
  { id: "sample-mocktail-passion", group: "mocktail", name: { pt: "Mocktail de maracujá", en: "Passion fruit mocktail" }, query: "passion fruit drink glass" },
  { id: "sample-virgin-mojito", group: "mocktail", name: { pt: "Mojito sem álcool", en: "Virgin mojito" }, query: "virgin mojito" },
  { id: "sample-beer", group: "beer", name: { pt: "Cerveja", en: "Beer" }, query: "cold beer glass" },
  { id: "sample-wine", group: "wine", name: { pt: "Vinho (copo)", en: "Wine (glass)" }, query: "glass of wine" },
  { id: "sample-mojito", group: "cocktail", name: { pt: "Mojito", en: "Mojito" }, query: "mojito cocktail" },
  { id: "sample-pina-colada", group: "cocktail", name: { pt: "Piña colada", en: "Piña colada" }, query: "pina colada" },
  { id: "sample-spirits", group: "spirits", name: { pt: "Bebidas espirituosas", en: "Spirits" }, query: "whisky glass" },
];
