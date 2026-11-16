Feature: Criar uma tarefa

Scenario: Consultar as opções de prioridade
  Given que a lista contém a tarefa "Rever requisitos" por fazer, com prioridade "Alta" e data limite "20/11/2026"
  When a pessoa utilizadora abre "Lista de tarefas"
  And a pessoa utilizadora seleciona a ligação "Nova tarefa" em "Lista de tarefas"
  Then é apresentado o formulário "Nova tarefa" com o campo "Título", a lista "Prioridade" e o campo "Data limite"
  And a lista "Prioridade" apresenta as opções "Baixa", "Média" e "Alta", com "Média" selecionada por predefinição