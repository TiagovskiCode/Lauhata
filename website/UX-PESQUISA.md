# Pesquisa de UX: o que fazem os melhores sites de hotéis e restaurantes

Feita em novembro de 2026, com pesquisa na web e análise ao vivo de sites de referência. O objetivo era perceber o que
os torna especiais e trazer isso para o Lauhata sem inventar nada sobre o espaço.

## O que se observou

**Ao vivo (visto no navegador):**

| Site | O que faz bem |
| --- | --- |
| [Aman](https://www.aman.com/) | Fundo quente quase neutro, logótipo fino ao centro, **um único botão escuro «Reserve» sempre visível**, menu escondido atrás de «Menu», imagens com margem (não coladas ao ecrã), rótulos pequenos usados com muita parcimónia. |
| [Six Senses](https://www.sixsenses.com/en/resorts/laamu) | Hero em vídeo, logótipo ao centro, **«Book now» sempre à direita** (também quando o cabeçalho passa a creme ao descer), títulos que contam uma ideia («An atoll utopia where sumptuous meets sustainable»), composição assimétrica de fotografias e um «Journal» com histórias do lugar. Contra-exemplo: pop-up de newsletter e banner de cookies a tapar conteúdo. |
| [Noma](https://noma.dk/) | Página quase só com uma frase e **uma ação** («Book a table»), «Reservations» no cabeçalho, horário e reservas num bloco claro no fim. Muito pouco texto. |
| Soneva | Bloqueou a navegação automática (verificação anti-robô); não foi contornado. |

**Da pesquisa (lembrar que a maior parte é de agências e fornecedores, não estudos independentes):**

- Os maiores fatores de satisfação em sites de hotéis, num estudo da MeasuringU com 405 utilizadores de 5 cadeias
  ([fonte](https://measuringu.com/hotel-ux/)), foram o **calendário de reserva** (o fator isolado mais pesado),
  a clareza e exatidão dos preços, a comparação de opções, as descrições dos quartos e a imagem de marca. Os maus
  exemplos tinham o botão de reservar fora do ecrã ou calendários difíceis de usar.
- Fotografias: um inquérito citado pela Triptease diz que cerca de 70% das pessoas se apoiam nas fotos para conhecer
  um hotel, e um teste do Booking.com concluiu que **as fotos têm de corresponder ao quarto** que mostram
  ([fonte](https://uxdesign.cc/booking-guerilla-usability-testing-8c93bd6dc4b2)).
- Sites de luxo: fotografia sem edição pesada, navegação simples, preços e condições claros, sinais de confiança
  (avaliações reais, política de cancelamento, contacto fácil)
  ([fonte](https://www.luxurytravelmagazine.com/news-articles/luxury-travel-websites-design-features-that-turn-inspiration-into-bookings)).
- Restaurantes: **ação principal (reservar ou ver a ementa) logo no início**, horário e localização visíveis sem
  descer, ementa em texto (não só PDF) com botões grandes no telemóvel, botão de reserva sempre à mão
  ([exemplo de resumo](https://www.getsauce.com/post/restaurant-website-design-best-practices)).
- Números como «+31% de conversão» que aparecem em vários blogues não têm fonte verificável e não foram usados.

## O que se aplicou ao Lauhata (e porquê)

1. **«Reservar» sempre à vista.** Os três sites de referência nunca o escondem; o cabeçalho do Lauhata escondia-se ao
   descer. Agora, num computador, fica sempre. No telemóvel mantém-se a barra inferior.
2. **Logótipo ao centro, menu à esquerda e ações à direita** (a partir de 1200 px), como Aman e Six Senses.
3. **Informação prática logo a seguir ao hero:** horário do restaurante, onde fica, como reservar (só dados
   confirmados, vindos da ementa impressa). Era o padrão mais consistente na pesquisa de restaurantes.
4. **Menos «tiques de template»**, a partir da skill de design: retirada a numeração «01 · Comer / 02 · Dormir»
   (não é uma sequência; o «dia no Lauhata» mantém-na porque é) e os rótulos por cima dos títulos passaram a
   frase normal em vez de maiúsculas espaçadas (fica só a linha de lugar no hero).
5. **Já estava certo:** hero com uma frase forte, uma só ação principal, sem pop-ups nem banners, ementa em texto
   com pesquisa e botões grandes, barra fixa de reservas no telemóvel, fotos que não fingem ser do espaço
   (etiqueta «Imagem ilustrativa»).

## O que não se fez, de propósito

- **Comparador de quartos e preços:** é um dos fatores mais pesados nos estudos, mas os quartos ainda não têm
  capacidade, comodidades nem preços confirmados; uma tabela agora seria inventada ou vazia.
- **Avaliações e «Journal»:** só com conteúdo real do Lauhata.
- **Disponibilidade em tempo real:** não existe; os pedidos vão por WhatsApp e o texto diz-o.

## Próximos passos que mais fariam diferença

1. Fotografia real do Lauhata (quartos, pratos, restaurante): é o ponto em que os melhores sites mais se distinguem.
2. Preços, capacidade e comodidades de cada quarto, para poder pôr um comparador.
3. Avaliações reais (Google) e a história do Lauhata contada pelo dono.

## «Um dia no Lauhata» refeito como palco cinematográfico

O bloco anterior (foto em arco e cinco passos) parecia um cartão de site-modelo e não mostrava o lugar. O padrão que hotéis e
restaurantes de gama alta usam para contar um dia é um **ecrã inteiro que fica fixo enquanto o scroll troca a imagem**: uma
única cena grande, hora e frase legíveis por cima, e um indicador de progresso discreto. O Lauhata usa agora este padrão com as
suas fotografias aéreas reais, uma cor que muda da manhã ao entardecer e uma régua com as cinco horas. Decisões: o texto muda
mais depressa do que a imagem (nunca há dois textos sobrepostos); o palco usa `position: sticky` em vez de `pin` do GSAP (o `pin`
causava um salto de layout, CLS 1.0); sem GSAP o bloco é uma lista normal, por isso nunca fica vazio.
