# Testes automatizados (pytest-bdd + Playwright)

Pacote gerado pelo test-automator: um ficheiro `.feature` por caso de teste, as step definitions em `steps/`,
as páginas e locators em `pages/` e a configuração do browser em `conftest.py`.

## Cenários cobertos

- Apresentar as colunas, os dados das tarefas e o contador (`features/consultar_e_atualizar_a_lista_de_tarefas.feature`)
- Desmarcar a caixa de seleção de uma tarefa concluída (`features/consultar_e_atualizar_a_lista_de_tarefas_2.feature`)
- Apresentar riscado o título da tarefa concluída (`features/consultar_e_atualizar_a_lista_de_tarefas_3.feature`)
- Apresentar um traço para a tarefa sem data limite (`features/consultar_e_atualizar_a_lista_de_tarefas_4.feature`)
- Marcar como concluída uma tarefa por fazer (`features/consultar_e_atualizar_a_lista_de_tarefas_5.feature`)
- Marcar uma tarefa como concluída sem sessão iniciada (`features/consultar_e_atualizar_a_lista_de_tarefas_6.feature`)
- Abrir o formulário sem sessão iniciada (`features/abrir_o_formulario_de_nova_tarefa.feature`)
- Consultar as opções de prioridade (`features/criar_uma_tarefa.feature`)
- Manter uma tarefa depois de recarregar a lista no mesmo navegador (`features/guardar_os_dados_das_tarefas_no_navegador.feature`)
- Apresentar as tarefas iniciais num navegador novo (`features/guardar_os_dados_das_tarefas_no_navegador_2.feature`)

## Cenários saltados

- Comparar as tarefas apresentadas nos dois estados de sessão: O passo «consulta "Lista de tarefas" com sessão iniciada» depende de uma sessão e de um utilizador que os passos não identificam nem estabelecem. Assim, o browser não tem informação suficiente para preparar esse estado de forma reproduzível.
- Abrir Iniciar sessão com sessão iniciada conduz à lista de tarefas: O passo «Given que a pessoa utilizadora já tem sessão iniciada» depende de uma sessão prévia que o cenário não estabelece nem identifica. Assim, o estado necessário não fica fixado para o teste.
- Terminar sessão e permanecer na lista de tarefas: O passo «Then a sessão termina» verifica o estado interno da sessão, mas não especifica qualquer indicação visível no browser que permita confirmá-lo.
- Aceitar o endereço de email da conta sem distinguir maiúsculas e minúsculas: Os passos «introduz o endereço de email da conta com as letras em maiúsculas» e «introduz a palavra-passe correta da conta» não identificam qual é a conta. Assim, não é possível preparar os dados concretos necessários para executar o início de sessão.
- Apresentar a mensagem de lista vazia: elemento não localizado: Then é apresentada a mensagem "Não tem tarefas."
- Apresentar a data limite no formato dd/mm/aaaa: elemento não localizado: Then a data limite da tarefa "Rever requisitos" é apresentada como "20/11/2026", no formato dd/mm/aaaa
- Apagar uma tarefa sem confirmação: elemento não localizado: And não é pedida confirmação para apagar a tarefa "Rever requisitos"
- Impedir a criação com uma data limite anterior a hoje: elemento não localizado: Then é apresentado um erro de validação para o campo "Data limite"
- Impedir a criação com um título inválido: elemento não localizado: And a tarefa não é criada
- Criar uma tarefa válida e acrescentá-la ao fim da lista: elemento não localizado: Then a tarefa "Planear viagem" é criada e acrescentada ao fim da lista de tarefas
- Apresentar em conjunto os erros de validação: elemento não localizado: Then são apresentados em conjunto os erros de validação dos campos "Título" e "Data limite"
- Cancelar o preenchimento sem criar a tarefa: elemento não localizado: And a tarefa "Planear viagem" não é apresentada em "Lista de tarefas"
- Iniciar sessão com credenciais corretas: elemento não localizado: Given que a pessoa utilizadora está na página "página de início de sessão"
- Abrir a página de início de sessão a partir da lista de tarefas: elemento não localizado: When seleciona a ligação "Iniciar sessão"
- Continuar sem sessão e regressar à lista de tarefas: elemento não localizado: Given que a pessoa utilizadora está na página "página de início de sessão"
- Apresentar os campos e a opção para continuar sem sessão: elemento não localizado: Given que a pessoa utilizadora está na página "página de início de sessão"
- Apresentar um erro e permanecer na página de início de sessão perante dados inválidos: elemento não localizado: Given que a pessoa utilizadora está na página "página de início de sessão"

## Como correr

```bash
pip install -r requirements.txt
playwright install
APP_URL=https://lnl10.github.io/xtwins-site-simples/ pytest
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
