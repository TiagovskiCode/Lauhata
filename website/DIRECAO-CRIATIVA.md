# Lauhata — direção criativa «Diário da costa»

Documento interno, 5 de novembro de 2026. Pesquisa e direção escolhida antes da implementação.

## 1. Skills

- **Impeccable:** não está instalada (verificado nas skills locais, nos plugins e nas skills do claude.ai). Pode ser
  instalada fora desta sessão (`/plugin marketplace add pbakaus/impeccable` num terminal `claude`). O Tiago escolheu
  avançar sem ela. Não foi usada nem imitada.
- **Usadas:** frontend-design (direção e crítica visual), e no fim os testes do projeto (acessibilidade, larguras,
  formulários) com o browser integrado e o Puppeteer.

## 2. Referências estudadas (sites reais, desktop 1440px)

| Referência | O que funciona | Para o Lauhata | Não copiar |
|---|---|---|---|
| Aman | Fundo papel neutro, cabeçalho mínimo (Menu · marca · Reservar), títulos serifados *pequenos*, fotos sem cantos, legendas curtas por baixo das imagens | Contenção; legendas; poucos elementos no cabeçalho | O vazio total à espera de imagens que carregam tarde; a escala de rede global |
| Xigera | Composição assimétrica: texto pequeno ao lado de uma imagem deslocada; ritmo lento | Grelha assimétrica, imagens deslocadas | O excesso de branco puro e texto muito pequeno |
| Casa Angelina | A paisagem enquadrada como janela; marca manuscrita; texto numa coluna lateral | Enquadrar o mar; coluna de texto estreita | A marca manuscrita (não é do Lauhata) |
| Bürgenstock / Oetker | A história do lugar como prova (datas, «since»); a reserva sempre visível | O lugar como prova: coordenadas, morada real | Barras de reserva com datas (não há motor de reservas) |
| Bastible / Noma | A comida fala sozinha; o menu é tipografia; a reserva é um passo claro | Ementa como texto composto, não como loja | Fotografia de autor que o Lauhata ainda não tem |
| F-eat / Ever (Mondo) | Revista de comida; caminho curto até reservar; motion subtil | Caminho curto para o WhatsApp | — |
| BLESS | Sequência narrativa, cortes entre claro e escuro, sobreposição imagem/texto | Capítulos que alternam papel e noite | Fotos de lifestyle com modelos |

## 3. Diagnóstico do site atual (porque parece gerado)

