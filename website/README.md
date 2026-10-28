# Lauhata — website (restaurante + alojamento)

Website bilingue (PT/EN) do Lauhata, em Lauhata, Liquiçá, Timor-Leste. Combina o âmbito dos pacotes
**Restaurante & Café** e **Hotel & Alojamento** da Elevate Web Studio, com reservas por WhatsApp.

HTML, CSS e JavaScript nativos, sem framework. Um script de build em Node (sem dependências) gera
as páginas em português e em inglês, cada uma no seu URL, o que é melhor para o SEO.

O design segue a mockup aprovada «Lauhata — Restaurante & Hotel» (PDF): títulos em Noto Serif
Display, texto em Manrope, cores creme `#F6F0E4`, verde `#0F2E28`, terracota `#A8432A`,
dourado `#C89640` e azul-petróleo `#2F6E73`, faixa de tais, selo rotativo e mapa ilustrado da costa.

## Comandos

Corre-os dentro da pasta `website/`:

```bash
npm run build      # gera dist/ a partir de src/
npm run preview    # build + servidor local em http://localhost:8080
```

Para publicar, envia o conteúdo de `dist/` para qualquer alojamento estático (Netlify, Vercel,
Cloudflare Pages, cPanel…). O site tem de ficar na raiz do domínio.

## Onde mudar o conteúdo

| Ficheiro | O que contém |
| --- | --- |
| `src/data/site.mjs` | Domínio, WhatsApp, telefone, email, horários, check-in/out, tempo de resposta, redes sociais, comodidades, Google Analytics |
| `src/data/menu.mjs` | Categorias e pratos da ementa (PT/EN, preço opcional) |
| `src/data/rooms.mjs` | Tipos de quarto: cada um gera a sua página nas duas línguas |
| `src/data/images.mjs` | Fotografias. `placeholder: true` = imagem ilustrativa do Unsplash |
| `src/i18n/pt.mjs`, `en.mjs` | Todos os textos, títulos SEO e mensagens de WhatsApp |

Os campos vazios ficam escondidos ou aparecem como «a confirmar» até serem preenchidos.

## Páginas

| PT | EN | Pacote |
| --- | --- | --- |
| `/` | `/en/` | Início |
| `/restaurante/` (ementa interativa + reserva de mesa) | `/en/restaurant/` | Restaurante |
| `/alojamento/` (quartos + pedido de reserva) | `/en/stay/` | Alojamento |
| `/alojamento/quarto-jardim/`, `/quarto-vista-mar/`, `/suite-familia/` | `/en/stay/garden-room/`, `/sea-view-room/`, `/family-suite/` | 1 página por tipo de quarto |
| `/contactos/` (mapa, acesso, FAQ) | `/en/contact/` | Localização |
| `/obrigado/`, `/privacidade/`, `/404.html` | equivalentes em `/en/` | Páginas utilitárias |

São 7 páginas de conteúdo (com 3 tipos de quarto) mais 3 utilitárias. «Experiências» e «A nossa
história» são secções da homepage, não páginas próprias. O número final de páginas e o orçamento
do projeto combinado ainda têm de ser acordados com o cliente.

## O que falta do Lauhata

- [ ] Número de WhatsApp (os formulários abrem o WhatsApp sem destinatário até lá)
- [ ] Telefone e email
- [ ] Domínio final (`siteUrl`; agora `https://lauhata.example`)
- [ ] Horário do restaurante e horas de check-in/check-out
- [ ] Tempo de resposta habitual às reservas
- [ ] Coordenadas exatas e indicações de acesso
- [ ] Fotografias reais: espaço, pratos, quartos, equipa
- [ ] Ementa real (pratos, descrições, preços) — «Da terra» e «Doces & café» ainda estão vazios
- [ ] História do espaço (o texto entre [ ] na secção «A nossa história»)
- [ ] Avaliações reais: nota média, número de avaliações e 3 citações (secção «O que dizem os nossos hóspedes»)
- [ ] Tempo de viagem a partir de Díli (`driveFromDili`)
- [ ] Redes sociais e link para a página de avaliações (Google/TripAdvisor)

### Conteúdo que veio da mockup e tem de ser confirmado

Os textos abaixo estão no site porque estão no design, mas são afirmações sobre o negócio:

- Quartos: Quarto Jardim, Quarto Vista Mar e Suite Família, com as respetivas comodidades
  (ar condicionado, Wi-Fi, pequeno-almoço, sala, varanda…) e capacidades
- Pratos: Ikan sabuko na brasa, Peixe em folha de bananeira, Lulas grelhadas, Caril de camarão
- «Receção 24 horas» e «normalmente em poucos minutos» (tempo de resposta)
- «Um dia no Lauhata»: café de Ermera, snorkel, passeios em Liquiçá, jantar ao pôr do sol
- Pequeno-almoço no restaurante com café de Timor
- A versão em tétum (botão TET no design) não foi incluída: é um idioma adicional, extra do pacote
- [ ] ID do Google Analytics, se quiserem estatísticas
- [ ] Revisão da política de privacidade

Quando tudo estiver preenchido, muda `showPlaceholderNotes` para `false` em `src/data/site.mjs`.

## Fora do âmbito (extras, só com aprovação)

Motor de reservas com disponibilidade em tempo real, calendário sincronizado, pagamentos ou
depósitos online, contas de cliente, painel de administração e integrações externas. O site não
simula nenhuma destas funções: o fluxo é sempre um **pedido** enviado por WhatsApp e confirmado
pelo Lauhata.
