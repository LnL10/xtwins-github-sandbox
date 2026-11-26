Feature: Consultar e adicionar produtos ao carrinho

@XTW-184
Scenario: Selecionar a cor e a quantidade do produto
  Given o utilizador está autenticado como "cliente"
  When acedo à página "Detalhe do produto (3)"
  And seleciono uma opção disponível em "escolha de cor"
  And defino "controlo de quantidade" como "2"
  Then a opção de cor selecionada e a quantidade "2" são apresentadas na configuração do produto