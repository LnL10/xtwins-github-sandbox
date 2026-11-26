Feature: Pesquisar e explorar produtos
@XTW-174
Scenario: Abrir a página de um produto
Given o utilizador está autenticado como "cliente"
When acedo à página "Catálogo"
And seleciono o produto "Portátil Aurora Book 14"
Then a página "Portátil Aurora Book 14" é apresentada