# Lauhata — relatório do refinamento 02 (19 de novembro de 2026)

Base: o commit `ec06d2b` (8 de novembro). Esta ronda **refez do zero** também o trabalho da ronda anterior, porque a árvore de trabalho voltou a `ec06d2b` a meio da sessão (ver «Estado do Git»). **Nada foi commitado nem publicado.**


---

## Atualização — brief «Luxury Coastal Hospitality» (19 de novembro, ronda 3)

Decisões do dono: a navegação do novo brief prevalece sobre a anterior; da imagem de referência usei **só o layout** (sem piscina infinita, spa, beach bar, depoimentos nem quartos de luxo, que o Lauhata não confirmou).

**Feito**
- **Navegação:** Home, Restaurant, Hotel (as páginas de quartos), Experiences (a página de eventos), Gallery, Contact, mais o botão laranja «Reserve» (abre o formulário de reserva existente). Our Story e Discover ficam na homepage e no rodapé. Em PT: Início, Restaurante, Hotel, Experiências, Galeria, Contactos.
- **Hero:** «Dine. Stay. *Unwind.*» (última palavra em itálico laranja), texto do brief, botões «Explore Our Resort» e «Discover Our Story».
- **Homepage (ritmo escuro/claro):** hero (escuro) → Our Story (creme, fotografia grande e três factos verdadeiros) → restaurante e hotel com o mesmo peso (escuro) → «Find Your Perfect Stay» com os dois quartos reais (areia) → «Flavours by the Sea» com três pratos (creme) → Facilities só com o que existe: restaurante, bar, junto à praia, quartos com televisão, eventos (areia) → «Moments That Last» (escuro) → galeria (creme) → avaliações (areia) → «Your Perfect Getaway Awaits» (fotografia) → rodapé escuro.
- Hotel (/stay/), Restaurante, Experiências, Galeria e Contacto mantêm-se com as melhorias das rondas anteriores.

**Não segui, e porquê**
- **Rótulos em maiúsculas por cima dos títulos** («ACCOMMODATION»…): a regra do Impeccable proíbe-os sem exceção; mantive os títulos sem rótulo.
- **«Book a Room»:** usei «Request a Room», porque o pedido segue por WhatsApp e só fica confirmado quando a equipa responder.
- **Depoimentos, estatísticas, preços, tamanhos de quarto e número de hóspedes por quarto:** não inventados; ficam as duas caixas Tripadvisor/Booking.com com os valores já verificados no projeto.
- **Lenis:** não adicionado (a Taste Skill desaconselha scroll com inércia numa página de hotelaria).
- **Página de detalhe por quarto:** já existe (/stay/queen-room/ e /stay/queen-and-single-room/).

**Testes desta ronda:** Unknown command: "test"


Did you mean this?
  npm test # Test a package
To see a list of supported npm commands, run:
  npm help 17/17; sem overflow horizontal nem colisão do cabeçalho em 9 páginas × 7 larguras (375–1440), incluindo PT com a nova barra; todas as imagens da homepage carregam. **Não executado de novo:** gate/perf da Taste Skill sobre o novo desenho, Lighthouse, teclado e leitor de ecrã, mobile verificado só por medição (sem captura).

## 1. Problemas identificados (e a causa)
| Problema | Causa real encontrada |
|---|---|
| O hero «encolhia» e o botão de disponibilidade ficava enorme | O cartão de reserva do hero abria e fechava dentro do hero (`booking-card.is-hero`), mudando-lhe a altura |
| **Our Story: o título sobrepõe-se ao parágrafo seguinte** | Medido no navegador: `.ab-title` tinha `position: sticky` em `design.css` e aplicava-se a **dois** títulos. No bloco «What Lauhata is» o título e os parágrafos estão **na mesma coluna**: o título fixava-se a 112 px do topo e passava por cima dos parágrafos que subiam. Só o segundo título (que está noutra coluna da grelha) devia ser sticky. Não é GSAP nem ScrollTrigger |
| Cartões dos quartos desiguais | Duas linhas alternadas com carrosséis de alturas diferentes (`roomRows`) |
| Reviews no mesmo fundo do rodapé | A secção levava a classe `is-dark` |
| Navegação apertada | 5 ligações + botão «Dine & Stay» + idioma + carrinho numa só barra, com o menu a esconder-se abaixo de 1360 px |
| Texto dos factos do quarto ilegível (contraste 1,05:1) | Cartões claros herdavam a cor creme das linhas escuras antigas. Encontrado pelo gate da Taste Skill |
| Caixas de avaliações a transbordar a 375/390 px | Sem a classe escura, a grelha interna perdia a área `meter` |
| Ícone e símbolo com o nome «bed-king» | Resto de nomenclatura King, removido |

## 2. Pesquisa e referências
Ver `LAUHATA_REFINEMENT_RESEARCH.md`. **Só consegui ler o Aman**; o Six Senses devolveu HTTP 403 e o Soneva só um ecrã de carregamento; One&Only não foi consultado. As decisões assentam também nas regras da Taste Skill, no `craft-floor.md` da Impeccable e nas HIG da Apple.

