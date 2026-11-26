Feature: Configurar o painel de demonstração

@XTW-220
Scenario: Entrar como um utilizador de teste disponível
  Given o utilizador está autenticado como "cliente"
  When acedo à página "Painel de demonstração"
  And seleciono a ação para entrar como um utilizador de teste disponível
  Then a página "Página inicial" é apresentada com o nome do utilizador de teste selecionado no "Cabeçalho da loja"