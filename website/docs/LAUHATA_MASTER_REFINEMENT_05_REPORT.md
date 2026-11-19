# Master Refinement 05 — relatório (19 de novembro de 2026)

## 1. Skills e referências
Consultei as instruções das skills nas rondas anteriores (Taste, Impeccable com `craft-floor`, `design:*`, `web-performance-audit`, HIG). **Nesta ronda não as reabri** nem executei os scripts `gate`/`consistency` do Taste; usei o Lighthouse e capturas reais. **Sem pesquisa web nova** (ver `LAUHATA_MASTER_REFINEMENT_05_RESEARCH.md`).

## 2. Problemas encontrados
- A curva da secção Welcome cobria a base da hero; sem indicador de scroll.
- O «C» no carrinho era a inicial do prato (sem fotografia) e as linhas não tinham grelha para a miniatura.
- Wi-Fi, casa de banho privativa e pequeno-almoço incluído **não confirmados** (ver 14).
- Contact com o formulário depois do mapa; telefone da FAQ sem formatação (regex com barra invertida perdida).

## 3. Alterações implementadas
- **Hero:** `height: 100vh; height: 100svh` (medido = altura do viewport em 10 tamanhos, 0 px de espaço abaixo); curva removida na base da hero; **indicador de scroll** (linha fina de 60 px com ponto que desce, centrado, só `transform/top`, desaparece ao fazer scroll, estático com `prefers-reduced-motion`).
- **Welcome:** título maior, linha de local e horários (dados reais), três cartões mais baixos (1:1 em vez de 4:5), o do meio mais abaixo (composição menos previsível); ligações iguais.
- **What Makes Lauhata Special:** título centrado e seis cartões pequenos em grelha 3×2 (2 colunas em ecrãs < 700 px, 1 coluna < 440 px), hover discreto; conteúdo factual igual.
- **From the Lauhata Kitchen:** carrossel preservado; cada cartão ganhou preço à esquerda e **Add to Cart** à direita.
- **Home — Stay:** nome maior e linha divisória nas características (sem Wi-Fi/banho/pequeno-almoço).
- **Home — Experiences:** reformulada (fotografia alta + fotografia pequena sobreposta; texto, duas experiências reais separadas por linhas finas, ocasiões, um CTA).
- **Home — Surroundings:** título e primeiro parágrafo alinhados no topo; cinco fotografias mantidas.
- **Footer:** LAUHATA em laranja queimado (`#a14a18`), ~17 vw, a subir com *clip + opacity* uma vez ao entrar no ecrã (IntersectionObserver; sem animação com `reduced-motion`); antes da linha legal.
- **Restaurant:** introdução editorial (título e descrição à esquerda, nota e aviso de consumo no restaurante à direita), pesquisa numa linha própria; **barra de categorias ≥ 1000 px**, **Filter < 1000 px**.
- **Stay:** dois blocos horizontais grandes e espelhados, com galerias independentes de 3 fotografias (setas, contador «1 / 3», swipe e teclado), informação (nome, descrição existente, camas, televisão) e CTA que abre o diálogo de reserva com o quarto pré-selecionado; mobile: galeria primeiro.
- **Experiences (página):** tira de três fotografias reais do local antes do formulário; ocasiões e `Plan Your Event` mantidos (continua a ir para `#pedido`).
- **Contact:** telefone e horários na hero, **Write to us** logo a seguir à hero, mapa mais baixo (16:11, máx. 24 rem), mantidos WhatsApp e Google Maps; FAQ depois.
- **Carrinho:** miniaturas (fotografia real ou, na falta dela, a ilustrativa rotulada), nome em serifa, opções, preço unitário, subtotal, quantidade e remover em áreas próprias; formato `$`/USD único. **Página dedicada em desktop: não implementada** (razões na pesquisa).

## 4. Preservado sem alterações
Navbar, diálogo «Make a Reservation», Experiences That Stay With You, Your Next Moment Starts Here, Gallery (14 fotografias, legendas, lightbox).

