# Lauhata — pesquisa da ronda 2 de refinamento (19 de novembro de 2026)

Complementa `LAUHATA_DESIGN_RESEARCH.md` (ronda 1). Nada foi copiado: só princípios de composição.

## O que consegui realmente consultar
| Referência | Resultado |
|---|---|
| **Aman (Amanpuri)** | Lido (a página carregou). Ver abaixo |
| **Six Senses (Laamu)** | **Não consegui**: o servidor devolveu HTTP 403 |
| **Soneva (Fushi)** | **Não consegui**: só recebi o ecrã de carregamento, sem conteúdo |
| **One&Only** | Não consultado nesta ronda |

Por isso, as conclusões abaixo assentam **numa só referência lida (Aman)**, mais as regras da Taste Skill, do Impeccable (`craft-floor.md`) e das HIG da Apple. Não afirmo ter estudado Six Senses, Soneva ou One&Only.

## Aman — observações úteis
- A navegação principal é curta e a de cada resort é separada. A barra de topo tem o idioma e um só botão principal («Reserve»).
- O alojamento aparece **cedo**, como **dois cartões iguais** (fotografia, título, uma frase, uma ligação), seguidos de um único botão «Book now».
- Depois vêm experiências, restauração e, quase no fim, como chegar e contactos. Cada tema tem a sua secção, sem repetir informação.
- A fotografia lidera; o texto é curto.

## Decisões que daí vieram (e das skills)
1. **Quartos como par de cartões iguais** (mesma proporção 4/3, mesmos blocos pela mesma ordem, uma ação por cartão). Em vez de linhas alternadas com carrosséis de tamanhos diferentes.
2. **Uma ação principal por página**, com verbo + objeto: `Reserve a Table`, `Request a Room`, `Plan Your Event`, `Get in Touch`.
3. **Sequência da homepage:** hero → introdução → Dine & Stay → pré-visualização do restaurante → pré-visualização dos quartos → eventos → história → opiniões → convite final. Cada passo tem informação diferente (restaurante: horário e três pratos; quartos: os dois cartões; eventos: uma frase e um botão), para não repetir.
4. **Hero sem widgets que se abrem.** Dois botões simples; o formulário real fica na página do restaurante e na do alojamento. Assim o hero nunca muda de tamanho.
5. **Cabeçalho:** um só botão de ação deixou de existir no topo (as ações estão no hero, nas páginas e na barra do telemóvel); sobra espaço para seis ligações maiores (Taste/Apple HIG: alvos e legibilidade antes de caber tudo).
6. **Sem legendas sob fotografias, sem etiquetas acima de títulos, sem números de secção** (Taste e Impeccable).
7. **Reviews num fundo próprio**, diferente do rodapé, com os dois cartões do mesmo tamanho.

## Limites
- Não medi o comportamento real da animação nem o desempenho percebido em dispositivos reais.
- A pesquisa de concorrentes foi curta e incompleta (ver tabela acima).
