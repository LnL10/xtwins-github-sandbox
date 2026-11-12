Feature: Validar o intervalo de preço nos filtros do catálogo

Scenario: Apresentar uma mensagem quando o preço mínimo é superior ao máximo
  Given que o visitante está na página "Catálogo"
  When indica "100" no campo "Mínimo" e "20" no campo "Máximo" de "Preço (€)" e carrega em "Aplicar filtros"
  Then aparece a mensagem "O preço mínimo não pode ser superior ao máximo."