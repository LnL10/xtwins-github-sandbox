# Testes automatizados (pytest-bdd + Playwright)

Pacote gerado pelo test-automator: um ficheiro `.feature` por caso de teste, as step definitions em `steps/`,
as páginas e locators em `pages/` e a configuração do browser em `conftest.py`.

## Cenários cobertos

- Ver a mensagem quando não há tarefas (`features/ver_as_minhas_tarefas.feature`)
- Ver as colunas e o contador de tarefas (`features/ver_as_minhas_tarefas_2.feature`)
- Abrir a página de criação de uma tarefa a partir da lista (`features/aceder_a_criacao_de_uma_tarefa.feature`)

## Cenários saltados

- Nenhum.

## Como correr

```bash
pip install -r requirements.txt
playwright install
APP_URL=https://lnl10.github.io/xtwins-site-simples/tarefas.html pytest
```

`APP_URL` é o endereço da aplicação a testar; o código lê-o sempre do ambiente.

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
