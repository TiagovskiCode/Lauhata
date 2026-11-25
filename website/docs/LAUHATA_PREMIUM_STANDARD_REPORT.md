# Lauhata Beach Escape: padrão premium (25 de novembro de 2026)

Sem commit, push nem publicação. Sem dependências novas. O plano está em `PLANO-PREMIUM-2026-11-25.md`.

## Melhorias
- **Filme do hero:** montagem nova do vídeo de drone original (DJI_0827): abre na areia e recua até ao mar, 15 s, 1600×900, 3,5 MB
  (antes 1440×810, 4,8 MB), o fim funde-se no início. O poster é o primeiro fotograma do próprio filme. O filme só é pedido depois da
  página carregar, só aparece quando um fotograma foi mesmo pintado, funde-se a meia velocidade e acelera. Tem botão de pausa.
  Se falhar, fica a fotografia. Nos telemóveis: fotografia ao alto do mesmo lugar (da original de 4000 px).
- **Ecrã de entrada opaco removido:** tapava o poster 2,3 s. Em vez dele, as barras do enquadramento abrem e as palavras sobem.
- **Fotografia:** um «laboratório» (`tools/revelar-fotos.mjs`) dá a mesma cor a todas as fotografias reais e gera WebP. Só exposição,
  contraste e cor. Os originais não foram tocados; os JPEG anteriores estão em `originais/fotos/web-anterior/`.
- **Sem marcadores vazios:** ementa tipográfica; quartos com fotografias reais do exterior e uma nota que o diz.
- **Páginas:** home com «Um dia no Lauhata» (GSAP, horas reais), cozinha como página impressa, quartos, pôr do sol, arredores; Alojamento e
  fichas dos quartos refeitos; Experiências com a lista que preenche o formulário e os quatro passos; Galeria em quatro capítulos;
  Descobrir com a linha da costa desenhada com coordenadas oficiais; A Nossa História com capítulo em azul fundo; Contactos e FAQ.
- **Identidade:** acento novo, o azul das varandas dos quartos. O laranja do logótipo fica para as reservas.
- **Movimento:** uma curva e três gestos; deriva por CSS (`animation-timeline`), sem JavaScript durante o scroll; transição entre páginas com o
  cabeçalho parado; GSAP só na cena do dia. Tudo desligado com «movimento reduzido».
- **Código:** CSS de 387 KB para cerca de 275 KB de fonte (200 KB minificado, 40 KB com gzip), 249 textos sem uso removidos por língua,
  17 secções e funções mortas removidas. `dist` tem 17 MB.

## Contradições resolvidas
| Antes | Agora |
|---|---|
| Menu «Hotel», páginas «Stay», rodapé «Menu»; «Events» e «Experiences»; «About us» e «Our Story» | Um só nome em todos os menus (cabeçalho, gaveta, rodapé), com teste automático; o alojamento chama-se «Hotel» nos menus, por pedido do cliente |
| FAQ: «os preços não estão publicados» | $90 por noite, lido de `rooms.mjs` |
| FAQ: casa de banho, Wi-Fi e pequeno-almoço «pergunte» | De acordo com as comodidades já publicadas |
| «Resort», «hotel», «exceptional cuisine», «sea at your window», «local produce», «like family» | Removidos: não confirmados |
| «Ver os quartos» abria o formulário de pedido | «Pedir um quarto» |
| Horas escritas à mão em textos | Lidas de `site.mjs` |
| Créditos de fotografias de pratos que o site não mostra (e publicava) | Só os das duas fotografias em uso; as outras já não são publicadas |
| Erros no PT («As dois tipos», «Escolha uma», «Ambas») | Corrigidos |
| Mensagem de WhatsApp «Evening · 19:30» | «19:30» |
| Dados estruturados `Hotel` | `LodgingBusiness` |

## Testes
- `npm test`: compilação, **48/48** testes, 24 páginas, 2 431 ligações internas. O projeto não tem ESLint nem TypeScript.
- Nove testes antigos descreviam o desenho substituído: foram reescritos, e acrescentados quatro.
- Varrimento: 21 páginas × 7 tamanhos (320 a 1920): sem scroll lateral, imagens partidas ou erros de consola. Avisos: só ligações dentro de
  texto (créditos, fonte) com menos de 24 px de altura.
- Fluxos a 1440 e 390: pesquisa, categorias, opções, carrinho, pedido, mesa, quarto, evento, FAQ, mapa, galeria, língua, menu móvel.
- Transição poster → filme: luminância entre 79,7 e 84,6 (0 a 255) durante toda a passagem; CLS 0; testado sem o filme e com movimento reduzido.
- Lighthouse (local, gzip): acessibilidade, boas práticas e SEO **100** em todas as páginas medidas (na última medição de cada uma).
  Desempenho no computador 99 (home) e 100 (restaurante). No telemóvel (4G lento simulado): home 84, sobre nós 89, restaurante 91,
  galeria 91, descobrir 91, alojamento 95, contactos 95, eventos 98, quarto 98. LCP simulado da home no telemóvel: 4,6 s (a folhagem da fotografia pesa 166 KB).
- **Não testado:** aparelhos reais, Safari/iOS, Firefox. INP precisa de visitantes reais.

## Por confirmar com o Lauhata
1. Fotografias do interior dos quartos, dos pratos, da equipa.
2. Crianças no Queen & Single Room: idades e condições.
3. Pequeno-almoço: faz parte dos $90? Ar condicionado?
4. Horas de entrada e de saída; dias em que o restaurante abre (a ementa não diz; a Câmara indica 09:00–22:00).
5. Wi-Fi: está publicado, mas uma opinião de 2023 diz que não havia.
6. Bebidas e preços (14 por confirmar, não publicados); 6 preços de pizzas escritos à mão na ementa; tipos de pedido.
7. Os 8 pratos da home são uma escolha editorial.
8. Tétum: Bondia, Botarde, Bonoite (pedir a um falante).
9. Email, redes sociais, domínio, ID de análise, revisão da política de privacidade.
