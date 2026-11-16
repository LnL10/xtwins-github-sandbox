Feature: Consultar e atualizar a lista de tarefas

Scenario: Apresentar um traço para a tarefa sem data limite
  Given que a tarefa "Preparar demonstração" não tem data limite
  When a pessoa utilizadora abre "Lista de tarefas"
  Then a data limite da tarefa "Preparar demonstração" é apresentada como "—"