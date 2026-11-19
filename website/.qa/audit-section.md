
---

## Auditoria UI/UX completa e segunda auditoria (19 de novembro, ronda 9)

### 1. Skills: descoberta e uso
Descobri as skills realmente instaladas e carreguei as que se aplicam; li as instruções de cada uma. **Não** há skills de testes de usabilidade com pessoas, de CRO com dados nem de investigação com utilizadores reais (`design:user-research` e `research-synthesis` precisam de utilizadores/dados que não existem): não as simulei.

| Skill | Especialidade | Uso real nesta ronda | Parte melhorada |
|---|---|---|---|
| `design:design-critique` | crítica UX e hierarquia | primeira impressão, usabilidade e consistência por página; deu a lista de prioridades | repetição de chamadas à ação, botão principal inconsistente |
| `design:accessibility-review` | WCAG | teclado real (Tab), foco, nomes, contraste, alvos de toque | anéis de foco dos formulários |
| `design:design-system` | design system | auditoria de botões, cartões, espaçamento, estados | regras reutilizáveis em \`refine.css\` |
| `design:ux-copy` | texto de interface | revisão dos rótulos dos CTAs e das mensagens de WhatsApp | verbos e honestidade («pedido», nunca «reserva confirmada») |
| \`anthropic-skills:web-performance-audit\` | desempenho, a11y, SEO | CLS, \`aria-label\`, Esc, meta e Open Graph | Lighthouse em 11 páginas |
| \`taste-skill\` e \`impeccable\` | direção de arte, layout, piso de qualidade | critérios de composição e ritmo (rondas anteriores) e gate/perf | composição da página inicial |
| Lighthouse 13.6 e \`shoot.mjs\` | teste em navegador e QA visual | medições e capturas reais | verificação |

### 2. Auditoria inicial: problemas reais, por impacto
| # | Problema (evidência) | Impacto |
|---|---|---|
| 1 | **Campos de formulário sem anel de foco visível** (a borda laranja dava ≈ 2,6:1 sobre creme, abaixo de 3:1; os seletores de data/hora ficavam com \`outline: none\`) | alto: WCAG 2.4.7 / 1.4.11 em todos os formulários |
| 2 | **Dois convites de reserva seguidos** nas páginas Restaurante e Contacto («Your Perfect Getaway Awaits» e logo a seguir o do rodapé), com os mesmos botões; a Contacto repetia WhatsApp/Reservar/Quartos três vezes | alto: ruído em páginas cujo objetivo é uma só ação |
| 3 | **Botão principal com cor diferente** conforme a página (preto em «Request this room», «WhatsApp» no Contacto, «Stay at Lauhata»; laranja noutras) | médio: a hierarquia «um principal por ecrã» não era legível |
| 4 | Menu móvel listava **«Gallery» duas vezes** | médio (já corrigido na ronda 6) |
| 5 | Faixa vazia na página Experiences, por baixo das ocasiões | baixo |
| 6 | Espaçamento das páginas interiores diferente do da página inicial | baixo |
| 7 | Estados hover/ativo dos botões e ligações pouco uniformes | baixo |

Não encontrei problemas de contraste de texto, de rótulos ou de semântica (Lighthouse e auditoria própria limpos), nem erros de consola.

### 3. Implementado
- **Foco dos formulários:** anel de 2 px da cor da tinta em campos, áreas de texto, seletores de data/hora e pesquisa do menu; claro em fundos escuros.
- **Um só convite de reserva por página:** o rodapé deixa de repetir o convite quando a página já termina com um (início, restaurante); a página **Contacto** deixa de ter o bloco de fecho (é o próprio destino) e fica só com o convite do rodapé.
- **Regra de botões:** principal = laranja (um por ecrã), secundário = contorno, terciário = ligação de texto. «Request this room», «Stay at Lauhata», «WhatsApp» (Contacto), o botão do pequeno-almoço e o da página 404 passaram a laranja; «Get directions» passou a contorno. O botão preto «Add» do menu fica (interface funcional).
- **Design system em regras reutilizáveis:** espaçamento vertical único para todas as páginas, transições e estado «premido» nos botões, hover dos botões laranja e de contorno, sublinhado das ligações, raio único nos cartões, bloco de ocasiões dos eventos sem faixa vazia. Tudo com \`prefers-reduced-motion\`.

### 4. Segunda auditoria (executada)
| Verificação | Resultado |
|---|---|
| Testes automáticos | **20/20**; 24 páginas e 2277 ligações sem problemas |
| Overflow horizontal e colisão do cabeçalho | **nenhum** em 11 páginas (incluindo PT) × 8 larguras (1920, 1680, 1440, 1280, 1024, 768, 390, 375) |
| Lighthouse móvel (servidor com gzip) | Acessibilidade, boas práticas e SEO **100** em 11 páginas. Desempenho: stay 96, quarto 96, eventos 98, contacto 94, restaurante 91, descobrir 89, sobre 87, galeria 83, privacidade 99, PT início 82, PT alojamento 97 (início: 88–91 na ronda anterior). CLS 0 em todas |
| Teclado | Tab percorre o Contacto; contorno de 2 px nas ligações, e agora nos campos e seletores (confirmado por \`getComputedStyle\` depois de uma tecla Tab) |
| Reservar mesa | validação (3 erros) e mensagem correta para o WhatsApp, sem dizer que a mesa está confirmada |
| Pedir quarto | validação (3 erros), passo de revisão e mensagem correta («I would like to enquire…», pagamento no Lauhata) |
| Navegação e ligações | cinco páginas na barra, menu móvel de cinco, \`check-site\` sem problemas |
| Capturas | contacto e eventos (1440), quarto (375) e restaurante (1280) capturados; **vi** contacto e eventos; **não vi** quarto 375 nem restaurante 1280 desta passagem |

### 5. Comparação com a auditoria inicial
- **Melhorou:** os 7 pontos acima (1–3 e 5 verificados; 4 e 6–7 por regra de CSS, não por medição individual).
- **Continua pendente:** desempenho móvel da galeria (83) e do PT início (82); página Descobrir: o mapa incorporado aparece cinzento na minha captura (não consegui confirmar se é só carregamento lento); fotografias de comida, quartos e bar continuam ilustrativas; informações do dono em falta (nº de quartos, capacidades, preços, fotografias reais).
- **Limitações:** não fiz **nova pesquisa na web** nesta ronda (a de referências já feita limita-se ao Aman e às cinco imagens recebidas); não testei com leitor de ecrã nem em telemóvel real; não corri o Taste gate sobre esta versão; typecheck e ESLint não existem no projeto; as animações só foram observadas em capturas reais (o painel está oculto, sem medição de FPS).
