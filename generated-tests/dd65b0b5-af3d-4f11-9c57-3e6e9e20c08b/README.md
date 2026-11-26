# Testes automatizados (pytest-bdd + Playwright)

Pacote gerado pelo test-automator: um ficheiro `.feature` por caso de teste, as step definitions em `steps/`,
as páginas e locators em `pages/` e a configuração do browser em `conftest.py`.

## Cenários cobertos

- Consultar a página de início de sessão sem autenticação (`features/iniciar_sessao_e_aceder_as_areas_protegidas.feature`)
- Acesso a uma página protegida sem sessão iniciada (`features/iniciar_sessao_e_aceder_as_areas_protegidas_2.feature`)
- Pesquisar produtos a partir da página inicial (`features/pesquisar_e_explorar_produtos.feature`)
- Abrir a página de um produto (`features/pesquisar_e_explorar_produtos_2.feature`)
- Navegar para as promoções (`features/pesquisar_e_explorar_produtos_3.feature`)
- Ordenar os produtos do catálogo (`features/ordenar_alterar_a_vista_e_paginar_o_catalogo.feature`)
- Apresentar 12 produtos numa página do catálogo geral (`features/ordenar_alterar_a_vista_e_paginar_o_catalogo_2.feature`)
- Selecionar a cor e a quantidade do produto (`features/consultar_e_adicionar_produtos_ao_carrinho.feature`)
- Aceder ao catálogo a partir do carrinho vazio (`features/navegar_a_partir_do_carrinho_vazio.feature`)
- Consultar o estado vazio do carrinho (`features/navegar_a_partir_do_carrinho_vazio_2.feature`)
- Entrar como um utilizador de teste disponível (`features/configurar_o_painel_de_demonstracao.feature`)
- Guardar as definições de latência e de falhas simuladas (`features/configurar_o_painel_de_demonstracao_2.feature`)

## Cenários saltados

