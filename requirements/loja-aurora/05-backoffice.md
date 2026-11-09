# Loja Aurora — Backoffice

Documento de requisitos · versão 1.0 · novembro de 2026

Só os utilizadores com perfil Gestor acedem ao backoffice (ver RG-01).

## 1. Painel

- **RF-BO-01** — Indicadores: vendas dos últimos 30 dias (sem canceladas), encomendas por enviar (pagas), encomendas
  com pagamento pendente, produtos esgotados e número de clientes. Cada indicador abre a lista correspondente.
- **RF-BO-02** — Gráfico de barras com as vendas de cada um dos últimos 7 dias, lista de produtos com stock baixo (1 a
  3 unidades) e as 5 últimas encomendas.

## 2. Encomendas

- **RF-BO-03 — Lista.** 10 encomendas por página, ordenáveis por número, data, cliente e total (clicando no cabeçalho
  da coluna). Filtros: pesquisa por número, cliente ou email; estado; intervalo de datas. A data final não pode ser
  anterior à inicial.
- **RF-BO-04 — Estados.**

  | Estado atual | Pode passar a |
  |---|---|
  | Pendente | Paga, Cancelada |
  | Paga | Enviada, Cancelada |
  | Enviada | Entregue |
  | Entregue, Cancelada | — (estado final) |

- **RF-BO-05 — Enviar.** Marcar como enviada exige o número de seguimento (duas letras, nove dígitos e PT, ex.:
  RR123456789PT).
- **RF-BO-06 — Cancelar.** Exige o motivo (5 caracteres ou mais) e devolve o stock.
- **RF-BO-07 — Ações em massa.** O gestor seleciona várias encomendas (ou todas as da página) e marca-as como enviadas
  ou cancela-as. As que estão num estado que não o permite são ignoradas e a mensagem diz quantas foram atualizadas e
  quantas ignoradas.
- **RF-BO-08 — Exportar.** "Exportar CSV" descarrega as encomendas filtradas (separador ponto e vírgula).
- **RF-BO-09 — Notas internas.** O gestor junta notas à encomenda (até 500 caracteres), com autor e data, que o
  cliente não vê. O histórico regista quem mudou cada estado.

## 3. Produtos

- **RF-BO-10 — Lista.** Imagem, SKU, nome, categoria, preço, stock (a vermelho quando esgotado) e interruptor "Ativo".
  Filtros: pesquisa por nome ou SKU, categoria, estado (ativos/inativos) e stock (baixo/esgotados).
- **RF-BO-11 — Criar e editar.** Nome (3 a 80 caracteres), SKU único no formato AUR-0000, categoria, preço maior que
  zero com até 2 casas decimais, preço anterior opcional (maior do que o preço), stock inteiro 0 ou mais, descrição até
  500 caracteres com contador, destaque e imagem PNG, JPEG ou WebP até 1 MB, com pré-visualização.
- **RF-BO-12 — Ativar e desativar.** Um produto inativo deixa de aparecer na loja, mas as encomendas antigas mantêm-se.
- **RF-BO-13 — Eliminar.** Só produtos sem encomendas podem ser eliminados; os outros mostram "tem encomendas associadas
  e não pode ser eliminado. Pode desativá-lo."

## 4. Utilizadores

- **RF-BO-14** — Lista com nome, email, perfil, estado, data de registo e número de encomendas; filtros por pesquisa,
  perfil e estado.
- **RF-BO-15** — O gestor muda o perfil (Cliente/Gestor) e bloqueia ou desbloqueia contas, sempre com confirmação. Não
  pode alterar a sua própria conta.
