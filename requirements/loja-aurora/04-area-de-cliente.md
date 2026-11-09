# Loja Aurora — Área de cliente

Documento de requisitos · versão 1.0 · novembro de 2026

## 1. Iniciar sessão

- **RF-CLI-01** — O cliente entra com email e palavra-passe. Pode mostrar a palavra-passe ("Mostrar"/"Ocultar") e
  escolher "Manter sessão iniciada".
- **RF-CLI-02** — Campos vazios: "Indique o email." e "Indique a palavra-passe."; email mal formado: "Indique um email
  válido."
- **RF-CLI-03** — Credenciais erradas: "Email ou palavra-passe incorretos." A partir da terceira falha, a mensagem diz
  quantas tentativas restam.
- **RF-CLI-04 — Bloqueio temporário.** À quinta falha seguida, o email fica bloqueado durante 60 segundos ("Demasiadas
  tentativas falhadas. Tente novamente dentro de N segundos.", com contagem decrescente) e o botão "Entrar" fica
  desativado.
- **RF-CLI-05** — Conta bloqueada pelo gestor: "Esta conta está bloqueada. Contacte o apoio ao cliente."
- **RF-CLI-06** — Depois de entrar, o cliente volta à página que estava a tentar abrir; sem destino, o cliente vai para
  a página inicial e o gestor para o backoffice.

## 2. Criar conta

- **RF-CLI-07** — Nome (3 caracteres ou mais), email, palavra-passe e confirmação são obrigatórios; telemóvel e NIF são
  opcionais mas validados. É obrigatório aceitar os Termos e Condições; a newsletter é opcional.
- **RF-CLI-08 — Palavra-passe.** Pelo menos 8 caracteres, com maiúscula, minúscula, número e símbolo. Enquanto escreve,
  o cliente vê cada regra cumprida e a força (Fraca, Média, Forte).
- **RF-CLI-09** — Email já registado: "Já existe uma conta com este email." Confirmação diferente: "As palavras-passe
  não coincidem."
- **RF-CLI-10** — Depois de criar a conta, a sessão fica iniciada.

## 3. Recuperar palavra-passe

- **RF-CLI-11** — O cliente indica o email e vê sempre a mesma mensagem, exista ou não a conta ("Se existir uma conta
  associada a <email>, vai receber um email com instruções…").

## 4. Perfil

- **RF-CLI-12** — O cliente altera nome, telemóvel e NIF. O email não se altera.
- **RF-CLI-13** — Para mudar a palavra-passe, indica a atual ("A palavra-passe atual está incorreta."), a nova (mesmas
  regras do registo e diferente da atual) e a confirmação.

## 5. Encomendas

- **RF-CLI-14** — A lista mostra número, data, número de artigos, total e estado, e filtra por estado.
- **RF-CLI-15** — O detalhe mostra os artigos, os totais, a entrega, o pagamento, o número de seguimento (quando
  enviada) e o histórico de estados.
- **RF-CLI-16 — Cancelar.** Encomendas "Pendente" ou "Paga" podem ser canceladas, escolhendo um motivo obrigatório. O
  stock é devolvido.
- **RF-CLI-17 — Voltar a comprar.** Junta ao carrinho os produtos da encomenda que ainda têm stock e avisa dos que não
  têm.

## 6. Moradas

- **RF-CLI-18** — Até 5 moradas, cada uma com nome (único, ex.: Casa), destinatário, morada, código postal, localidade
  e telefone. Uma é a predefinida, usada por omissão no checkout.
- **RF-CLI-19** — Adicionar, editar e eliminar (com confirmação). Ao eliminar a predefinida, a primeira das restantes
  passa a predefinida.