## 3. Alterações implementadas
- **Quartos:** nomes oficiais `Queen Room` e `Queen & Single Room` em EN/PT, em todo o site (cartões, formulários, mensagens, metadados, URLs; os URLs antigos redirecionam). Sem King (teste automático). Sem contagem de quartos, capacidade nem preços.
- **Navegação:** Restaurant, Stay, Events, **Gallery**, Our Story, Contact (PT: Restaurante, Alojamento, Eventos, Galeria, A Nossa História, Contactos). Letra maior (1 rem), mais espaço, uma só linha flex; o menu completo aparece a partir de 1200 px. O botão «Dine & Stay» deixou o cabeçalho. Discover Liquiçá saiu da barra e continua acessível no rodapé e na secção da história.
- **Idioma:** botão com globo, lista English/Português, página equivalente, fecha com Esc, clique fora e saída de foco (padrão de «pop-up button» das HIG).
- **Hero:** título que diz o que é (`Beachfront restaurant and rooms in Liquiçá.`), duas ações simples (`Reserve a Table` principal, `Request a Room` secundária), sem widgets que abrem.
- **Homepage (sequência final):** hero → introdução → Dine & Stay (duas portas iguais) → pré-visualização do restaurante (horário e três pratos) → pré-visualização dos quartos (dois cartões iguais) → eventos → história → opiniões (duas caixas: Tripadvisor e Booking.com) → convite final. Discover deixou a página inicial.
- **Stay:** dois cartões do mesmo tamanho (fotografia 4/3, nome, resumo, factos confirmados, `Request a Room` e «Ver o quarto»). Formulário de pedido simplificado (datas, hóspedes, tipo, nome, telefone/WhatsApp, notas; o email saiu).
- **Restaurante:** menu com categorias numa coluna à esquerda (≥1000 px) com marcação da categoria atual; barra horizontal em ecrãs pequenos. Promessa de «20 a 30 minutos» trocada por «Pergunte à equipa pelos tempos de preparação» (não estava confirmada).
- **Events:** sem passos numerados; um só formulário com os cinco campos (ocasião, data preferida, data alternativa opcional, hora preferida, número de pessoas); botão `Plan Your Event`. Não há campo de contacto: o pedido segue por WhatsApp, onde o contacto já existe.
- **Our Story:** causa corrigida (ver 1); fotografias sem legenda.
- **Gallery:** página própria na barra (grelha editorial com filtros e lightbox).
- **Reviews:** fundo próprio (creme), título e duas caixas alinhados, mesma dimensão; os cartões de comentários individuais saíram; «Leave your feedback» mantém-se.
- **Movimento:** removidos o scroll com inércia (a roda do rato), a barra de progresso laranja, as entradas em cascata e as máscaras; as cenas só animam `transform`; o texto do hero não sobe nem desvanece ao fazer scroll.
- **Carrinho:** mensagem com total por linha (`2x … $6 each = $12`).
- **Build:** um só ficheiro CSS (44 KiB) em vez de onze.

## 4. Decisões de UX e conversão
| Percurso | CTA principal | Onde |
|---|---|---|
| Stay | `Request a Room` | hero (secundário), cartões dos quartos, página Stay, convite final |
| Restaurant | `Reserve a Table` | hero (principal), pré-visualização, página Restaurante |
| Events | `Plan Your Event` | pré-visualização, página Events |
| Geral | `Get in Touch` | convite final (ligação de texto), rodapé |

Um botão principal (laranja) e um secundário (contorno) por zona; o gate ainda aponta 4 variações de botão (por exemplo, o convite final sobre a fotografia), por unificar. Mensagens de WhatsApp diferentes por origem (mesa, quarto, evento, geral, avaliação), todas escritas como **pedido**, nunca como reserva confirmada. A barra do telemóvel (mesa/quarto/WhatsApp) mantém-se e o botão «Voltar ao topo» passou a ficar acima dela e do botão de pedido (alterei o CSS, **não verifiquei visualmente** num telemóvel). Sem pop-ups, urgência falsa ou contadores.

## 5. Skills efetivamente utilizadas
- **Taste Skill:** `gate.mjs` (3 execuções), `perf.mjs` (desktop e 390 px); regras aplicadas: sem legendas sob fotografias, sem fade-in no scroll, sem eyebrows, uma ação principal por ecrã. `consistency.mjs` **não** foi executado nesta ronda.
- **Impeccable:** `craft-floor.md` lido na íntegra no início desta ronda; `detect` executado em início, stay e about. Modo **Persuade** nas páginas editoriais (início, história, galeria), **Operate** no menu, carrinho e formulários (clareza antes de expressão).
- **Apple HIG:** as mesmas referências da ronda anterior (sidebars, pop-up buttons, accessibility, layout, typography, entering data, text fields); aplicadas ao menu lateral, ao seletor de idioma e aos formulários curtos.

