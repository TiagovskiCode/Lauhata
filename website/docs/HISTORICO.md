# Lauhata — website (restaurante + alojamento)

Website bilingue (PT/EN) do Lauhata, em Lauhata, Liquiçá, Timor-Leste. Combina o âmbito dos pacotes
**Restaurante & Café** e **Hotel & Alojamento** da Elevate Web Studio, com reservas por WhatsApp.

HTML, CSS e JavaScript nativos, sem framework. Um script de build em Node (sem dependências) gera
as páginas em português e em inglês, cada uma no seu URL, o que é melhor para o SEO.

O design segue a mockup aprovada «Lauhata — Restaurante & Hotel» (PDF): títulos em Noto Serif
Display, texto em Manrope, cores creme `#F6F0E4`, verde `#0F2E28`, terracota `#A8432A`,
dourado `#C89640` e azul-petróleo `#2F6E73`, faixa de tais e mapa ilustrado da costa.

### A landing page

A homepage (`home()` em `src/pages.mjs`, estilos em `src/assets/css/home.css`) conta um dia na costa e
usa o **arco** como forma de assinatura (hero, quartos e tais). Sequência:

1. **Hero:** ecrã inteiro. Primeiro aparece a **capa do vídeo** (`heroCover` em `images.mjs`, ficheiros `hero-capa-*.jpg`: o primeiro
   frame da filmagem de drone do Lauhata). A capa fica sozinha ~1,3 s; o vídeo (`heroVideo` em `site.mjs`, `src/assets/video/hero.mp4`) carrega
   por trás, parado nesse mesmo frame, e depois toca e entra em fusão (1,6 s) por cima da capa: como é o mesmo frame e o mesmo
   enquadramento, a capa parece começar a mexer-se. O vídeo toca sempre e em loop (também com «movimento reduzido», por decisão do dono),
   sem botão de pausa: se algo o parar, recomeça. Só espera fora do ecrã; não é descarregado com poupança de dados nem ligação 2G
   (fica só a capa) e, se falhar, a capa fica. **Para trocar de vídeo:** reduzir (1280×720, ~1,6 Mbps, sem áudio), cortar frames
   iniciais que não sejam a filmagem real (o original tinha 3 frames de um «cartaz» diferente) e gerar a capa com o primeiro frame do
   vídeo reduzido, para a fusão ser invisível. O original fica em `videos-originais/` (não é publicado). Sobre a pesquisa do cartão de
   reserva: começa só com **Restaurante** e **Alojamento**; os campos (data, hora, pessoas, ou entrada, saída, hóspedes) aparecem
   depois de escolher, e o pedido segue sempre por WhatsApp.2. **Comer / Dormir:** uma frase curta e dois painéis grandes (um retângulo, um arco) que levam à ementa e aos quartos.
3. **01 · Comer:** fotografia, horário (do PDF da ementa) e os pratos mais escolhidos, com botão de adicionar ao pedido.
4. **O pequeno-almoço:** foto larga, o horário em grande (de `restaurantHours`) e as linhas reais da ementa da manhã. O texto
   «café, sabores locais» é o do briefing e **não vem da ementa impressa**: confirmar com o Lauhata.
5. **02 · Dormir:** os três quartos em painéis que se abrem ao passar o rato ou ao focar (no telemóvel, cartões empilhados), com
   uma frase curta (`tagline` em `rooms.mjs`) e «Consultar disponibilidade» por WhatsApp com o nome do quarto. A capacidade e as
   comodidades só aparecem quando `roomDetailsConfirmed` for `true` em `site.mjs`; preços só com `price` preenchido.
6. **Um dia no Lauhata:** palco de ecrã inteiro que fica fixo (`position: sticky`) enquanto se faz scroll. Cinco fotografias aéreas
   reais fundem-se uma na outra, a cor (grade) vai da manhã azul ao entardecer laranja, a hora aparece em grande e uma régua
   dourada em baixo conta as horas. Animado com GSAP (`cinema.js`). Sem JavaScript, sem GSAP ou se algo falhar, vira uma lista simples
   de cinco fotos com texto. São sugestões, não horários de funcionamento: a página di-lo sempre.
