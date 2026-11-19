# Master Refinement 03 — pesquisa e referências (19 de novembro de 2026)

## O que foi realmente consultado
| Fonte | Resultado |
|---|---|
| aman.com (página inicial, lida hoje) | Lida. Navegação com dois menus grandes (Destinos, Experiências) e **um único link «Reserve»** no cabeçalho, sem formulário; cartões de imagem com legenda curta; estados «Now open / Coming soon» junto ao nome. O texto extraído não descreve espaçamento nem tipografia, por isso nada disso é afirmado. |
| sixsenses.com | **Bloqueada** (HTTP 403). Não consultada. |
| oneandonlyresorts.com | **Tempo esgotado.** Não consultada. |
| Soneva | Consultada em rondas anteriores: só um ecrã de carregamento. Não consultada. |
| Apple Human Interface Guidelines (pasta `apple-design-skill-main`, ronda anterior) | Usadas: sidebars, pop-up buttons, accessibility, entering-data. |

Não foi feita investigação ampla além disto. As decisões abaixo seguem o que a página da Aman mostra, os princípios das skills (Taste, Impeccable, HIG) e o brief.

## Princípios retirados e como foram aplicados
1. **Uma só porta de reserva.** A Aman usa um único «Reserve» no cabeçalho. No Lauhata o botão «Make a Reservation» abre o diálogo único (Restaurant / Stay); todas as outras ligações de reserva abrem o mesmo diálogo, e as secções «Request a Table» / «Request a Room» das páginas foram retiradas.
2. **Imagem com legenda curta, sem caixa.** Fotografia como protagonista: Welcome com uma fotografia dominante e duas «portas» de texto separadas por linhas finas; Gallery com descrição por baixo de cada fotografia.
3. **Cartões só onde há escolha.** Mantidos nos quartos (comparação), nas avaliações (três cartões) e no diálogo; removidos do Welcome, da faixa de qualidades e dos pratos.
4. **Ritmo por alternância de fundo e bordas suaves**, com espaço generoso (`--sec-y`), em vez de caixas dentro de caixas.
5. **Poucas imagens grandes** na secção gastronómica (uma grande, duas médias), em vez de uma grelha de cartões.
6. **Honestidade comercial.** Sem preços, avaliações, pratos, serviços ou Wi-Fi não confirmados.

## Skills efetivamente usadas nesta ronda
Taste (regras de lugar: fotografia, sem parallax em texto, um momento por secção), Impeccable (craft-floor, layout: ritmo e composição, Persuade nas páginas editoriais / Operate no menu, diálogo e formulários), HIG (clareza, alvos de 44 px, foco visível), `design:accessibility-review`, `design:ux-copy` (rótulos dos CTAs), `web-performance-audit`. Não existem TypeScript nem ESLint neste projeto.
