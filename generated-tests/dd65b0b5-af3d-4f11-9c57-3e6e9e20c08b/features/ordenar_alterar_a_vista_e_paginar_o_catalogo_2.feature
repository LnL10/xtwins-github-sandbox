Feature: Ordenar, alterar a vista e paginar o catálogo

@XTW-180
Scenario: Apresentar 12 produtos numa página do catálogo geral
  Given o utilizador está autenticado como "cliente"
  When acedo à página "Catálogo"
  Then a página "Catálogo" apresenta 12 produtos, de um total de 24