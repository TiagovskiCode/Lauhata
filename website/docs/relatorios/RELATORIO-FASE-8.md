# Lauhata — relatório da Fase 8 (5 de novembro de 2026)

Nada foi publicado: as alterações estão nesta pasta, sem commit. O site em linha mostra a versão anterior.

## 1. Pesquisa e referências
Visitadas no browser (1440px):
- **Hotéis:** Aman, NIHI Sumba, Rosewood, Six Senses, Xigera, Casa Angelina, Bürgenstock, Oetker.
- **Restaurantes:** Noma, Bastible.
- **F-eat:** só a página do projeto.
- **Soneva:** ficou em branco no browser automático e não foi estudada.

Principais lições:
- **NIHI:** ecrã dividido com detalhes por metade.
- **Rosewood:** proporções variadas e legendas.
- **Aman:** contenção e legendas.
- **Noma e Bastible:** a ementa é tipografia.

A auditoria completa (método design-critique) está em `DIRECAO-CRIATIVA.md`.

## 2. Direção criativa
Continua o «Diário da costa»: papel claro e capítulos de noite, fotografias sem cantos com legenda real/ilustrativa,
coordenadas reais, o fio de tais como único ornamento. Nesta fase: menos caixas, mais composição. Onde havia cartões,
há agora linhas tipográficas, ecrãs divididos, imagens de ponta a ponta e sequências com proporções diferentes.

## 3. Skills
- **Impeccable:** verificada outra vez e **não está instalada**. Não foi usada.
- **Usadas:**
  - frontend-design, para a direção;
  - design-critique, para a auditoria;
  - os testes do projeto, no browser integrado e no Puppeteer.

## 4. Principais alterações
- **Início:**
  - Comer & Ficar ganha por baixo das fotos uma faixa com factos verificados: o horário e as secções da ementa; as
    duas suites e as camas; como se pede e se paga. Cada lado tem duas ações.
  - A praia escura com palmeiras e montanha volta a ocupar o ecrã inteiro, com o título, uma legenda, o texto, as
    coordenadas e duas fotos secundárias.
- **Opiniões:** redesenhadas. Mostram:
  - as notas verificadas das duas plataformas, em grande;
  - um resumo em destaque e três secundários, cada um com autor, data e ligação;
  - a nota de que os resumos são nossos.
  O formulário de opinião passa para segundo plano.
- **Suites:**
  - Novos nomes provisórios: «Suite King» e «Suite King & Single».
  - Novas moradas; as antigas reencaminham para as novas.
  - Cada página tem: herói, texto, carrossel com 4 fotos, especificação tipográfica, desenho das camas vistas de cima
    (sem medidas inventadas), a lista «Antes de pedir, pode perguntar», o pedido e a outra suite de ponta a ponta.
  - Foi retirada a promessa de «o mar como horizonte», que não estava confirmada.
- **Ementa:**
  - 38 descrições reescritas com mais clareza, sem acrescentar ingredientes.
  - Retirados «peixe do dia na brasa» e «café das montanhas de Timor», que não estão confirmados.
  - O layout em linhas passa no teste de sobreposição de 360 a 3840px. O erro do «Sauteed Vegetables» vinha das
    fichas de foto de tamanho fixo numa grelha de 4 colunas, que já não existem.
- **Ecrãs grandes:** a partir de 1920px, a escala de tipo e a largura do conteúdo crescem juntas. Em 4K o conteúdo
  ocupa 1920px, em vez de 1470px num ecrã vazio.
- **Sobre nós:**
  - Removido o bloco «Em tétum — Mai, han, toba.» (é o «Em teto Myran Toba» do cliente).
  - Quatro capítulos com foto: o restaurante e o bar, as suites, a costa de Liquiçá e as pessoas.
- **Descobrir Liquiçá:**
  - Linhas editoriais para os lugares com foto: forte de Maubara, ruínas de Aipelo, centro de Liquiçá, o mar.
  - Lista tipográfica para os lugares que ainda não têm foto.
  - As fotos de drone das ruínas passam a ser as de Aipelo (confirmado pelo Tiago).
  - O forte e o centro de Liquiçá têm fotos de referência do Wikimedia Commons, assinaladas «Imagem ilustrativa» e
    creditadas na página de privacidade.
- **Mapas:** os três mapas abrem centrados no Lauhata, com zoom 15. A pesquisa pelo nome dá exatamente o ponto das
  coordenadas oficiais e mostra o nome do Lauhata no mapa.