- Aceder à página inicial após iniciar sessão sem destino definido: O passo «preencho o campo "email" com o email válido do cliente» não identifica qual é o cliente nem o respetivo email. Sem esse dado, não é possível preparar a conta que o teste deve usar.
- Submeter o formulário sem palavra-passe: O passo «preencho o campo "email" com o email válido do cliente» não identifica o cliente nem o respetivo email. Assim, não é possível determinar que dado de teste preparar para preencher o campo.
- A mensagem informa as tentativas restantes após falhas consecutivas: O passo «preencho o campo "email" com o email válido do cliente» não identifica o cliente nem indica um endereço de email concreto. Assim, não é possível preparar com certeza a conta necessária para executar as tentativas.
- Uma conta bloqueada pelo gestor não pode iniciar sessão: O passo «bloqueio a conta associada ao email válido do cliente» não identifica o cliente nem o email. Sem esses dados concretos, não é possível preparar a conta que o teste deve bloquear.
- A quinta falha bloqueia o endereço de email durante 60 segundos: O passo «preencho o campo "email" com o email válido do cliente» não identifica o cliente nem o respetivo endereço de email. Assim, não é possível preparar os dados necessários para executar as tentativas de início de sessão.
- Submissão com email já registado: O passo «preencho o formulário de criação de conta com o email válido do cliente» não identifica o cliente nem o email a usar. Assim, não é possível preparar de forma determinada um email já registado para o teste.
- Pedir recuperação da palavra-passe com ou sem conta associada: O passo «And o email indicado está "<associação>"» não identifica um endereço de email para o caso associado a uma conta. Sem esse dado, não é possível preparar de forma fiável a conta necessária para executar o pedido no browser.
- Voltar a comprar produtos com e sem stock: O passo «a encomenda contém produtos com e sem stock» não identifica a encomenda nem os produtos. Sem esses dados concretos, não é possível preparar ou estabelecer a precondição do cenário.
- Impedir o cancelamento de uma encomenda não elegível: O passo «uma encomenda não está pendente nem paga» não identifica a encomenda nem fixa os seus dados ou estado concreto, pelo que não é possível preparar a precondição para o teste. Sem uma encomenda identificada, também não é possível tentar cancelá-la nem verificar a linha correspondente.
- Cancelar uma encomenda pendente ou paga: O passo «uma encomenda está pendente ou paga» não identifica a encomenda nem fixa os dados ou o estado necessários. Assim, não é possível preparar de forma determinada a encomenda que será cancelada.
- Consultar o conteúdo e o histórico de uma encomenda: O passo «abro o detalhe de uma encomenda» não identifica qual é a encomenda, pelo que não é possível preparar dados de teste determinados. Além disso, não é especificado se essa encomenda está enviada, condição necessária para verificar o seguimento.
- Consultar os dados apresentados na lista de encomendas: O passo «And tenho encomendas» não identifica encomendas concretas nem define como preparar esse estado. Assim, não é possível garantir que a lista contenha dados para verificar no browser.
- Adicionar uma morada: O passo «tenho menos de cinco moradas» depende do estado das moradas da conta, mas não especifica que conta ou estado deve ser preparado. Assim, a precondição não fica fixada para o teste.
- Submeter o formulário com um email inválido: elemento não localizado: When preencho o campo "email" com "email-invalido"
- Ocultar a palavra-passe introduzida: elemento não localizado: And preencho o campo "palavra-passe" com a palavra-passe válida do cliente
- Submeter o formulário sem email: elemento não localizado: When deixo o campo "email" vazio
- Mostrar a palavra-passe introduzida: elemento não localizado: And preencho o campo "palavra-passe" com a palavra-passe válida do cliente
- Encaminhar o gestor para o backoffice: elemento não localizado: When preencho o campo "email" com o email válido do gestor
- Manter a sessão iniciada após autenticação: elemento não localizado: When preencho o campo "email" com o email válido do cliente
- Regressar à página protegida pedida após iniciar sessão como cliente: elemento não localizado: And preencho o campo "email" com o email válido do cliente
- Navegar para uma categoria: elemento não localizado: And seleciono a categoria "Computadores"
- Aplicar filtros por categoria, preço, avaliação e disponibilidade em stock: elemento não localizado: And defino o filtro "avaliação mínima" como "1"
- Limpar os filtros aplicados no catálogo: elemento não localizado: And defino o filtro "avaliação mínima" como "1"
- Navegar para outra página de resultados: elemento não localizado: Then a página "Catálogo" apresenta os resultados da página "2"
- Alternar entre as vistas de grelha e lista: elemento não localizado: Then os produtos são apresentados na vista "lista"
- Adicionar o produto ao carrinho: elemento não localizado: Then o produto "Smartphone Dobrável Fold Z" é apresentado no carrinho
- Consultar o conteúdo dos separadores do produto: elemento não localizado: Then o conteúdo correspondente ao separador "especificações" é apresentado
- Criação de conta sem dados opcionais: elemento não localizado: When seleciono "criar conta"
- Validação dos requisitos da palavra-passe: elemento não localizado: When seleciono "criar conta"
- Criação de conta com dados opcionais válidos: elemento não localizado: When seleciono "criar conta"
- Submissão com palavras-passe diferentes: elemento não localizado: When seleciono "criar conta"
- Submissão sem um dado obrigatório: elemento não localizado: When seleciono "criar conta"
- Indicação de telemóvel inválido: elemento não localizado: When seleciono "criar conta"
- Submissão com nome inferior a três caracteres: elemento não localizado: When seleciono "criar conta"
- Indicação de NIF inválido: elemento não localizado: When seleciono "criar conta"
- Impedir a alteração do endereço de email: elemento não localizado: And estou a gerir o meu perfil
- Rejeitar uma nova palavra-passe que não cumpre os requisitos: elemento não localizado: And estou a alterar a palavra-passe
- Atualizar cada dado permitido do perfil: elemento não localizado: And estou a gerir o meu perfil
- Rejeitar uma nova palavra-passe igual à atual: elemento não localizado: And estou a alterar a palavra-passe
- Alterar a palavra-passe com dados válidos: elemento não localizado: And estou a alterar a palavra-passe
- Rejeitar uma confirmação diferente da nova palavra-passe: elemento não localizado: And estou a alterar a palavra-passe
- Filtrar encomendas por estado: elemento não localizado: And estou na lista de encomendas
- Manter uma morada quando a eliminação não é confirmada: elemento não localizado: And adiciono uma morada com o nome "Casa QA 11", o destinatário "Cliente QA", a morada "Rua QA, 11", o código postal "1000-011", a localidade "Lisboa" e o telefone "912345689"
- Utilizar a morada predefinida no checkout: elemento não localizado: And adiciono uma morada com o nome "Casa QA 15", o destinatário "Cliente QA", a morada "Rua QA, 15", o código postal "1000-015", a localidade "Lisboa" e o telefone "912345693"
- Definir uma morada como predefinida: elemento não localizado: And adiciono uma morada com o nome "Casa QA 9", o destinatário "Cliente QA", a morada "Rua QA, 9", o código postal "1000-009", a localidade "Lisboa" e o telefone "912345687"
- Eliminar uma morada após confirmação: elemento não localizado: And adiciono uma morada com o nome "Casa QA 12", o destinatário "Cliente QA", a morada "Rua QA, 12", o código postal "1000-012", a localidade "Lisboa" e o telefone "912345690"
- Editar uma morada: elemento não localizado: When edito a morada "Casa QA 8" com o destinatário "Cliente QA Atualizado", a morada "Rua QA, 18", o código postal "1100-018", a localidade "Porto" e o telefone "912345686"
- Impedir a adição de uma sexta morada: elemento não localizado: And adiciono uma morada com o nome "Casa QA 2", o destinatário "Cliente QA", a morada "Rua QA, 2", o código postal "1000-002", a localidade "Lisboa" e o telefone "912345679"
- Definir a primeira morada restante como predefinida após eliminação: elemento não localizado: And adiciono uma morada com o nome "Casa QA 13", o destinatário "Cliente QA", a morada "Rua QA, 13", o código postal "1000-013", a localidade "Lisboa" e o telefone "912345691"
- Repor os dados locais da loja: elemento não localizado: Then o produto "Portátil Aurora Book 14" é apresentado no carrinho

