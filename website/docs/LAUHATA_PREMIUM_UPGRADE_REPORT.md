# Premium Digital Experience Upgrade — relatório (23 de novembro de 2026)

## Auditoria: o que já existia
A maior parte deste pedido já estava implementada nas rondas anteriores (03–05, menu escalonado, filtro do menu, carrinho, FAQ, galerias dos quartos, SEO). Não reconstruí nada. Verifiquei, e mantive: hero com vídeo aéreo real e fotografia real de reserva, header transparente → sólido, menu móvel (GSAP), páginas do alojamento por quarto, menu digital com pesquisa, categorias, carrinho e WhatsApp, diálogo de reservas (mesa e quarto) com validação e mensagem pré-preenchida («pedido», nunca «confirmado»), galeria com lightbox, Discover Liquiçá com fontes, avaliações Tripadvisor/Booking.com verificadas, EN/PT, `sitemap.xml`, `robots.txt`, canonical, hreflang, Open Graph e JSON-LD (Restaurant + Hotel, com morada e telefone reais).

## Implementado nesta ronda
1. **Política de fotografia dos pratos (o ponto mais importante).** Três estados:
   - **REAL**: ficheiro aprovado `src/assets/img/pratos/<id>-640.jpg` (ou imagem não marcada como substituta em `menu.mjs`).
   - **PLACEHOLDER** (por omissão): mosaico próprio da marca (fundo areia com linhas finas, ícone e «LAUHATA»), sem letra nem imagem de outro prato.
   - **ILUSTRATIVA**: as fotografias de pratos semelhantes (`pratos-temp`) **já não são mostradas ao público**; só aparecem se `site.dishPhotos.showIllustrative = true`.
   Aplica-se ao menu, ao carrossel da home, às bebidas e ao carrinho (o «C» da miniatura foi substituído por um ícone). O cartão «Restaurant & Bar» da home deixou de usar a fotografia de um prato de stock e passou a usar uma fotografia aérea real do Lauhata. O texto do carrossel foi corrigido («as fotografias dos pratos estarão disponíveis em breve»).
2. **Dados preparados para o negócio gerir** (`menu.mjs`, documentados no cabeçalho): `special` («Especial do dia», sem duplicar dados), `available: false` («Indisponível hoje», sem botão de encomenda), `diet` (vegetariano/vegano/picante/marisco, só valores verificados) e `allergens` (só quando listados). «Vegetariano» vem da secção vegetariana da própria ementa; nada é inferido do nome do prato. Acrescentada uma nota de alergias («diga à equipa antes de pedir»). Testado com dois pratos marcados temporariamente (a marcação foi revertida: nenhum prato está hoje como especial nem indisponível).
3. **Stay:** as fotografias dos quartos abrem o lightbox do site (setas, Esc, swipe); nova **comparação compacta** dos dois quartos só com dados confirmados (camas, lotação, televisão, preço por noite); nota a dizer que os horários de check-in/out ainda não estão publicados e que um pedido não é uma reserva.

## Não alterei (de propósito)
- **Copy do hero** («Dine. Stay. Unwind.», «Explore Our Resort», «Discover Our Story»): é texto aprovado por si em rondas anteriores; a sugestão do brief («Where the ocean meets your escape.») não foi aplicada.
- **Categorias da galeria** (The Beach, Restaurant, Accommodation, Food & Drinks, Events): só existem fotografias reais para «Lauhata e a praia», «O mar e a luz» e «Arredores»; não criei categorias vazias nem usei fotografias que não sejam do Lauhata.
- **Preferência de lugar na reserva de mesa**, **horários de check-in/out**, **política de reservas** e **disponibilidade**: não existem dados confirmados; não foram inventados.
- Sem backoffice nem CMS falso: os dados continuam em ficheiros (`menu.mjs`, `rooms.mjs`, `site.mjs`) prontos para um CMS futuro.

## Testes executados
- `npm test`: **42/42** (novo: política de fotografia; atualizado o do menu da ronda anterior), 24 páginas, ~2400 ligações OK.
- Navegador sem cabeça: menu com marcadores de posição e etiquetas «Vegetarian» só na secção vegetariana; carrinho com miniatura da marca; lightbox dos quartos (abre, avança «2 / 3», fecha); JSON-LD na home (`Restaurant`+`Hotel`, localidade, telefone, geo) e BreadcrumbList.
- Lighthouse móvel: home 93, restaurante 92, stay 95, galeria 80, Discover 88 (desempenho); acessibilidade, boas práticas e SEO **100** em todas; CLS 0.
- Não executei ESLint nem TypeScript (não existem no projeto). Não testei com leitor de ecrã nem em dispositivo real.

## Informação e fotografia ainda em falta (Lauhata)
Fotografias reais, aprovadas, de cada prato (basta largar `<id>-640.jpg` e `-1080.jpg` em `src/assets/img/pratos/`); lista de especiais/indisponíveis do dia; alergénios e etiquetas dietéticas verificadas por prato; horários de check-in e check-out; política de reservas e cancelamento; fotografias reais de casa de banho, interiores e exterior dos quartos (hoje as dos quartos são ilustrativas e rotuladas); fotografias reais de eventos.

## Próximos passos recomendados (não implementados)
Sessão fotográfica dos pratos mais pedidos; ligar `special`/`available` a uma folha de cálculo ou CMS; vídeo aéreo em formato otimizado adicional para 4G; páginas de destino individuais em Discover Liquiçá quando houver fotografia e informação verificada de cada local; reduzir o peso das fotografias da galeria (desempenho móvel 80).

## Git
Alterações só no diretório de trabalho; **sem commit nem deploy**.
