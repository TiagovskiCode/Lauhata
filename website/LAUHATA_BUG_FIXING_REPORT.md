# Lauhata Beach Escape — relatório de correção de bugs (ronda de estabilização)

Data: 22 de novembro de 2026. **Sem commit, push nem deploy.** Sem funcionalidades novas, sem mudanças de identidade visual,
preço de $90 por noite, preços provisórios das bebidas e capacidade pendente do Queen & Single Room inalterados.

## Como foi feita a inspeção (e porque é diferente da anterior)

A ronda anterior confiou em medições automáticas (overflow, elementos fora do ecrã, alturas de cartões). Desta vez **olhei para as
páginas**: um script percorre cada página como um visitante (movimento ligado, um ecrã de cada vez, com pausa para as animações de
entrada) e guarda uma captura por ecrã; juntei as capturas em folhas de contacto e revi-as uma a uma. Depois abri e usei os
componentes (modal do prato, opções, carrinho com produtos, quantidades, remover, gaveta do menu, modal de opinião, lightbox, galeria
do Alojamento) e fotografei cada estado.

- Páginas percorridas por inteiro (do herói ao rodapé): Início, Restaurante, Alojamento, Experiências/Eventos, Galeria, Contactos,
  e `/pt/restaurante/`.
- Larguras observadas visualmente: 390×844, 600×960, 768×1024, 900×1200, 1024×768, 1032×1376, 1180×820, 1280×800, 1440×900
  (estados interativos em 390, 1024 e 1440).
- Browser: Brave (Chromium) sem ecrã, a emular tamanho e toque. **Não usei aparelhos reais nem Safari.**

---

## 1–5. Problemas encontrados, como se reproduziram, causa e correção

### 1. Cartões dos quartos com um grande espaço vazio no telemóvel (regressão da ronda anterior)
- **Reproduzido:** página inicial, 390×844, «Find Your Perfect Stay». O cartão do Queen Room tinha ~150 px vazios entre «Television» e
  os botões.
- **Causa:** eu tinha posto `grid-auto-rows: 1fr` em `.rp-grid` para igualar as alturas. Com os cartões empilhados (uma coluna), isso
  esticou o cartão mais curto até à altura do mais comprido.
- **Correção (`refine.css`):** removido. Lado a lado, a linha da grelha já iguala as alturas (`align-items: stretch`); empilhados, cada
  cartão tem a sua altura.
- **Depois:** captura `aft-390x844-rpgrid`: sem espaço vazio; em 768 e 1440 os dois cartões continuam iguais.

### 2. Cabeçalho dos cartões dos quartos diferente entre os dois cartões (tablet)
- **Reproduzido:** 768×1024, 1024×768, 1032×1376 e 1180×820. No Queen Room o preço ficava ao lado do nome; no Queen & Single Room
  (nome mais comprido) o preço caía para a linha de baixo, por isso os dois cartões não alinhavam.
- **Causa:** `flex-wrap` no `.rp-head`: a quebra depende do comprimento de cada nome, não da largura do cartão.
- **Correção:** o cartão passa a ser um *container* (`container-type: inline-size`); abaixo de 34rem de largura do **cartão** o preço
  vai sempre para baixo do nome, nos dois. Acima disso (desktop) fica na mesma linha, como antes.
- **Depois:** capturas `aft-768x1024-rpgrid` (os dois iguais) e `aft-1440x900-rpgrid` (desktop sem alteração).

### 3. Botão «voltar ao topo» por cima de conteúdo e de controlos no telemóvel e tablet
- **Reproduzido:** 390×844 em Contactos (tapava os «+» das perguntas frequentes «What else do the rooms include?» e «How can I
  contact the team?»), em Eventos (tapava o botão «See the rooms»), no Início (por cima de parágrafos de texto).
- **Causa:** um botão flutuante a 44 px da margem, acima da barra inferior, numa largura onde o conteúdo ocupa toda a largura. Estava
  definido em **sete** sítios (`resort.css` e `refine.css`) com posições contraditórias.
