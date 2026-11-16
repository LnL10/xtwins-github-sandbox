Feature: Abrir o formulário de nova tarefa

Scenario: Abrir o formulário sem sessão iniciada
  Given que a sessão não está iniciada
  And a pessoa utilizadora abre "Lista de tarefas"
  When a pessoa utilizadora seleciona a ligação "Nova tarefa" em "Lista de tarefas"
  Then é apresentado o formulário "Nova tarefa" com o campo "Título", a lista "Prioridade" e o campo "Data limite"