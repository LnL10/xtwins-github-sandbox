# Loja Aurora — Visão geral

Documento de requisitos · versão 1.0 · novembro de 2026

## 1. Contexto

A Loja Aurora vende equipamento de tecnologia (computadores, telemóveis, áudio, casa inteligente, gaming e
acessórios) em Portugal. Este conjunto de documentos descreve a loja online e o backoffice de gestão.

| Documento | Âmbito |
|---|---|
| 01 — Visão geral | Perfis, regras transversais, requisitos não funcionais |
| 02 — Loja e catálogo | Página inicial, pesquisa, filtros, produto, avaliações |
| 03 — Carrinho e checkout | Carrinho, códigos promocionais, envio, pagamento, confirmação |
| 04 — Área de cliente | Conta, sessão, registo, perfil, encomendas, moradas |
| 05 — Backoffice | Painel, encomendas, produtos e utilizadores |

## 2. Perfis

| Perfil | Pode |
|---|---|
| Visitante | Consultar o catálogo, juntar produtos ao carrinho e comprar como convidado |
| Cliente | Tudo o que o visitante pode, mais: guardar moradas, acompanhar e cancelar encomendas, avaliar produtos |
| Gestor | Aceder ao backoffice: gerir encomendas, produtos e utilizadores |

- **RG-01** — Um cliente que tente abrir uma página do backoffice vê a página "Acesso negado".
- **RG-02** — Um visitante que tente abrir uma página da área de cliente ou do backoffice é levado ao início de
  sessão e, depois de entrar, volta à página que queria abrir.
- **RG-03** — Uma conta bloqueada pelo gestor não consegue iniciar sessão, e uma sessão aberta dessa conta termina.

## 3. Regras transversais

- **RG-04** — Todos os preços são em euros, com IVA incluído à taxa de 23%. O resumo do carrinho e do checkout mostra
  o valor do IVA incluído.
- **RG-05** — As datas são apresentadas no formato dd/mm/aaaa e os valores no formato português (1 234,56 €).
- **RG-06** — As mensagens de sucesso e de erro aparecem numa notificação no canto do ecrã, que desaparece sozinha ao
  fim de alguns segundos e pode ser fechada.
- **RG-07** — Nenhuma ação destrutiva (eliminar, cancelar, bloquear) é feita sem confirmação numa janela de diálogo.
- **RG-08** — Quando um serviço falha, a página mostra a mensagem "O serviço está temporariamente indisponível" e um
  botão "Tentar novamente".

## 4. Requisitos não funcionais

- **RNF-01** — A loja funciona nos browsers atuais e em ecrãs a partir de 375 px de largura, sem scroll horizontal.
- **RNF-02** — Todos os campos têm etiqueta visível; os erros aparecem junto ao campo e, em formulários longos, num
  resumo no topo ("Corrija os N campos assinalados."). O foco vai para o primeiro campo com erro.
- **RNF-03** — Palavras-passe e dados de cartão nunca são mostrados nem guardados em claro; do cartão só se guardam os
  últimos 4 dígitos.
- **RNF-04** — Os separadores, menus e janelas de diálogo funcionam com o teclado.
