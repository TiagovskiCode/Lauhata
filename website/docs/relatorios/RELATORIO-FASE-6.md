# Lauhata Beach Escape — Relatório da Fase 6

4 de novembro de 2026. Nada foi publicado nem enviado para o GitHub: as alterações estão só nesta pasta, por gravar
(sem commit). O site em linha ainda mostra a versão anterior.

**Skill Impeccable:** não está instalada nem acessível nesta sessão. Não foi usada. O trabalho seguiu as regras do
pedido e as skills de design disponíveis (frontend-design).

## A. O que foi feito

- **Início:** herói com três ações (Reservar mesa, Ver quartos, Falar no WhatsApp) e uma linha de contexto (horário da
  ementa, localização, «Por WhatsApp · pagamento no local»). Secções novas: introdução, Comer & Ficar (mantida), cena da
  praia, eventos, pré-visualização de Descobrir Liquiçá, chamada final e opiniões (a última secção antes do rodapé).
- **Ementa:** cada um dos 53 pratos tem foto temporária com a etiqueta «Imagem ilustrativa» sempre visível. Há uma carta
  de bebidas de exemplo (14 bebidas em 10 grupos), marcada «Exemplo», sem preço e sem botão de pedir. Só consumo no
  restaurante: o site diz que não há delivery nem take-away.
- **Quartos:**
  - Quarto Vista Mar: 1 cama King Size e TV.
  - Suite Família: 1 cama King Size, 1 cama de solteiro e TV; ideal para um casal com uma criança.
  - Cada quarto tem um carrossel com 5 fotos (ilustrativas), fichas com camas, comodidades confirmadas e «preço sob
    consulta», e a nota de pagamento presencial.
- **Pedido de reserva por WhatsApp:** pede adultos, crianças, nome, email, telefone e pedidos especiais. Antes de abrir
  o WhatsApp mostra a mensagem para rever; a mensagem diz que é um pedido e que o pagamento é feito no Lauhata. Número
  usado: +670 7740 1111 (aprovado por ti).
- **Páginas novas e refeitas** (8 destinos principais):
  - Sobre nós.
  - Eventos, com formulário em 5 passos e revisão.
  - Galeria em mosaico, com filtros e visualizador (só fotos reais de drone).
  - Descobrir Liquiçá: locais da fonte oficial, distâncias em linha reta a partir das coordenadas oficiais, mapa e sem
    horários inventados.
  - Contactos: formulário por assunto, morada, como chegar e perguntas frequentes.
- **Opiniões:** nenhuma opinião inventada. Há um formulário que envia a opinião pelo WhatsApp para o Lauhata aprovar e
  uma ligação ao Tripadvisor. A nota e o número de avaliações só aparecem quando forem verificados.
- **Cabeçalho:** o menu completo aparece a partir de 1360px; abaixo disso, o botão de menu.
- **Correções desta ronda:**
  - Fotos ilustrativas erradas substituídas: peixe grelhado, bitoque, hambúrguer, salada de atum, batatas fritas, arroz,
    salteado de legumes, prato de fruta, e as bebidas água, coco, refrigerantes, maracujá, cerveja, vinho e piña colada.
    Tinham comida errada, pessoas, marcas ou um quadro.
  - Em telemóvel, o título do herói ficava por baixo do cabeçalho; já não fica.
  - O texto da ficha do quarto deixou de dizer que as camas estão por confirmar.

## B. O Carlos tem de confirmar

Lista completa em `CHECKLISTS.md`, secção 2. O essencial:

- [ ] WhatsApp +670 7740 1111 e morada/ponto no mapa (vêm de liquica.gov.tl).
- [ ] Horário: a ementa diz 08–10 e 11–21; a Câmara diz 09–22. O site usa o da ementa.
- [ ] Número de quartos (as fontes dizem 6 ou 8; o site só fala de *dois tipos*).
- [ ] Ocupação máxima, preço por noite e se inclui pequeno-almoço; horas de entrada e saída.
- [ ] Comodidades além de camas e TV (ar condicionado, casa de banho, Wi-Fi, varanda…).
- [ ] Carta de bebidas real, com preços (substitui os exemplos).
- [ ] Eventos que o Lauhata recebe e lotação.
- [ ] História do Lauhata; transfers de/para Díli.
- [ ] Nota e número de avaliações do Tripadvisor (tu viste 4,4 com 25; a página bloqueia leitura automática).
- [ ] 6 preços de pizzas escritos à mão na ementa e os 3 pratos «mais escolhidos».