## 6. Testes executados e resultados
| Verificação | Resultado |
|---|---|
| `npm test` (build + 17 testes + verificador de ligações) | **17/17 aprovados**; 24 páginas, 2277 ligações, sem problemas |
| Idioma (navegador) | lista abre, marca o atual, liga a `./pt/`; Esc e clique fora fecham |
| Our Story (navegador) | 1.º título `static`, 2.º `sticky`; 0 sobreposições em 4 posições de scroll |
| Overflow e colisão do cabeçalho (navegador, 10 páginas × 8 larguras: 375, 390, 430, 768, 1024, 1200, 1280, 1440) | **limpo** depois de corrigir as caixas de avaliações |
| Menu lateral (navegador) | marcação da categoria atual correta em 3 posições (com `requestAnimationFrame` simulado: o painel oculto não os executa) |
| Carrinho (navegador) | juntar, quantidade 2, persistência, gaveta `$6 each $12`, mensagem de WhatsApp `2x … = $12` correta |
| Formulário de mesa | validação de campos vazios (3 erros) e mensagem correta para `wa.me/67077401111` |
| Formulário de quarto | validação (3 erros), passo de revisão aparece com os dados, envio chega a `/thank-you/`. **Não li o texto final da mensagem** |
| Formulário de eventos | o envio chega a `/thank-you/`. **Não li o texto da mensagem nem a validação nesta ronda** |
| Gallery | 11 fotografias, abre o lightbox, avança, **Esc real fecha** |
| Taste `perf.mjs` | 390 px **PASS** (715 KiB, CLS 0, LCP relativo 268 ms); desktop FAIL só pelo vídeo de 5 MB do hero (só portáteis, por desenho) |
| Taste `gate.mjs` | **GATE: OPEN — 98 FAIL** (3 rondas gastas) |
| Impeccable `detect` | 40 achados: 28 preenchimentos curtos em controlos, 3 entrelinha, 3 paleta creme, 3 brilho no splash; os 3 `<img>` sem `src` do lightbox foram corrigidos depois |

**Não executados:** typecheck e lint (o projeto não os tem), Lighthouse, Playwright, Safari/Firefox, leitor de ecrã, telemóvel real, teclado ponta a ponta em todas as páginas, medição de FPS (painel oculto), `consistency.mjs`.

## 7. Por resolver
- **Gate aberto (98).** Maiores grupos: margens/arestas da composição, «uma secção por ecrã» (secções de duas colunas e rodapé), botões do hero repetidos noutras zonas (4 estilos), títulos de marca em vez de «nome da coisa», `ws-b` sobreposta à `ws-a` (colagem intencional), foto `lauhata-praia-do-mar` ampliada (fonte pequena), sombra da história que ultrapassa a fotografia, nota «algumas fotografias são ilustrativas» no rodapé.
- **Nota das fotografias no rodapé:** o gate quer-na removida; **mantive-a de propósito**, porque as fotografias dos quartos são ilustrativas e esconder isso seria enganar o visitante.
- **GSAP/ScrollTrigger numa página «place»:** a Taste Skill desaconselha; mantive-os só para o empurrão lento das fotografias (sem texto).
- **Dono:** nº de quartos físicos, capacidades/comodidades/preços, fotografias reais dos quartos, ementa («tempo de preparação»), logótipos das plataformas de avaliações.
- **Pesquisa incompleta** (ver 2).
- A cintilação das reservas continua **sem reprodução visual** (painel oculto); as causas medidas e suspeitas foram tratadas (espaço reservado para erros, observadores com margem, escritas só quando muda, cenas só com `transform`).

## 8. Estado do Git
Ramo `main`, a partir de `ec06d2b`; **sem commit, sem push, sem deploy**. Ficheiros alterados em `website/`: `build.mjs`, `package.json`, `src/layout.mjs`, `src/pages.mjs`, `src/i18n/{en,pt}.mjs`, `src/data/{rooms,menu,images}.mjs`, `src/assets/js/{main,order,cinema}.js`, `src/assets/css/{resort,cinema}.css` e **`refine.css`** (nova); novos: `tests/site.test.mjs`, `tools/check-site.mjs`, `docs/LAUHATA_REFINEMENT_*.md`, `.taste-skill/`. `dist/` foi regenerado.

**Aviso:** a meio desta sessão a árvore de trabalho voltou sozinha a `ec06d2b` (sem stash); o trabalho foi refeito a partir dos scripts de edição e do código recuperado de `origin/main` (verificador de ligações, menu lateral, menu de idioma). Se quiser guardar o trabalho, convém fazer um commit — mas só o faço se mo pedir.

---

## Passagem de controlo de qualidade (19 de novembro, depois do redesenho «Luxury Coastal»)

Sem commit, sem deploy, sem desfazer o redesenho. Só corrigi regressões e problemas reais.

