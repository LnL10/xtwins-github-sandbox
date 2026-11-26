Feature: Navegar a partir do carrinho vazio

@XTW-185
Scenario: Aceder ao catálogo a partir do carrinho vazio
  Given o utilizador está autenticado como "cliente"
  When acedo à página "Carrinho vazio"
  Then a página "Carrinho vazio" apresenta a "mensagem de carrinho vazio" e a "ligação para o catálogo"
  When seleciono a "ligação para o catálogo"
  Then a página "Catálogo" é apresentada