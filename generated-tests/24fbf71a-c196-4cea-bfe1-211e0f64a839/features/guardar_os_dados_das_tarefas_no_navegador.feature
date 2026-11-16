Feature: Guardar os dados das tarefas no navegador

Scenario: Manter uma tarefa depois de recarregar a lista no mesmo navegador
  Given a pessoa utilizadora abre "Lista de tarefas"
  And a pessoa utilizadora seleciona a ligação "Nova tarefa" em "Lista de tarefas"
  And preenche o campo "Título" com "Planear viagem"
  When a pessoa utilizadora seleciona o botão "Guardar" em "Nova tarefa"
  Then a tarefa "Planear viagem" é criada e acrescentada ao fim da lista de tarefas
  And é apresentada a mensagem "Tarefa criada."
  When a pessoa utilizadora recarrega "Lista de tarefas" no mesmo navegador
  Then a tarefa "Planear viagem" continua apresentada em "Lista de tarefas"