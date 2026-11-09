# Loja Aurora — Loja e catálogo

Documento de requisitos · versão 1.0 · novembro de 2026

## 1. Página inicial

- **RF-LOJA-01** — A página inicial mostra a campanha em curso (10% de desconto com o código AURORA10 em compras a
  partir de 30 €), as categorias, os produtos em destaque e as 4 maiores promoções.
- **RF-LOJA-02** — O cabeçalho tem a pesquisa, as categorias, a ligação "Promoções", o acesso à conta e o carrinho com o
  número de artigos.

## 2. Catálogo

- **RF-LOJA-03 — Pesquisa.** A pesquisa procura no nome, na descrição e na referência (SKU) do produto, ignorando
  maiúsculas e acentos. Todos os termos escritos têm de aparecer.
- **RF-LOJA-04 — Filtros.** O utilizador filtra por categoria, preço mínimo e máximo, avaliação mínima (3 ou 4
  estrelas) e "Só produtos com stock". Os filtros aplicados aparecem como etiquetas que se removem uma a uma, e o botão
  "Limpar filtros" remove todos.
- **RF-LOJA-05 — Validação dos filtros.** Se o preço mínimo for maior do que o máximo, a pesquisa não é feita e aparece
  "O preço mínimo não pode ser superior ao máximo."
- **RF-LOJA-06 — Ordenação.** Relevância (por omissão: destaques primeiro, esgotados no fim), preço crescente, preço
  decrescente, melhor avaliação e novidades.
- **RF-LOJA-07 — Paginação.** 12 produtos por página, com "Anterior", números de página e "Seguinte". O topo da lista
  mostra o total e o intervalo apresentado (ex.: "24 produtos · a mostrar 13–24").
- **RF-LOJA-08 — Vista.** O utilizador alterna entre vista em grelha e vista em lista.
- **RF-LOJA-09 — Sem resultados.** Sem produtos, a página mostra "Não encontrámos produtos" e uma ligação para limpar os
  filtros.
- **RF-LOJA-10 — Produtos inativos.** Produtos desativados no backoffice não aparecem na loja e a sua página mostra
  "Produto não encontrado".

## 3. Cartão de produto

- **RF-LOJA-11** — Cada produto mostra imagem, nome, avaliação média com o número de avaliações, preço e, se estiver em
  promoção, o preço anterior riscado e a percentagem de desconto.
- **RF-LOJA-12** — Produtos sem opções têm o botão "Adicionar ao carrinho" (1 unidade); produtos com opções (cor,
  armazenamento) têm "Escolher opções", que abre a página do produto. Produtos esgotados mostram "Esgotado" e não podem
  ser adicionados.

## 4. Página de produto

- **RF-LOJA-13** — A página mostra o caminho (Início › Categoria › Produto), a galeria com 4 imagens, a referência, a
  avaliação, o preço com IVA incluído e o estado do stock: "Em stock", "Últimas unidades (N)" quando há 3 ou menos, ou
  "Esgotado".
- **RF-LOJA-14 — Opções.** Quando o produto tem opções, o cliente tem de escolher uma antes de adicionar ao carrinho
  ("Escolha uma opção de cor."). Algumas opções custam mais (ex.: 256 GB +100 €) e o preço mostrado atualiza-se.
- **RF-LOJA-15 — Quantidade.** Entre 1 e 10 unidades por produto. Não se pode juntar ao carrinho mais do que o stock
  disponível, contando o que já lá está ("Só pode juntar mais 2 unidades deste produto ao carrinho.").
- **RF-LOJA-16** — Ao adicionar, aparece a mensagem "N unidade(s) de <produto> foi/foram adicionada(s) ao carrinho"
  com a ação "Ver carrinho", e o contador do carrinho no cabeçalho atualiza-se.
- **RF-LOJA-17 — Separadores.** Descrição, Especificações (tabela) e Avaliações (N).
- **RF-LOJA-18** — No fim aparecem até 4 produtos relacionados da mesma categoria.

## 5. Avaliações

- **RF-LOJA-19** — As avaliações aparecem da mais recente para a mais antiga, com classificação, título, comentário,
  autor e data.
- **RF-LOJA-20** — Só clientes com sessão iniciada avaliam; os visitantes veem "Inicie sessão para avaliar este produto".
- **RF-LOJA-21** — Cada cliente avalia cada produto uma só vez. A classificação (1 a 5) e o título são obrigatórios; o
  comentário tem entre 10 e 1000 caracteres.
