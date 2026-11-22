# Lauhata Beach Escape — relatório da refinação completa

Data: 22 de novembro de 2026. Âmbito: `website/` (EN na raiz, PT em `/pt/`). **Sem commit, push nem deploy**: tudo está só no
diretório de trabalho. Sem dependências novas (o `esbuild` que minifica o CSS já estava declarado em `devDependencies`; foi só
instalado com `npm install`).

---

## A. O que foi alterado

### Página inicial
- **Welcome:** os três cartões começam na mesma linha e têm a mesma altura e a mesma base em desktop, tablet e telemóvel
  (medido em 17 tamanhos). Nos telemóveis são cartões horizontais (foto à esquerda, texto à direita).
- **«O que torna o Lauhata especial»:** mantida e sem mudanças de design. **Decisão: fica logo a seguir ao Welcome.** É um resumo
  rápido para quem chega pela primeira vez (o que é, onde fica, o que há); depois de Experiências já seria repetir o que o
  visitante acabou de ver.
- **Carrossel «A cozinha»:** 8 pratos (antes 10), seleção editorial provisória («pratos para conhecer», não «os mais vendidos»),
  carrossel mantido. Ids em `fdIds` (`src/pages.mjs`).
- **«Encontre a sua estadia»:** dois cartões desktop mais sofisticados (foto 3/2, nome e preço na mesma linha, capacidade, camas,
  televisão, ação principal e ligação para o quarto), a mesma estrutura nos dois. Mobile mantém a direção anterior. Em baixo, uma só
  vez, as 9 comodidades do alojamento e a nota «preço por noite, por quarto, não por pessoa».
  - Queen Room: 1 cama queen, até 2 adultos. Queen & Single Room: 1 cama queen + 1 cama de solteiro, até 2 adultos e 2 crianças
    (**pendente**, ver F). Preço: **$90 por noite** (PT: «$90 por noite»).
  - Comodidades (e nada mais): transfer do aeroporto, quartos para não fumadores, estacionamento gratuito, restaurante no local,
    em frente à praia, bar, pequeno-almoço, Wi-Fi, casa de banho privativa. Nenhuma «King».
- **Experiências e Momentos Especiais:** mais editorial: foto grande com legenda, foto pequena sobreposta, «Pores do sol junto ao
  mar» em itálico dourado, «Celebrações» com os tipos de ocasião e o botão «Plan Your Event» (→ `#pedido`). Sem serviços inventados.
  O texto de abertura foi reescrito porque repetia a frase de «Celebrações».
- **Descobrir os Arredores:** não tocada.
- **Opiniões:** o cartão escuro «Share your experience» é agora um botão que abre um modal (nome, comentário, avaliação), com botão
  de fechar, Escape e clique no fundo; o foco volta ao cartão. Removido «Have you stayed with us? Leave your feedback +». O envio
  continua a preparar uma mensagem de WhatsApp (não há envio falso). Cartões Tripadvisor e Booking.com iguais.

### Restaurante
- Filtro, categorias, índice lateral (≥1000px) e carrinho mantidos.
- Cada prato é um cartão visual: **fotografia, nome, preço** (3 colunas ≥1000px, 2 em tablet e telemóvel, fotografia 4/3, nomes
  até 2 linhas, linhas sempre com a mesma altura). Clicar abre **um** modal com fotografia, nome, preço e a descrição curta que já
  existia (sem descrições inventadas) e o botão de pedir. Pratos com opções fecham este modal e abrem o das opções.
- **Bebidas:** cada uma tem agora um preço **provisório** estimado, marcado `provisional: true` nos dados e rotulado «Preço
  provisório» no cartão e no modal; não se podem pedir. Lista completa em **E** e em `docs/PRECOS-PROVISORIOS-BEBIDAS.md`
  (gerada pelo build).

### Página Alojamento
- Hero igual. A secção dos quartos deixou de ser escura: fundo creme, texto escuro (antes: faixa preta).
- Cada quarto mostra preço, capacidade, camas, televisão e, em baixo, as comodidades do alojamento. A página de cada quarto
  ganhou capacidade e a mesma lista.
