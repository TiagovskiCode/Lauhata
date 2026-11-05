# Website do Lauhata Beach Escape

Site estático bilingue (PT/EN) do restaurante e das duas suites do Lauhata, em Liquiçá, Timor-Leste. Sem frameworks:
um script em Node gera as páginas a partir de `src/` para `dist/`.

- **Publicado em:** https://tiagovskicode.github.io/Lauhata/website/dist/
- **Publicação:** o GitHub Actions (`.github/workflows/pages.yml`) gera e publica `dist/` a cada push para `main`.

## Comandos

```bash
npm run preview                     # gera o site e abre http://localhost:8080
npm run build                       # só gera dist/
npm run prelaunch                   # gera em modo estrito (falha se faltar alguma coisa crítica)
npm run fotos                       # tamanhos web das fotos em originais/fotos/maqueta/
npm run fotos:temporarias           # procura fotos temporárias de pratos (Wikimedia Commons)
npm run fotos:temporarias:otimizar  # tamanhos web dessas fotos
```

O `build` mostra no fim os avisos do que ainda falta (preços por confirmar, fotos ilustrativas em uso, etc.).

## Estrutura

```
website/
├── build.mjs            gera dist/ (páginas, sitemap, robots, docs/FOTOS-PRATOS.md)
├── package.json         comandos
├── src/                 tudo o que vai para o site
│   ├── pages.mjs        o conteúdo de cada página (início, ementa, alojamento, suites, sobre, eventos,
│   │                    galeria, Descobrir Liquiçá, contactos, privacidade, obrigado, 404)
│   ├── layout.mjs       cabeçalho, rodapé, <head>, carrinho, diálogo de reserva
│   ├── lib.mjs          rotas, figure(), ligações WhatsApp, utilitários
│   ├── prelaunch.mjs    os avisos do build
│   ├── i18n/            pt.mjs e en.mjs: todos os textos do site
│   ├── data/            os dados do negócio (ver a tabela abaixo)
│   └── assets/
│       ├── css/         main → cinema → order → home → landing → picker → wide → design → editorial → resort
│       │                (carregados por esta ordem; resort.css é o design final e é o último)
│       ├── js/          main.js (formulários e WhatsApp), picker.js (datas e horas), order.js (carrinho),
│       │                cinema.js (animações GSAP), vendor/ (GSAP)
│       ├── fonts/       Cormorant Garamond e Manrope (self-hosted)
│       └── img/         brand/ (logótipo), fotos/ (tamanhos web), pratos/ (fotos reais dos pratos),
│                        pratos-temp/ (fotos temporárias de pratos), favicon e imagem de partilha
├── tools/               scripts das fotos (ver «Comandos»)
├── docs/                guias e relatórios (ver abaixo)
├── originais/           material de origem, NUNCA publicado
│   ├── fotos/           maqueta/ (imagens da maqueta), drone-2026-11/ (fotos reais de drone),
│   │                    pratos-temporarios/, descobrir-referencias/
│   ├── videos/          drone/ (filmagem original), drone-hd/, drone-hd-definitivo/, web/ (versões comprimidas)
│   └── icones/
└── dist/                o site gerado (não editar à mão: é reescrito a cada build)
```

## Onde mudar o quê

| Quero mudar… | Ficheiro |
|---|---|
| Textos do site | `src/i18n/pt.mjs` e `src/i18n/en.mjs` |
| WhatsApp, telefone, morada, coordenadas, horário, notas do Tripadvisor e Booking.com | `src/data/site.mjs` |
| Pratos e preços da ementa | `src/data/menu.mjs` |
| Suites (nomes, camas, comodidades, preço, fotos) | `src/data/rooms.mjs` |
| Fotos (que foto aparece onde, textos alternativos, real ou ilustrativa) | `src/data/images.mjs` |
| Resumos das avaliações externas | `src/data/reviews-external.mjs` |
| Opiniões deixadas no site e aprovadas | `src/data/reviews.mjs` |
| Bebidas de exemplo (desligar com `showSamples: false` em `site.mjs`) | `src/data/sample-drinks.mjs` |
| Créditos das fotos temporárias | `src/data/temp-photos.json` |
| Aspeto (cores, tipos de letra, botões) | `src/assets/css/resort.css` |

**Fotos reais:**
- **Prato:** `src/assets/img/pratos/<id>-640.jpg` substitui a foto temporária. A lista de ids está em
  `docs/FOTOS-PRATOS.md`.
- **Outras fotos:**
  1. Pôr o original em `originais/fotos/`.
  2. Gerar os tamanhos web.
  3. Apontar a chave em `images.mjs` e marcar `placeholder: false`.

## Regras do negócio (não mudar sem o Carlos)

- **Pedidos:** reservas e encomendas são *pedidos* por WhatsApp (+670 7740 1111). A equipa confirma à mão.
- **Pagamentos:** sempre no Lauhata. Nada se paga no site.
- **Restaurante:** só consumo no local; sem delivery nem take-away.
- **Conteúdo:** só factos confirmados. As fotos ilustrativas têm sempre a etiqueta «Imagem ilustrativa».
- **Avaliações:** não se copiam textos. O site mostra as notas e resumos escritos por nós, com ligação.

## Documentação (`docs/`)

| Ficheiro | Para quê |
|---|---|
| `CHECKLISTS.md` | O que o Carlos tem de confirmar; produção, domínio, Google Business Profile, QR da ementa |
| `FOTOGRAFIAS.md` | Fotos reais e ilustrativas, e a lista de fotos a pedir ao Carlos |
| `FOTOS-PRATOS.md` | Estado da foto de cada prato (gerado pelo build) |
| `DIRECAO-CRIATIVA.md` | Pesquisa de referências e direção visual |
| `MARCA.md` | Logótipo, cores e tipos de letra |
| `AUDITORIA.md`, `UX-PESQUISA.md` | Auditoria técnica e pesquisa de UX |
| `HISTORICO.md` | Histórico de todas as fases do projeto |
| `relatorios/` | Relatórios de entrega (fase 6, fase 8, design final) |
