# Inventário de `media-source/` (DJI, 15 de novembro de 2026)

Os 31 ficheiros estavam em `src/assets/`, que o build copia por inteiro para `dist/` (cerca de 1 GB seria publicado). Foram **movidos, sem alteração**, para `website/media-source/`, que está no `.gitignore` e não entra no build. Um teste garante que nenhum original (DJI, DNG, MOV) nem ficheiro com mais de 8 MB chega a `dist/`.

## Fotografias (12 JPG 4000×2250 + 12 DNG em bruto)
| Ficheiro | O que mostra | Decisão |
|---|---|---|
| DJI_0828 | O Lauhata visto do mar, praia escura, palmeiras, montanhas de Liquiçá | **Usada**: hero do Discover Liquiçá; galeria |
| DJI_0829 | O Lauhata visto de cima: jardim, edifícios, praia, mar | **Usada**: fachada do mapa (Discover, Contact); galeria |
| DJI_0833 | Porta de um quarto e banco de madeira na varanda | **Usada**: cartão «Stay» do Welcome (home); galeria |
| DJI_0839 | Varanda dos quartos, cadeiras e mesa | **Usada**: hero da página Stay; galeria |
| DJI_0832 | Varanda que passa pelos quartos, plantas, jardim | **Usada**: Stay, «Onde ficam os quartos»; galeria |
| DJI_0836 | Edifício dos quartos atrás das palmeiras, do jardim | **Usada**: Stay; galeria (a melhor de três quase iguais) |
| DJI_0838 | Mesa no jardim junto à varanda | **Usada**: Stay; galeria |
| DJI_0834, DJI_0840 | Mesmo enquadramento de DJI_0836 | Não usadas (duplicados) |
| DJI_0830 | Bloco de quartos com carrinhas e antenas | Não usada (carros e antenas em primeiro plano) |
| DJI_0842 | Relvado com carrinhas estacionadas | Não usada |
| DJI_0843 | Jardim com uma árvore | Não usada (fraca ao lado das outras) |
| DNG (12) | Ficheiros em bruto das mesmas fotografias | Não usados (os JPG chegam para a web) |

Versões web (640, 1080 e 1600 px, JPEG q80, 27–365 KB) feitas com `tools/otimizar-drone-2026-11.ps1` (System.Drawing, sem dependências).

**Não há** fotografias do interior dos quartos, da casa de banho, do restaurante nem dos pratos: os quartos continuam com o marcador de posição da marca no interior, e as fotografias acima são apresentadas como o local onde ficam os quartos, não como um tipo de quarto.

## Vídeos (7 MP4, 1920×1080)
| Ficheiro | Duração | O que mostra | Decisão |
|---|---|---|---|
| DJI_0827 | 26 s | Recuo aéreo: do edifício sobre a praia até ao mar e às montanhas | **Melhor para o hero do desktop** (acaba com o mar azul) |
| DJI_0826 | 46 s | O mesmo movimento, mais longo, acaba nas montanhas | Alternativa ao hero |
| DJI_0841 | 26 s | Palmeiras e telhado com antenas e carro | Não usar |
| DJI_0831 | 21 s | Lateral do edifício, carrinhas, varanda escura | Não usar |
| DJI_0835, DJI_0837 | 4 s, 16 s | Edifício atrás das palmeiras (o mesmo das fotografias) | Não usar (as fotografias chegam) |
| DJI_0844 | 31 s | Jardim e relvado, carro ao fundo | Não usar |

**Feito:** o hero do desktop usa agora o DJI_0827 completo (26 s), recodificado com ffmpeg (autorizado pelo utilizador) para 1440×810, 24 fps, sem som, H.264 crf 30, `+faststart`: **4,8 MB** em `src/assets/video/hero-costa-1440.mp4`. O vídeo anterior (`hero-fundo-1600.mp4`, vista vertical do restaurante) foi guardado em `originais/videos/web-anterior/` e já não entra no build. O comportamento do hero não mudou: só em ecrãs 1280–1920 px, carrega depois da página, não carrega com `prefers-reduced-motion`, a fotografia fica se falhar.