7. **O dia termina melhor aqui:** foto de entardecer e duas ações («Descobrir o restaurante», «Reservar alojamento»).
8. **04 · Cultura:** em terracota, o tais num arco duplo, informação geral sobre Timor-Leste separada do espaço reservado para a
   história real do Lauhata, e «Mai, han, toba.» em grande (tradução por confirmar).
9. **Fotografias:** grelha só com as fotos marcadas como reais em `images.mjs` (`placeholder: false`); cresce sozinha quando
   se acrescentam fotos reais. Cada foto abre no lightbox do site (teclado: Enter, setas, Escape). Sem JavaScript é um link para a
   foto grande. Hoje são 4 frames do vídeo de drone.
10. **Visite o Lauhata:** localização, horários e reservas em três grupos, ao lado de um mapa real do Google com «Obter direções»
   e «Abrir no Google Maps». Sem coordenadas o mapa pesquisa pelo nome (`mapQuery`) e diz-o; ao preencher `geo` em `site.mjs` passa
   a usar as coordenadas.
11. **Convite final:** a vista aérea real da costa, «A sua escapada junto ao mar começa aqui.» e duas ações separadas
    («Consultar quartos» e «Reservar mesa»), antes do rodapé.

**Fase 3 (novembro 2026) — «menos, mas melhor».** A home ficou com: herói (vídeo real, «Liquiçá · Timor-Leste», título e uma
frase), uma frase sobre o Lauhata com foto aérea real, **Comer & Ficar** (dois painéis fotográficos de pesos diferentes com um
«&» dourado; as fotos estão em `DUO_PHOTOS` em `pages.mjs` e continuam ilustrativas até haver fotos reais), uma antevisão do
«Sobre nós» e o convite final. As secções antigas (dia no Lauhata, pequeno-almoço, entardecer, cultura, FAQ, mapa, galeria)
saíram da home: a galeria e a cultura estão em **Sobre nós** (`/sobre-nos/`), a FAQ e o mapa em **Contactos**. Nova página
**A nossa história** (`/a-nossa-historia/`) com os capítulos ainda não contados marcados como tal. Navegação: Início, Ementa,
Alojamento, Sobre nós, A nossa história, Contactos. **Dois tipos de quarto** (Quarto Vista Mar e Suite Família); o Quarto Jardim
saiu. **Ementa:** cada prato tem o seu espaço de fotografia (`src/assets/img/pratos/<id>-640.jpg`); a lista completa e o estado
de cada foto estão em `FOTOS-PRATOS.md`, gerado pelo build.

**Fase 4 (novembro 2026).**
- **Páginas:** Início, Ementa, Alojamento, Sobre nós, Eventos (`/eventos/`), Galeria (`/galeria/`), Contactos. «A nossa
  história» saiu enquanto não houver história verificada (fica dentro de «Sobre nós» quando existir).
- **Reservas:** o botão «Reservar» do cabeçalho, os botões do herói («Reservar mesa», «Ver quartos») e a barra do telemóvel
  abrem um diálogo com o pedido de mesa (data, hora, pessoas) ou de quarto (entrada, saída, hóspedes, quarto). Sem
  JavaScript são links para os formulários completos.
- **Ementa:** aviso «Pedidos para consumo no restaurante. Não disponibilizamos delivery nem take-away.» na ementa e no
  carrinho; a mensagem de WhatsApp diz «para consumo no restaurante»; o carrinho mostra a miniatura de cada prato.
- **Avaliações:** a secção «Experiências que ficam na memória» e o rodapé ligam à página oficial do Tripadvisor. A nota e o
  número de avaliações só aparecem quando preenchidos em `site.reviews.tripadvisor` (`rating`, `count`, `checked`), copiados à
  mão da página. Não se copiam textos de avaliações (exige autorização).
- **Notas internas** («a confirmar», «por configurar») já não aparecem ao público: campos sem dados ficam escondidos e o
  preço diz «sob consulta». As etiquetas «Imagem ilustrativa» continuam sempre visíveis.