- **Rodapé e contactos:**
  - O número aparece uma só vez («+670 7740 1111 · WhatsApp e telefone»).
  - As avaliações aparecem como duas linhas com nota.
  - Contactos: uma ação principal (WhatsApp) e ligações, em vez de quatro botões em caixa.
- **Caixas decorativas:** a nota de pagamento, o «só no restaurante» e o aviso do quarto passam a linhas com filete.
- **Vídeo do herói:** o filme HD escolhido pelo Tiago, comprimido para 10,8 MB (1920px) e 4,9 MB (telemóveis). A capa
  é exatamente o primeiro fotograma.

## 5. Opiniões verificadas (5/11/2026, páginas oficiais)
- **Tripadvisor:**
  - 4,4/5, 25 avaliações (14 excelentes, 9 boas, 1 razoável, 1 má).
  - Notas parciais entre 4,3 e 4,5.
  - A página está por reclamar.
- **Booking.com:** 8,2/10, 4 avaliações; pessoal 9,4.
- **Texto das avaliações:** os termos das plataformas não permitem copiá-lo. Por isso o site publica resumos nossos,
  assinalados, com o nome público do autor, a data e a ligação. Nenhum testemunho foi inventado.
- **Para citações literais:** reclamar a página do Tripadvisor e usar o widget oficial.

## 6. O Carlos tem de confirmar
A lista completa está em `CHECKLISTS.md`. O essencial:
- **Nomes:** os nomes comerciais das suites.
- **Por suite:** ocupação, casa de banho, ar condicionado, Wi-Fi, varanda, vista e tamanho das camas.
- **Pequeno-almoço:** se está incluído.
- **Horas:** de entrada e de saída (o Booking diz 14–22 e 10–11).
- **Outros:** estacionamento, animais, pagamento só em dinheiro, berços e transfer.
- **Ementa:** as descrições das sobremesas e dos acompanhamentos.

O anúncio do Booking.com e as opiniões referem vários destes pontos. Não foram publicados como factos.

## 7. Páginas testadas
Início, Ementa, Alojamento, as duas suites, Sobre nós, Eventos, Galeria, Descobrir Liquiçá e Contactos, em PT e EN.
Também Privacidade, Obrigado, 404 e as 4 moradas antigas que reencaminham.

## 8. Resoluções testadas
- **Varrimento automático:** 16 páginas em cada uma de 360×800, 390×844, 768×1024, 1024×768, 1180×820, 1366×768,
  1440×900, 1680×1050, 1920×1080, 2560×1440 e 3840×2160. Verifica:
  - que não há deslocamento horizontal;
  - que nenhum texto fica por cima de uma foto que não seja o seu fundo;
  - que o título não fica sob o cabeçalho;
  - que não há erros na página.
  **Tudo passou.**
- **Ementa:** as 67 linhas, nas mesmas resoluções e nas duas línguas. **Tudo passou.**
- **Revisão visual:** capturas revistas a 390, 1440, 2560 e 3840px.

## 9. Testes funcionais
**Todos passam:**
- check_site (26 páginas);
- formulários (quarto, mesa, cartão rápido, troca de idioma);
- diálogo de reserva e eventos com passo de revisão;
- opiniões;
- carrinho;
- suites;
- galeria e visualizador;
- cabeçalho de 1200 a 2560px;
- acessibilidade (0 falhas);
- vídeo do herói e capa;
- motion;
- verificação estática da fase 8 (38 pontos).

**Avisos conhecidos no teste bilingue (7):**
- 6 páginas sem par noindex (propositado);
- os títulos das fotos dos créditos estão em inglês.

**Testes ajustados à nova estrutura:**
- rooms, feedback, widths;
- check_site e bilingual, que agora ignoram as páginas de reencaminhamento.

**Limites:**
- Não testado em telemóveis reais nem com envio real pelo WhatsApp.
- Não foi feita medição PageSpeed nesta fase.
- O mapa não carrega no browser integrado; foi verificado com o Puppeteer.

## 10. Por resolver e fotografia
- **Suites:** continuam com fotografias ilustrativas.
- **Ementa:** continua com as 67 fotografias temporárias.
- **Descobrir Liquiçá:** três lugares sem foto.
- **O mais urgente para o Carlos:**
  1. as suites;
  2. o restaurante e os pratos;
  3. as pessoas.
  A lista de fotografias completa está em `FOTOGRAFIAS.md`.
- **Eventos:** o formulário de 5 passos ficou como estava, com o novo estilo global; não foi redesenhado nesta fase.
- **Galeria:** só herdou o novo estilo global.