### O que foi corrigido
| Problema | Origem | Correção |
|---|---|---|
| Foto do convite final **desaparecia** (bloco escuro) | A minha regra `position: relative` na `.scene-media` | `position: absolute; inset: 0` |
| «Dine & Stay» e «Facilities» sem tipo serifado nem espaço | Regra perdida ao reescrever o `refine.css` | `.ds-title` restaurado |
| Texto do herói cortado em cima (19 px) | Máscara da animação sem folga | folga em cima e em baixo nas palavras |
| Etiqueta e descrição dos pratos ilegíveis (2,34:1 e 4,83:1) | Laranja claro sobre areia | `terra-dark` e tinta |
| Títulos sem escala (h3 maior que h2; 4 tamanhos de h2) | Tamanhos soltos | uma escala para h2 e h3 abaixo dela |
| Menu do telemóvel com **«Gallery» duas vezes** | Ligação extra herdada | removida (+ teste novo) |
| Lighthouse `aria-allowed-attr` | `aria-required` num `<button>` (seletores de data/hora) | passou a `data-required` |
| Lighthouse `label-content-name-mismatch` | «LauhataBeach Escape» sem espaço no logótipo | espaço entre os dois `<span>` |
| Barra do telemóvel flutuante deixava ver texto ao lado | Pílula translúcida | banda opaca de largura total |
| «Voltar ao topo» por baixo da barra do telemóvel | Posição herdada | sobe acima da barra e do botão de pedido |
| Botão principal branco nos heróis das páginas | `btn-white` | todos laranja (um principal, um secundário) |
| Duas ligações «Discover Our Story» seguidas | Brief | a secção da história usa «Read our story» |
| Anel de foco ausente ou pouco visível | Regras antigas | anel de 2 px, claro em fundos escuros |
| Fotografias externas sem `width`/`height` | `figure()` | dimensões nominais 3:2 (o CSS manda no layout) |
| Texto sobre a foto do convite final a 2,4:1 (telemóvel) | Brilho do sol | painel escuro por trás do texto no telemóvel |

### Taste gate — resultado honesto
- Primeira execução sobre o novo desenho: **118 falhas**. Depois das correções: **106 abertas** (3 rondas gastas) → **GATE: OPEN**.
- **Regressões reais corrigidas:** contraste dos pratos, texto cortado, escala dos títulos, barra do telemóvel, foto do convite final, foco, botões do herói.
- **Falsos positivos ou aceites de propósito:**
  - `photo-upscale` (13 → 7): os ficheiros têm as larguras certas (ex.: `grilled-fish-640.jpg` 640×480, verificado); o gate mede imagens ainda a carregar.
  - `nav` («Lauhata BEACH ESCAPE» quebra linha): é o logótipo em duas linhas.
  - `sample-label`: a nota «algumas fotografias são ilustrativas» **fica**, é honesta.
  - `map-link`: «Get directions» usa coordenadas exatas, não um distrito.
  - `copy-slop-word` «elevate»: nome da agência no rodapé (dispensa já registada).
  - `focus-ring` (`main:focus` e `.pk-btn` antigos): o `main` só recebe foco por programa; os outros têm anel por uma regra posterior com `!important`.
  - `copy-headline` («Dine. Stay. Unwind.»): título pedido pelo dono; a categoria está no `<title>` e na descrição.
  - `effect-kind` (GSAP numa página «place»): mantido só para o empurrão lento das fotografias.
  - `collide` a 320 px: o cabeçalho fixo cobre o topo da foto do herói por desenho.
- **Genuínas por resolver (estrutura):** `edge-left`/`edge-right`/`container-edges` (≈43), `screen-height`/`section-height` (secções com 1,1 a 1,4 ecrãs: o brief pediu para não forçar 100vh), `row-lines`, `split-pair`, `one-section`, `no-visual` (Facilities é uma faixa curta de ícones), `focus-visible` no botão «Read our story» (anel presente por CSS; o gate não o deteta), `contrast` do texto final no telemóvel (3,3:1 mesmo com o painel, abaixo de 4,5:1).

### Desempenho
| Verificação | Resultado |
|---|---|
| Taste `perf.mjs`, 390 px | **PASS** nas métricas: LCP relativo ≈ 316 ms, CLS 0, blocking 101 ms |
| Taste `perf.mjs`, 1440 px | **1 FAIL**: transferência total 7,5 MiB = vídeo do herói (5 MB, só em portáteis) + 2,1 MiB de imagens quando se percorre a página toda. LCP 408 ms, CLS 0,001, blocking 104 ms |
| **Lighthouse 13.6** móvel, início | Desempenho **94**, Acessibilidade **100**, Boas práticas **100**, SEO **100**; LCP 2,3 s, CLS 0,001, TBT 40 ms |
| Lighthouse desktop, início | **97 / 100 / 100 / 100**; LCP 0,5 s |
| Lighthouse móvel, páginas interiores | Acessibilidade **100** e SEO **100** em stay, restaurante, contacto, eventos, galeria e sobre. **Desempenho 70–79** (LCP simulado 4,4–7,6 s) |

**Desempenho das páginas interiores — por resolver.** Medido sem estrangulamento, o LCP (foto do herói) carrega em ≈ 240 ms mais 160–190 ms de renderização; o número alto vem do modelo de CPU 4× e do trabalho da thread principal (2,4–4,2 s), com ≈ 400 KiB de JavaScript sem minificar e ≈ 200 KiB de CSS não usado (um só ficheiro para todas as páginas). Caminho provável: minificar o JS e dividir o CSS por página. Não o fiz nesta passagem (exigia uma nova dependência de build).

