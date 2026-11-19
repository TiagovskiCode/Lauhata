# Master Refinement 04 — relatório (19 de novembro de 2026)

## Auditoria inicial
- Header de 72 px com logótipo de 50 px e botão de 42 px (a barra mal envolvia os elementos); barra flutuante estreita sem cantos arredondados; Back to Top 5 rem acima da barra.
- Animação do carrinho quase invisível: o `@keyframes drawerIn` do `order.css` era redefinido pelo `resort.css` (menu móvel: 24 px + fade), pelo que o painel quase não se deslocava.
- Welcome com uma fotografia e duas ligações; pratos em destaque 1 grande + 2 pequenos; experiências numa faixa escura com chips; arredores em losangos; sem assinatura no rodapé; menu do restaurante com barra horizontal de 10 categorias; galeria com 11 fotografias; FAQ de 5 perguntas, com instruções desatualizadas («formulário da página»).
- Mensagens com "real photograph" nas legendas.

## O que foi feito
- **Navbar:** altura 88 px (76 px em telemóvel), logótipo 54 px (46 / 42), botão 40 px, `padding-block` no `header-inner`. Medido em 10 tamanhos: botão 40 px dentro de 88 px; logótipo 54 px, sem esmagar (incluindo 960 e 720 px de largura, como janelas divididas). Nada foi removido.
- **Barra flutuante (Restaurant / Stay / WhatsApp):** cantos superiores 22 px, padding uniforme, botões em pílula. **Back to Top:** em telemóvel passa de 9,6 rem para 6,1 rem sobre a barra; em desktop o intervalo para o WhatsApp é 8 px (0,5 rem), incluindo ≥ 1600 px.
- **Welcome:** exatamente três cartões, todos da mesma altura (medido 518/490/461 px por largura), cada um com fotografia, título, descrição curta e ligação: *Restaurant & Bar*, *Stay*, *Experiences*. Restaurante e bar numa só oferta.
- **What Makes Lauhata Special:** conservada tal como estava (mesmos ícones e textos) e **mantida logo a seguir ao Welcome**: faz de pausa editorial entre dois blocos de cartões fotográficos (Welcome e pratos) e antecipa os argumentos antes dos pratos e dos quartos.
- **From the Lauhata Kitchen:** carrossel de **10 pratos** do menu, cartões idênticos (medido: todos com a mesma altura, 408/374/357 px). Em desktop mostra 4 cartões e meio (a pista sangra até ao bordo direito); setas Previous/Next com `aria-label`, desativadas nos extremos; pista focável com ← →; swipe nativo no telemóvel (1,25 cartões visíveis); sem avanço automático; `prefers-reduced-motion` respeitado. Pratos: peixe grelhado, gambas salteadas, arroz frito Lauhata, bitoque, satay, caril de frango, tom yum de gambas, anéis de lula, mie goreng, frango grelhado (nomes, descrições e preços do `menu.mjs`). **Limitação:** nenhum prato tem fotografia do próprio restaurante; as imagens são de pratos semelhantes e levam a etiqueta «Illustrative image» em cada cartão. Nenhum prato foi repetido nem inventado.
- **Stay:** fotografias 2:1 → 5:2 em ecrãs ≥ 3:2, texto limitado a 2 linhas; o par mede 493 px em 1440×900 (de 572), 468 px em 1280×800; dois cartões lado a lado até 620 px. CTAs mantidos.
- **Características dos quartos:** apresentadas as confirmadas (cama Queen / Queen + Single; televisão). **Wi-Fi, casa de banho privativa e pequeno-almoço incluído NÃO foram publicados**: o dono só confirmou camas e TV (`rooms.mjs`, `pendingAmenities`, aviso do build). A FAQ remete essas perguntas para o WhatsApp. Se o dono confirmar, basta acrescentá-las a `amenities` em `rooms.mjs` (a UI já as mostra com ícone).
- **Experiences (homepage):** duas linhas editoriais alternadas (7/5 e 5/7) na faixa escura, com fotografia + texto; sem cartões nem chips repetidos; um CTA («Plan Your Event»). O link «See the gallery» foi retirado para manter a Gallery fora da homepage.
- **Discover the Surroundings:** composição de **cinco** fotografias reais do projeto (costa aérea, canoa, ruínas de Aipelo vistas de lado e de cima, aldeia costeira), de larguras e alturas diferentes, sem repetições.
- **Reviews e «Your Next Moment Starts Here»:** preservadas; apenas auditadas (alinhamento e responsividade verificados, sem alterações).
- **Footer:** palavra **LAUHATA** em grande formato (serif, ~15 vw, centrada) imediatamente antes da linha legal, que continua legível por baixo; acrescentada ligação «FAQ» em Explore.
- **Restaurant — Menu + Filter:** «Menu» à esquerda e «Filter» à direita; o popover lista «All dishes» e as categorias, filtra, mostra o filtro ativo ao lado do botão com «×» para limpar; fecha com Escape (devolve o foco), clique fora e depois de escolher; setas ↑↓ dentro da lista. Funciona igual em telemóvel (painel em largura total). A pesquisa combina com o filtro. Fotografias, preços, descrições e categorias intactos.
- **Gallery:** de 11 para **14** fotografias reais (acrescentadas a capa aérea e duas vistas aéreas); legendas curtas mantidas. Retirado «Real photograph/Fotografia real» das legendas, do cabeçalho da galeria e da descrição SEO; mantida a etiqueta «Illustrative image» nas imagens que o são.
- **FAQ:** na página Contact (`#faq`), 12 perguntas em 5 categorias (Reservations, Stay, Restaurant, Events, General), EN e PT, com acordeão nativo (`<details>`, várias abertas em simultâneo; transição suave de altura onde o navegador suporta). Horários e telefone lidos de `site.mjs`. JSON-LD FAQPage mantido. **Não inventei** política de cancelamento, check-in/out, preços, meios de pagamento, prazos de resposta nem comodidades.
- **Your Order:** keyframes próprios (`cartIn/cartOut`, 0,55 s / 0,34 s, `cubic-bezier(.22,1,.36,1)`; só `transform` e `opacity`), película a desvanecer em sincronia, folha vinda de baixo em telemóvel, sem animação com `reduced-motion`; o temporizador de fecho em `order.js` passou de 220 para 340 ms. Lógica de encomenda não alterada.
- **Reservas:** diálogo central intacto; sem formulários redundantes em Restaurant/Stay.
- **Correção encontrada em teste:** o botão «Make a reservation» do cabeçalho e as ligações de quarto continuam a funcionar; um erro meu (`$$` num `replace`) tinha estragado o JS e foi corrigido antes da entrega.

