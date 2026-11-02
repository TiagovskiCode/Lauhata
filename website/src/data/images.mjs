// Photo registry. `src` is one of:
//   "foto:<slug>"     a photo in /assets/img/fotos/, pre-sized by tools/otimizar-fotos.ps1 (see
//                     README); `width` is the original width, used for srcset;
//   "unsplash:<id>"   an illustrative stock photo (Unsplash License).
// `placeholder: true` marks an image that does not show Lauhata itself (stock photos and the
// illustrative photos made for the mock-up); set it to `false` once a real photo replaces it.
export default {
  heroSunset: {
    src: "foto:hero-por-do-sol",
    width: 1310,
    alt: { pt: "Mesa posta com peixe grelhado e água de coco num terraço sobre a baía, ao pôr do sol", en: "Table set with grilled fish and coconut water on a terrace above the bay at sunset" },
    placeholder: true,
  },
  coastSunset: {
    src: "foto:costa-por-do-sol",
    width: 1734,
    alt: { pt: "Baía com palmeiras e montanhas verdes ao pôr do sol", en: "Bay with palm trees and green hills at sunset" },
    placeholder: true,
  },
  terrace: {
    src: "foto:terraco-mar",
    width: 1341,
    alt: { pt: "Espreguiçadeiras e cocos frescos num terraço com vista para o mar", en: "Loungers and fresh coconuts on a terrace overlooking the sea" },
    placeholder: true,
  },
  foodSpread: {
    src: "foto:mesa-restaurante",
    width: 1341,
    alt: { pt: "Peixe grelhado em folha de bananeira, arroz, salada e sambal numa mesa sobre o mar", en: "Grilled fish on banana leaf, rice, salad and sambal on a table above the sea" },
    placeholder: true,
  },
  palmsSea: {
    src: "unsplash:1705672354908-a068661bc81d",
    alt: { pt: "Palmeiras sobre mar turquesa", en: "Palm trees over a turquoise sea" },
    placeholder: true,
  },
  roomGarden: {
    src: "foto:quarto-jardim",
    width: 1513,
    alt: { pt: "Quarto com cama de madeira, tais na parede e portadas abertas para o jardim", en: "Bedroom with a wooden bed, tais on the wall and shutters open to the garden" },
    placeholder: true,
  },
  roomFamily: {
    src: "foto:suite-familia",
    width: 1536,
    alt: { pt: "Suite com duas camas, cadeiras de vime e varanda com vista para o mar", en: "Suite with two beds, wicker chairs and a balcony with a sea view" },
    placeholder: true,
  },
  weaving: {
    src: "foto:tais",
    width: 1122,
    alt: { pt: "Mãos a segurar um tais, o pano tradicional tecido em Timor", en: "Hands holding a tais, the traditional cloth woven in Timor" },
    placeholder: true,
  },
  palmSunset: {
    src: "unsplash:1460627390041-532a28402358",
    alt: { pt: "Silhuetas de palmeiras ao pôr do sol", en: "Palm silhouettes at sunset" },
    placeholder: true,
  },
  heroCoast: {
    src: "unsplash:1707445305630-5962c1e9e1e9",
    alt: { pt: "Vista da costa de Timor-Leste a partir de uma colina", en: "View of the Timor-Leste coast from a hillside" },
    placeholder: true,
  },
  coastAerial: {
    src: "unsplash:1553242018-6496a076bd3d",
    alt: { pt: "Vista aérea de mar turquesa e recife junto à costa", en: "Aerial view of turquoise sea and reef along the coast" },
    placeholder: true,
  },
  coastHills: {
    src: "unsplash:1591325408953-ef9298125f96",
    alt: { pt: "Colinas verdes e baía em Timor-Leste", en: "Green hills and a bay in Timor-Leste" },
    placeholder: true,
  },
  canoe: {
    src: "unsplash:1548345626-e69336aa565b",
    alt: { pt: "Duas pessoas numa canoa em mar calmo", en: "Two people in a canoe on a calm sea" },
    placeholder: true,
  },
  sunset: {
    src: "unsplash:1559494007-9f5847c49d94",
    alt: { pt: "Pôr do sol sobre o mar", en: "Sunset over the sea" },
    placeholder: true,
  },
  diningVeranda: {
    src: "unsplash:1767429013026-fefb4bc82879",
    alt: { pt: "Mesas de restaurante numa varanda aberta", en: "Restaurant tables on an open veranda" },
    placeholder: true,
  },
  diningWicker: {
    src: "unsplash:1791540133579-af633981d5ff",
    alt: { pt: "Cadeiras de vime e mesas de madeira", en: "Wicker chairs and wooden tables" },
    placeholder: true,
  },
  grilledFish: {
    src: "unsplash:1600699899970-b1c9fadd8f9e",
    alt: { pt: "Peixe grelhado servido com salada", en: "Grilled fish served with salad" },
    placeholder: true,
  },
  fishOnGrill: {
    src: "unsplash:1556814901-18c866c057da",
    alt: { pt: "Peixe a grelhar sobre brasas", en: "Fish grilling over embers" },
    placeholder: true,
  },
  seafood: {
    src: "unsplash:1765100479761-2359e22fbe16",
    alt: { pt: "Travessa de marisco variado", en: "Platter of mixed seafood" },
    placeholder: true,
  },
  drink: {
    src: "unsplash:1786366562970-0fdd109196d0",
    alt: { pt: "Bebida fresca com gelo e hortelã", en: "Cold drink with ice and mint" },
    placeholder: true,
  },
  coffeeHarvest: {
    src: "unsplash:1642613630414-1d9938f4fe02",
    alt: { pt: "Mãos a colher grãos de café", en: "Hands picking coffee cherries" },
    placeholder: true,
  },
  coffeeCherries: {
    src: "unsplash:1515694590185-73647ba02c10",
    alt: { pt: "Grãos de café vermelhos e verdes no ramo", en: "Red and green coffee cherries on the branch" },
    placeholder: true,
  },
  roomForest: {
    src: "unsplash:1774280954999-9758f11f3d41",
    alt: { pt: "Quarto em madeira com janela grande para a vegetação", en: "Wooden bedroom with a large window onto greenery" },
    placeholder: true,
  },
  roomWarm: {
    src: "unsplash:1584132915807-fd1f5fbc078f",
    alt: { pt: "Cama com roupa branca e cortinas de tons quentes", en: "Bed with white linen and warm-toned curtains" },
    placeholder: true,
  },
  roomBright: {
    src: "unsplash:1584132905271-512c958d674a",
    alt: { pt: "Cama de casal num quarto luminoso", en: "Double bed in a bright room" },
    placeholder: true,
  },
  verandaWicker: {
    src: "unsplash:1785245647510-5547d4388d2a",
    alt: { pt: "Varanda com cadeiras de vime", en: "Veranda with wicker chairs" },
    placeholder: true,
  },
  verandaBamboo: {
    src: "unsplash:1788927790674-09bcb30d688f",
    alt: { pt: "Varanda com grades de bambu e plantas", en: "Veranda with bamboo railings and plants" },
    placeholder: true,
  },
  palmShadow: {
    src: "unsplash:1530177150700-84cd9a3b059b",
    alt: { pt: "Sombra de folhas de palmeira numa parede clara", en: "Palm-leaf shadow on a pale wall" },
    placeholder: true,
  },
};
