Feature: Iniciar sessão no Gestor de Tarefas
  Como utilizador registado, quero iniciar e terminar sessão para gerir as minhas tarefas.

  Scenario: Iniciar sessão com credenciais válidas
    Given que estou na página de início de sessão
    When preencho o utilizador "qa.demo" e a palavra-passe válida
    And carrego em "Entrar"
    Then vejo a lista de tarefas
    And vejo o nome "Utilizador Demo" no cabeçalho

  Scenario: Iniciar sessão com a palavra-passe errada
    Given que estou na página de início de sessão
    When preencho o utilizador "qa.demo" e a palavra-passe "errada"
    And carrego em "Entrar"
    Then vejo a mensagem de erro "Utilizador ou palavra-passe inválidos."

  Scenario: Terminar sessão
    Given que tenho a sessão iniciada como "qa.demo"
    When carrego em "Terminar sessão"
    Then estou na página de início de sessão
    And vejo a mensagem "Sessão terminada."
