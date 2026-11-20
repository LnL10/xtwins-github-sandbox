Feature: Ver as minhas tarefas

@XTW-29
Scenario: Ver as colunas e o contador de tarefas
  Given que estou na página "Lista de tarefas"
  When consulto o conteúdo da página
  Then vejo a tabela com as colunas "Tarefa", "Prioridade", "Data limite" e "Ações"
  And vejo o contador "2 tarefas por fazer"