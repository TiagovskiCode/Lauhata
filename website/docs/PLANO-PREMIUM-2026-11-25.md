# Plano: padrão premium (25 de novembro de 2026)

Melhoria do projeto existente (não é uma reconstrução). Auditoria feita a olhar para as 9 páginas, ecrã a ecrã, a 1440×900.

## O que a auditoria encontrou
1. **Marcadores vazios a dominar o site:** ~60 azulejos «talheres» na ementa, 8 no carrossel da home, caixas riscadas enormes nos quartos; a ficha de cada quarto tem o hero partido e uma faixa final ilegível.
2. **Afirmações não confirmadas ou exageradas:** «resort», «hotel», «exceptional cuisine», «sea at your window», «local produce», «like family», «designed for comfort».
3. **Nomes diferentes para a mesma coisa:** Hotel / Stay / Alojamento; Events / Experiences; About us / Our Story; Add to Cart / Your order.
4. **Pergunta já respondida:** a ficha do quarto manda perguntar por casa de banho, internet e preço, que o site já publica.
5. **Hero:** abre sobre postes e folhagem, véu cinzento, corte seco no fim do vídeo; um ecrã de entrada opaco tapa o poster 2,3 s.
6. **Motivos genéricos:** grelha de 6 ícones, cartões iguais, a mesma fotografia de pôr do sol em 3 heros, 5 vistas quase iguais na galeria.
7. **Botões flutuantes** por cima de preços e dos «+» das perguntas frequentes; o cabeçalho translúcido deixa ver texto por baixo.
8. **Código:** 11 camadas de CSS, secções e textos que já nenhuma página usa.

## Direção: «a maré e o dia»
O lugar conduz: filme e fotografia reais com uma só cor de laboratório (sombras quentes levantadas), tinta e creme já estabelecidos, e um acento novo vindo do próprio sítio: o **azul das varandas**. Tipografia da marca (Cormorant + Manrope). Sem marcadores: onde não há fotografia, há tipografia.
Movimento: uma curva (`--ease-tide`), três gestos (a imagem abre como uma maré, a linha sobe, a fotografia deriva), deriva por CSS (`animation-timeline`), GSAP só para o dia em cena da home.

## Ordem
Dados e textos EN/PT → fotografia e filme → hero → movimento → páginas → limpeza → testes.
