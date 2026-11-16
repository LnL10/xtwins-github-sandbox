Feature: Consultar e atualizar a lista de tarefas

Scenario: Apresentar as colunas, os dados das tarefas e o contador
  Given que a lista contém a tarefa "Rever requisitos" por fazer, com prioridade "Alta" e data limite "20/11/2026"
  And a tarefa "Preparar demonstração" concluída, com prioridade "Média" e sem data limite
  When a pessoa utilizadora abre "Lista de tarefas"
  Then são apresentadas as colunas "Concluída", "Título", "Prioridade", "Data limite" e "Ações"
  And são apresentados os dados das tarefas "Rever requisitos" e "Preparar demonstração"
  And o "resumo de tarefas por fazer" apresenta "1" tarefa por fazer