### Capturas de ecrã
36 capturas de página inteira (9 rotas × 1440, 1024, 768 e 375 px) em `website/.qa/shots/` (ferramenta `shoot.mjs` da Taste Skill, com o Brave). **Inspecionei visualmente:** início a 1440, 768 e 375 (com recortes do herói, do convite final e de secções), stay a 1440, restaurante a 1440 (visão geral), eventos a 1440, sobre a 1440 e galeria a 375. As restantes (contacto, descobrir, quarto, e 1024 em todas) foram capturadas mas **não as vi**; para elas só tenho a medição de overflow (limpa em 9 páginas × 7 larguras). As capturas não foram repetidas depois das últimas correções (barra do telemóvel, painel do convite final).

### Acessibilidade
- Lighthouse: 100 em 7 páginas.
- Teclado: Tab percorre «Skip to content», logótipo, carrinho, menu e botões, com contorno sólido de 2 px nos 9 primeiros passos testados no início. Esc fecha o menu do telemóvel e o lightbox.
- Auditoria de HTML (13 rotas): 1 `h1` por página, sem saltos de nível, todas as imagens com `alt`, todos os campos com rótulo, `lang` definido, sem IDs duplicados. As ligações de imagem «sem nome» no início têm `aria-hidden` e `tabindex="-1"` (duplicam o texto ao lado).
- Movimento reduzido: o código desliga o «tier B» (parallax, empurrões) com `prefers-reduced-motion`; **não o testei com a preferência ativa no navegador**.

### Verificação funcional (executada)
| Fluxo | Resultado |
|---|---|
| Navegação (6 ligações) e ligações internas | `check-site`: 24 páginas, 2277 ligações, 0 problemas |
| Idioma | lista abre, Esc e clique fora fecham, liga à página gémea |
| Menu do telemóvel | abre com as 6 ligações e os dois botões, Esc fecha (depois de remover a ligação duplicada) |
| Reservar mesa | validação (3 erros com campos vazios) e envio com a mensagem correta para `wa.me/67077401111` |
| Pedir quarto | validação, passo de revisão e envio até `/thank-you/`; «Request a Room» mantido (é um pedido, só confirmado pela equipa) |
| Eventos | o envio chega a `/thank-you/` |
| Carrinho | juntar, quantidade, persistência, mensagem `2x … $6 each = $12` |
| Galeria | 11 fotografias, o lightbox abre e avança, Esc fecha |

**Não verificado:** o texto das mensagens de WhatsApp de quarto e eventos depois destas correções, teclado ponta a ponta em todas as páginas, leitor de ecrã, Safari/Firefox, telemóvel real, FPS, `consistency.mjs`.

### Testes
`npm test`: **19/19 aprovados** (dois novos: menu do telemóvel sem duplicados; h1, níveis de títulos, `alt` e `lang` em todas as páginas). Sem typecheck nem lint (o projeto não os tem).

### Bloqueadores restantes antes do commit
1. **Desempenho das páginas interiores em telemóvel:** melhorou (com gzip: 79–96, ver a secção de otimização); falta o restaurante (TBT) e a galeria/sobre (LCP).
2. **GATE: OPEN (106)**, sobretudo alinhamento e alturas de secção; o contraste do texto final no telemóvel está a 3,3:1.
3. Informação do dono: número de quartos, capacidades, comodidades e preços, fotografias reais dos quartos e dos pratos, ementa (tempo de preparação).
4. Ver as capturas que não inspecionei (contacto, descobrir, quarto, 1024).

---

## Otimização de JS e CSS (19 de novembro, depois da passagem de QA)

### O que mudou
- **GSAP, ScrollTrigger e `cinema.js` só carregam na página inicial.** O Lighthouse mostrou o `ScrollTrigger.min.js` a custar ≈ 820 ms de thread principal nas páginas interiores, sem nada que o justificasse lá. Nas interiores deixou de haver o «empurrão» lento da foto do herói e a deriva das fotografias; o texto, as animações de entrada em CSS e o resto continuam. Isto também alinha com a Taste Skill (sem bibliotecas de scroll numa página «place») e retira uma fonte possível de cintilação.
- **Minificação no build** com `esbuild` (nova **dependência de desenvolvimento**, `devDependencies`): CSS e os 5 scripts do site. O build continua a funcionar sem ele (só fica menos comprimido). Os ficheiros de `vendor` já vinham minificados.
- **Erro corrigido no `cinema.js`:** o caminho de recuperação chamava `smoothTick`, que já não existia (teria dado `ReferenceError`).
- **Galeria:** as miniaturas pequenas pedem uma imagem para 50 % da largura em telemóvel, em vez de 100 %.

### Lighthouse móvel (13.6), antes e depois
| Página | Antes | Depois, servidor local sem gzip | Depois, **com gzip** (como o GitHub Pages) |
|---|---|---|---|
| Início | 94 | 95 | **97** (LCP 1,1 s) |
| Stay | 77–79 | 82 | **95** (LCP 2,6 s) |
| Restaurante | 70 | 72 | **79–83** (LCP 2,9 s; TBT 430–560 ms) |
| Contacto | 75 | 83 | **94** |
| Eventos | 79 | 85 | **96** |
| Galeria | 71 | 74 | **79–83** (LCP 4,4–5,3 s) |
| Sobre | 73 | 77 | **83** (LCP 3,9 s) |