- **Correção:** uma só definição em `resort.css`. Em computadores fica por cima do botão do WhatsApp, como antes. **Até 860 px (onde
  existe a barra de ações) deixa de aparecer**: o telemóvel já tem o gesto de deslizar e a barra fixa, e um terceiro botão flutuante
  tapava conteúdo. Removidas as outras seis regras.
- **Depois:** capturas `aft-390x844-contact-*`: os botões das perguntas frequentes e os botões do rodapé ficam livres.

### 4. Créditos do rodapé por baixo dos botões flutuantes (desktop)
- **Reproduzido:** 1440×900, fundo da página: «Website by Elevate Web Studios» ficava por baixo do botão do WhatsApp.
- **Correção (`main.css`):** a linha legal do rodapé reserva 5,5rem à direita a partir de 861 px.

### 5. Galeria do Alojamento: as barras recuavam durante a passagem automática
- **Reproduzido** com amostragem a cada 40 ms (`rgcheck.mjs`, 390×844): na passagem da foto 1 para a 2 o estado foi
  `ativa 1 → ativa 0 → ativa 1`. A barra 1 voltava a ativa por um instante e a barra 2 recomeçava do zero.
- **Causa:** durante o deslizamento suave, o evento `scroll` arredondava a posição intermédia para a foto anterior e chamava `show()`.
- **Correção (`main.js`):** enquanto o carrossel desliza para uma foto escolhida pelo código (`target`), as posições intermédias
  são ignoradas; um gesto do utilizador (`pointerdown`) cancela isso e volta a mandar.
- **Depois:** a mesma amostragem dá `ativa 0 → ativa 1`, sem recuo.

### 6. Galeria do Alojamento: depois de tocar numa barra ou numa seta, a reprodução automática nunca mais retomava
- **Reproduzido:** 390×844 com toque (`page.tap`). Depois do toque o foco ficava no botão; a galeria estava em pausa enquanto tivesse
  foco, por isso ficava parada até se tocar noutro sítio.
- **Correção:** a pausa por foco só se aplica ao foco de teclado (`:focus-visible`). Rato e toque pausam enquanto estão por cima ou
  em contacto, e depois retoma.
- **Depois:** 5,6 s depois do toque a galeria avançou para a foto seguinte.

### 7. Cartões dos pratos apertados a 1024 px
- **Reproduzido:** 1024×768, Restaurante. Com a coluna de categorias ao lado, os três cartões por linha ficavam com ~135 px; nomes de
  duas linhas com o preço encostado à primeira («Satay (Main / $12 / Course)»).
- **Causa:** o número de colunas e a posição do preço dependiam da largura do **ecrã**, não do espaço real do menu.
- **Correção:** `.menu-body` e `.dcard` são *containers*. O menu tem 3 colunas quando a coluna do menu tem ≥40rem e 2 colunas abaixo
  disso. Num cartão com menos de 14rem o preço vai para baixo do nome. Removida a media query de 559 px que fazia isso só nos telemóveis.
- **Depois:** `aft-1024x768-restaurant-*`: nome e preço legíveis; telemóvel igual ao de antes.

### 8. Lightbox no telemóvel: a imagem ocupava pouco mais de metade da largura
- **Reproduzido:** 390×844, Galeria: imagem com ~240 px de largura, porque as setas tinham colunas próprias na grelha.
- **Correção (`main.css`):** até 640 px a grelha tem uma só coluna e as setas ficam por cima da fotografia, centradas na vertical,
  com fundo escuro translúcido.
- **Depois:** `aft2-390x844-7-lightbox`: a imagem ocupa a largura toda; as setas e o fechar estão visíveis; o scroll da página volta
  à mesma posição (900 → 900) ao fechar.

### Verificado e **sem** problema (não alterado)
- **Carrinho, salto lateral:** desta vez medido **com barras de scroll reais** (15 px; o Chromium sem ecrã esconde-as por omissão,
  por isso a ronda anterior não o conseguia medir). A 1440, 1280 e 1024, ao abrir e fechar o carrinho, o logótipo e os cartões ficam
  exatamente no mesmo píxel, e a roda do rato não mexe na página por trás. O carrinho abre e fecha; adicionar, «+», remover, estado
  vazio e com produtos funcionam (390, 1024, 1440).
