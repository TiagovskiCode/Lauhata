# React Bits — StaggeredMenu + LineSidebar: relatório de integração (19 de novembro de 2026)

## Ponto de partida (importante)
- **O projeto não usa React.** É um site estático gerado por `build.mjs` (HTML/CSS/JS puro, GSAP 3 já distribuído em `src/assets/js/vendor/gsap.min.js`, sem routing de cliente: cada página é um ficheiro HTML).
- **Os códigos-fonte dos dois componentes não vieram anexados** à mensagem (só a descrição). Não os tive à frente; **reimplementei o comportamento descrito** em JavaScript puro, a partir do que sei dos componentes (StaggeredMenu: camadas de cor que entram, painel, links que sobem em escalonado, números; LineSidebar: índice vertical com efeito de proximidade do cursor em `requestAnimationFrame`). Não é uma cópia literal do código do React Bits, e não foi instalada nenhuma dependência (nem React).
- Consequência: «StrictMode», «unmount» e «mudança de rota» não se aplicam; a navegação entre páginas recarrega o documento (não há SPA). Limpeza feita onde faz sentido: `cancelAnimationFrame` em `pagehide`, listeners registados uma vez, `pageshow` fecha o menu restaurado do bfcache.

## Componentes integrados
### StaggeredMenu (mobile e janelas < 1280 px)
- Integrado no **header existente**: o botão «Menu» (pílula com texto e duas barras) substitui o botão de ícone do header, na mesma posição; abaixo de 420 px fica só o ícone (nome acessível `Open menu`). Um só header, um só logótipo (o painel **não** repete o logótipo).
- Container: o `<dialog>` existente, agora a toda a largura e transparente; desenha duas **camadas** (terracota escuro `#5a2a10`, terracota `#a14a18`) e um **painel** `#17120f` à direita (34 rem no máximo, largura total em telemóvel). Cor de destaque: laranja `--sunset`; tipografia serifa do site; números 01–05 (contador CSS) em laranja.
- Itens: os **mesmos cinco** do header (Restaurant, Hotel, Experiences, Gallery, Contact, mesma ordem, destinos reais). Mantive os extras que já existiam no menu móvel (Reservar mesa, Pedir quarto, idioma) e acrescentei uma linha discreta com **Our Story, Discover Liquiçá e FAQ**, que são destinos reais já ligados no rodapé.
- **Redes sociais:** `site.social` está vazio, por isso a secção não é desenhada (teste garante que não existe lista vazia).
- GSAP: timeline de abertura (camadas 0,55 s em escalonado → painel 0,7 s → links a subir 0,9 s com rotação ligeira, números e rodapé a surgir) e de fecho (0,4 s). O GSAP é **carregado ao primeiro sinal de intenção** (hover/foco/toque no botão) nas páginas onde ainda não está (só a home o traz), em vez de o enviar para todas as páginas. Se falhar ou com `prefers-reduced-motion`, o menu abre instantaneamente.
- Correção minha: o nome de classe `sm` colidia com o mosaico dos arredores (`.sm`), que deixava o painel visível em desktop; renomeado para `sm-menu` e verificado.

### LineSidebar (home, ≥ 1360 px)
- Fixa à **esquerda**, centrada na vertical, **escondida enquanto a hero está visível** e depois visível; oito itens com secções reais: Welcome (`#bem-vindo`), Special (`#especial`), Kitchen (`#cozinha`), Stay (`#quartos`), Experiences (`#experiencias`), Surroundings (`#arredores`), Reviews (`#opinioes`), Next moment (`#momento`). Foram acrescentados IDs estáveis às secções que não os tinham; cada ID existe uma só vez (teste).
- Escolha do lado esquerdo: à direita o carrossel dos pratos sangra até ao bordo e há o WhatsApp/Back to top; à esquerda a margem do conteúdo (80 px a 1440) dá espaço.
- Em vez de `<li onClick>`: `<a href="#id">` reais (teclado, leitores de ecrã), `aria-current="true"` no item ativo, foco visível, etiqueta (pílula) ao passar o rato ou focar.
- Secção ativa por **IntersectionObserver** numa faixa fina a meio do ecrã; o clique atualiza o estado de imediato, faz scroll suave (instantâneo com `reduced-motion`), bloqueia o observador 0,9 s para não dessincronizar e atualiza o hash. Cor adapta-se a secções escuras (`data-ls-tone`).
- Proximidade do cursor: `requestAnimationFrame` só enquanto o rato está perto e até estabilizar (deslocamento máximo 5 px, cor e comprimento da linha); desligada em toque e com `reduced-motion`.
- Só na homepage (EN e PT); não existe em Restaurant, Stay, Contact nem Gallery (teste).