- **Galeria:** o «1 / 3» foi substituído por três barras de progresso discretas (estilo stories): a barra ativa enche em 5 s e
  passa à fotografia seguinte; a última fica (não repete em ciclo). Escolher uma barra, usar as setas ou deslizar reinicia a barra
  da fotografia mostrada. Pausa com o rato por cima, foco dentro, dedo no ecrã, separador escondido e galeria fora do ecrã. Com
  «reduzir movimento» não há reprodução automática (as barras só indicam a fotografia). **O temporizador é a própria animação CSS**
  (`animationend`), por isso não há intervalos para limpar nem temporizadores duplicados; o observador de visibilidade é
  desligado em `pagehide`.

### Lightbox da galeria
- Fixo a `100dvh` (com `100vh` como alternativa), imagem `object-fit: contain`, botões sempre visíveis, sem segunda barra de
  scroll, sem scroll da página por trás.

### Carrinho
- Mantido como painel (não é página própria). Corrigido o salto horizontal ao abrir (ver B). Estado vazio compacto nos telemóveis
  (a folha passa de 776 px de altura a 433 px em 390×844).

### Ecrã de entrada (loading)
- Novo: «nascer do sol sobre a água». Uma linha de horizonte dourada desenha-se, o sol sobe e deixa um rasto de luz no mar, três
  ondulações abrem a partir do horizonte, o nome sobe letra a letra e a noite abre em duas pálpebras curvas. **2,3 s** no total
  (antes 2,85 s), só CSS (começa no primeiro pintar, não espera por scripts nem imagens), pointer-events desligados, escondido por
  um temporizador próprio mesmo que o JS falhe. Lógica inalterada: só na primeira página da sessão, `?intro` repete, **não aparece
  com «reduzir movimento»**, e a entrada do herói acompanha (1,5 s).

### Menu mobile
- **StaggeredMenu removido por completo** (JS, CSS, markup). Agora: gaveta simples que entra da direita para a esquerda e sai ao
  contrário, botão circular de 44×44 px, Escape, clique no fundo, foco preso pelo `<dialog>` e devolvido ao botão,
  `aria-expanded`, sem deslocar a página. O índice de linha do restaurante (LineSidebar) continua só em desktop.

### Barra de ações do telemóvel
- Colada ao fundo do ecrã (`bottom: 0`), fundo sólido, cantos de cima arredondados, `env(safe-area-inset-bottom)` dentro do
  preenchimento e extensão sólida por baixo (nada da página se vê por baixo, nem com a barra do browser a mexer). `viewport-fit=cover`
  no `<head>`. Em 320 px os rótulos portugueses mais compridos já cabem (ver B).

### Limpeza de código
Removidos (sem uso ou substituídos): linhas antigas de prato e a grelha de pratos (≈100 regras CSS), cartões e painéis de quartos
antigos (`roomRows`, `roomCards`, `suitesSection`, `.su-*`, `.room-row-*`, `.room-card`), `hut-deco`, estilos antigos do menu mobile,
a ligação à galeria na secção de Experiências, regras `!important` e declarações duplicadas dos componentes tocados.

---

## B. Problemas encontrados e causa real

| Problema | Causa real | Correção |
|---|---|---|
| Página «salta» para o lado ao abrir carrinho/modais | `html.has-modal { overflow: hidden }` fazia desaparecer a barra de scroll e a página alargava | `html { scrollbar-gutter: stable }` e `html:has(dialog[open]) { overflow: hidden }` |
| Lightbox com segunda barra de scroll | grelha com `height: 100%` + imagem `max-height: 80vh` + 4rem de preenchimento: a soma passava a altura do diálogo | diálogo fixo a 100dvh, grelha `minmax(0,1fr)`, imagem 100%×100% contida |
| Barra inferior descolada / com faixa por baixo | 6 camadas de regras contraditórias (cápsula flutuante vs. ancorada, transform, sem extensão sólida, sem `viewport-fit`) | um só bloco em `main.css` |
| Barra inferior a transbordar a 320 px em PT | «Restaurante» + «Alojamento» não cabiam ao lado do botão do WhatsApp | botões com `min-width: 0` e, abaixo de 360 px, fonte menor e sem ícones |
| Cartões Welcome: foto por cima do texto nos telemóveis | `.wk-media { aspect-ratio: 1/1 }` mais abaixo no ficheiro anulava o `auto` do layout de telemóvel e a foto passava a coluna | uma só regra de proporção |
| Folha do carrinho vazia com 776 px de altura | `dialog.cart { height: auto }`: um diálogo modal é `fixed` com `top`/`bottom`, e `auto` estica-o até `max-height` | `height: fit-content` |
| Legenda da foto grande de Experiências cortada | foto pequena sobreposta ao canto onde a legenda se estende | legenda em coluna, com margem direita |
| Modal de prato não abria (erro meu, apanhado nos testes) | `$$` dentro de uma string de substituição do `String.replace` passou a `$` | corrigido no código |
| Erro de preços da lista de bebidas (idem) | mesma causa | corrigido |

