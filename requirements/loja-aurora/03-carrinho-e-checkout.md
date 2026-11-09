# Loja Aurora — Carrinho e checkout

Documento de requisitos · versão 1.0 · novembro de 2026

## 1. Carrinho

- **RF-CHK-01** — O carrinho lista cada produto e opção numa linha, com preço unitário, quantidade editável e total da
  linha. Sem artigos, mostra "O seu carrinho está vazio." e a ligação para o catálogo.
- **RF-CHK-02 — Quantidade.** Alterar a quantidade para mais do que o stock (ou mais de 10) repõe o máximo possível e
  avisa "Só pode encomendar N unidades de <produto>."
- **RF-CHK-03 — Remover.** Remover uma linha mostra uma notificação com a ação "Anular", que a repõe no mesmo lugar.
- **RF-CHK-04 — Portes grátis.** Abaixo de 50 € (depois do desconto), o carrinho mostra quanto falta para os portes
  grátis ("Faltam 30,10 € para ter portes grátis.").

## 2. Códigos promocionais

| Código | Efeito | Condição |
|---|---|---|
| AURORA10 | 10% de desconto | Compras a partir de 30 € |
| BEMVINDO5 | 5 € de desconto | Compras a partir de 20 € |
| PORTESGRATIS | Portes grátis (exceto envio expresso) | — |
| VERAO2026 | 15% de desconto | Expirado |

- **RF-CHK-05** — Mensagens: "Código promocional inválido.", "Este código promocional expirou.", "Este código exige
  compras a partir de 30,00 €." e, quando aplicado, "Código AURORA10 aplicado: 10% de desconto."
- **RF-CHK-06** — Só um código por encomenda. Se o carrinho deixar de cumprir o mínimo, o desconto deixa de contar.

## 3. Checkout

O checkout tem 4 passos, sempre visíveis no topo: **Entrega → Envio → Pagamento → Revisão**. O resumo da encomenda fica
ao lado e atualiza-se a cada escolha. O carrinho vazio volta ao carrinho.

- **RF-CHK-07 — Convidado.** Sem sessão, o cliente escolhe entre "Iniciar sessão" (e volta ao checkout) e "Continuar
  como convidado".
- **RF-CHK-08 — Entrega.** Um cliente com moradas guardadas escolhe uma delas (a predefinida vem selecionada) ou "Usar
  outra morada". Para uma morada nova: nome, telefone (9 dígitos), morada, código postal (0000-000) e localidade são
  obrigatórios; o convidado indica também o email. O NIF é opcional mas, se indicado, tem de ser válido (dígito de
  controlo).
- **RF-CHK-09 — Envio.**

  | Método | Custo | Prazo |
  |---|---|---|
  | Envio normal | 3,99 €; grátis a partir de 50 € | 2 a 4 dias úteis |
  | Envio expresso | 7,99 € | 24 horas |
  | Levantamento em loja | Grátis | 2 dias úteis; escolher Lisboa, Porto ou Braga |

- **RF-CHK-10 — Regiões Autónomas.** Para códigos postais começados por 9 (Madeira e Açores), o envio normal tem uma
  sobretaxa de 5 € (mesmo acima de 50 €) e o envio expresso não está disponível.
- **RF-CHK-11 — Pagamento.**
  - Cartão: nome, número (validado pelo algoritmo de Luhn), validade MM/AA não expirada e CVV de 3 dígitos.
  - MB WAY: telemóvel português (91, 92, 93 ou 96 e 9 dígitos).
  - Referência Multibanco: gerada depois de confirmar; válida 72 horas.
- **RF-CHK-12 — Revisão.** Mostra entrega, envio e pagamento (cartão só com os últimos 4 dígitos), cada um com
  "Alterar". É obrigatório aceitar os Termos e Condições. O botão mostra o total: "Confirmar encomenda · 89,10 €".
- **RF-CHK-13 — Pagamento recusado.** Se o banco recusar o cartão, o cliente volta ao passo Pagamento com "Pagamento
  recusado pelo banco. Experimente outro cartão ou outro método de pagamento." O carrinho mantém-se.
- **RF-CHK-14 — Stock.** O stock é verificado de novo ao confirmar; se faltar, a encomenda não é criada.

## 4. Confirmação

- **RF-CHK-15** — Depois de confirmar, a página "Obrigado pela sua encomenda!" mostra o número (AUR-2026-NNNNN), o
  estado, o total e o email de confirmação. No Multibanco, mostra entidade, referência e valor.
- **RF-CHK-16** — Pagamentos por cartão e MB WAY ficam no estado "Paga"; Multibanco fica "Pendente". O stock dos
  produtos é reduzido e o carrinho esvaziado.