**Fase 8 — refinamento a partir do feedback do cliente (5 de novembro de 2026).** Ver `RELATORIO-FASE-8.md`,
`DIRECAO-CRIATIVA.md` (pesquisa e auditoria), `FOTOGRAFIAS.md` (fotos e lista para o Carlos) e `CHECKLISTS.md`.
- **Opiniões:** notas verificadas em `site.mjs` (`reviews.tripadvisor`, `reviews.booking`, com a data). Resumos nossos
  de avaliações públicas em `src/data/reviews-external.mjs`: o texto das avaliações não é copiado.
- **Suites:** nomes provisórios «Suite King» e «Suite King & Single» (`rooms.mjs`). As moradas novas são `suite-king` e
  `suite-king-e-solteiro`/`suite-king-and-single`; as antigas reencaminham para as novas (criadas pelo `build.mjs`).
- **Vídeo do herói:** `src/assets/video/hero-hd.mp4` (1920px) e `hero-hd-1280.mp4` (telemóveis). A capa é o primeiro
  fotograma (`hero-capa-hd`).
- **Mapas:** `mapEmbed()` em `pages.mjs` procura «Lauhata Beach Escape» (o marcador coincide com as coordenadas
  oficiais), com zoom 15.
- **Ecrãs grandes:** a partir de 1920px a escala de tipo e a largura do conteúdo crescem juntas (`editorial.css`).

**Fase 7 — direção «Diário da costa» (5 de novembro de 2026).** Ver `DIRECAO-CRIATIVA.md` (pesquisa, diagnóstico,
sistema visual, lista de fotografias para o Carlos).
- **CSS:** `src/assets/css/editorial.css`, carregado depois de todos os outros, define a nova linguagem: papel Soft
  Cream e capítulos Deep Ocean, fotos sem cantos, botões retangulares, sem rótulo por cima de cada título, o fio de tais.
- **Legendas:** `figure(t, key, { credit: true })` (em `lib.mjs`) acrescenta por baixo da foto o que ela mostra e
  «Fotografia real» ou «Imagem ilustrativa». Usado no início e nos heróis das páginas.
- **Início:** herói com coordenadas reais; frase de apresentação com foto suspensa; Comer & Ficar de ponta a ponta;
  capítulo noturno da costa com três fotos reais; eventos; Descobrir Liquiçá; convite; opiniões.
- **Ementa:** cada categoria é um capítulo, com o nome fixo à esquerda e os pratos em linhas à direita, e fotos
  pequenas (são ilustrativas). O carrinho e o WhatsApp não mudaram.
- **Quartos:** Quarto Vista Mar fica no oceano noturno; a Suite Família fica numa faixa de areia.

**Fase 6 (4 de novembro de 2026).** Ver também `CHECKLISTS.md` (fontes, confirmações pendentes, conteúdo temporário,
produção, Google Business Profile, QR da ementa, manutenção e âmbito).
- **Contacto e morada:** WhatsApp/telefone +670 7740 1111 e morada/coordenadas da Autoridade Municipal de Liquiçá, num só
  sítio (`site.mjs`). O Carlos deve confirmar.
- **Quartos:** camas e televisão confirmadas pelo dono (`rooms.mjs`); cada quarto tem um carrossel com 3 fotos (deslizar,
  botões, setas do teclado, contador, lightbox). As fotos dos quartos continuam ilustrativas e etiquetadas.
- **Pedido de quarto:** adultos e crianças, email e telefone opcionais, um passo de revisão com a mensagem exata antes de
  abrir o WhatsApp e a nota de que o pagamento é feito presencialmente no Lauhata.
- **Eventos:** formulário em 5 passos (evento, convidados, preferências, ideia, contacto) com revisão antes do WhatsApp.
- **Contactos:** formulário «Escreva-nos» com assunto; mapa no ponto oficial.
- **Ementa:** cada prato tem uma foto temporária própria (Wikimedia Commons, licenças livres) com a etiqueta «Imagem
  ilustrativa» e créditos na página de privacidade (`tools/fotos-temporarias.mjs` e `tools/otimizar-temporarias.ps1`).
  Bebidas de exemplo (`sample-drinks.mjs`), sem preço e sem botão de pedir, desligáveis com `showSamples: false`.
- **Home:** herói com parágrafo, três caminhos (mesa, quartos, WhatsApp) e uma faixa de informação; praia em panorama,
  convite para eventos.
