Feature: Carrinho na Loja Aurora
  Scenario: Cliente com o carrinho vazio vê o aviso e a ligação ao catálogo
    Given o utilizador abre a página "Carrinho"
    Then vê a mensagem "O seu carrinho está vazio."
    And vê a ligação "Ver catálogo"