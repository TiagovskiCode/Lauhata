# Master Refinement 03 — relatório (19 de novembro de 2026)

## Diagnóstico inicial
Demasiados cartões (Welcome com 4 cartões, restaurante e bar como duas ofertas), secção de qualidades ausente, secções de pedido de mesa/quarto duplicadas nas páginas, botão «Discover Our Story» ilegível em hover, hero com `max(100svh, 640px)`, galeria sem descrições, avaliações com 2 caixas e o convite a comentar escondido num `<details>`.

## Causa real do bug do hover
`refine.css` tinha `.btn-ghost-light { background: transparent }`, que anulava o fundo do hover; o `editorial.css` mudava só a cor do texto para tinta escura. Resultado: texto preto sobre a fotografia. Agora o hover/foco/ativo usa fundo creme e texto escuro (medido: texto `rgb(31,24,19)` sobre `rgb(247,240,228)`).

## Alterações implementadas
- **Navbar:** altura 84 → 72 px (64 px em telemóvel), logótipo 50 px, links 0,95 rem; nada removido. Botão «Make a Reservation» (≥1360 px) / «Reserve» (abaixo) / PT «Fazer uma reserva» / «Reservar».
- **Hero:** `height: 100vh; height: 100svh` (medido igual à altura do ecrã em 1920×1200 … 375×667), com `safe-area-inset-bottom`.
- **Homepage:** hero → Welcome (texto à esquerda; uma fotografia real dominante e duas «portas»: *Restaurant and bar* e *Hotel*, sem cartões) → **What Makes Lauhata Special** (faixa com 6 ícones do sprite do site, sem emojis) → **From the Lauhata Kitchen** (3 pratos do menu com fotografia, uma grande e duas médias, preços do menu, CTA «Explore Our Menu») → Stay (mais compacto) → Experiences (faixa escura simplificada, 4 ocasiões, um CTA) → Surroundings → Reviews (3 cartões) → *Your Next Moment Starts Here* (intocada) → footer. O panorama foi retirado.
- **Qualidades usadas** (só conteúdo já existente): restaurante junto à praia, dois tipos de quarto, bebidas junto ao mar, pôr do sol, acolhimento timorense, celebrações. **Wi-Fi e refeições ao ar livre não foram incluídos** (não confirmados: `site.amenities` está vazio).
- **Stay:** fotografias 16:9 (2:1 em ecrãs ≥ 3:2, i.e. portáteis 16:10), menos padding. Par de quartos mede 572 px em 1440×900 (64 % do ecrã), 541 px em 1280×800.
- **Avaliações:** três cartões do mesmo tamanho; o terceiro («Share Your Experience» → «Leave Your Feedback») abre o formulário real por baixo. Ligações reais Tripadvisor/Booking.com mantidas.
- **Reservas:** auditoria — o botão do cabeçalho abre o diálogo com abas Restaurant/Stay e mensagem para o WhatsApp (pedido, nunca confirmado). Faltava-lhe nome e observações, que existiam nos formulários das páginas: acrescentados (opcionais) ao diálogo. Retiradas as secções `#reservar` de Restaurant e Stay (as páginas de evento e contacto mantêm os seus formulários). Todas as ligações de reserva abrem o diálogo; os botões «Request this room» pré-selecionam o quarto.
- **Bug corrigido na mensagem de quarto:** com 0 crianças a mensagem dizia «1 child» (`Number(0) || 1`). Agora respeita 0.
- **Menu mobile:** barra de categorias horizontal fixa com deslize (10 categorias, um toque cada), mantida por usabilidade; acrescentados desvanecimento na margem direita, alvos de 44 px e etiqueta «Illustrative image» legível nas miniaturas. **Imagens:** abordagem híbrida — cartões com fotografia no desktop, miniaturas compactas no telemóvel; nada removido (as fotografias são ilustrativas e rotuladas).
- **Experiences (página):** fotografia grande + ocasiões em lista com linhas finas + um CTA, depois o formulário.
- **Gallery:** descrição visível por baixo de cada fotografia (a descrição factual já existente de cada imagem, 2 linhas no máximo), mosaico e lightbox mantidos.
- **Contact:** apenas auditada, sem alterações.

## Testes executados
- `npm test`: **23/23** testes (3 novos + 2 ajustados), 24 páginas e 2287 ligações sem problemas.
- Overflow horizontal: nenhum em 7 páginas × 9 tamanhos (1920×1200, 1680×1050, 1440×900, 1280×800, 1024×768, 768, 430, 390, 375).
- Fluxo do diálogo: quarto (pré-seleção, validação, mensagem com nome/observações) e mesa (validação e mensagem) — verificados por interceção do URL do WhatsApp; **não** enviei mensagens reais.
- Lighthouse móvel (servidor gzip): início 94 / 100 / 100 / 100, restaurante 80 / 100 / 100 / 100, galeria 86 / 100 / 100 / 100 (desempenho / acessibilidade / boas práticas / SEO); CLS 0.
- Capturas vistas: início 1440 e 390, galeria 1440, menu 390.

## Não verificado / pendente
- TypeScript e ESLint: não existem no projeto, não executados.
- Taste gate não reexecutado; sem leitor de ecrã, Safari/Firefox ou dispositivo real; `prefers-reduced-motion` não testado com a preferência ativa.
- A faixa «Experiences» da homepage: o título aparece só depois do scroll (animação de entrada única); numa captura de página inteira sem scroll fica invisível — não confirmei o estado final a scroll real nesta ronda.
- Páginas Contact, Restaurant e Experiences em 1280×800/768 e a versão PT da homepage não foram revistas visualmente; o desempenho móvel do restaurante (80) baixou face à ronda anterior (91).
- Pesquisa: só a Aman foi lida; Six Senses (403), One&Only (tempo esgotado) e Soneva não (ver `LAUHATA_MASTER_REFINEMENT_03_RESEARCH.md`).
- Fotografias de pratos e quartos continuam ilustrativas (rotuladas); a escolha dos 3 pratos em destaque (grelhado, arroz frito da casa, gambas salteadas) é minha, sem dados de vendas — a confirmar com o restaurante.

## Estado do Git
Alterações no diretório de trabalho; **nada commitado nem publicado**.