- **Galeria:** mosaico editorial com filtros. **Sobre nós:** o que é o Lauhata, em resumo, com fontes verificadas.
- **Descobrir Liquiçá:** mapa e distância em linha reta a partir das coordenadas oficiais (nunca tempos de viagem).

**Fase 5 (novembro 2026).**
- **Seletores no diálogo de reserva:** o calendário, a hora e as listas abriam por trás do diálogo. Causa: o diálogo modal
  fica na «top layer» do navegador, acima de qualquer z-index, e o seletor era anexado ao `<body>`. Agora o seletor abre
  dentro do diálogo que contém o campo (`picker.js`, função `show`). O diálogo também mostrava os dois formulários ao mesmo
  tempo (uma regra `display: grid` anulava `[hidden]`); corrigido.
- **«Descer»** foi retirado da home.
- **Descobrir Liquiçá** (`/descobrir-liquica/`): lugares e factos da página oficial de turismo (timorleste.tl, município de
  Liquiçá), creditada na página. Sem distâncias, tempos de viagem, preços nem passeios: nada disso está confirmado.
- **Opiniões** (última secção da home): ligação ao Tripadvisor e opiniões deixadas no site. O formulário envia a opinião ao
  Lauhata pelo WhatsApp (com o consentimento para publicar); só aparece no site depois de copiada para
  `src/data/reviews.mjs` (instruções no próprio ficheiro). O GitHub Pages é estático: não há servidor nem base de dados, por
  isso a moderação é feita pelo dono neste ficheiro. Se um dia houver um serviço (por exemplo um formulário com base de
  dados), o formulário pode passar a enviar para lá.
- **Bebidas:** categoria preparada em `menu.mjs` (grupos água, sumos, café, cerveja, vinho, …). Fica escondida até haver bebidas
  reais com preço: a ementa impressa não tem carta de bebidas.
- **Navegação:** Ementa, Alojamento, Sobre nós, Eventos, Galeria, Descobrir Liquiçá, Contactos (o logótipo leva ao início). O
  menu completo aparece a partir de 1360 px; abaixo, o botão de menu.

Inventário das fotografias reais de drone (originais em `fotos-originais/drone-2026-11/`):

| Chave (`images.mjs`) | Mostra | Onde é usada |
|---|---|---|
| `beachFront` | O Lauhata visto do mar: praia, mesas, palmeiras, montanhas | Comer & Ficar (Comer), Eventos, Restaurante (formulário), Galeria |
| `aerialCoast` | Vista aérea do jardim à praia | Comer & Ficar (Ficar), Galeria |
| `sunsetPalmsHigh` | Pôr do sol com palmeiras | Ementa (herói), Alojamento (formulário), Galeria |
| `sunsetGarden` | Pôr do sol entre as árvores do jardim | Home (introdução), Galeria |
| `sunsetSea` | Caminho de luz no mar | Alojamento (herói), Galeria |
| `sunsetPalms` | Palmeiras em silhueta | Eventos (herói), Galeria |
| `seaCanoe` | Canoa com três pessoas no mar | Home (Sobre nós), Galeria |
| `coastVillage` | A costa e as casas vistas de cima | Contactos (herói), Galeria |
| `ruinsAerial`, `ruinsTop` | Ruínas de pedra junto à costa (nome e local por confirmar) | Galeria, «Nos arredores» |

As restantes 7 fotos de pôr do sol eram quase iguais às escolhidas e não foram usadas. Fotos dos quartos e dos pratos continuam
em falta (ver `FOTOS-PRATOS.md`).

Páginas interiores:
- **Alojamento:** capacidade e comodidades dos quartos só aparecem com `roomDetailsConfirmed: true`; até lá, uma linha diz
  «Detalhes do quarto a confirmar». A galeria de imagens ilustrativas desta página foi retirada (repetia as fotos acima).
- **Página de cada quarto:** frase do quarto, descrição, ficha do quarto (tipo, capacidade, camas, no quarto, entrada e saída,
  preço) com «A confirmar» em tudo o que o Lauhata ainda não confirmou, cartão «Pedir este quarto» (abre o formulário com o
  quarto escolhido, ou WhatsApp), «Ver todos os quartos» e os outros dois quartos com foto.
