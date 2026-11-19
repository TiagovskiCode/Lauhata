# Master Refinement 05 — pesquisa, auditoria e decisões (19 de novembro de 2026)

## Referências: o que foi e não foi consultado
Nesta ronda **não fiz pesquisa web nova**. As referências disponíveis continuam a ser as das rondas anteriores:
- aman.com (lida na ronda 03: um único «Reserve», cartões de imagem com legenda curta); Six Senses (HTTP 403), One&Only (tempo esgotado) e Soneva (ecrã de carregamento) **não foram lidas**;
- as skills instaladas (Taste, Impeccable, `design:*`, `web-performance-audit`) e as Apple HIG da pasta `apple-design-skill-main`, relidas nas rondas anteriores; nesta ronda **não reabri** os ficheiros das skills, apliquei o que já tinha lido (sem cartões desnecessários, uma ação principal por ecrã, 44 px de alvo, foco visível, `prefers-reduced-motion`).
Não há, portanto, estudo novo de menus com «quick add», de quartos editoriais nem de carrinhos premium: as decisões abaixo vêm da auditoria do próprio código e dos padrões já usados no projeto.

## Auditoria do estado atual (o que foi encontrado)
| Área | Achado |
|---|---|
| Hero | já tinha `100vh/100svh`, mas a secção seguinte subia 44 px sobre a base da hero (o «elemento branco» era a curva do Welcome); não havia indicador de scroll. |
| Quick add | `order.js` já trata `[data-add]` globalmente e o carrinho existe em todas as páginas, mas a homepage só carregava no `LAUHATA_MENU` 3 + 8 pratos; foi passado o menu completo. |
| Carrinho | o «C» ao lado dos valores é a **inicial do prato** usada como miniatura quando o prato não tem fotografia própria (`cl-thumb is-initial`), não um símbolo de moeda. A moeda é `$` (USD) vinda de `site.order.currency`, igual em toda a aplicação. O CSS das linhas também não tinha área de grelha para a miniatura. |
| Quartos | só existem 4 fotografias por quarto, todas ilustrativas e distintas entre quartos. |
| Comodidades | `docs/CHECKLISTS.md` e `src/data/rooms.mjs` listam Wi-Fi, pequeno-almoço, casa de banho privativa e ar condicionado como **pendentes de confirmação do Carlos**; e uma nota da checklist refere opiniões do Tripadvisor (2023) com «sem Wi-Fi». **Não publicadas.** |
| Contacto | telefone e horários já existiam nos dados (`site.mjs`); o formulário estava depois do mapa. |
| FAQ | o número de telefone na resposta «How can I contact the team?» aparecia sem formatação por uma expressão regular com a barra invertida perdida; corrigido. |

## Decisões de design
1. **Categorias do menu:** barra horizontal fixa a partir de **1000 px** (largura em que cabem as 10 categorias com contagens), botão **Filter** abaixo disso; mudança só por CSS (`min-width: 1000px` / `max-width: 999px`) e uma `matchMedia` que limpa o filtro quando se passa a largo. Não há deteção de dispositivo.
2. **Carrinho em página dedicada no desktop: não implementado.** Razões: o carrinho é um `<dialog>` partilhado por todas as páginas, com passo de checkout, validação, bloqueio de scroll, foco e mensagem de WhatsApp; uma segunda superfície duplicaria esse estado (risco de inconsistências) e o painel já mostra fotografia, nome, opções, preço unitário, quantidade, subtotal e remover sem encher o ecrã. Alternativa para o futuro: uma rota `/cart/` que reutilize o mesmo estado em `localStorage` e os mesmos blocos de linha.
3. **«Chef's Selection» não usado como título:** a seleção dos 10 pratos é minha, não do chefe; manteve-se «From the Lauhata Kitchen» para não afirmar uma recomendação que ninguém fez.
4. **Quartos na página Stay:** dois blocos horizontais espelhados, galeria por scroll-snap com contador e botões; só as 3 primeiras fotografias de cada quarto (distintas entre si). Em mobile a galeria vem primeiro.
5. **Experiences (home):** uma fotografia alta com uma pequena sobreposta e o texto ao lado, com duas experiências reais já existentes no site (pôr do sol, celebrações); sem atividades novas.
