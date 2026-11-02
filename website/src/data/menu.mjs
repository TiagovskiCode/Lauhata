// Lauhata menu, transcribed from the restaurant's printed menu ("lauhata menu.pdf", 6 pages).
// Prices are in US dollars, exactly as printed. Dish names are kept as printed (English); the PT
// descriptions are translations of the printed ones. Nothing here is invented: if the printed menu
// does not say it, it is not here.
//
// Fields per dish:
//   id          stable key (used by the cart, never change it once orders exist)
//   category    one of `categories`
//   name        as printed
//   description { en, pt } (optional)
//   price       number in US$, or null = price not set: the dish cannot be added to the order
//   options     choices the printed menu offers ("scrambled, fried or sunny-side up", "Small / Large"…).
//               Each group is required (one choice). A choice with its own `price` sets the dish price
//               (e.g. small and large chips); otherwise the dish price applies.
//   image       key (in images.mjs) of a real photo of THIS dish, or null. Until the restaurant has photos,
//               cards are shown without a picture instead of with a stock or illustrative one.
//   featured    true = shown in the homepage's "most chosen" row (3 dishes). PENDING: Lauhata to confirm.
//   confirm     true = the printed price is handwritten or unclear; check it with the restaurant.

export const categories = [
  {
    id: "breakfast",
    name: { en: "Breakfast", pt: "Pequeno-almoço" },
    note: {
      en: "Served with chilled juice. Breakfast is served from 8:00 am to 10:00 am.",
      pt: "Servido com sumo gelado. O pequeno-almoço serve-se das 8:00 às 10:00.",
    },
  },
  { id: "salad", name: { en: "Salad", pt: "Saladas" } },
  { id: "starters", name: { en: "Starters", pt: "Entradas" } },
  { id: "soup", name: { en: "Soup", pt: "Sopas" } },
  { id: "main", name: { en: "Main Course", pt: "Pratos principais" } },
  { id: "vegetarian", name: { en: "Vegetarian", pt: "Vegetariano" } },
  { id: "sides", name: { en: "Side Order", pt: "Acompanhamentos" } },
  {
    id: "dessert",
    name: { en: "Dessert", pt: "Sobremesas" },
    note: { en: "Based on availability.", pt: "Sujeito a disponibilidade." },
  },
  { id: "pizza", name: { en: "Pizza", pt: "Pizzas" } },
];

// Printed on the last page of the menu: applies to every dish.
export const menuNote = {
  en: "All items are served within 20 to 30 minutes.",
  pt: "Todos os pratos são servidos em 20 a 30 minutos.",
};

const opt = (id, en, pt, price) => ({ id, label: { en, pt }, ...(price == null ? {} : { price }) });
const group = (id, en, pt, choices) => ({ id, label: { en, pt }, choices });
const text = (en, pt) => ({ en, pt });

const chipsSize = group("size", "Size", "Tamanho", [
  opt("small", "Small", "Pequenas", 5),
  opt("large", "Large", "Grandes", 10),
]);

