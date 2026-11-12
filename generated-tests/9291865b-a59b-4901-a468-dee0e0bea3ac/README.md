# Testes automatizados (pytest-bdd + Playwright)

Pacote gerado pelo test-automator: um ficheiro `.feature` por caso de teste, as step definitions em `steps/`,
as páginas e locators em `pages/` e a configuração do browser em `conftest.py`.

## Cenários cobertos

- Adicionar uma tarefa válida à lista vazia (`features/adicionar_uma_tarefa.feature`)

## Cenários saltados

- Tentar adicionar uma tarefa composta apenas por espaços: elemento não localizado: Then não é criada nenhuma tarefa e a lista continua a apresentar apenas a tarefa "Ler livro"

## Como correr

```bash
pip install -r requirements.txt
playwright install
APP_URL=https://demo.playwright.dev/todomvc/ pytest
```

`APP_URL` é o endereço da aplicação a testar; o código lê-o sempre do ambiente.
