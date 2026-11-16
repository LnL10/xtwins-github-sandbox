Feature: Consultar e atualizar a lista de tarefas

Scenario: Marcar como concluída uma tarefa por fazer
  Given que a lista contém a tarefa "Rever requisitos" por fazer e o "resumo de tarefas por fazer" apresenta "1" tarefa por fazer
  When a pessoa utilizadora marca a caixa de seleção da tarefa "Rever requisitos"
  Then a tarefa "Rever requisitos" fica concluída
  And o "resumo de tarefas por fazer" apresenta "0" tarefas por fazer