1. Areia quente (#F3E9D7) em todas as secções + Cormorant + terracota: a combinação mais comum dos sites gerados.
2. Um rótulo em terracota por cima de *cada* título («O Lauhata», «Eventos», «Descobrir Liquiçá»).
3. Todas as imagens com o mesmo canto arredondado; botões em pílula; a mesma divisão texto/imagem repetida.
4. Uma palavra em itálico dourado no título do herói («abranda»).
5. Fotos do pôr do sol muito escuras e usadas três vezes seguidas.
6. Cabeçalho cheio (logótipo em círculo, 7 ligações, seletor de idioma em pílula, carrinho, botão pílula) e bolha verde
   flutuante do WhatsApp.

O que funciona e fica: o vídeo real de drone no herói, as fotos reais do drone, Comer & Ficar, a ementa com carrinho e
WhatsApp, o pedido de quarto com revisão, o formulário de eventos, a galeria com visualizador, a nota de pagamento no
local, o bilinguismo, as etiquetas «Imagem ilustrativa».

## 4. Direções exploradas

- **A. «Diário da costa»:** o site como o caderno de viagem de uma única praia: papel claro e capítulos de noite, legendas
  em cada fotografia, coordenadas reais, um fio de tais como único ornamento. **Escolhida.**
- **B. «Maré»:** tudo escuro e cinematográfico. Rejeitada: é o modelo do hotel de luxo genérico e esconde a luz do dia,
  que é o que as fotos reais têm de melhor.
- **C. «Tais»:** padrões têxteis em todo o lado. Rejeitada: decoração sobre cultura, risco de pastiche. Fica só como
  um fio fino.

## 5. Sistema visual

- **Cor:** o papel é Soft Cream (#FAF7EF). A noite é Deep Ocean (#123B3A), com Tropical Forest só em superfícies
  secundárias. Warm Sand passa a ser só uma superfície pequena (formulários, ementa), nunca o fundo da página. Terracota
  só para estados ativos e um único botão principal por ecrã. Golden Hour só em texto pequeno sobre a noite. Sea Glass
  nas linhas sobre a noite. Charcoal no texto.
- **Tipo:** Cormorant Garamond + Manrope mantêm-se: estão alojadas no próprio site, a Cormorant tem o contraste de uma
  revista e a Manrope lê-se bem em tamanhos pequenos. Trocar de fonte obrigava a descarregar novos ficheiros e não
  resolvia o problema, que era de *uso*. A disciplina passa a ser:
  - Corpo de texto: 17px.
  - Escala grande só no herói e numa frase por página.
  - Títulos normais entre 2 e 2,8rem, peso 400, sem itálico de destaque.
  - Legendas em Manrope de 12–13px, em caixa normal.
  - Linhas até ~34em.
- **Forma:** fotografias sem cantos arredondados. Botões retangulares (2px), um cheio e um sublinhado. Sem sombras nem
  pílulas, com uma exceção: os controlos de formulário ganham uma pequena curva para continuarem claros.
- **Assinaturas:**
  1. **Legenda de diário** em cada fotografia real: o que mostra e «Fotografia do Lauhata». Nas ilustrativas fica a
     etiqueta «Imagem ilustrativa». A honestidade torna-se o próprio recurso gráfico.
  2. **Coordenadas reais** (8°34′54″S · 125°20′59″E, liquica.gov.tl) no herói e no rodapé.
  3. **Fio de tais:** uma faixa fina de fios verticais (oceano, terracota, ouro, vidro do mar) só nas passagens entre
     papel e noite.
- **Composição:** grelha de 12 colunas, assimétrica. Fotos que sangram até à margem, imagens deslocadas que sobrepõem o
  texto, um ecrã dividido de ponta a ponta em Comer & Ficar e uma faixa de três fotos com proporções diferentes.
- **Motion:** entrada única do herói (título por linhas). Revelação suave das fotos com recorte. Nada de animar cada
  cartão nem de prender o scroll. `prefers-reduced-motion` respeitado.

## 6. Implementação

1. Fundamentos: `editorial.css`, carregado por último, com tokens, cantos, botões, rótulos, legendas e o fio de tais.
2. Cabeçalho e rodapé.
3. Início, recomposto em capítulos.
4. Restaurante e ementa.
5. Alojamento e quartos, com uma identidade para cada quarto.
6. Restantes páginas; revisão em telemóvel.
7. Motion, acessibilidade, desempenho, testes.

## 7. Lista de fotografias para o Carlos

Prioridade alta (não há nenhuma foto real destes temas):
- **Cada quarto:**
  - cama inteira com luz do dia;
  - vista da janela ou da porta;
  - casa de banho;
  - um pormenor (tecido, madeira);
  - o exterior do quarto.
- **Restaurante:**
  - a sala com mesas postas;
  - a cozinha ou a grelha;
  - 8 a 10 pratos da ementa, fotografados de cima e a 45° com luz natural.
- **Pessoas (com autorização):**
  - a equipa a trabalhar;
  - o Carlos.
- **Bebidas reais:** água de coco, sumos, café de Timor, se o servirem.

Prioridade média:
- O pôr do sol visto de uma mesa, com a mesa em primeiro plano.
- A praia de manhã, ao nível do chão.
- A entrada e a placa.
- Um evento real (com autorização).

Formato: original, sem filtros, horizontal e vertical de cada cena.
