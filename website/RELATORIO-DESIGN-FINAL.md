# Lauhata — aplicação do design final (LAUHATA-FINAL-HOMEPAGE-DESIGN.md)

6 de novembro de 2026. Nada foi gravado nem publicado: o site em linha mostra a versão anterior.
**Impeccable:** não está instalada; não foi usada.

## Secções implementadas (página inicial, PT e EN)

1. **Cabeçalho:**
   - Logótipo oficial e as ligações Início, Restaurante, Alojamento, Eventos, Descobrir Liquiçá, A nossa história e
     Contacto.
   - Seletor PT/EN e carrinho.
   - Botão «Comer & Ficar», que abre o pedido de reserva.
   - Transparente sobre o herói; carvão quando se faz scroll.
   - A Galeria passa para o menu de telemóvel e para o rodapé.
2. **Herói:**
   - Fotografia real do pôr do sol entre as palmeiras, com uma correção de cor quente suave.
   - «Um pouco mais perto do *mar*.» e «Relaxe. Saboreie. Descubra.».
3. **Painel de pedido com dois modos:**
   - **Pedir uma suite:** entrada, saída, adultos, crianças, suite; ação «Consultar disponibilidade».
   - **Reservar mesa:** data, hora, pessoas; ação «Reservar mesa».
   - Datas passadas rejeitadas; a saída tem de ser depois da entrada.
   - A mensagem abre no WhatsApp oficial (+670 7740 1111) e diz que a equipa confirma e que o pagamento é no local.
4. **Bem-vindo:** introdução à esquerda e quatro cartões fotográficos (Restaurante e bar, Suites, Eventos, Descobrir
   Liquiçá), cada um com ligação real.
5. **A nossa história:** secção escura com a fotografia real do pôr do sol sobre o mar.
6. **Alojamento:** exatamente duas suites, cada uma com:
   - foto e nome;
   - as camas confirmadas;
   - «Ver a suite» e «Pedir».
7. **Opiniões:** secção escura, com:
   - as notas verificadas do Tripadvisor (4,4/5, 25) e do Booking.com (8,2/10, 4), com a data;
   - resumos nossos das avaliações, um de cada vez, com setas anterior/seguinte e a ligação à fonte;
   - o formulário de opinião em segundo plano;
   - nenhum retrato, estrelas ou citação inventados.
8. **Descobrir Liquiçá:** a fotografia real das ruínas de Aipelo a toda a largura.
9. **Rodapé:**
   - logótipo, morada, horário, o número uma só vez, as duas plataformas, ligações e copyright;
   - sem email nem redes sociais, porque não há nenhum confirmado.

## Todas as páginas
- **Visual:** a nova paleta (tirada do logótipo: carvão, marfim, laranja do pôr do sol, vermelho, bronze), os cantos
  arredondados, os botões em pílula, os rótulos com filete e o cabeçalho e rodapé carvão aplicam-se a todas as páginas
  (`src/assets/css/resort.css`).
- **Antigos tokens verdes:** apontam agora para o carvão.
- **Heróis das páginas interiores:** a mesma sombra quente.
- **Ementa, suites, eventos, galeria, Descobrir e contactos:** mantêm o conteúdo e o funcionamento, com o novo estilo.

## Ficheiros principais
- `src/pages.mjs`:
  - `home()`;
  - `bookingCard()` (modo herói e prefixo de ids);
  - `reviewsSection()`;
  - `heading()` e `pageHero()` (rótulos).
- `src/layout.mjs`: navegação, «Comer & Ficar», CSS novo.
- `src/assets/css/resort.css`: novo; é carregado por último.
- `src/assets/js/main.js`: todos os cartões de pedido, o modo inicial do herói e o carrossel de opiniões.
- `src/i18n/pt.mjs`, `src/i18n/en.mjs`: textos do design em PT e EN.

## Testes
- **Testes automáticos** (Puppeteer, sobre `dist/`), todos passam:
  - varrimento de 16 páginas em 11 resoluções, de 360 a 3840px: sem deslocamento horizontal, sem texto sobre fotos
    fora das sobreposições do design, título visível, sem erros;
  - ementa nas mesmas resoluções;
  - cabeçalho de 1200 a 2560px;
  - formulários (quarto, mesa, cartão rápido do herói, troca de idioma);
  - diálogo de reserva e eventos;
  - seletores de data por cima do diálogo;
  - carrinho;
  - suites;
  - galeria;
  - acessibilidade (0 falhas);
  - verificação de ligações (26 páginas);
  - verificação estática (38 pontos).
- **No browser:**
  - modos sala/mesa;
  - validação (datas vazias, passadas e saída no mesmo dia);
  - sem ids duplicados;
  - envio da mesa: mensagem com data, hora e pessoas para o número oficial.
- **Testes obsoletos (não «passam»):**
  - **herovideo3 e cinema:** testam o vídeo de drone e as barras e grão de cinema no herói. O design final pede uma
    fotografia do pôr do sol, por isso o vídeo deixou de estar na página inicial. Os ficheiros de vídeo continuam no
    projeto.
- **Teste bilingue:** os 7 avisos conhecidos.
- **Limites:** não testado em telemóveis reais, nem com envio real pelo WhatsApp, nem no PageSpeed.

## Diferenças em relação ao documento (e porquê)
- **«Savour the flavours of Timor» → «Os sabores da costa»:** a ementa é sobretudo internacional, por isso «de Timor»
  seria uma afirmação sem base.
- **Opinião em destaque:** é um resumo nosso, com autor e data, e não uma citação com fotografia. As plataformas não
  permitem copiar o texto e não há retratos reais.
- **Fotografias das suites e do cartão «Suites»:** são ilustrativas (não há fotos reais) e estão assinaladas.
- **Rodapé:** sem email nem redes sociais, porque não há nenhum confirmado.

## A confirmar com o Carlos
Ver `CHECKLISTS.md` e `FOTOGRAFIAS.md`. O essencial:
- os nomes finais das suites;
- as comodidades e a ocupação de cada suite;
- se o pequeno-almoço está incluído;
- as horas de entrada e saída;
- email e redes sociais oficiais;
- fotografias reais das suites, do restaurante e dos pratos.

## Pré-visualização local

```bash
cd website
npm run preview
```

Abre http://localhost:8080 (faz o build e serve a pasta `dist/`).
