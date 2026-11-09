Feature: Iniciar sessão na Loja Aurora
  Como cliente registado, quero iniciar sessão para comprar e acompanhar as minhas encomendas.

  Scenario: Cliente inicia sessão com credenciais válidas
    Given que estou na página de início de sessão
    When preencho o email "ana.silva@example.com" e a palavra-passe válida
    And carrego em "Entrar"
    Then vejo a saudação "Olá, Ana" no cabeçalho

  Scenario: Cliente erra a palavra-passe
    Given que estou na página de início de sessão
    When preencho o email "ana.silva@example.com" e a palavra-passe "errada"
    And carrego em "Entrar"
    Then vejo a mensagem de erro "Email ou palavra-passe incorretos."

  Scenario: Conta bloqueada não consegue entrar
    Given que estou na página de início de sessão
    When preencho o email "bloqueado@example.com" e a palavra-passe válida
    And carrego em "Entrar"
    Then vejo a mensagem de erro "Esta conta está bloqueada. Contacte o apoio ao cliente."
