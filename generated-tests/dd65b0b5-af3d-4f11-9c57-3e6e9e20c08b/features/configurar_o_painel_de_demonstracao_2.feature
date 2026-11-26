Feature: Configurar o painel de demonstração

@XTW-222
Scenario: Guardar as definições de latência e de falhas simuladas
  Given o utilizador está autenticado como "cliente"
  When acedo à página "Painel de demonstração"
  And configuro os controlos de "latência" e de "falhas simuladas"
  And primo "Guardar"
  When volto a carregar a página "Painel de demonstração"
  Then os controlos de "latência" e de "falhas simuladas" apresentam as definições que foram guardadas