# Auditoria técnica — website Lauhata (Elevate Web Studios)

Data: 2 de novembro de 2026. Estado analisado: `website/` no commit atual mais as alterações desta ronda.
Âmbito: o orçamento enviado ao cliente (Hotel & Alojamento, ementa interativa, ementa com QR,
SEO local + Google Business Profile, domínio e hospedagem, formulário inteligente). Os preços não
foram alterados e não se assume que todos os extras estão contratados: a tabela diz apenas o que
existe no código.

Estados: **Implementado** · **Parcial** · **Não implementado** · **Validação externa** (depende de
dados do cliente, domínio, hospedagem ou contas Google).

## 1. Tabela de auditoria

| Funcionalidade | Estado | Evidência no código | O que falta | Melhorias recomendadas | Prioridade |
| --- | --- | --- | --- | --- | --- |
| **A. Quartos e páginas por tipo** | Implementado | `src/data/rooms.mjs` (3 tipos); cada um gera uma página PT e EN (`pages.mjs` `room()`); lista em `/alojamento/` | Os quartos são os da mockup: nomes e tipos por confirmar | Confirmar tipos, número e nomes com o Lauhata | Média |
| Fotografias dos quartos | Parcial | `images.mjs`: Quarto Jardim e Suite Família com fotos ilustrativas; Quarto Vista Mar com uma do Unsplash; 2 fotos por galeria | Nenhuma foto mostra o Lauhata real | Sessão fotográfica (6 fotos por quarto) | Alta |
| Descrição, capacidade e comodidades | Parcial | `rooms.mjs`: capacidade e 3 chips por quarto; descrição igual ao resumo, marcada «a confirmar»; `site.amenities` vazio (secção escondida) | Descrição real, camas, casa de banho, comodidades iguais nos 3 quartos | Ficha por quarto: factos numa linha, comodidades, «Bom saber» | Alta |
| Informação para hóspedes (check-in/out, políticas, pagamento) | Não implementado | `site.stayTimes` é `null`; sem secção «Bom saber»; FAQ só explica o pedido de reserva | Horas, crianças, cancelamento, formas de pagamento, transfer desde Díli | Secção «Bom saber» e 4 a 5 perguntas novas no FAQ, só com dados confirmados | Alta |
| Botões de reserva e WhatsApp (alojamento) | Implementado | Cartão do hero, cabeçalho, barra fixa mobile, página de cada quarto (`?room=` pré-seleciona o quarto) | Número de WhatsApp (ver F) | — | Alta |
| **B. Restaurante: apresentação, ementa e categorias** | Implementado | `/restaurante/` com 9 categorias e 53 pratos copiados da ementa impressa (`menu.mjs`), com nomes, descrições e preços como no PDF | Os pratos «mais escolhidos» da homepage foram escolhidos sem dados de vendas | Confirmar com o restaurante | Média |
| Fotografias dos pratos | Não implementado | Os 53 pratos aparecem sem imagem: as fotos ilustrativas antigas eram de pratos que não existem nesta ementa e foram retiradas | Fotos reais de cada prato | Sessão fotográfica; depois pôr a chave da foto no campo `image` do prato | Alta |
| Preços da ementa | Implementado | 53 pratos com preço em dólares, tal como no PDF; batatas fritas com preço por tamanho (5$/10$) | As 6 pizzas têm o preço escrito à mão no PDF | Confirmar os preços das pizzas (`confirm: true` em `menu.mjs`) | Média |
| Horário e contactos do restaurante | Parcial | Horário vindo do PDF: pequeno-almoço 08:00–10:00 e almoço e jantar 11:00–21:00; telefone e email vazios | Telefone e email; o PDF não diz que dias abre | Preencher `site.mjs` | Alta |
| Reserva de mesa por WhatsApp | Implementado | Formulário completo e cartão rápido do hero (`main.js`), testados | Número de WhatsApp | — | Alta |
| **Pedido do restaurante: carrinho e WhatsApp** | Implementado | Carrinho em todas as páginas, guardado no navegador; opções, quantidades, total; checkout com nome (e tipo de pedido e mesa, quando configurados); mensagem de WhatsApp organizada (`order.js`) | Número de WhatsApp; tipos de pedido que o restaurante aceita (`order.types`) | Ver README, secção «Ementa e pedido por WhatsApp» | Alta |
| **C. Ementa interativa (+200$)** | Implementado | Pesquisa por nome ou ingrediente, barra de categorias que acompanha o scroll, opções por prato, botão de adicionar em cada cartão (`order.js`, `pages.mjs`) | Fotos dos pratos; sem filtros por dieta (não há dados confirmados) | — | Média |
| **D. Ementa com QR (+60$)** | Não implementado | Não há página própria da ementa. `/restaurante/#ementa` existe, mas abre o hero e cada categoria ocupa ~3 ecrãs em mobile (cartões de ~420 px) | Página própria; domínio definitivo | Ver secção 3 | Média |
| **E. SEO local: títulos e descrições** | Implementado | 1 `h1` por página; `title` único; descrições de 100 a 137 caracteres (medido), exceto a política de privacidade (78 e 65) | — | — | — |
| Dados estruturados | Parcial | `Restaurant`+`Hotel`, `BreadcrumbList`, `FAQPage`, `hasMenu` | Telefone, coordenadas, horário, `priceRange`, cozinha | Campos já preparados em `site.mjs` (`phone`, `geo`, `openingHoursSpec`, `priceRange`, `servesCuisine`): só aparecem quando preenchidos | Média |
| Open Graph, sitemap, robots | Implementado, com ressalva | `og:*`, `hreflang`, canonical, `sitemap.xml` (16 URLs), `robots.txt` | Usam `https://lauhata.example` | Definir `siteUrl` no domínio final e voltar a gerar | Alta |
| Imagens e `alt` | Implementado | Todas as imagens do conteúdo têm `alt` descritivo (PT/EN); a única sem `alt` é a da caixa de ampliação, preenchida por JS | Faltam `width`/`height` nas imagens (risco pequeno de saltos de layout) | Gravar a altura no registo de imagens | Baixa |
| Indexação e posição no Google | Validação externa | Não verificável localmente | Publicação, Search Console, tempo | Submeter o sitemap e acompanhar. Nada garante posição | Alta |
| **Google Business Profile** | Validação externa | O site só prepara os dados | Criar e verificar a ficha; nome, morada e telefone iguais aos do site; categorias, horário, fotos, link do site e das reservas, avaliações | Ver secção 4 | Alta |
| **F. Domínio e hospedagem** | Parcial | URLs relativas (`build.mjs` `relativize`), sem dependências locais; todos os 902 links e recursos internos existem | `siteUrl` de exemplo; 404 só funciona na raiz do domínio; HTTPS e redirecionamentos dependem do alojamento | Ver secção 5 | Alta |
| **G. Formulário inteligente** (incluído) | Implementado | Dois formulários (mesa, quarto) mais cartão rápido: validação, datas a partir de hoje, saída depois da entrada, quarto pré-selecionado, mensagem organizada em PT/EN, página «Obrigado» | O número de WhatsApp | Feito nesta ronda: contacto passou a opcional | Alta |

