Feature: Navegar a partir do carrinho vazio

@XTW-186
Scenario: Consultar o estado vazio do carrinho
  Given o utilizador está autenticado como "cliente"
  When acedo à página "Carrinho vazio"
  Then a página "Carrinho vazio" apresenta a "mensagem de carrinho vazio" e a "ligação para o catálogo"