export const items = [
  // ---- Breakfast ----
  {
    id: "choice-of-eggs", category: "breakfast", name: "Choice of Eggs", price: 6,
    description: text("Scrambled, fried eggs, sunny-side up, served with toast bread & butter", "Ovos mexidos, fritos ou estrelados, servidos com torradas e manteiga"),
    options: [group("style", "Style", "Preparação", [opt("scrambled", "Scrambled", "Mexidos"), opt("fried", "Fried", "Fritos"), opt("sunny", "Sunny-side up", "Estrelados")])],
  },
  {
    id: "egg-chicken-sausage-toast", category: "breakfast", name: "Egg and Chicken Sausage on Toast", price: 8,
    description: text("Fried or scrambled. Served with tomato, olive & feta", "Ovos fritos ou mexidos. Servido com tomate, azeitona e feta"),
    options: [group("style", "Style", "Preparação", [opt("fried", "Fried", "Fritos"), opt("scrambled", "Scrambled", "Mexidos")])],
  },
  {
    id: "omelette", category: "breakfast", name: "Omelette", price: 6,
    description: text("Plain, ham & cheese or Spanish", "Simples, de fiambre e queijo ou espanhola"),
    options: [group("type", "Type", "Tipo", [opt("plain", "Plain", "Simples"), opt("ham-cheese", "Ham & cheese", "Fiambre e queijo"), opt("spanish", "Spanish", "Espanhola")])],
  },
  {
    id: "baked-beans-toast", category: "breakfast", name: "Baked Beans on Toast", price: 6,
    description: text("Baked beans served on toasted bread", "Baked beans servidos sobre pão torrado"),
  },
  {
    id: "french-toast", category: "breakfast", name: "French Toast", price: 6,
    description: text("Served with honey and cinnamon", "Servido com mel e canela"),
  },
  {
    id: "pancakes", category: "breakfast", name: "Pancakes", price: 6,
    description: text("Plain or banana and maple syrup", "Simples ou com banana e xarope de ácer"),
    options: [group("version", "Version", "Versão", [opt("plain", "Plain", "Simples"), opt("banana-maple", "Banana and maple syrup", "Banana e xarope de ácer")])],
  },
  {
    id: "cereal-choices", category: "breakfast", name: "Cereal Choices", price: 4,
    description: text("Choco or corn flakes served with hot or cold milk", "Cereais de chocolate ou flocos de milho, servidos com leite quente ou frio"),
    options: [
      group("cereal", "Cereal", "Cereal", [opt("choco", "Choco", "Chocolate"), opt("corn-flakes", "Corn flakes", "Flocos de milho")]),
      group("milk", "Milk", "Leite", [opt("hot", "Hot", "Quente"), opt("cold", "Cold", "Frio")]),
    ],
  },
  {
    id: "seasonal-fruit-salad", category: "breakfast", name: "Seasonal Fruit Salad", price: 5,
    description: text("Selection of fruits in season", "Seleção de frutas da época"),
  },

  // ---- Salad ----
  {
    id: "caesar-salad", category: "salad", name: "Caesar Salad", price: 8,
    description: text("Seared herb chicken with lettuce, boiled egg, pork bacon, crouton & Caesar dressing", "Frango selado com ervas, alface, ovo cozido, bacon de porco, croutons e molho Caesar"),
  },
  {
    id: "greek-salad", category: "salad", name: "Greek Salad", price: 8,
    description: text("Feta, olive, tomato and cucumber mix with tossed salad & Lauhata dressing", "Mistura de feta, azeitonas, tomate e pepino com salada variada e molho Lauhata"),
  },
  {
    id: "tuna-salad", category: "salad", name: "Tuna Salad", price: 8,
    description: text("Tuna, lettuce, tomato, onion & cucumber with Lauhata dressing", "Atum, alface, tomate, cebola e pepino com molho Lauhata"),
  },

  // ---- Starters ----
  {
    id: "clams-garlic-bread", category: "starters", name: "Clams & Garlic Bread", price: 10,
    description: text("Clams cooked in white wine, garlic & coriander leaves", "Amêijoas cozinhadas em vinho branco, alho e folhas de coentros"),
  },
  {
    id: "calamari-rings", category: "starters", name: "Calamari Rings", price: 6,
    description: text("Calamari served with chilli sauce mixed with mayo sauce", "Anéis de lula servidos com molho de chilli misturado com maionese"),
  },
  {
    id: "satay-starter", category: "starters", name: "Satay (Starter)", price: 6,
    description: text("4 satays with tamarind sauce", "4 espetadas satay com molho de tamarindo"),
    options: [group("meat", "Choice", "Escolha", [opt("chicken", "Chicken", "Frango"), opt("pork", "Pork", "Porco")])],
  },
  {
    id: "spring-rolls-samosa", category: "starters", name: "Spring Rolls or Samosa", price: 6,
    description: text("Served 8 pieces with sweet chilli sauce", "Servido em 8 peças com molho de chilli doce"),
    options: [group("kind", "Choice", "Escolha", [opt("spring-rolls", "Spring Rolls", "Spring rolls"), opt("samosa", "Samosa", "Samosa")])],
  },
  {
    id: "chips-starter", category: "starters", name: "Chips", price: null,
    description: text("Chips served with sweet tomato or chilli sauce", "Batatas fritas servidas com molho doce de tomate ou de chilli"),
    options: [chipsSize],
  },

  // ---- Soup ----
  {
    id: "potato-soup", category: "soup", name: "Potato Soup", price: 6,
    description: text("Served with chorizo & plain toasted bread", "Servida com chouriço e pão torrado simples"),
  },
  {
    id: "tom-yum-prawns", category: "soup", name: "Tom Yum Prawns", price: 8,
    description: text("Clear spicy seafood broth", "Caldo de marisco picante e límpido"),
  },

  // ---- Main Course ----
  {
    id: "grilled-fish", category: "main", name: "Grilled Fish", price: 18, featured: true,
    description: text("Slice of fish fillet served with lemon & butter sauce, roasted rosemary potatoes & green salad", "Posta de filete de peixe com molho de limão e manteiga, batatas assadas com alecrim e salada verde"),
  },
  {
    id: "steak-bitoque", category: "main", name: "Steak (Bitoque)", price: 19,
    description: text("Porterhouse steak with chips, salad, fried egg", "Bife porterhouse com batatas fritas, salada e ovo estrelado"),
  },
  {
    id: "grilled-chicken", category: "main", name: "Grilled Chicken", price: 15,
    description: text("Served with roast potato and salad", "Servido com batata assada e salada"),
  },
  {
    id: "grilled-pork-belly", category: "main", name: "Grilled Pork Belly", price: 15,
    description: text("Served with roast potato and salad", "Servida com batata assada e salada"),
  },
  {
    id: "saute-prawns", category: "main", name: "Sauté Prawns", price: 18,
    description: text("Prawns served with green salad and garlic bread", "Gambas servidas com salada verde e pão de alho"),
  },
  {
    id: "satay-main", category: "main", name: "Satay (Main Course)", price: 12,
    description: text("6 satay sticks served with steamed rice and chilli", "6 espetadas satay servidas com arroz branco e chilli"),
    options: [group("meat", "Choice", "Escolha", [opt("chicken", "Chicken", "Frango"), opt("pork", "Pork", "Porco")])],
  },
  {
    id: "chicken-curry", category: "main", name: "Chicken Curry", price: 15,
    description: text("Served with steamed rice and salad", "Servido com arroz branco e salada"),
  },
  {
    id: "spaghetti", category: "main", name: "Spaghetti", price: 15,
    description: text("Bolognaise or Carbonara with garlic bread", "À bolonhesa ou à carbonara, com pão de alho"),
    options: [group("sauce", "Sauce", "Molho", [opt("bolognaise", "Bolognaise", "Bolonhesa"), opt("carbonara", "Carbonara", "Carbonara")])],
  },
  {
    id: "mie-goreng", category: "main", name: "Mie Goreng", price: 10,
    description: text("Fried noodles with chicken, sausage, prawns or mix", "Massa salteada (noodles) com frango, salsicha, gambas ou mista"),
    options: [group("with", "Choice", "Escolha", [opt("chicken", "Chicken", "Frango"), opt("sausage", "Sausage", "Salsicha"), opt("prawns", "Prawns", "Gambas"), opt("mix", "Mix", "Mista")])],
  },
  {
    id: "lauhata-special-fried-rice", category: "main", name: "Lauhata Special Fried Rice", price: 10, featured: true,
    description: text("Chicken, sausage, prawns and egg", "Frango, salsicha, gambas e ovo"),
  },
  {
    id: "grilled-burger", category: "main", name: "Grilled Burger", price: 12,
    description: text("Lettuce, tomato, onion and cheese, served with French fries", "Alface, tomate, cebola e queijo, servido com batatas fritas"),
    options: [group("meat", "Choice", "Escolha", [opt("beef", "Beef", "Vaca"), opt("chicken", "Chicken", "Frango")])],
  },
  {
    id: "club-sandwich", category: "main", name: "Club Sandwich", price: 10,
    description: text("Lettuce, tomato, chicken, bacon, egg. Served with French fries", "Alface, tomate, frango, bacon e ovo. Servida com batatas fritas"),
    options: [group("bread", "Bread", "Pão", [opt("toasted", "Toasted", "Torrado"), opt("plain", "Plain", "Simples")])],
  },

  // ---- Vegetarian ----
  {
    id: "vegetarian-fried-rice", category: "vegetarian", name: "Vegetarian Fried Rice", price: 8,
    description: text("Served with fried egg and green salad", "Servido com ovo frito e salada verde"),
  },
  {
    id: "spaghetti-pesto", category: "vegetarian", name: "Spaghetti Pesto", price: 8,
    description: text("Served with garlic bread", "Servido com pão de alho"),
  },
  {
    id: "vegetable-curry", category: "vegetarian", name: "Vegetable Curry", price: 8,
    description: text("Served with steamed rice and chapati", "Servido com arroz branco e chapati"),
  },
  {
    id: "vegetarian-dhal-fry", category: "vegetarian", name: "Vegetarian Dhal Fry", price: 8,
    description: text("Served with steamed rice and chapati", "Servido com arroz branco e chapati"),
  },
  {
    id: "stir-fry-vegetables", category: "vegetarian", name: "Stir-fry Vegetables", price: 6,
    description: text("Local vegetables", "Legumes locais"),
  },

  // ---- Side Order ----
  { id: "sauteed-vegetables", category: "sides", name: "Sauteed Vegetables", price: 4 },
  { id: "green-salad", category: "sides", name: "Green Salad", price: 4 },
  { id: "chips-side", category: "sides", name: "Chips", price: null, options: [chipsSize] },
  { id: "spicy-potato-wedges", category: "sides", name: "Spicy Potato Wedges", price: 5 },
  { id: "garlic-bread", category: "sides", name: "Garlic Bread", price: 4 },
  { id: "steam-rice", category: "sides", name: "Steam Rice", price: 2 },

  // ---- Dessert (based on availability) ----
  { id: "cheesecake", category: "dessert", name: "Cheesecake", price: 5 },
  { id: "orange-cake", category: "dessert", name: "Orange Cake", price: 5 },
  { id: "chocolate-mud-cake", category: "dessert", name: "Chocolate Mud Cake", price: 5 },
  { id: "red-velvet-cake", category: "dessert", name: "Red Velvet Cake", price: 5 },
  { id: "mixed-ice-cream", category: "dessert", name: "Mixed Ice Cream", price: 4 },
  { id: "fruit-platter", category: "dessert", name: "Fruit Platter", price: 5 },

  // ---- Pizza (the printed prices are handwritten labels stuck above each name: confirm them) ----
  {
    id: "pizza-margarita", category: "pizza", name: "Margarita", price: 17, confirm: true,
    description: text("Sliced tomato, feta & mozzarella", "Tomate em fatias, feta e mozzarella"),
  },
  {
    id: "pizza-pepperoni", category: "pizza", name: "Pepperoni", price: 20, confirm: true,
    description: text("Onion, mushroom, capsicum, olives, feta, pepperoni & mozzarella", "Cebola, cogumelos, pimento, azeitonas, feta, pepperoni e mozzarella"),
  },
  {
    id: "pizza-hawaiian", category: "pizza", name: "Hawaiian", price: 20, confirm: true,
    description: text("Ham, pineapple, feta & mozzarella", "Fiambre, ananás, feta e mozzarella"),
  },
  {
    id: "pizza-spicy-chicken", category: "pizza", name: "Spicy Chicken", price: 20, confirm: true,
    description: text("Chicken, bacon, chilli, feta & mozzarella", "Frango, bacon, chilli, feta e mozzarella"),
  },
  {
    id: "pizza-lauhata-seafood", category: "pizza", name: "Lauhata Seafood", price: 21, confirm: true, featured: true,
    description: text("Tuna, prawns, feta & mozzarella", "Atum, gambas, feta e mozzarella"),
  },
  {
    id: "pizza-meat-lover", category: "pizza", name: "Meat Lover", price: 21, confirm: true,
    description: text("Onions, olives, chicken, sausages, ham, pepperoni, bacon, feta & mozzarella", "Cebola, azeitonas, frango, salsichas, fiambre, pepperoni, bacon, feta e mozzarella"),
  },
].map((d) => ({ options: [], image: null, ...d }));