---

## C. QA responsivo realmente testado

Ferramenta: Brave (Chromium) sem ecrã, via puppeteer-core, a emular o tamanho do ecrã e o toque. **Não foram usados dispositivos
reais nem Safari/iOS.**

Tamanhos: 320×568, 375×667, 390×844, 393×852, 402×874, 412×924 (Pixel 10), 430×932, 440×956, 768×1024, 820×1180, 1024×768,
1032×1376, 1280×800, 1366×768, 1440×900, 1600×1000, 1920×1200. O iPhone SE foi coberto por 375×667; os iPhone 16 e 16 Pro Max por
393×852 e 440×956 (as dimensões lógicas, não o aparelho).

**Varrimento automático** (17 tamanhos × 12 páginas EN/PT: início, alojamento, quarto, restaurante, experiências, galeria,
contactos, sobre nós, descobrir, e `/pt/`, `/pt/alojamento/`, `/pt/restaurante/`): 0 problemas. Verificou: sem scroll horizontal,
nenhum elemento visível fora do ecrã, sem imagens partidas, sem erros de consola, botão do menu 44×44, barra inferior encostada ao
fundo, e cartões em linha com a mesma altura e a mesma base (Welcome, quartos, pratos), sem foto sobre o texto.

**Testes de interação** (1440×900, 768×1024, 390×844, 320×568): lightbox (100dvh, sem scroll interno, página bloqueada, imagem
contida, botões visíveis, Escape fecha); modal de opinião (abre, cabe no ecrã, fecha por botão, Escape e clique no fundo); modal do
prato; adicionar ao carrinho e ver a linha; pesquisa «pizza» (6 de 67 pratos). **Menu e barra** em 10 tamanhos de telemóvel/tablet
× 2 páginas: abre, painel a toda a altura, Escape fecha, foco volta ao botão, sem deslocar o cabeçalho, sem scroll horizontal.
**Galeria do Alojamento:** reprodução automática avança ao fim de 5 s, escolher a barra 1 reinicia, sem erros.

Vi capturas de ecrã de: cartões e modal do menu, página Alojamento (desktop e telemóvel), carrinho, ecrã de entrada (desktop e
telemóvel, vários instantes), Welcome e Experiências, gaveta, barra inferior (320 PT).

---

## D. Mantido

Estrutura e filtro da página do Restaurante, carrinho (comportamento), página de Experiências («Plan Your Event» → `#pedido`),
Galeria (só o lightbox mudou), Contactos, rodapé, «Descobrir os Arredores», cartões Tripadvisor e Booking.com, pedidos só por
WhatsApp (+670 7740 1111), pagamento no local, só consumo no restaurante, etiquetas «Imagem ilustrativa», PT/EN completos
(o teste das chaves PT/EN passa).

---

## E. Preços provisórios das bebidas (NÃO são preços oficiais)

Estimativas em USD por dose, criadas a 22/11/2026 até o Carlos confirmar os preços reais. Os nomes também não estão confirmados.
Aparecem como «Preço provisório» e não se podem pedir.

