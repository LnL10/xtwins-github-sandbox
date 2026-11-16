Feature: Consultar e atualizar a lista de tarefas

Scenario: Apresentar riscado o título da tarefa concluída
  Given que a tarefa "Preparar demonstração" está concluída
  When a pessoa utilizadora abre "Lista de tarefas"
  Then o título "Preparar demonstração" é apresentado riscado