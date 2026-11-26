Feature: Ordenar, alterar a vista e paginar o catálogo

@XTW-179
Scenario: Ordenar os produtos do catálogo
  Given o utilizador está autenticado como "cliente"
  When acedo à página "Catálogo"
  And seleciono uma opção de ordenação nos controlos de ordenação
  Then são apresentados 12 produtos na página "Catálogo"