Acessibilidade, boas práticas e SEO ficaram a **100** em todas. O servidor de desenvolvimento (`http-server`) não comprime, por isso os números «sem gzip» são pessimistas; os «com gzip» foram medidos com um servidor temporário só para isto (já parado). **Não medi o site publicado.**

### Ainda por resolver (desempenho)
- **Restaurante:** TBT de 430–560 ms (cerca de 80 cartões de prato e o menu pesquisável a iniciar).
- **Galeria e Sobre:** LCP de 3,9–5,3 s (fotografias grandes em simultâneo com a do herói).
- CSS de ≈ 230 KB (não comprimido) num só ficheiro para todas as páginas; dividir por página continua possível.

### Testes
`npm test`: 19/19. Verificado no navegador, na página Stay: sem erros de consola (só o aviso antigo da política CSP), o título do herói visível, o menu de idioma e os 13 seletores a funcionar com o JS minificado. Depois da minificação voltei a verificar no restaurante: carrinho (adicionar), validação do formulário de mesa (3 erros) e o scroll-spy do menu (breakfast, main e drinks marcados corretamente). **Não voltei a correr** o Taste gate, as capturas de ecrã, nem os fluxos de quarto e de eventos; recomendo repeti-los antes do commit.

---

## Evolução inspirada nas cinco referências (19 de novembro)

**Aviso importante:** a mensagem falava em cinco referências visuais, mas **não chegou nenhuma imagem** (só o texto). Não vi o Skyview, o Ocean Haven, o Tropical Nature Homestay, a referência escura nem o Northview. Trabalhei a partir das descrições do brief e das regras das skills. Se enviar as imagens, ajusto a composição a elas.

### Implementado (homepage)
Nova ordem, sem repetir informação entre secções:

| # | Secção | Fundo | Composição |
|---|---|---|---|
| 1 | Hero «Dine. Stay. Unwind.» | foto/vídeo real | mantido |
| 2 | **Welcome to Lauhata** | creme | texto à esquerda; **quatro cartões fotográficos assimétricos** à direita (Restaurante, Estadia, Bar e descanso, Momentos especiais): um alto, dois empilhados, um largo |
| 3 | **Faixa de instalações** | areia | Restaurante, Alojamento, Bar, Localização junto à praia, Eventos; divisórias finas; no telemóvel passa a grelha de 2 colunas |
| 4 | **Find Your Perfect Stay** | creme | os dois quartos reais em cartões iguais com elevação ao passar o rato; «Explore All Rooms» |
| 5 | **A Taste of Lauhata** | areia | texto, horário e dois botões; mosaico de 3 fotografias (uma grande, duas pequenas) |
| 6 | **What Makes Lauhata Special** | **escuro** | três painéis: pores do sol (galeria), celebrações (eventos), à volta de Liquiçá (descobrir) |
| 7 | **Our Story** | creme | **fotografia dominante com duas mais pequenas sobrepostas**; texto diferente do da introdução |
| 8 | Galeria | areia | 4 fotografias de proporções diferentes (7/5 e 5/7 colunas) |
| 9 | Avaliações | creme | as duas caixas verificadas (Tripadvisor e Booking.com) |
| 10 | **Your Next Moment Starts Here.** | foto | «Request a Room» e «Reserve a Table» |

Só duas secções escuras (hero e «What Makes Lauhata Special») mais o rodapé: o resto é claro. Texto em PT para tudo. Tudo com os dados do projeto: nada de piscina, spa, preços, avaliações ou horários inventados.

### Também corrigido
- Botão de idioma: nome acessível agora começa pelo texto visível («EN · Language: English»), o que o Lighthouse apontava.

### Decisões e o que não fiz
- **Cartões de quartos em três colunas e quarto «em destaque» com fotografias de apoio:** não, porque só existem **dois** tipos de quarto e as fotografias deles são ilustrativas; ficam dois cartões iguais.
- **Hero:** não alterei a composição; já é uma fotografia/vídeo real da propriedade. Não existe uma fotografia panorâmica do mar com o edifício que justificasse trocá-la.
- **Fotografias:** as reais (costa, aéreas, praia, pores do sol) lideram o hero, a história, a galeria e o convite final. **As de comida, quartos e bar são ilustrativas** (marcadas como tal) e continuam a ser a nota do rodapé; o Lauhata deve substituí-las por fotografias suas.
- **Movimento:** mantido o GSAP só na página inicial; acrescentei apenas zoom suave de imagens ao passar o rato e elevação dos cartões de quartos, todos desligados com `prefers-reduced-motion`.
- **Avaliações:** só as duas plataformas verificadas, como antes.

