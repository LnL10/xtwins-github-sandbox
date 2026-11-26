Feature: Iniciar sessão e aceder às áreas protegidas

@XTW-171
Scenario: Acesso a uma página protegida sem sessão iniciada
  Given não tenho a sessão iniciada
  When acedo à página "Página inicial"
  Then a página "Iniciar sessão" é apresentada