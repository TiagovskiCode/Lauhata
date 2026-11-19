
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
