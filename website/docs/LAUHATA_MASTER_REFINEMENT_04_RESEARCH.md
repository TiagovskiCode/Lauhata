# Master Refinement 04 — pesquisa e referências (19 de novembro de 2026)

## O que foi realmente consultado
| Fonte | Resultado |
|---|---|
| aman.com | Lida na ronda 03 (nesta ronda não foi relida): um único «Reserve» no cabeçalho, cartões de imagem com legenda curta, estados («Now open») ao lado do nome. |
| sixsenses.com | Bloqueada (HTTP 403). Não consultada. |
| oneandonlyresorts.com | Tempo esgotado. Não consultada. |
| Soneva | Só um ecrã de carregamento em rondas anteriores. Não consultada. |
| Apple Human Interface Guidelines (pasta `apple-design-skill-main`) | Consultadas em rondas anteriores (sidebars, pop-up buttons, accessibility, entering-data); aplicadas aqui ao filtro do menu (popover com lista de opções exclusivas, Escape, clique fora, foco devolvido), ao carrossel (alvos de 48–52 px) e à folha do carrinho. |

**Esta ronda não incluiu pesquisa web nova.** O pedido de investigação sobre carrosséis, FAQs, drawers e navegação móvel de sites de hotelaria não foi feito com fontes novas: as decisões seguem os princípios das skills (Taste, Impeccable, HIG) e o brief. Não afirmo ter estudado esses sites.

## Princípios aplicados (do brief e das skills, não de cópia de layouts)
1. **Cartões só onde há escolha:** Welcome (3), pratos (10), quartos (2) e avaliações (3). Experiências, qualidades e arredores passam a composição editorial (fotografia, linhas finas, texto).
2. **Transições entre secções por fundo e bordas suaves:** claro → faixa areia → claro → areia → escuro → claro, com a mesma curva de sobreposição; sem caixas dentro de caixas.
3. **Largura variável:** o carrossel sangra até ao bordo direito do ecrã; o mosaico dos arredores usa colunas de larguras diferentes.
4. **Uma porta de reserva** (diálogo central), mantida.
5. **Controlos acessíveis:** carrossel com botões rotulados, pista focável com setas do teclado, sem avanço automático e com `prefers-reduced-motion`; filtro com `aria-expanded`, Escape, clique fora e foco devolvido; FAQ em `<details>` nativos (teclado e leitores de ecrã sem JavaScript).
6. **Honestidade comercial:** nada de Wi-Fi, pequeno-almoço incluído, casa de banho privativa, políticas de cancelamento, horários de check-in/out ou prazos de resposta, porque não estão confirmados.
