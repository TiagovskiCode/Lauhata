# Lauhata — projeto Elevate Web Studio

Cliente: restaurante e alojamento em Lauhata, Liquiçá, Timor-Leste.

## Estrutura

```
Lauhata/
├── documentos/
│   ├── cliente/    ← pode ser mostrado ou enviado ao cliente
│   │   └── Proposta_Website_Lauhata_Elevate.pptx
│   └── interno/    ← só para a Elevate (estratégia de negociação)
│       └── Preparacao_Negociacao_Lauhata.pptx
└── website/        ← o site (código em src/, site pronto a publicar em dist/)
    └── README.md   ← como compilar, onde mudar conteúdos e o que falta do cliente
```

## Documentos

| Ficheiro | Para quem | Notas |
| --- | --- | --- |
| `documentos/cliente/Proposta_Website_Lauhata_Elevate.pptx` | Cliente | Proposta comercial, sem preços |
| `documentos/cliente/Video_Promocional_Lauhata.mp4` | Cliente | Vídeo de 1 min (1080p) a apresentar o site. Música: «Kuta Beach – Tropical acoustic», SounovaMusic, via Pixabay (licença Pixabay, sem crédito obrigatório) |
| `documentos/cliente/Video_Promocional_Lauhata_WhatsApp.mp4` | Cliente | O mesmo vídeo comprimido (23,8 MB) para caber no limite do WhatsApp |
| `documentos/interno/Preparacao_Negociacao_Lauhata.pptx` | Interno | Os 7 elementos da negociação, sem valores |
| [Cábula de preços](https://claude.ai/artifact/N4BZ9U4S1DNzFbyEDKLz1T) | Interno | Preços da Elevate, para responder se o cliente perguntar (Claude Docs) |

Os prazos e preços nos documentos foram tirados do site da Elevate em 25 de outubro de 2026.
Desde então, a página de pacotes deixou de mostrar preços e passou a indicar prazos em dias úteis
(Hotel & Alojamento: 30 a 40; Restaurante & Café: 15 a 20). Confirmar antes de enviar.

## Website

```bash
cd website
npm run preview    # compila e abre em http://localhost:8080
```

Detalhes em [website/README.md](website/README.md).