### Validação desta passagem
| Verificação | Resultado |
|---|---|
| `npm test` | **19/19**; 24 páginas, 2277 ligações |
| Capturas de página inteira da homepage | 1440, 1024, 768 e 375 px (`.qa/shots/home-*-r5.png`). **Vi** 1440 (visão geral e recortes da introdução e do restaurante) e 375 (introdução, experiências, história). **Não vi** 1024 nem 768 |
| Overflow horizontal, início EN e PT | nenhum em 375, 390, 430, 768, 1024, 1280 e 1440 |
| Imagens | os 37 ficheiros locais respondem 200 em EN e PT; **não verifiquei as 35 variantes externas (Unsplash) uma a uma** |
| Consola | sem erros (só o aviso antigo de CSP em modo «report-only») |
| Lighthouse (servidor com gzip), início | **Móvel:** desempenho 92 (LCP 1,1 s, CLS 0, TBT 300 ms), acessibilidade 100, boas práticas 100, SEO 100. **Desktop:** 98 / 100 / 100 / 100 |
| Ligações dos novos cartões | `./restaurant/`, `./stay/`, `./restaurant/#cat-drinks`, `./events/#pedido` (âncoras existentes; `check-site` sem problemas) |

**Não verificado nesta passagem:** o Taste gate (não foi corrido sobre esta versão), o fluxo de pedido de quarto e de reserva de mesa (não foram alterados e passaram na passagem anterior, mas **não os repeti**), o teste de movimento reduzido com a preferência ativa, o teclado ponta a ponta, leitor de ecrã, Safari/Firefox e telemóvel real.

---

## Segunda leitura: com as cinco imagens de referência à vista (19 de novembro)

Agora vi as cinco referências (Skyview, Ocean Haven, Tropical Nature Homestay, a referência escura e Northview). Retirei delas **princípios**, não elementos; o que não tem correspondência verificada no Lauhata ficou de fora.

### Aplicado
| Referência | Princípio | Onde ficou |
|---|---|---|
| Skyview, Ocean Haven, homestay | Faixa de instalações com **ícones em círculos**, rótulo e uma linha de apoio | Faixa a seguir à introdução: Restaurante, Alojamento, Bar, Localização junto à praia, Eventos, cada um com um facto confirmado por baixo |
| Ocean Haven | Título **centrado com filete fino dourado**, botão de contorno «ver tudo» | «Find Your Perfect Stay» e «What Makes Lauhata Special»; «Explore All Rooms» em botão de contorno |
| Ocean Haven, Skyview | Cartões de quartos com **linha de ícones** (cama, televisão) | Os dois quartos reais, com a informação confirmada |
| Ocean Haven | **Selo circular** de ícone sobre a fotografia das experiências | Os três cartões escuros |
| Homestay | Transição **curva** entre o herói e a página | Canto arredondado da introdução sobre o herói |
| Northview | Composição de imagens em **losangos entrelaçados** | Our Story (ecrãs largos); em telemóvel voltam os retângulos |
| Northview, Skyview | **Painel** sobre a fotografia final com as duas ações | «Your Next Moment Starts Here.»: «Reserve a Table» (laranja) e «Request a Room» (contorno), com a nota de que a equipa confirma por WhatsApp |
| — | Evitar duas chamadas iguais seguidas | Na página inicial, o rodapé deixa de repetir os botões de reserva |

### Não apliquei, de propósito
- **Barra de reserva com datas e hóspedes** (Skyview, Ocean Haven, homestay, referência escura): seria um sistema de disponibilidade falso. O pedido de quarto continua pelo formulário e por WhatsApp.
- **Piscina, spa, atividades aquáticas, «Wellness», passeios**: o Lauhata não os tem confirmados.
- **Preços, «from $…/night», contagem decrescente, descontos de 30 %, selos «5 estrelas», «24/7», «melhor preço garantido»**: nada disto está confirmado; os contadores e descontos são exatamente o que o brief proibiu.
- **Depoimentos com foto e nome**: não existem verificados; ficam as duas caixas Tripadvisor e Booking.com.
- **Ecrã escuro de ponta a ponta** (referência escura e Northview): o brief pediu uma página claramente mais clara.
- **Rótulos pequenos em maiúsculas por cima dos títulos** (Ocean Haven, Skyview): a regra da Impeccable continua a proibi-los.
- **Letra manuscrita** («Where comfort meets adventure»): não usei.

### Validação desta passagem
| Verificação | Resultado |
|---|---|
| `npm test` | **19/19** |
| Capturas da página inicial a 1440 e 375 px | vistas: herói, introdução, faixa, quartos, experiências, história (1440), painel final e faixa (375). **1024 e 768 não revistas** depois destas alterações |
| Overflow horizontal (início EN, início PT, stay, restaurante) | nenhum em 375, 390, 430, 768, 1024, 1280 e 1440 |
| Lighthouse (servidor com gzip), início | **Móvel 97 / 100 / 100 / 100** (LCP 1,1 s, CLS 0,001, TBT 130 ms); **desktop 97 / 100 / 100 / 100** |

