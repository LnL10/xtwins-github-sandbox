Feature: Pesquisar e explorar produtos
@XTW-173
Scenario: Pesquisar produtos a partir da página inicial
Given o utilizador está autenticado como "cliente"
When acedo à página "Página inicial"
And pesquiso produtos por "a" no campo "pesquisa de produtos"
Then a página "Catálogo" apresenta 12 produtos, de um total de 24