- **Ementa:** lista de carta impressa (nome e preço na mesma linha, descrição por baixo, botão «Adicionar/Escolher»), sem cartões.
- **Fecho do Restaurante e dos Contactos:** o mesmo convite final da home, com fotografias aéreas reais (a foto de stock de
  outro resort e a frase sobre eventos saíram).

Tipografia: Cormorant Garamond nos títulos, Manrope no texto e na interface (ambas em `src/assets/fonts`).
`siteUrl` em `site.mjs` aponta para o endereço do GitHub Pages (`https://tiagovskicode.github.io/Lauhata/website/dist`):
trocar pelo domínio final quando existir.

A faixa de tais só aparece nas costuras (fim do hero e antes da cultura). Por cima há uma camada de
movimento (`cinema.css` e a secção «Cinematic motion» de `main.js`, sem bibliotecas): cortina com o
logótipo na primeira visita (fica enquanto a página carrega, de 1,6 a 4 s), texto que se acende com o
scroll, revelações das imagens, parallax, linha do dia desenhada com o scroll, cursor personalizado e
botões magnéticos. Tudo se desliga com «movimento reduzido» no sistema.

Os pratos e quartos em destaque vêm de `featured: true` em `menu.mjs` e `rooms.mjs`. A fotografia do hero
é a chave `heroSunset` em `images.mjs`.

Tudo se desliga com «movimento reduzido» no sistema.

### Seletores (calendário, hora, pessoas)

Nenhum formulário usa os seletores nativos do navegador. `src/assets/js/picker.js` (estilos em
`picker.css`) desenha por cima dos campos marcados com `data-pick`:

- `date`: calendário de um dia (segunda-feira primeiro, dias passados desativados, «Hoje» e «Limpar»).
- `in` + `out`: calendário de entrada e saída num só (2 meses em desktop, 1 no telemóvel), com pré-visualização
  do intervalo e contagem de noites.
- `time`: grelha de horas de 30 em 30 minutos, calculadas a partir de `restaurantHours` em `site.mjs` (a última
  é meia hora antes de fechar) e agrupadas em manhã, tarde e noite.
- `number`: pessoas/hóspedes com − e +. `select`: lista de tipos de quarto.

O `<input>`/`<select>` original continua no formulário, escondido, e é ele que o resto do código lê; sem
JavaScript o navegador mostra o seu seletor normal. No telemóvel o seletor abre como uma folha em baixo.
Teclado: setas movem o dia, PageUp/PageDown mudam de mês, Esc fecha.

## Comandos

Corre-os dentro da pasta `website/`:

```bash
npm run build      # gera dist/ a partir de src/ e lista o que ainda falta antes de publicar
npm run preview    # build + servidor local em http://localhost:8080
npm run prelaunch  # como o build, mas falha enquanto houver bloqueios (domínio, WhatsApp)
```

A auditoria técnica e a lista do que depende do cliente, do domínio e do Google Business Profile
estão em [AUDITORIA.md](AUDITORIA.md).

Para publicar, envia o conteúdo de `dist/` para qualquer alojamento estático (Netlify, Vercel,
Cloudflare Pages, cPanel…). O site tem de ficar na raiz do domínio.

## Fotografias

Os originais (PNG, ~2,5 MB cada) ficam em `fotos-originais/`, fora do site publicado. O script
`tools/otimizar-fotos.ps1` (Windows) gera em `src/assets/img/fotos/` três JPEG por foto
(640, 1080 e 1600 px) e a imagem de partilha `og-image.jpg` (1200×630):

```bash
powershell -ExecutionPolicy Bypass -File tools/otimizar-fotos.ps1
```

Para uma foto nova: junta o original a `fotos-originais/`, acrescenta-a à lista `$map` do script,
corre-o e regista-a em `src/data/images.mjs` com `src: "foto:<nome>"` e `width` (largura original).
O site escolhe sozinho o tamanho certo para cada ecrã.

## Onde mudar o conteúdo

