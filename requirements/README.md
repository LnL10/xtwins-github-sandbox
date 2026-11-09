# requirements

Documentos de requisitos da Loja Aurora, escritos como os de um cliente. São o input do story-writer (e do
app-explorer) nos testes do xTwins. Os PDF passam pelo servidor de OCR.

| Documento | Markdown | PDF |
|---|---|---|
| Visão geral (perfis, regras transversais, não funcionais) | [01-visao-geral.md](loja-aurora/01-visao-geral.md) | [PDF](loja-aurora/01-visao-geral.pdf) |
| Loja e catálogo | [02-loja-e-catalogo.md](loja-aurora/02-loja-e-catalogo.md) | [PDF](loja-aurora/02-loja-e-catalogo.pdf) |
| Carrinho e checkout | [03-carrinho-e-checkout.md](loja-aurora/03-carrinho-e-checkout.md) | [PDF](loja-aurora/03-carrinho-e-checkout.pdf) |
| Área de cliente | [04-area-de-cliente.md](loja-aurora/04-area-de-cliente.md) | [PDF](loja-aurora/04-area-de-cliente.pdf) |
| Backoffice | [05-backoffice.md](loja-aurora/05-backoffice.md) | [PDF](loja-aurora/05-backoffice.pdf) |
| Todos num só documento | — | [requisitos-loja-aurora-completo.pdf](loja-aurora/requisitos-loja-aurora-completo.pdf) |

Os `.md` são a fonte. Depois de os alterar, gere de novo os PDF com `python tools/build_pdfs.py`.