| Grupo | Bebida | Preço estimado |
|---|---|---|
| Água | Água | $1 |
| Água de coco | Água de coco | $3 |
| Refrigerantes | Refrigerantes | $2 |
| Sumos naturais | Sumo natural de laranja | $4 |
| Sumos naturais | Sumo natural de manga | $4 |
| Café e chá | Café | $2 |
| Café e chá | Chá | $2 |
| Sem álcool | Mocktail de maracujá | $5 |
| Sem álcool | Mojito sem álcool | $5 |
| Cerveja | Cerveja | $3 |
| Vinho | Vinho (copo) | $6 |
| Cocktails | Mojito | $7 |
| Cocktails | Piña colada | $7 |
| Bebidas espirituosas | Bebidas espirituosas | $5 |

Dados: `src/data/sample-drinks.mjs` (`provisional: true`). Lista gerada em `docs/PRECOS-PROVISORIOS-BEBIDAS.md`; o aviso de pré-lançamento
(`npm run build`) lembra-as.

---

## F. Informação pendente

1. **Queen & Single Room: 2 adultos + 2 crianças.** Intenção do cliente; faltam as **idades das crianças** e as condições de
   ocupação. No código é `capacityPending: true` (`src/data/rooms.mjs`, com comentário) e o site mostra uma frase «a confirmar» junto
   da capacidade (cartão, página Alojamento e ficha do quarto).
2. **Ar condicionado:** continua por confirmar e não é mostrado (`pendingAmenities`).
3. **Pequeno-almoço:** está listado como comodidade do alojamento; falta saber se está **incluído** no preço de $90 (o site não o diz).
4. Preços e nomes das 14 bebidas (E) e a carta de bebidas real.
5. Os 8 pratos do carrossel são uma seleção editorial: confirmar com o restaurante.
6. Fotografias reais dos quartos e dos pratos (hoje ilustrativas, etiquetadas).
7. `docs/CHECKLISTS.md` foi atualizado (secção 0) com tudo isto; as partes históricas que falam de «Suite King» ficaram como histórico.

---

## G. Resultados técnicos

- `npm test` (compila, 39 testes, verificação do site): **39/39**, 26 páginas compiladas, `check-site`: 24 páginas, **2 475 ligações
  internas e âncoras** resolvem, **OK**. Foram acrescentados testes (comodidades, preço/capacidade, barras da galeria, cartões e
  modal do prato, bebidas provisórias, modal de opinião, lightbox/barra/bloqueio) e atualizados os que descreviam o menu antigo.
- Consola: 0 erros em todo o varrimento e nos testes de interação.
- Tradução: o teste de chaves EN = PT passa; novas chaves em ambas.
- ESLint e verificação de tipos: **o projeto não os tem**; não foram acrescentados (sem dependências novas).
- Ligações externas: apenas confirmado o formato (hosts: wa.me, booking.com, tripadvisor.com, google.com/maps, Wikimedia/Creative
  Commons para as fotos temporárias, Unsplash, timorleste.tl). **Não verifiquei se respondem** (alguns bloqueiam pedidos
  automáticos).
- Formulários: o de opinião e os de reserva preparam mensagens de WhatsApp (nada é enviado a um servidor); validação de campos
  vazios exercitada no modal de opinião.

---

## H. Limitações

- **Nada foi testado em aparelhos reais nem em Safari/iOS.** Os comportamentos de barra do browser, área segura e barra de scroll
  são verificados por regras e medições em Chromium; recomenda-se uma passagem rápida num iPhone e num Android antes de publicar.
- O Chromium sem ecrã usa barras de scroll sobrepostas, por isso **o salto lateral ao abrir o carrinho não se reproduz lá**; a
  correção assenta na causa identificada (`overflow: hidden` a retirar a barra) e em medições, não num olhar a um Windows com barra clássica.
- A galeria do Alojamento para na última fotografia e não tem botão de pausa próprio (pausa ao pairar, focar ou tocar; não repete).
- A galeria da **ficha de cada quarto** continua com o contador «1 / 3»: o pedido era para a página Alojamento.
- Ficaram regras `!important` antigas (≈120) em partes que não toquei; limpei as dos componentes alterados.
- O ecrã de entrada foi visto por capturas em 5 instantes (desktop e telemóvel); não medi o seu aspeto numa ligação lenta.
- As fotografias dos pratos e dos quartos continuam ilustrativas.
