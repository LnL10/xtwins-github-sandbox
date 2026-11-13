Feature: Catálogo
  Scenario: Abrir o catálogo a partir do início
    Given o utilizador abre a página "Início"
    When o utilizador carrega em "Ver catálogo"
    Then o utilizador vê o botão "Aplicar filtros"
