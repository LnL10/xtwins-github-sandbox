Feature: Consultar e atualizar a lista de tarefas

Scenario: Marcar uma tarefa como concluída sem sessão iniciada
  Given que a sessão não está iniciada
  And a lista contém a tarefa "Rever requisitos" por fazer
  When a pessoa utilizadora abre "Lista de tarefas"
  Then a tarefa "Rever requisitos" é apresentada na lista
  And o "resumo de tarefas por fazer" apresenta "1" tarefa por fazer
  When a pessoa utilizadora marca a caixa de seleção da tarefa "Rever requisitos"
  Then a tarefa "Rever requisitos" fica concluída
  And o "resumo de tarefas por fazer" apresenta "0" tarefas por fazer