Feature: Navegar no catálogo
  Como visitante, quero filtrar e ordenar o catálogo para encontrar depressa o que procuro.

  Scenario: Filtrar o catálogo por categoria
    Given o utilizador abre a página "Catálogo"
    When escolhe a categoria "Áudio" nos filtros
    And carrego em "Aplicar filtros"
    Then vê "4 produtos" no total de resultados

  Scenario: Ordenar o catálogo pelo preço mais baixo
    Given o utilizador abre a página "Catálogo"
    When ordena por "Preço: mais baixo"
    Then o primeiro produto é "Capa Antichoque X1"
