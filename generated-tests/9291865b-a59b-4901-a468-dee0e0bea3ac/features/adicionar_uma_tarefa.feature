Feature: Adicionar uma tarefa

Scenario: Adicionar uma tarefa válida à lista vazia
  Given na página "Aplicação de tarefas TodoMVC" a lista de tarefas está vazia
  When escrevo "Comprar pão" no campo "What needs to be done?" e primo "Enter"
  Then a tarefa "Comprar pão" aparece no fim da lista e o contador apresenta "1 item left"