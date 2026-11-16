Feature: Guardar os dados das tarefas no navegador

Scenario: Apresentar as tarefas iniciais num navegador novo
  Given que a aplicação é aberta num navegador novo
  When a pessoa utilizadora abre "Lista de tarefas"
  Then são apresentadas as tarefas "Rever requisitos", "Preparar demonstração" e "Enviar relatório semanal" em "Lista de tarefas"