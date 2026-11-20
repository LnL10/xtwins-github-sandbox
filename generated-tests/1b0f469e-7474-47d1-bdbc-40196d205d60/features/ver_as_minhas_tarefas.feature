Feature: Ver as minhas tarefas

@XTW-28
Scenario: Ver a mensagem quando não há tarefas
  Given que estou na página "Lista de tarefas"
  When apago as três tarefas apresentadas na tabela da página "Lista de tarefas" através dos botões "Apagar"
  And abro a página "Lista de tarefas"
  Then vejo a mensagem "Não tem tarefas."