| Ficheiro | O que contém |
| --- | --- |
| `src/data/site.mjs` | Domínio, WhatsApp, telefone, email, horários, check-in/out, tempo de resposta, redes sociais, comodidades, Google Analytics |
| `src/data/menu.mjs` | A ementa: 9 categorias e 53 pratos copiados da ementa impressa (preço, opções, foto) |
| `src/data/rooms.mjs` | Tipos de quarto: cada um gera a sua página nas duas línguas |
| `src/data/images.mjs` | Fotografias: `foto:<nome>` (fotos próprias em `assets/img/fotos/`) ou `unsplash:<id>`. `placeholder: true` = imagem ilustrativa, não mostra o Lauhata |
| `src/i18n/pt.mjs`, `en.mjs` | Todos os textos, títulos SEO e mensagens de WhatsApp |

Os campos vazios ficam escondidos ou aparecem como «a confirmar» até serem preenchidos.

## Páginas

| PT | EN | Pacote |
| --- | --- | --- |
| `/` | `/en/` | Início |
| `/restaurante/` (ementa interativa com pedido por WhatsApp + reserva de mesa) | `/en/restaurant/` | Restaurante |
| `/alojamento/` (quartos + pedido de reserva) | `/en/stay/` | Alojamento |
| `/alojamento/quarto-jardim/`, `/quarto-vista-mar/`, `/suite-familia/` | `/en/stay/garden-room/`, `/sea-view-room/`, `/family-suite/` | 1 página por tipo de quarto |
| `/contactos/` (mapa, acesso, FAQ) | `/en/contact/` | Localização |
| `/obrigado/`, `/privacidade/`, `/404.html` | equivalentes em `/en/` | Páginas utilitárias |

São 7 páginas de conteúdo (com 3 tipos de quarto) mais 3 utilitárias. «Experiências» e «A nossa
história» são secções da homepage, não páginas próprias. O número final de páginas e o orçamento
do projeto combinado ainda têm de ser acordados com o cliente.

## O que falta do Lauhata

- [ ] Número de WhatsApp (os formulários abrem o WhatsApp sem destinatário até lá)
- [ ] Telefone e email
- [ ] Domínio final (`siteUrl`; agora `https://lauhata.example`)
- [ ] Horário do restaurante e horas de check-in/check-out
- [ ] Tempo de resposta habitual às reservas
- [ ] Coordenadas exatas e indicações de acesso
- [ ] Fotografias reais: espaço, pratos, quartos, equipa. As fotos atuais são ilustrativas; ainda
  vêm do Unsplash o Quarto Vista Mar, algumas varandas, a costa aérea e o pôr do sol final
- [ ] Tipos de pedido que o restaurante aceita (consumo no local, para levar, entrega): `order.types` em `site.mjs`
- [ ] Fotografias de cada prato (a ementa mostra os pratos sem imagem até haver fotos reais)
- [ ] Confirmar os 6 preços das pizzas (na ementa impressa estão escritos à mão)
- [ ] História do espaço (o texto entre [ ] na secção «A nossa história»)
- [ ] Avaliações reais: nota média, número de avaliações e 3 citações (secção «O que dizem os nossos hóspedes»)
- [ ] Tempo de viagem a partir de Díli (`driveFromDili`)
- [ ] Redes sociais e link para a página de avaliações (Google/TripAdvisor)

### Conteúdo que veio da mockup e tem de ser confirmado

Os textos abaixo estão no site porque estão no design, mas são afirmações sobre o negócio:

- Quartos: Quarto Jardim, Quarto Vista Mar e Suite Família, com as respetivas comodidades
  (ar condicionado, Wi-Fi, pequeno-almoço, sala, varanda…) e capacidades
- Quais são os pratos e quartos «mais escolhidos» (agora: Grilled Fish, Lauhata Special Fried Rice,
  Lauhata Seafood; Quarto Jardim e Quarto Vista Mar). Foram escolhidos sem dados de vendas
- Receção 24 horas (agora «a confirmar») e o tempo de resposta (agora sem promessa de tempo)
- «Um dia no Lauhata»: café de Ermera, snorkel, passeios em Liquiçá, jantar ao pôr do sol
- Pequeno-almoço no restaurante com café de Timor
- A versão em tétum (botão TET no design) não foi incluída: é um idioma adicional, extra do pacote
- [ ] ID do Google Analytics, se quiserem estatísticas
- [ ] Revisão da política de privacidade

