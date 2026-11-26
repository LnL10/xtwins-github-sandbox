Feature: Pesquisar e explorar produtos
@XTW-175
Scenario: Navegar para as promoções
Given o utilizador está autenticado como "cliente"
When acedo à página "Página inicial"
And seleciono "promoções"
Then a página "Promoções" é apresentada