# Gestor de Tarefas — Documento de Requisitos

Versão 1.0 · novembro de 2026

## 1. Contexto

A equipa administrativa precisa de uma aplicação web simples para registar e acompanhar as suas tarefas do dia a dia.
Hoje as tarefas estão espalhadas por e-mails e folhas de cálculo, e ninguém sabe ao certo o que está por fazer, o que
está em curso e o que já foi concluído.

O Gestor de Tarefas é usado no browser, em computador e em telemóvel, por utilizadores com conta criada pela equipa de
sistemas.

## 2. Utilizadores

| Perfil | Descrição |
|---|---|
| Utilizador | Colaborador da equipa administrativa. Inicia sessão, consulta, cria, atualiza e elimina tarefas. |

## 3. Requisitos funcionais

### 3.1 Sessão

- **RF-01 — Iniciar sessão.** O utilizador inicia sessão com o seu utilizador e a sua palavra-passe. Depois de
  iniciar sessão, vê a lista de tarefas e o seu nome no cabeçalho.
- **RF-02 — Credenciais inválidas.** Se o utilizador ou a palavra-passe estiverem errados, a aplicação mostra
  "Utilizador ou palavra-passe inválidos." e limpa a palavra-passe. Se algum dos campos estiver vazio, mostra
  "Preencha o utilizador e a palavra-passe."
- **RF-03 — Terminar sessão.** Em qualquer página, o utilizador pode terminar a sessão. Volta à página de início de
  sessão, que mostra "Sessão terminada."
- **RF-04 — Páginas protegidas.** Sem sessão iniciada, qualquer página da aplicação leva à página de início de sessão.

### 3.2 Lista de tarefas

- **RF-05 — Consultar tarefas.** A lista mostra, para cada tarefa, o título, a prioridade, o estado e a data limite, e o
  número de tarefas apresentadas (por exemplo "6 tarefas").
- **RF-06 — Pesquisar.** O utilizador pesquisa tarefas por parte do título; a lista atualiza-se enquanto escreve.
- **RF-07 — Filtrar por estado.** O utilizador filtra a lista por estado: Todas, Por fazer, Em curso ou Concluída.
- **RF-08 — Lista vazia.** Quando nenhuma tarefa corresponde à pesquisa ou ao filtro, a aplicação mostra "Nenhuma
  tarefa encontrada."

### 3.3 Criar tarefas

- **RF-09 — Nova tarefa.** O utilizador cria uma tarefa com título, descrição, prioridade e data limite. Uma tarefa
  nova fica no estado "Por fazer". Depois de guardar, volta à lista, que mostra "Tarefa criada com sucesso."
- **RF-10 — Validações.** O título é obrigatório ("O título é obrigatório.") e tem no máximo 80 caracteres ("O título
  não pode ter mais de 80 caracteres."). A data limite é opcional, mas não pode ser no passado ("A data limite não pode
  ser no passado."). A prioridade é Baixa, Média ou Alta; por omissão, Média.

### 3.4 Detalhe e ciclo de vida da tarefa

- **RF-11 — Detalhe.** Ao abrir uma tarefa a partir da lista, o utilizador vê o título, a descrição ("Sem descrição."
  quando não tem), a prioridade, o estado, a data limite e a data de criação.
- **RF-12 — Mudar o estado.** Uma tarefa "Por fazer" pode ser iniciada (passa a "Em curso") ou concluída. Uma tarefa
  "Em curso" pode ser concluída. Uma tarefa "Concluída" pode ser reaberta (volta a "Por fazer"). Cada mudança mostra uma
  mensagem: "Tarefa iniciada.", "Tarefa concluída." ou "Tarefa reaberta."
- **RF-13 — Eliminar.** O utilizador elimina uma tarefa depois de confirmar ("Tem a certeza que quer eliminar esta
  tarefa?"). Pode cancelar a eliminação. Depois de eliminar, volta à lista, que mostra "Tarefa eliminada."
- **RF-14 — Tarefa inexistente.** Abrir uma tarefa que não existe mostra "Tarefa não encontrada." com uma ligação de
  volta à lista.

## 4. Requisitos não funcionais

- **RNF-01** — A aplicação funciona nos browsers atuais (Chrome, Edge, Firefox, Safari) e em ecrãs a partir de 375 px de
  largura, sem scroll horizontal.
- **RNF-02** — Todos os campos têm uma etiqueta visível e as mensagens de erro são anunciadas aos leitores de ecrã.
- **RNF-03** — A palavra-passe nunca é mostrada no ecrã.

## 5. Fora do âmbito

Registo de novos utilizadores, recuperação da palavra-passe, atribuição de tarefas a outras pessoas, comentários e
anexos.