Quando tudo estiver preenchido, muda `showPlaceholderNotes` para `false` em `src/data/site.mjs`.

## Ementa e pedido por WhatsApp

A ementa (`src/data/menu.mjs`) vem da ementa impressa do restaurante (`lauhata menu.pdf`): nomes,
descrições e preços em dólares, tal como estão impressos. As descrições em PT são tradução das impressas.

- **Pesquisa e categorias:** pesquisa por nome ou ingrediente (sem diferenciar acentos) e uma barra de
  categorias que fica visível ao fazer scroll e desliza na horizontal no telemóvel.
- **Opções:** o que a ementa oferece como escolha («ovos mexidos, fritos ou estrelados», «Bolonhesa ou
  Carbonara», «Small / Large») vira um grupo de opções obrigatório. Uma escolha com `price` (as batatas
  fritas) define o preço do prato; as outras não alteram o preço.
- **Carrinho:** botão no cabeçalho (com contagem) e botão flutuante «Ver pedido» com o total, em todas as
  páginas. Mesmo prato com as mesmas opções soma a quantidade; a quantidade vai de 1 a 20 e, ao descer de
  1, o prato sai. Fica guardado neste navegador (`localStorage`, 24 h). Um prato sem preço não se adiciona.
- **Finalizar:** pede o nome (e, se estiverem configurados em `order.types` de `site.mjs`, o tipo de
  pedido e o número da mesa) e abre o WhatsApp com a mensagem preenchida. O pedido **não fica confirmado**
  por abrir o WhatsApp: o carrinho só se limpa na página «Obrigado», pelo botão «Limpar o pedido».
- **Número de WhatsApp:** um só sítio, `whatsapp` em `src/data/site.mjs` (o site usa-o em todos os botões).
  Enquanto estiver vazio, o WhatsApp abre sem destinatário. `npm run prelaunch` avisa disso.
- **Tipos de pedido:** `order.types` está vazio de propósito. Exemplo:
  `{ id: "dine-in", label: { pt: "Comer no restaurante", en: "Dine in" }, askTable: true }`.
- **Fotos dos pratos:** quando houver, junte a foto a `images.mjs` e ponha a chave no campo `image` do prato.
- **Código:** `src/assets/js/order.js` (carrinho, opções, checkout, mensagem, pesquisa), `src/assets/css/order.css`,
  marcação em `src/layout.mjs` (`cartUi`) e `src/pages.mjs` (`menuSection`, `dishCard`).

## Fora do âmbito (extras, só com aprovação)

Motor de reservas com disponibilidade em tempo real, calendário sincronizado, pagamentos ou
depósitos online, contas de cliente, painel de administração e integrações externas. O site não
simula nenhuma destas funções: o fluxo é sempre um **pedido** enviado por WhatsApp e confirmado
pelo Lauhata.

### Camada cinematográfica

Está no fim de `src/assets/css/design.css` («Cinema layer») e nas funções `sceneSection` (`pages.mjs`) e do cabeçalho.

- **Abertura:** no hero da home, duas barras pretas (letterbox) fecham a imagem e deslizam para fora ao carregar.
- **Look de filme:** grão e vinheta nas fotografias de ecrã inteiro (hero, cenas).
- **Cenas:** faixas de ecrã inteiro com uma fotografia aérea **real** (frames do vídeo de drone, `aerialGarden` e `aerialCoast` em
  `images.mjs`) e uma frase. A foto abre como um obturador ao entrar no ecrã e anda devagar contra o scroll. A página de Contactos também
  usa a fotografia aérea.
- **GSAP:** `src/assets/js/vendor/gsap.min.js` e `ScrollTrigger.min.js` (GSAP 3.13, licença gratuita, alojados no próprio site, sem CDN).
  `src/assets/js/cinema.js` corre depois de `main.js` e trata: o palco «Um dia no Lauhata» (fusões, cor, régua; todos os níveis),
  o obturador e a deriva das cenas, o parallax, e o hero (a imagem aproxima-se e o texto sobe e desaparece, com as duas linhas do título
  a afastar-se) na home e nas páginas interiores (nível B). Se o GSAP não carregar ou der erro, `cleanup()` devolve a página ao
  layout simples. O palco usa `sticky` e não `pin` do GSAP: o `pin` deslocava o ecrã inteiro (CLS 1.0) no momento em que fixava.
