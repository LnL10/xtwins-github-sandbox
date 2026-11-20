Feature: Aceder à criação de uma tarefa

@XTW-30
Scenario: Abrir a página de criação de uma tarefa a partir da lista
  Given que estou na página "Lista de tarefas"
  When seleciono a ligação "Nova tarefa" na página "Lista de tarefas"
  Then vejo a página "Nova tarefa"