**Não verificado agora:** o Taste gate sobre esta versão, os fluxos de pedido de quarto e de reserva de mesa (não alterados), movimento reduzido ativo, teclado, leitor de ecrã, Safari/Firefox e telemóvel real. Os losangos usam `clip-path`: não os testei em navegadores que não sejam o Brave.

---

## Compactação, navegação de cinco páginas e nova organização (19 de novembro, ronda 7)

### Implementado
- **Navbar com exatamente cinco páginas:** Restaurant, Hotel, Experiences, Gallery, Contact (PT: Restaurante, Hotel, Experiências, Galeria, Contactos). Sem Home, Our Story, About nem Discover; o logótipo continua à esquerda e leva à página inicial; o menu do telemóvel tem as mesmas cinco. Mantive o botão «Reserve».
- **Welcome to Lauhata reorganizada:** à esquerda título, parágrafo e botão «Discover Lauhata»; à direita **quatro cartões retangulares numa só linha** (Restaurant, Hotel, Bar, Special Moments), cada um com fotografia 4:3, título curto, uma frase e um indicador circular. Em 1100 px ou mais ficam os quatro em linha; entre 700 e 1099 px ficam em linha por baixo do texto; abaixo disso 2×2, e em telemóvel pequeno passam a cartões horizontais (foto à esquerda, texto à direita).
- **Distribuição dos pontos fortes**, sem repetir: Welcome (conceito + os quatro cartões) → **A Taste of Lauhata** (gastronomia, horário, encomendas pelo menu enviadas por WhatsApp para comer no restaurante, reserva de mesa) → **Find Your Perfect Stay** (os dois quartos reais, pedido por WhatsApp) → **Experiences & Special Moments** (ocasiões reais da página de eventos, «Plan Your Event») → **Discover the Surroundings** (Liquiçá, forte de Maubara, ruínas de Aipelo; ligação a Discover) → avaliações → painel de reserva final.
- **Retirado da página inicial:** a galeria (fica só na navbar e no rodapé), a faixa de instalações e a secção de pores do sol, para não duplicar; no rodapé da página inicial deixaram de se repetir a frase e os botões de reserva.
- **Hero com drone:** já existia **filmagem aérea real do Lauhata** (`hero-fundo-1600.mp4`, ≈ 5 MB) e foi mantida. Só carrega em ecrãs de portátil (1280–1920 px) e **não** com poupança de dados, 2G ou movimento reduzido; só começa depois de a página estar pronta (`preload="none"`), pausa fora do ecrã e, se falhar, fica a fotografia. Em telemóveis e tablets fica a fotografia por peso. Não troquei por footage de outro local. O brief pedia golden hour e travelling lento: **não verifiquei a hora do dia nem o movimento da filmagem existente**.

### 16:10 e proporções
- Um só ritmo vertical (`--sec-y`: 3 a 4,75 rem), títulos numa só escala (2 a 2,8 rem), hero entre 560 e 860 px (88 % da altura do ecrã) e fotografias mais baixas (quartos 16:10, mosaicos 4:3).
- **Altura total da página inicial** (EN, medida nas capturas): 1440×900 passou de **9 887 px (11 ecrãs) para 5 917 px (6,6 ecrãs)**; 1920×1200: 6 486 px (5,4 ecrãs); 1680×1050: 5 512 px; 1280×800: 5 645 px; 1024×768: 5 576 px; 768×1024: 7 176 px; 390×844: 8 348 px; 375×812: 8 481 px.

### Validação
| Verificação | Resultado |
|---|---|
| `npm test` | **20/20** (navegação de cinco ligações e menu móvel de cinco; novo teste: quatro cartões, sem galeria nem faixa, sem secção repetida); 24 páginas, 2277 ligações |
| Capturas de página inteira | 1920×1200, 1680×1050, 1440×900, 1280×800, 1024×768, 768×1024, 390×844, 375×812. **Vi** 1440 (visão geral e recorte da introdução), 768 e 390 (introdução e restaurante). **Não vi** 1920, 1680, 1280, 1024 nem 375 |
| Overflow e colisão do cabeçalho | **nenhum** em 7 páginas × 8 larguras (1920, 1680, 1440, 1280, 1024, 768, 390, 375) |
| Lighthouse início (servidor com gzip) | **Desktop 96/100/100/100**, LCP 0,9 s (com o vídeo a carregar: 5,3 MiB). **Móvel 79–91** em três medições (LCP ≈ 3,0 s, TBT 120–450 ms), acessibilidade 100. Desceu face aos 97 da passagem anterior, com a foto do herói agora como elemento LCP; **não investiguei** a causa |
| Vídeo do herói | pedido em desktop e **0 pedidos em móvel**; LCP e TBT de desktop não pioraram |

### Limitações
- Mobile: o desempenho da página inicial oscila (79–91); falta perceber porque o LCP subiu de 1,1 s para ≈ 3,0 s.
- Não corri o Taste gate nesta ronda, nem repeti os fluxos de pedido de quarto, reserva de mesa e encomenda (não foram alterados; `check-site` e os testes continuam a passar).
- Typecheck e ESLint: o projeto não os tem.
- As fotografias de comida, quartos e bar continuam ilustrativas (marcadas no rodapé).