## C. Conteúdo temporário

| O quê | Onde | Como substituir |
|---|---|---|
| 67 fotos ilustrativas de pratos e bebidas (Wikimedia Commons: CC0, domínio público, CC BY, CC BY-SA), com crédito na página de privacidade | `src/assets/img/pratos-temp/`, `src/data/temp-photos.json` | Guardar a foto real em `src/assets/img/pratos/<id>-640.jpg`; a temporária deixa de aparecer |
| 14 bebidas de exemplo | `src/data/sample-drinks.mjs` | `showSamples: false` em `site.mjs` quando houver carta real |
| Fotos dos quartos (Unsplash e maqueta), 4 ainda ligadas ao Unsplash | `src/data/images.mjs` (`placeholder: true`) | Pelo menos 3 fotos reais de cada quarto |
| 15 imagens ilustrativas noutras secções | `images.mjs` | Fotos reais do Lauhata |

Para trocar uma foto temporária má: `node tools/fotos-temporarias.mjs --only=<id>` rejeita a atual e procura outra.

## D. SEO e produção

- Dados estruturados só com factos verificados: nome, morada, coordenadas, telefone, restaurante. Sem preços, sem
  avaliações.
- Títulos e descrições únicos, hreflang PT/EN recíproco, canonical e sitemap: verificados pelos testes.
- Antes do lançamento (`CHECKLISTS.md`, secção 4):
  - Domínio: nada foi comprado.
  - `siteUrl` final.
  - Search Console.
  - Google Business Profile: precisa do acesso do Carlos; nada foi alterado.
  - QR da ementa para `https://<domínio>/restaurante/`.
- **Número de páginas:** 8 destinos principais mais 2 páginas de quarto, privacidade e agradecimento. Confirmar com o
  Carlos se as páginas de quarto contam dentro das 8.

## E. Testes executados (nesta sessão, sobre `dist/`)

| Teste | Resultado |
|---|---|
| check_site (links, títulos, alt, hreflang, JSON-LD), 26 páginas | Sem problemas |
| bilingual | 7 avisos conhecidos. 6 são páginas noindex sem par (intencional). 1 é a página de privacidade, com títulos de fotos em inglês nos créditos |
| forms (quarto: adultos, crianças, email, telefone, revisão, pagamento, número; mesa; cartão rápido; troca de idioma) | Tudo passou |
| bdialog (diálogo de reserva; eventos com passo de revisão) | Tudo passou |
| feedback (opiniões por último; bebidas só como exemplos sem preço nem pedido) | Tudo passou |
| pickerlayer, cart, rooms, lbmenu, motion, herovideo3, align, headerfit, cinema, widths | Tudo passou |
| a11y (contraste, alvos de toque, nomes, alt, títulos) | 0 falhas |
| heromob (título do herói visível de 360 a 1280px) | Passou depois da correção |
| static6 (carrosséis ≥ 3 fotos, nota de pagamento, factos dos quartos, formulário de contacto, galeria, sem «a confirmar», só consumo no local) | Tudo passou |

Testes ajustados porque o comportamento mudou de propósito:
- A mensagem do cartão rápido agora diz «alojamento» e inclui adultos.
- O formulário de eventos passou a ter um passo de revisão.
- As bebidas de exemplo agora aparecem.

## F. Limites e próximos passos

- Não testado em telemóveis reais (só emulação no Brave) nem com envio real pelo WhatsApp.
- As fotos temporárias foram escolhidas automaticamente e revistas por mim numa folha de contacto. Algumas são
  aproximações (por exemplo, a «piña colada» é um cocktail parecido).
- Não foi feita medição Lighthouse/PageSpeed nesta ronda.
- Próximo passo: gravar (commit) e publicar no GitHub Pages, quando quiseres; depois, enviar ao Carlos a lista B.
