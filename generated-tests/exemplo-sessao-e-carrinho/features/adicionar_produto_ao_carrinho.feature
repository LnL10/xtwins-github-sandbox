Feature: Adicionar produto ao carrinho
  Como visitante, quero juntar produtos ao carrinho para os comprar depois.

  Scenario: Adicionar um produto com opções ao carrinho
    Given que pesquisei "Aurora X1" na loja
    When abro o produto "Smartphone Aurora X1"
    And escolho a opção "256 GB"
    And carrego em "Adicionar ao carrinho"
    Then o carrinho do cabeçalho mostra 1 artigo
    And o preço do produto é "799,00 €"

  Scenario: Adicionar sem escolher a opção obrigatória
    Given que pesquisei "Aurora X1" na loja
    When abro o produto "Smartphone Aurora X1"
    And carrego em "Adicionar ao carrinho"
    Then vejo o erro da opção "Escolha uma opção de armazenamento."
    And o carrinho do cabeçalho mostra 0 artigos
