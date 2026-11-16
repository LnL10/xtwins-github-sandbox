Feature: Consultar e atualizar a lista de tarefas

Scenario: Desmarcar a caixa de seleção de uma tarefa concluída
  Given que a lista contém a tarefa "Preparar demonstração" concluída e o "resumo de tarefas por fazer" apresenta "0" tarefas por fazer
  When a pessoa utilizadora desmarca a caixa de seleção da tarefa "Preparar demonstração"
  Then a tarefa "Preparar demonstração" fica por fazer
  And o "resumo de tarefas por fazer" apresenta "1" tarefa por fazer