- **Entre páginas:** uma transição curta por preto (`@view-transition`; só opacidade).
- **Cabeçalho (≥1200 px):** logótipo à esquerda, menu exatamente ao centro, idioma, carrinho e «Reservar» à direita.
- **Movimento reduzido:** grão, vinheta, cenas e a transição por preto ficam sempre (são imagens paradas ou fusões). As partes que
  se movem (barras, obturador, deriva, entradas) só correm sem «movimento reduzido» (`html.cine-motion`, posta por `main.js`). Para ver o
  efeito completo num computador com «movimento reduzido», abrir uma vez qualquer página com `?movimento=completo` (fica guardado);
  `?movimento=reduzido` desfaz. Os blocos `prefers-reduced-motion` dos CSS foram restringidos a `html:not(.cine-motion)` por
  `tools/scope-reduced-motion.mjs` para esta opção funcionar. O vídeo do hero toca sempre, por decisão do dono.

### Fase de refinamento (novembro de 2026)

- **Cabeçalho:** transparente só no topo da página sobre o herói; fica sólido logo que a página se mexe. Decidido por um
  IntersectionObserver num marcador a 40 px do herói (não por eventos de scroll), com fusão de 0,25 s e fundo sólido sem JS.
- **Vídeo de fundo do herói (home):** «Hero video HD definitivo» (`originais/videos/drone-hd-definitivo/`) como fundo de todo o herói
  (`object-fit: cover`, atrás do texto e do painel de pedido): `src/assets/video/hero-fundo-1600.mp4` (16:9, 5,0 MB) e
  `hero-fundo-540.mp4` (9:16, 2,6 MB, ecrãs < 900 px). Poster/fallback: a fotografia do pôr do sol. O vídeo só é pedido depois do
  carregamento da página; com «movimento reduzido», poupança de dados, 2G, sem JavaScript ou se falhar, fica a fotografia.
  **Muda a decisão anterior** (vídeo a tocar sempre). Um filme lateral em cartão foi experimentado e removido.
- **Inglês por defeito (nov. 2026):** o inglês está na raiz (`/`, `/restaurant/`, `/stay/`…) e o português em `/pt/` (`/pt/restaurante/`…).
  Rotas em `ROUTES` (`src/lib.mjs`); os endereços antigos (`/restaurante/`, `/en/…`) têm páginas que reencaminham (`OLD_ROUTES`;
  `build.mjs`); `x-default` e o mapa do site apontam para o inglês. O seletor mostra sempre EN | PT. Sem deteção automática do idioma do navegador.
- **Caminho visível removido:** já não há «Início / Página» nas páginas interiores; o `BreadcrumbList` (JSON-LD) mantém-se para os motores de busca.
- **Comodidades pendentes:** `pendingAmenities` em `src/data/rooms.mjs` (Wi-Fi, pequeno-almoço, casa de banho privativa, ar condicionado), com ícones, sem aparecer em nenhuma página.
- **Raios:** escala única em `resort.css` (`--radius-field` 12, `--radius-card` 16, `--radius-panel` 24, `--radius-pill`).
- **Opiniões:** cartões; notas das plataformas lado a lado (bolhas do Tripadvisor, barra do Booking.com); a nota de cada
  resumo só aparece quando a plataforma a publica (`rating` em `reviews-external.mjs`). Sem carrossel.
- **Suites:** «Confirmado pelo Lauhata» com ícones SVG (cama King Size, cama de solteiro, televisão), nada mais.
- **Bebidas de exemplo:** uma grelha compacta, com o grupo como etiqueta; continuam sem preço e sem botão de pedir.
- **Notas (pagamento, só no restaurante):** linha clara e arredondada, sem a barra lateral colorida.
- **Herói da home:** altura automática, para o painel de pedido nunca ficar cortado em ecrãs baixos (1024×768).