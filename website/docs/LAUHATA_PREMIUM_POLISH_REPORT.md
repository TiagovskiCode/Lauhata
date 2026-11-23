# Premium Polish — relatório (23 de novembro de 2026)

## Melhorias mais importantes
1. **Fotografia de quartos honesta.** As imagens dos quartos são de stock/mock-up, não do Lauhata. Passaram a mostrar um **marcador de posição da marca** (cama, «LAUHATA», «as fotografias deste quarto estarão disponíveis em breve»), na home, no cartão Stay do Welcome, na página Stay e nas páginas de cada quarto. Um marcador não é repetido para fingir uma galeria: sem fotografias reais, cada quarto tem uma só «fotografia» e sem controlos de carrossel. Uma fotografia de paisagem (o pôr do sol) deixou de contar como fotografia do quarto. Interruptor: `site.illustrativeRooms` (`site.mjs`); para publicar fotografias reais, marcar a imagem com `kind: "room"` e `placeholder: false` em `images.mjs`.
2. **Preços provisórios escondidos.** As bebidas de exemplo (com preços provisórios) deixaram de ser públicas (`site.showSamples: false`); a categoria Drinks só reaparece quando houver bebidas confirmadas em `menu.mjs`.
3. **Menos ruído, por auditoria de «remoção»** (skill `audit-ai-design-slop`):
   - os seis mosaicos de ícone+título+texto da secção «What Makes Lauhata Special» ocupavam quatro ecrãs em coluna única no telemóvel; passam a 2 × 3 compactos;
   - os horários do restaurante repetiam-se dentro da descrição de cada quarto (já aparecem no Welcome, no Restaurante, no Contacto e no rodapé); retirados das descrições EN e PT;
   - a frase longa do marcador de posição fica só nas páginas dos quartos; nos mosaicos pequenos mostra apenas ícone e nome.
4. Já feito antes desta ronda e verificado de novo: política de fotografia dos pratos (marcador da marca por omissão), comparação dos quartos, lightbox dos quartos, FAQ, filtro e categorias do menu, carrinho, reservas.

## Skills usadas
- **`audit-ai-design-slop`**: lida e aplicada (teste da remoção sobre capturas reais de home 1440 e 390, e do Stay a 390); deu os pontos 3.
- Taste e Impeccable: não as reabri nesta ronda; seguem as regras que já tinha lido (sem etiquetas sob imagens, um só CTA principal por ecrã, sem cartões desnecessários).
- Não usei outras skills instaladas (3D, shaders, vídeo, etc.): não se aplicam a este site.

## Testes executados
- `npm test`: **42/42**, 24 páginas e cerca de 2400 ligações OK. Atualizei três testes que descreviam o estado anterior (galerias de três fotografias, bebidas de exemplo): agora verificam a política nova (um marcador por quarto, sem fotografias de stock nos quartos, nenhum preço provisório visível).
- Navegador sem cabeça: 118 verificações (11 páginas × 8 tamanhos, mais os diálogos de reserva, feedback, carrinho e menu) sem overflow nem controlos fora do ecrã; 60 seletores (data, hora, pessoas, quarto, rating) abrem junto ao campo; troca de idioma EN↔PT (`/stay/` ↔ `/pt/alojamento/`, `lang` e hreflang corretos); pedido de quarto pelo diálogo (pré-seleção do quarto, validação, mensagem de pedido sem afirmar confirmação); carrinho a partir da home (2 × Grilled Fish = $36, 1800 cêntimos por unidade); menu móvel abre, tem as 5 ligações e fecha com Escape.
- Não executei ESLint nem TypeScript (não existem no projeto). Não testei com leitor de ecrã nem em dispositivo real.

## Pendente / a confirmar com o Lauhata
Fotografias reais dos quartos (interiores, casa de banho, exterior) e dos pratos; confirmação das bebidas e preços (hoje fora do menu); preços das pizzas escritos à mão na ementa (`confirm` em `menu.mjs`); horários de check-in e check-out; política de reservas.

## Nota
O menu móvel é agora uma gaveta simples (alteração posterior à do menu escalonado); verifiquei que abre, tem as cinco ligações e fecha com Escape.

## Git
Alterações só no diretório de trabalho; sem commit nem deploy.

## Ronda seguinte (Premium Digital Experience, 23 de novembro de 2026)
- **Mapas:** o Google Maps já não carrega com a página (Discover, Contact): uma fachada com fotografia aérea real do Lauhata, o local, «Mostrar o mapa» e «Abrir no Google Maps». Fim da caixa cinzenta enquanto o mapa carregava; nenhum pedido ao Google sem o visitante o pedir. O mapa recebe o foco quando aparece.
- **Bug grave encontrado e corrigido em telemóvel:** nas páginas Contact e Discover, a moldura do mapa combinava `aspect-ratio` com `min-height`, o que a obrigava a ter 427–465 px de largura; o telemóvel encolhia a página inteira (zoom-out) para caber. Os meus varrimentos anteriores mediam `innerWidth`, que cresce com esse zoom-out, e por isso não o apanharam; o varrimento passou a comparar com a largura real do ecrã. 11 páginas × 8 tamanhos: sem overflow.
- **Vídeo do hero:** auditado e mantido (só em ecrãs 1280–1920, carregado depois da página, não carrega com `prefers-reduced-motion`, poupança de dados ou 2G, pausa fora do ecrã, a fotografia fica se falhar). Não otimizei o ficheiro (5,3 MB): não há ffmpeg neste ambiente.
- `npm test` 43/43 (novo teste dos mapas). Lighthouse móvel: home 97, contacto 90, Discover 88; acessibilidade, boas práticas e SEO 100; CLS 0.
