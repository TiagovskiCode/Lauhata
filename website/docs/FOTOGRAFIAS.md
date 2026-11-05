# Lauhata — fotografias: o que há, o que falta, como substituir

Atualizado a 5 de novembro de 2026. Cada fotografia do site tem uma legenda: **«Fotografia real»** (do Lauhata) ou
**«Imagem ilustrativa»** (não mostra o Lauhata). Nenhuma imagem ilustrativa é apresentada como sendo do Lauhata.

## 1. Fotografias reais (do Lauhata)

| Chave (`images.mjs`) | O que mostra | Onde aparece |
|---|---|---|
| `heroCover` + vídeo `hero-hd.mp4` / `hero-hd-1280.mp4` | Filme de drone sobre o Lauhata (capa = 1.º fotograma) | Herói do início |
| `aerialGarden`, `aerialCoast`, `aerialDay2`, `aerialDay4` | Vistas aéreas do edifício, do jardim e da praia | Comer & Ficar, eventos, convite final, Sobre nós, galeria |
| `beachFront` | O Lauhata visto do mar: praia de areia escura, palmeiras, montanhas | Capítulo da praia, Sobre nós, galeria |
| `sunsetGarden`, `sunsetPalmsHigh`, `sunsetPalms`, `sunsetSea` | Pôr do sol entre as palmeiras e sobre o mar | Comer & Ficar, início, galeria |
| `seaCanoe`, `coastVillage` | O mar com uma canoa; a costa e as casas vistas de cima | Início, Descobrir Liquiçá, galeria |
| `ruinsAerial`, `ruinsTop` | Ruínas da prisão de Aipelo (identificadas pelo Tiago a 5/11/2026) | Descobrir Liquiçá, galeria |

## 2. Imagens ilustrativas (a substituir)

| Onde | Chaves | Origem |
|---|---|---|
| Suites (carrosséis, páginas das suites) | `roomWarm`, `roomBright`, `verandaBamboo`, `roomFamily`, `roomForest`, `verandaWicker`, `palmShadow` | Unsplash e imagens da maqueta |
| Ementa: 53 pratos + 14 bebidas de exemplo | `src/assets/img/pratos-temp/` | Wikimedia Commons (créditos na página de privacidade) |
| Descobrir Liquiçá | `placeMaubaraFort`, `placeLiquicaCentre` | Wikimedia Commons, fotografias reais dos lugares mas não do Lauhata |
| Outras secções antigas | `heroSunset`, `coastSunset`, `terrace`, `foodSpread`, `weaving`, restantes chaves `unsplash:` | Maqueta / Unsplash |

**Como substituir:**
- **Foto de prato:** guardar como `src/assets/img/pratos/<id-do-prato>-640.jpg` (4:3; opcional `-1080.jpg`). A
  ilustrativa sai sozinha. Lista de ids em `FOTOS-PRATOS.md`.
- **Outras fotos:**
  1. Pôr o original em `fotos-originais/`.
  2. Gerar os tamanhos com `tools/otimizar-fotos.ps1` (slug → `<slug>-640/1080/1600.jpg`).
  3. Apontar a chave em `images.mjs` para `foto:<slug>` e pôr `placeholder: false`.
- **Lugares em Descobrir Liquiçá:** a lista `PLACE_PHOTOS` em `src/pages.mjs` diz que foto acompanha cada lugar.
  Tecelagem de Maubara, praias e lago salgado ainda não têm foto e aparecem como texto.

## 3. Lista de fotografias para o Carlos (por prioridade)

**Formato:** original da câmara ou do telemóvel, sem filtros. Cada cena na horizontal e na vertical. Luz natural:
manhã cedo ou fim de tarde. Nomes de ficheiro como `suite-king-cama-01.jpg`.

### Prioridade 1 — as suites (não há nenhuma foto real)
- **Cada suite, de dia:**
  - plano geral do quarto a partir da porta;
  - a cama inteira;
  - a cama em pormenor (roupa, almofadas);
  - a casa de banho;
  - a vista da janela ou da porta;
  - o exterior da suite.
- **Suite King & Single:** as duas camas no mesmo enquadramento.
- **Pormenores:** tecidos, madeira, a televisão, o que houver no quarto.

### Prioridade 2 — restaurante e bar
- A sala ou o espaço das mesas, com mesas postas, de dia e ao pôr do sol.
- A cozinha ou a grelha a trabalhar (com autorização de quem aparece).
- 8 a 10 pratos da ementa, em pratos do Lauhata, de cima e a 45°: peixe grelhado, satay, caril, mie goreng, nasi
  goreng especial, uma pizza, uma sobremesa, o pequeno-almoço.
- O bar e 4 a 6 bebidas reais (sumos, água de coco, cocktails, se existirem).

### Prioridade 3 — pessoas e hospitalidade
- O Carlos e a equipa, a trabalhar e em retrato (com autorização).
- Um momento de receção a hóspedes (com autorização).

### Prioridade 4 — o lugar
- A praia ao nível do chão, de manhã e ao fim da tarde, com as mesas em primeiro plano.
- A entrada e a placa do Lauhata.
- O jardim e as zonas comuns.
- Um evento real (com autorização dos convidados).

### Prioridade 5 — Descobrir Liquiçá (quando o Tiago ou o Carlos visitarem)
- Forte de Maubara (substitui a foto do Commons).
- Centro de Liquiçá (substitui a foto do Commons).
- Tecelagem de Maubara (com autorização das tecedeiras).
- Praias de Maubara e de Ai Pelo.
- O lago salgado.
- Mais vistas das ruínas de Aipelo, ao nível do chão.
