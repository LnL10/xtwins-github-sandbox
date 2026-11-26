Feature: Iniciar sessão e aceder às áreas protegidas

@XTW-169
Scenario: Consultar a página de início de sessão sem autenticação
  Given não tenho a sessão iniciada
  When acedo à página "Iniciar sessão"
  Then a página "Iniciar sessão" é apresentada