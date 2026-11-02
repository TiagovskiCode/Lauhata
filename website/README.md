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

1. **Hero:** um grande fundo de ecrã inteiro (a panorâmica da costa em desktop; a foto da baía e da mesa em
   telemóvel, escolhida por `art` em `figure()`), com aproximação lenta, título em grande escala e o cartão
   de reserva por WhatsApp. Ao fazer scroll, o texto sobe e esvanece-se. **Vídeo:** quando houver
   filmagens reais, otimize-as (loop curto, sem som, de preferência abaixo de 3 MB), ponha o ficheiro em
   `src/assets/video/` e preencha `heroVideo` em `src/data/site.mjs`: a fotografia aparece primeiro e o
   vídeo entra em fusão por cima depois de a página carregar. Não carrega com «movimento reduzido», poupança
   de dados ou ligação lenta, pausa fora do ecrã e, se falhar, a fotografia fica. O vídeo comercial em
   `documentos/cliente/` é uma apresentação do site, não serve para isto.
2. **Comer / Dormir:** uma frase curta e dois painéis grandes lado a lado (um retângulo, um arco) que levam à ementa e aos quartos.
3. **01 · Comer:** fotografia, horário (do PDF da ementa) e os pratos mais escolhidos como linhas de ementa, com botão de adicionar ao pedido.
4. **O pequeno-almoço:** foto larga com o horário em grande (de `restaurantHours`) e as linhas reais do pequeno-almoço da ementa, também com botão de adicionar.
5. **02 · Dormir:** os três quartos em painéis que se abrem ao passar o rato ou ao focar (no telemóvel, cartões empilhados), com preço (ou «Preço a confirmar»), ver quarto e pedir reserva.
6. **03 · Um dia no Lauhata:** janela em arco fixa que muda de foto enquanto a cor da página vai da manhã ao entardecer. Os horários e atividades são os do design e estão por confirmar (há um aviso enquanto `showPlaceholderNotes` for true).
7. **04 · Cultura:** em terracota, com o tais num arco duplo, espaço reservado para a história real e «Mai, han, toba.» em grande. A tradução («Venha, coma, durma») está por confirmar.
8. **05 · Reservar e chegar:** morada, horários, WhatsApp, email e «Desde Díli» (por confirmar) ao lado de um mapa real do Google, com «Obter direções» e «Abrir no Google Maps». Sem coordenadas, o mapa pesquisa pelo nome (`mapQuery`) e diz-o por baixo; ao preencher `geo` em `site.mjs`, passa a usar as coordenadas.

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