## Testes executados
- `npm test`: **28/28** testes (5 novos: carrossel, assinatura do rodapé, filtro, FAQ, carrinho; 2 ajustados); 24 páginas, 2325 ligações internas OK.
- Overflow horizontal: nenhum em 8 páginas × 10 tamanhos (1920×1200, 1440×900, 1280×800, 1024×768, 960×1080, 768×1024, 720×900, 430×932, 390×844, 375×667).
- Hero = altura do ecrã em todos os tamanhos; header/logo/botão medidos (acima).
- Filtro do menu (abrir, Escape, clique fora, escolher, limpar), carrinho (vazio, vários produtos, abrir/fechar/Escape, animações aplicadas), diálogo de reserva (quarto/mesa) verificados por script no navegador.
- Lighthouse móvel: início 89 (acessibilidade 96 → corrigida depois: `role="group"` na lista do carrossel; **não repetido**), restaurante 85, contacto 88, galeria 79; boas práticas e SEO 100; CLS 0.
- Capturas vistas: início 1440 (todas as secções), início 390, restaurante 390, contacto 1440, galeria.

## Informação comercial a confirmar
Wi-Fi, casa de banho privativa e pequeno-almoço incluído nos dois quartos; número de quartos; preços; horários de check-in/out; política de cancelamento; prazo de resposta; fotografias reais de pratos e quartos; confirmação dos 10 pratos em destaque (escolhidos por mim, sem dados de vendas).

## Pendente / limitações
- Não repeti o Lighthouse após a correção de acessibilidade; desempenho móvel da galeria (79) e do início (89) abaixo da ronda anterior (carrossel com 10 imagens).
- Não testei o carrinho em modo telemóvel real nem com leitor de ecrã; a transição foi verificada pelas propriedades aplicadas (o painel do navegador não anima), não por vídeo ou FPS.
- Pesquisa web nova: não feita (ver `LAUHATA_MASTER_REFINEMENT_04_RESEARCH.md`). TypeScript e ESLint não existem. Taste gate não reexecutado.
- Não vi capturas de Experiences e Stay a 768/1024, nem da homepage em PT, nem do rodapé em telemóvel (a assinatura foi dimensionada por cálculo).

## Estado do Git
Alterações apenas no diretório de trabalho (incluindo `dist/`, que o repositório rastreia); **nada commitado nem publicado**.