## Alteração pedida no fim: Restaurant
Em **≥ 1000 px** as categorias passam a uma **coluna à esquerda** (fixa ao fazer scroll, com a pesquisa por cima); a barra horizontal foi substituída. Em **< 1000 px** (tablets e telemóveis) mantém-se o botão **Filter**. A passagem é por CSS (`min-width: 1000px` / `max-width: 999px`); `order.js` seguiu o novo layout (posição atual dentro da coluna, deslocamento ao clicar).

## Ficheiros alterados
`src/layout.mjs` (header e painel), `src/pages.mjs` (IDs, sidebar), `src/assets/js/main.js` (menu e sidebar), `src/assets/js/order.js` (categorias à esquerda), `src/assets/css/refine.css`, `src/i18n/{en,pt}.mjs`, `tests/site.test.mjs`. Criados: este relatório e, fora do código do site, `.qa/cdp.mjs` e scripts `.qa/t-*.mjs` (verificações em navegador sem cabeça).

## Acessibilidade
`aria-expanded` e `aria-controls` no botão; `<dialog>` modal (foco preso, página atrás inerte, Escape, ver abaixo); foco levado ao botão Fechar quando o painel estava escondido enquanto o GSAP carregava; scroll do documento bloqueado com `html.nav-open`; fecho por clique fora do painel, por Escape (com animação de saída), por link de âncora/botão de reserva e ao passar a ≥ 1280 px; `prefers-reduced-motion` testado com emulação; alvos de 44 px; sem elementos interativos escondidos (`visibility: hidden` durante a espera do GSAP).

## Testes executados e resultados
- `npm test`: **34/34**, 24 páginas, 2389 ligações internas sem problemas. Atualizei o teste do menu móvel porque a estrutura mudou (mesmas verificações: cinco ligações, cada uma uma vez, **e** agora igual à navegação do desktop) e acrescentei testes do StaggeredMenu, da LineSidebar (8 âncoras com alvo único) e da coluna do Restaurant.
- Navegador sem cabeça com frames reais (`.qa/cdp.mjs`): abertura (painel 390→0 px, camadas em escalonado, links a subir), fecho, Escape, clique fora (768 px), `reduced-motion` (abre sem animação), cinco links reais; LineSidebar (secção ativa correta nas 8 secções, tom escuro em Experiences e Next moment, escondida no topo, proximidade a 0→1→0, escondida a 1280 px); Restaurant (coluna à esquerda em 1024/1440, Filter em 390/820, clique numa categoria leva à secção e marca-a).
- Header sem overflow nem sobreposição em 9 tamanhos (320, 375, 390, 430, 667×375 horizontal, 768, 1100, 1279, 1280): botão do menu até 1279 px, navegação horizontal a partir de 1280 px, um só header.
- Lighthouse móvel: home 95, restaurante 93; acessibilidade, boas práticas e SEO 100; CLS 0.

## Não verificado / limitações
- Nenhum teste com dedo real, leitor de ecrã, Safari/Firefox ou zoom de browser; «orientação horizontal» só em 667×375 emulado.
- ESLint e TypeScript não existem no projeto (não executados).
- Não vi a abertura do menu em PT nem a LineSidebar em 1920×1200 em captura (o comportamento foi medido por script).
- Sem router de cliente: a navegação entre páginas recarrega a página; usar transições entre páginas seria outro trabalho.

## Git
Sem commit nem deploy (as alterações das rondas 03–05 também estão por commitar).

## Atualização (pedido posterior): a LineSidebar só na página do Restaurant
A LineSidebar foi **retirada da homepage** e passou a existir **apenas na página Restaurant**, como índice das categorias do menu (≥ 1000 px): número, linha e nome de cada categoria, linha que cresce e deslocamento subtil perto do cursor (`requestAnimationFrame` só enquanto o rato está perto), categoria atual a acompanhar o scroll e clique que leva à secção. Em tablets e telemóveis continua o botão Filter. Os IDs que tinham sido acrescentados às secções da home mantêm-se (inofensivos). Teste automático: o índice existe no Restaurant e **nenhuma** outra página tem sidebar. Verificado em navegador sem cabeça: proximidade 0→1→0, categoria atual correta ao clicar, Filter a 820 px. `npm test`: 34/34.
