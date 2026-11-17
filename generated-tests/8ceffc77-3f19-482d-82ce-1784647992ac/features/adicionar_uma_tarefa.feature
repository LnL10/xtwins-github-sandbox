Feature: Adicionar uma tarefa

Scenario: Adicionar uma tarefa à lista
  Given estou na página "Lista de tarefas"
  When escrevo "Comprar pao" no campo "What needs to be done?" e carrego em "Enter"
  Then a tarefa "Comprar pao" aparece na lista