- **Modal do prato:** abre com a fotografia, o nome, o preço e a descrição **do prato clicado** (verificado: «Grilled Fish» →
  `grilled-fish-640.jpg`). Pratos com opções fecham-no e abrem o das opções.
- **Bebidas:** continuam com «Preço provisório».
- **Menu mobile:** botão circular 44×44, gaveta da direita, fecha com Escape, o X e o fundo, sem segundo cabeçalho, sem código
  StaggeredMenu.
- **Barra inferior:** encostada ao fundo, sólida, cabe a 320 px em PT.
- **Ecrã de entrada:** aparece na primeira página, termina (overlay removido, herói visível), não volta ao navegar nem ao recarregar
  na mesma sessão, não aparece com «reduzir movimento».
- **Contactos:** nenhuma regressão além do botão «voltar ao topo» (ponto 3).

---

## 4. Ficheiros alterados nesta ronda
- `src/assets/css/refine.css`: cartões dos quartos (grelha e *container query*), grelha e cartões do menu (*container queries*),
  remoção de 6 regras do «voltar ao topo», comentário desatualizado.
- `src/assets/css/resort.css`: definição única do «voltar ao topo».
- `src/assets/css/main.css`: lightbox no telemóvel, margem do rodapé.
- `src/assets/js/main.js`: galeria do Alojamento (deslizamento e foco).
- `tests/site.test.mjs`: um teste de regressão para estes pontos.

## 6. Viewports
- **Observados em captura:** ver a lista no início.
- **Varrimento automático** (sem scroll horizontal, nenhum elemento fora do ecrã, sem imagens partidas, sem erros de consola, botão
  do menu 44×44, barra inferior no fundo, cartões em linha com a mesma altura, sem foto sobre o texto): 320×568, 375×667, 390×844,
  393×852, 402×874, 412×924, 430×932, 440×956, 600×960, 700×1000, 768×1024, 820×1180, 900×1200, 1024×768, 1032×1376, 1180×820,
  1280×800, 1366×768, 1440×900, 1600×1000, 1920×1200, em 12 páginas EN/PT. Resultado: ver 7.

## 7. Resultados dos testes
- `npm test`: build OK, **40/40** testes, `check-site`: 24 páginas, 2 475 ligações internas e âncoras OK.
- TypeScript / ESLint: **não existem no projeto**.
- Interação automática (`interact.mjs`, 1440 e 390): lightbox, modal de opinião, carrinho e pesquisa OK. O único «FAIL» é do
  próprio teste: o carrinho guarda-se no `localStorage` e a contagem acumulou de execuções anteriores no mesmo perfil do browser
  (esperava 1, viu 2). A linha do carrinho é uma só, como devia.
- Varrimento automático depois das correções: **21 tamanhos × 12 páginas, 0 problemas**. Lembrete: o varrimento anterior também
  dava 0 e havia defeitos visíveis. Por isso os pontos 1–8 foram confirmados com capturas antes e depois, não com este número.

## 8. Por resolver
- Nada do que reproduzi ficou por corrigir.
- O botão do WhatsApp e o «voltar ao topo», em computadores, continuam a flutuar sobre o conteúdo enquanto se faz scroll (é o
  comportamento normal de um botão flutuante; só no fim da página o rodapé lhes reserva espaço).
- A secção «Discover the Surroundings» em tablet ocupa quase dois ecrãs de fotografias; mantive-a como estava, por pedido anterior.

## 9. Limitações
- Sem aparelhos reais, sem Safari/iOS: a barra do Safari, a área segura real e o comportamento de toque de um iPhone não foram vistos.
- As capturas são do Chromium com o tamanho emulado; as fontes e o anti-aliasing podem diferir ligeiramente noutros browsers.
- Revi as capturas em folhas de contacto (reduzidas). Os pormenores finos (1–2 px) só foram verificados por medição, não à vista.
