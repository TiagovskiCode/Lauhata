# Lauhata Beach Escape — guia de marca

Direção: **Tropical Coastal Luxury**. Calma, natural, acolhedora; grandes superfícies neutras, cor forte só
onde conta. O arco (a janela sobre o mar) é a forma da marca.

## Logótipo

**O logótipo do site é o fornecido pelo cliente** (`lauhata beach escape.png`, na raiz do repositório, que fica
como original). O site usa-o recortado e em tamanho leve, `src/assets/img/brand/logo-lauhata-beach-escape-160.png`
(41 KB), no cabeçalho, no rodapé, nas chamadas finais, no favicon, no ícone do iPhone e na imagem de partilha. Como
as letras são pretas sobre fundo transparente, o logótipo vive sempre numa **chapa redonda Soft Cream** (`.brand-mark`
em `design.css`): lê-se igual sobre a foto escura do hero, o cabeçalho claro e o rodapé Deep Ocean. O nome «LAUHATA /
BEACH ESCAPE» escrito ao lado é texto do site (as letras curvas do logótipo não se leem em tamanho pequeno); para
mostrar só o logótipo, esconde `.brand-text`.

Para trocar o logótipo: substituir o PNG original, recortar e exportar de novo (ver `tools/`) e voltar a gerar
`favicon-64.png`, `apple-touch-icon.png` e `og-image.jpg` em `src/assets/img/`.

### Proposta alternativa (não usada)

Fez-se também uma proposta de redesenho (arco, sol, ondas e palmeira, em SVG), em
`src/assets/img/brand/lauhata-*.svg`, gerada por `tools/gerar-logotipo.mjs`. Não está no site: fica como alternativa
para mostrar ao cliente se ele quiser evoluir a marca. Os SVG principal e wordmark pesam ~100 KB cada por levarem as
fontes embutidas; podem ser retirados de `dist/` sem afetar nada.
## Cores

Definidas em `src/assets/css/main.css` (`:root`). Distribuição pretendida: ~50% Warm Sand, 20% Soft Cream, 15% Deep
Ocean, 10% Tropical Forest, 5% Sunset Terracotta e Golden Hour.

| Nome | HEX | Token | Uso |
| --- | --- | --- | --- |
| Deep Ocean | `#123B3A` | `--forest`, `--ink` | Marca, rodapé, secções escuras, títulos |
| Tropical Forest | `#244C3F` | `--leaf` | Botões e destaques secundários |
| Warm Sand | `#F3E9D7` | `--cream` | Fundo principal da página |
| Soft Cream | `#FAF7EF` | `--paper` | Cartões, formulários, secções claras |
| Sunset Terracotta | `#C76545` | `--terra` | Detalhes e texto grande (≥ 24 px) |
| Golden Hour | `#D9A85F` | `--gold` (`--gold-soft` `#E7C38B` em fundo escuro) | Sol do símbolo, apontamentos |
| Sea Glass | `#A9C7B8` | `--sage` | Campos suaves (ex.: secção «Cultura») |
| Charcoal | `#252C29` | `--text` (`--body` `#333D39` em parágrafos) | Texto |

**Desvio deliberado:** o branco sobre `#C76545` só dá 3,9:1, abaixo dos 4,5:1 do AA para texto pequeno. Por isso os
botões cheios de terracota e o texto pequeno terracota usam `--terra-dark` `#A4482C` (5,9:1); o `#C76545` puro
fica para detalhes e texto grande. Não há fundos inteiros em terracota nem vermelho vivo.

## Tipografia

- **Títulos:** Cormorant Garamond 500 (itálico para a palavra de destaque), números alinhados (`lining-nums`).
- **Texto e interface:** DM Sans 400–700. Rótulos e botões em maiúsculas com espaçamento 0,14–0,34 em.
- Fontes alojadas em `src/assets/fonts/` (sem Google Fonts).

## Forma e movimento

- Botões: pílula. Cartões 22 px, imagens 18 px, arco só em molduras-chave (hero de página, dia, tais).
- Secções que deslizam por cima da anterior com cantos grandes (`--round`).
- Movimento contido (ver README): tudo se desliga com «movimento reduzido».

## Fotografia

Direção: hora dourada, tons quentes, oceano profundo, vegetação tropical, gastronomia editorial. Nenhuma fotografia
atual mostra o Lauhata: as imagens provisórias levam «Imagem ilustrativa» até serem substituídas (ver README).
