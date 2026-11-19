
---

## Otimização de JS e CSS (19 de novembro, depois da passagem de QA)

### O que mudou
- **GSAP, ScrollTrigger e `cinema.js` só carregam na página inicial.** O Lighthouse mostrou o `ScrollTrigger.min.js` a custar ≈ 820 ms de thread principal nas páginas interiores, sem nada que o justificasse lá. Nas interiores deixou de haver o «empurrão» lento da foto do herói e a deriva das fotografias; o texto, as animações de entrada em CSS e o resto continuam. Isto também alinha com a Taste Skill (sem bibliotecas de scroll numa página «place») e retira uma fonte possível de cintilação.
- **Minificação no build** com `esbuild` (nova **dependência de desenvolvimento**, `devDependencies`): CSS e os 5 scripts do site. O build continua a funcionar sem ele (só fica menos comprimido). Os ficheiros de `vendor` já vinham minificados.
- **Erro corrigido no `cinema.js`:** o caminho de recuperação chamava `smoothTick`, que já não existia (teria dado `ReferenceError`).
- **Galeria:** as miniaturas pequenas pedem uma imagem para 50 % da largura em telemóvel, em vez de 100 %.

### Lighthouse móvel (13.6), antes e depois
| Página | Antes | Depois, servidor local sem gzip | Depois, **com gzip** (como o GitHub Pages) |
|---|---|---|---|
| Início | 94 | 95 | **97** (LCP 1,1 s) |
| Stay | 77–79 | 82 | **95** (LCP 2,6 s) |
| Restaurante | 70 | 72 | **79–83** (LCP 2,9 s; TBT 430–560 ms) |
| Contacto | 75 | 83 | **94** |
| Eventos | 79 | 85 | **96** |
| Galeria | 71 | 74 | **79–83** (LCP 4,4–5,3 s) |
| Sobre | 73 | 77 | **83** (LCP 3,9 s) |

Acessibilidade, boas práticas e SEO ficaram a **100** em todas. O servidor de desenvolvimento (`http-server`) não comprime, por isso os números «sem gzip» são pessimistas; os «com gzip» foram medidos com um servidor temporário só para isto (já parado). **Não medi o site publicado.**

### Ainda por resolver (desempenho)
- **Restaurante:** TBT de 430–560 ms (cerca de 80 cartões de prato e o menu pesquisável a iniciar).
- **Galeria e Sobre:** LCP de 3,9–5,3 s (fotografias grandes em simultâneo com a do herói).
- CSS de ≈ 230 KB (não comprimido) num só ficheiro para todas as páginas; dividir por página continua possível.

### Testes
`npm test`: 19/19. Verificado no navegador, na página Stay: sem erros de consola (só o aviso antigo da política CSP), o título do herói visível, o menu de idioma e os 13 seletores a funcionar com o JS minificado. **Não voltei a correr** o Taste gate, as capturas de ecrã nem todos os fluxos de reserva depois da minificação; recomendo repeti-los antes do commit.
