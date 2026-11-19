
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
1. **Desempenho das páginas interiores em telemóvel (70–79).** Minificar o JS e dividir o CSS por página.
2. **GATE: OPEN (106)**, sobretudo alinhamento e alturas de secção; o contraste do texto final no telemóvel está a 3,3:1.
3. Informação do dono: número de quartos, capacidades, comodidades e preços, fotografias reais dos quartos e dos pratos, ementa (tempo de preparação).
4. Ver as capturas que não inspecionei (contacto, descobrir, quarto, 1024).