## 2. Análise visual e de experiência

O que está bem e se mantém: paleta própria (creme, verde, terracota, dourado, azul-petróleo),
serifa editorial com sans limpa, hierarquia clara, faixa de tais e mapa ilustrado da costa,
barra de reserva fixa em mobile, hero com os dois negócios visíveis. Sem scroll horizontal em 360,
375, 768, 1024 e 1366 px (50 combinações testadas).

O que ainda pesa: nenhuma foto mostra o Lauhata real; os textos da mockup afirmavam coisas por
confirmar (corrigido nesta ronda); a cultura timorense está como ornamento e não como conteúdo
(significado do nome, um tais real, pessoas reais). O relatório completo está no documento
«Lauhata — Análise crítica do website».

## 3. Ementa com QR: como implementar (não implementado de propósito)

Não foi gerado nenhum código QR: o URL só pode ser fixado depois de o domínio estar definido,
e um QR impresso não se corrige.

1. Criar `P.menu(t)` em `pages.mjs` com rotas `/ementa/` e `/en/menu/` (acrescentar a `ROUTES` em `lib.mjs`).
2. Página sem hero: cabeçalho compacto, separadores de categoria fixos no topo, pratos em lista (nome, descrição, preço), botão de WhatsApp. Reutiliza `items`, `categories` e `dishTabs()`.
3. Estável: o Lauhata é dono do domínio e esse URL não muda. Depois de publicar, gerar o QR para `siteUrl + "/ementa/"` no build, em SVG.
4. Cartões de mesa em PDF, QR com pelo menos 2 cm e contraste alto.
5. Testar com a câmara de um iPhone e de um Android, em rede móvel fraca.

## 4. Google Business Profile (fora do código)

A criar e verificar pelo Lauhata, ou por quem tratar da ficha: nome exatamente «Lauhata»; categorias
(restaurante e alojamento); morada e pin no mapa; telefone e horário iguais aos de `site.mjs`;
link do site e link de reserva (`/alojamento/#reservar`); fotos reais; ligação às avaliações
(`reviewsUrl`). A consistência de nome, morada e telefone entre a ficha, o rodapé e os dados
estruturados é o que mais pesa na pesquisa local.

## 5. Publicação: o que depende do domínio e da hospedagem

- `siteUrl` em `site.mjs` e voltar a gerar: atualiza canonical, `hreflang`, Open Graph, sitemap, robots e dados estruturados.
- Publicar o conteúdo de `dist/` na raiz do domínio (a página 404 usa caminhos a partir da raiz).
- HTTPS, redirecionamento `www` e página 404 dependem do alojamento.
- Recursos externos: Google Fonts, `unpkg.com` (Lenis), `images.unsplash.com` (8 fotos) e Google Maps (página Contactos). Para velocidade e privacidade, servir fontes e Lenis a partir do próprio site e trocar o Unsplash por fotos reais.
- Google Analytics só carrega se `gaId` estiver preenchido; se for usado, convém um aviso de cookies.
- `npm run prelaunch` lista o que falta e falha enquanto houver bloqueios.

## 6. Alterações feitas nesta ronda

Textos que afirmavam o que o Lauhata ainda não confirmou (receção 24 h, «normalmente em poucos
minutos», selo «Mais pedido»); preços em falta com texto claro; contacto opcional nos formulários;
cartões dos pratos mais escolhidos com ligação; textos abaixo de 12 px e alvos de toque do rodapé;
descrições curtas; campos novos para dados estruturados; sitemap sem `lastmod` falso; verificação
de pré-lançamento no build.