## 5. Quick Add to Cart
Cada botão usa `data-add="<id do prato>"`, tratado pelo `order.js` existente (um só carrinho, `localStorage`). A homepage passou a injetar o menu completo em `window.LAUHATA_MENU`. Testado no navegador: um clique → 1 item e botão «Added»; segundo clique no mesmo prato → quantidade 2 (sem duplicar linha); outro prato → nova linha; abrir o carrinho mostra fotografia, `$18 each`, subtotais `$36` / `$18` e total `$54` iguais ao indicador; remover funciona; a página não muda. Pratos com opções (satay, mie goreng) mostram «Choose» e abrem o seletor existente.

## 6. Responsive
| Componente | Regra |
|---|---|
| Categorias do menu | barra ≥ 1000 px; Filter ≤ 999 px |
| Welcome | 3 colunas ≥ 641 px (título por cima < 1100 px); 1 coluna com cartões horizontais ≤ 640 px |
| Special | 3×2 ≥ 700 px; 2 colunas; 1 coluna ≤ 439 px |
| Kitchen | 4,5 cartões ≥ 1100 px; 2,5 ≥ 641 px; 1,25 abaixo |
| Stay (página) | dois blocos lado a lado ≥ 900 px; verticais abaixo |
| Experiences (home) | duas colunas ≥ 900 px |
Verificado sem overflow horizontal em 8 páginas × 10 tamanhos (375×667, 390×844, 430×932, 768×1024, 820×1180, 960×1080 meia janela, 1024×768, 1280×800, 1440×900, 1920×1200) depois de corrigido um excesso de 5 px na ementa em PT a 375 px.

## 7. Testes executados
- `npm test`: **31/31**, 24 páginas e 2373 ligações internas OK. Novos: Stay (2 quartos espelhados, 3+3 fotografias distintas, sem comodidade não confirmada, EN/PT), categorias responsivas, Quick Add, indicador de scroll, Contact.
- Lighthouse móvel (servidor gzip): home 90, restaurante 79, stay 92, contacto 94, eventos 91 de desempenho; acessibilidade, boas práticas e SEO **100** em todas; CLS 0. Referência anterior (ronda 04): home 89 (a11y 96, entretanto corrigida), restaurante 85, contacto 88.
- Hero = altura do viewport, indicador e carrossel/filtro/galerias verificados por script; capturas vistas: home 1440 (hero, welcome, cozinha, stay, experiences, surroundings, footer), restaurante 1440, stay 1440, contacto 1440, eventos 1440, carrinho (desktop).

## 8. Não verificado / pendente
- **TypeScript e ESLint não existem** no projeto; Taste gate não executado.
- Carrinho em mobile real, leitor de ecrã, Safari/Firefox não testados; animações (indicador, rodapé, carrossel) só confirmadas por propriedades e capturas estáticas, sem FPS.
- Não vi capturas de Stay, Restaurant e Contact a 390/820 (só medidas por script); a transição do contador das galerias foi verificada com scroll instantâneo (o painel oculto não anima).
- Desempenho móvel do restaurante desceu (79) com as 50+ miniaturas; página dedicada do carrinho não feita.
- `docs`: `.qa/` e `.taste-skill/` continuam sem seguimento no Git.

## 9. Informação comercial a confirmar
Wi-Fi, casa de banho privativa e pequeno-almoço incluído em **ambos** os quartos (**não publicados**: `docs/CHECKLISTS.md` e `rooms.mjs` dão-nos como pendentes, e há opiniões do Tripadvisor de 2023 que contradizem o Wi-Fi). Fotografias reais dos quartos (as 3 por quarto são ilustrativas e rotuladas) e dos pratos; escolha dos 10 pratos; horários de check-in/out; preços.

## 10. Ficheiros principais alterados
`src/pages.mjs`, `src/layout.mjs`, `src/lib.mjs`, `src/assets/css/refine.css`, `src/assets/js/{main,order,cinema}.js`, `src/i18n/{en,pt}.mjs`, `src/data/images.mjs`, `tests/site.test.mjs`, `docs/LAUHATA_MASTER_REFINEMENT_05_*.md`.

## Git
Alterações só no diretório de trabalho (as das rondas 03 e 04 também continuam por commitar). **Sem commit nem deploy.**
