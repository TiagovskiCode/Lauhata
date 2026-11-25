// Photo registry. `src` is "foto:<slug>": the files src/assets/img/fotos/<slug>-<width>.webp, made by tools/revelar-fotos.mjs from the
// originals; the widths and the size of the picture are read from the files themselves.
//   placeholder  true = the picture does not show Lauhata (it is labelled wherever it appears)
//   group        places a real photograph in the gallery page: "lauhata", "stay", "coast" or "around"
//   kind         "room" = the inside of a room type (none yet)
export default {
  // The home hero: the first frame of the film (tools/filme-hero.mjs writes both), and on a phone the same place, upright.
  heroFilmCover: {
    src: "foto:hero-filme",
    alt: {
      en: "Lauhata from the sea side: the dark-sand beach, the restaurant among the palm trees",
      pt: "O Lauhata visto do mar: a praia de areia escura, o restaurante entre as palmeiras",
    },
    placeholder: false,
  },
  heroPortrait: {
    src: "foto:costa-retrato",
    alt: {
      en: "Lauhata from the sea side: the dark-sand beach, the restaurant among the palm trees",
      pt: "O Lauhata visto do mar: a praia de areia escura, o restaurante entre as palmeiras",
    },
    placeholder: false,
  },
  // Lauhata from the beach, the sea and the air.
  restaurantBeach: {
    src: "foto:restaurante-praia",
    alt: {
      en: "Lauhata's restaurant behind its palm trees, seen from the beach side",
      pt: "O restaurante do Lauhata atrás das palmeiras, visto do lado da praia",
    },
    placeholder: false,
    group: "lauhata",
  },
  beachFront: {
    src: "foto:lauhata-praia-do-mar",
    alt: {
      en: "Lauhata seen from the sea: the dark-sand beach, tables in the shade, the palm trees and the mountains behind",
      pt: "O Lauhata visto do mar: a praia de areia escura, mesas à sombra, as palmeiras e as montanhas atrás",
    },
    placeholder: false,
    group: "lauhata",
  },
  coastMountains: {
    src: "foto:costa-montanhas",
    alt: {
      en: "Lauhata seen from the sea: the dark-sand beach, the palm trees and the Liquiçá mountains behind",
      pt: "Lauhata visto do mar: a praia de areia escura, as palmeiras e as montanhas de Liquiçá atrás",
    },
    placeholder: false,
    group: "lauhata",
  },
  aerialGarden: {
    src: "foto:aerea-lugar",
    alt: {
      en: "Aerial view of Lauhata: the building among its garden, trees and palm trees",
      pt: "Vista aérea do Lauhata: o edifício entre o jardim, as árvores e as palmeiras",
    },
    placeholder: false,
    group: "lauhata",
  },
  aerialTop: {
    src: "foto:vista-de-cima",
    alt: {
      en: "Lauhata from directly above: the garden, the buildings, the beach and the sea",
      pt: "O Lauhata visto de cima: o jardim, os edifícios, a praia e o mar",
    },
    placeholder: false,
    group: "lauhata",
  },
  // The outside of the rooms: doors, veranda and garden. They are the accommodation, not one room type.
  stayVeranda: {
    src: "foto:quartos-varanda",
    alt: {
      en: "The rooms' veranda, with wooden chairs and a table",
      pt: "A varanda dos quartos, com cadeiras de madeira e uma mesa",
    },
    placeholder: false,
    group: "stay",
  },
  stayEntrance: {
    src: "foto:quarto-entrada",
    alt: {
      en: "A room's door and the wooden bench on the veranda",
      pt: "A porta de um quarto e o banco de madeira na varanda",
    },
    placeholder: false,
    group: "stay",
  },
  stayWalkway: {
    src: "foto:quartos-corredor",
    alt: {
      en: "The veranda that runs past the rooms, between plants and the garden",
      pt: "A varanda que liga os quartos, entre plantas e o jardim",
    },
    placeholder: false,
    group: "stay",
  },
  stayGarden: {
    src: "foto:quartos-jardim",
    alt: {
      en: "The rooms' building behind the palm trees, seen from the garden",
      pt: "O edifício dos quartos atrás das palmeiras, visto do jardim",
    },
    placeholder: false,
    group: "stay",
  },
  gardenTable: {
    src: "foto:jardim-varanda",
    alt: {
      en: "A table in the garden, beside the rooms' veranda",
      pt: "Uma mesa no jardim, junto à varanda dos quartos",
    },
    placeholder: false,
    group: "stay",
    hide: true, // a parked car and a fire extinguisher in the frame
  },
  // The evening.
  sunsetSea: {
    src: "foto:por-do-sol-mar",
    alt: {
      en: "The path of the setting sun's light across the sea, with the coast beyond",
      pt: "O caminho de luz do sol poente sobre o mar, com a costa ao fundo",
    },
    placeholder: false,
    group: "coast",
  },
  sunsetPalmsHigh: {
    src: "foto:por-do-sol-palmeiras-alto",
    alt: {
      en: "Sunset over the sea, with the palm trees in silhouette",
      pt: "Pôr do sol sobre o mar, com as palmeiras em silhueta",
    },
    placeholder: false,
    group: "coast",
  },
  sunsetPalms: {
    src: "foto:por-do-sol-palmeiras",
    alt: {
      en: "Palm trees in silhouette against the late-afternoon sky and the sea",
      pt: "Palmeiras em silhueta contra o céu do fim da tarde e o mar",
    },
    placeholder: false,
    group: "coast",
  },
  sunsetGarden: {
    src: "foto:por-do-sol-jardim",
    alt: {
      en: "The sun setting over the sea, seen between the palm trees and the garden trees",
      pt: "O sol a pôr-se sobre o mar, visto entre as palmeiras e as árvores do jardim",
    },
    placeholder: false,
    group: "coast",
  },
  // The coast around Lauhata. The ruins were identified by Tiago on 5 Nov 2026 as the Aipelo prison.
  coastVillage: {
    src: "foto:costa-aldeia-cima",
    alt: {
      en: "Aerial view of the coast: the sea, the beach and the houses among the trees",
      pt: "Vista aérea da costa: o mar, a praia e as casas entre as árvores",
    },
    placeholder: false,
    group: "around",
  },
  seaCanoe: {
    src: "foto:mar-canoa",
    alt: {
      en: "A canoe with three people on the blue sea, by the breaking waves",
      pt: "Uma canoa com três pessoas no mar azul, junto à rebentação",
    },
    placeholder: false,
    group: "around",
  },
  ruinsAerial: {
    src: "foto:arredores-ruinas",
    alt: {
      en: "The ruins of Aipelo prison by the coast, seen from above",
      pt: "As ruínas da prisão de Aipelo junto à costa, vistas de cima",
    },
    placeholder: false,
    group: "around",
  },
  ruinsTop: {
    src: "foto:arredores-ruinas-cima",
    alt: {
      en: "The grounds of the Aipelo prison ruins, between the road and the beach, seen from above",
      pt: "O recinto das ruínas da prisão de Aipelo, entre a estrada e a praia, visto de cima",
    },
    placeholder: false,
    group: "around",
  },
  // Places in Discover Liquiçá that nobody has photographed for Lauhata yet: Wikimedia Commons, credited on the privacy page
  // (temp-photos.json) and labelled illustrative. Replace the file and set placeholder: false when there is a photograph.
  placeMaubaraFort: {
    src: "foto:lugar-forte-maubara",
    alt: {
      en: "The entrance of Maubara fort, in the shade of the trees",
      pt: "A entrada do forte de Maubara, à sombra das árvores",
    },
    placeholder: true,
  },
  placeLiquicaCentre: {
    src: "foto:lugar-centro-liquica",
    alt: {
      en: "The church in the centre of Liquiçá",
      pt: "A igreja no centro de Liquiçá",
    },
    placeholder: true,
  },
};