## Como correr

```bash
pip install -r requirements.txt
playwright install
APP_URL=https://lnl10.github.io/xtwins-github-sandbox/ pytest
```

`APP_URL` é o endereço da aplicação a testar; o código lê-o sempre do ambiente.

## Segredos

Estas variáveis de ambiente têm de estar definidas ao correr; os valores nunca ficam no pacote
(`.env.example` lista-as). O login é feito uma vez por sessão de testes, no `conftest.py`, com o utilizador
de teste destas variáveis; os cenários autenticados começam já com sessão.

- `APP_URL`
- `APP_USERNAME`
- `APP_PASSWORD`

A página de login é aberta relativamente à pasta de `APP_URL`, por isso uma aplicação servida sob um
prefixo (`https://servidor/prefixo/`) faz o login no sítio certo; termine `APP_URL` em `/` quando for uma
pasta. Limitação conhecida: as páginas dos cenários são abertas pelo caminho absoluto no servidor, como
na geração, por isso o prefixo do caminho tem de ser o mesmo na geração e na execução.

## Resultados no Xray

Cada cenário dos casos de teste publicados no Xray tem a tag com a chave do teste (`@<chave>`). Corra os testes
gerando o `cucumber.json` e importe-o para o Xray:

```bash
pytest --cucumberjson=cucumber.json
python scripts/import_xray_results.py
```

O script cria uma execução no Xray com os resultados e mostra a sua chave. Só usa a biblioteca padrão do Python;
o caminho do ficheiro pode ser dado como argumento (por omissão `cucumber.json`). Defina estas variáveis de
ambiente (uma API key do Xray Cloud; os valores nunca ficam no pacote):

- `XRAY_CLIENT_ID`
- `XRAY_CLIENT_SECRET`
